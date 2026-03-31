"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RecommendationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const recommendation_entity_1 = require("./recommendation.entity");
const candidate_entity_1 = require("../candidate/candidate.entity");
const cache_service_1 = require("../../common/cache/cache.service");
const RECOMMENDATION_WEIGHTS = {
    SKILL_MATCH: 0.4,
    INDUSTRY_MATCH: 0.25,
    POSITION_MATCH: 0.25,
    POPULARITY: 0.1,
};
let RecommendationService = RecommendationService_1 = class RecommendationService {
    constructor(recommendationRepo, candidateRepo, cacheService) {
        this.recommendationRepo = recommendationRepo;
        this.candidateRepo = candidateRepo;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(RecommendationService_1.name);
        this.CACHE_TTL = 600;
        this.CACHE_PREFIX = 'recommendation';
    }
    async generateRecommendations(userId, behavior, limit = 20) {
        const cacheKey = `${this.CACHE_PREFIX}:user:${userId}:limit:${limit}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            this.logger.debug(`Cache hit for user ${userId}`);
            return cached;
        }
        this.logger.log(`Generating recommendations for user ${userId}...`);
        const allCandidates = await this.candidateRepo.find();
        const excludedIds = behavior.viewedCandidateIds || [];
        const filteredCandidates = allCandidates.filter(c => !excludedIds.includes(String(c.id)));
        const scoredCandidates = filteredCandidates.map(candidate => {
            const scoreData = this.calculateMatchScore(candidate, behavior);
            return {
                candidate,
                ...scoreData,
            };
        });
        scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);
        const topCandidates = scoredCandidates.slice(0, limit);
        const recommendations = [];
        for (const item of topCandidates) {
            const recommendation = await this.saveRecommendation(userId, String(item.candidate.id), item.totalScore, item.reason);
            recommendations.push({
                id: recommendation.id,
                candidateId: recommendation.candidateId,
                candidate: item.candidate,
                score: recommendation.score,
                reason: recommendation.reason,
                createdAt: recommendation.createdAt,
            });
        }
        await this.cacheService.set(cacheKey, recommendations, this.CACHE_TTL);
        this.logger.log(`Generated ${recommendations.length} recommendations for user ${userId}`);
        return recommendations;
    }
    calculateMatchScore(candidate, behavior) {
        const resumeData = candidate.resumeJsonb || {};
        const candidateSkills = resumeData.skills || [];
        const candidateIndustry = resumeData.industry || '';
        const candidateTitle = resumeData.currentTitle || '';
        const candidateKeywords = this.extractKeywords(candidate);
        const skillMatch = this.calculateSkillMatch(candidateSkills, behavior.preferredSkills || []);
        const industryMatch = this.calculateIndustryMatch(candidateIndustry, behavior.industry || '');
        const positionMatch = this.calculatePositionMatch(candidateTitle, candidateKeywords, behavior.searchedPositions || []);
        const popularity = this.calculatePopularity(candidate);
        const totalScore = skillMatch * RECOMMENDATION_WEIGHTS.SKILL_MATCH +
            industryMatch * RECOMMENDATION_WEIGHTS.INDUSTRY_MATCH +
            positionMatch * RECOMMENDATION_WEIGHTS.POSITION_MATCH +
            popularity * RECOMMENDATION_WEIGHTS.POPULARITY;
        return {
            totalScore: Math.min(totalScore, 1.0),
            reason: {
                skillMatch,
                industryMatch,
                positionMatch,
                popularity,
                matchedSkills: skillMatch > 0 ? this.findMatchedSkills(candidateSkills, behavior.preferredSkills || []) : [],
                matchedKeywords: positionMatch > 0 ? this.findMatchedKeywords(candidateKeywords, behavior.searchedPositions || []) : [],
            },
        };
    }
    calculateSkillMatch(candidateSkills, preferredSkills) {
        if (!preferredSkills || preferredSkills.length === 0) {
            return 0.3;
        }
        const matchedCount = this.findMatchedSkills(candidateSkills, preferredSkills).length;
        if (matchedCount === 0)
            return 0;
        return Math.min(matchedCount / preferredSkills.length, 1.0);
    }
    calculateIndustryMatch(candidateIndustry, userIndustry) {
        if (!userIndustry)
            return 0.5;
        if (!candidateIndustry)
            return 0.3;
        if (candidateIndustry.toLowerCase() === userIndustry.toLowerCase()) {
            return 1.0;
        }
        if (candidateIndustry.toLowerCase().includes(userIndustry.toLowerCase()) ||
            userIndustry.toLowerCase().includes(candidateIndustry.toLowerCase())) {
            return 0.7;
        }
        return 0.2;
    }
    calculatePositionMatch(candidateTitle, candidateKeywords, searchedPositions) {
        if (!searchedPositions || searchedPositions.length === 0) {
            return 0.5;
        }
        const matchedCount = this.findMatchedKeywords(candidateKeywords, searchedPositions).length;
        if (matchedCount === 0)
            return 0.2;
        return Math.min(matchedCount / searchedPositions.length, 1.0);
    }
    calculatePopularity(candidate) {
        const now = new Date().getTime();
        const createdAt = new Date(candidate.createdAt).getTime();
        const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
        if (daysSinceCreation <= 7) {
            return 1.0;
        }
        else if (daysSinceCreation <= 30) {
            return 0.7;
        }
        else if (daysSinceCreation <= 90) {
            return 0.4;
        }
        else {
            return 0.2;
        }
    }
    extractKeywords(candidate) {
        const resumeData = candidate.resumeJsonb || {};
        const keywords = [];
        if (resumeData.currentTitle) {
            keywords.push(resumeData.currentTitle.toLowerCase());
        }
        if (resumeData.workExperience) {
            resumeData.workExperience.forEach((exp) => {
                if (exp.position)
                    keywords.push(exp.position.toLowerCase());
                if (exp.company)
                    keywords.push(exp.company.toLowerCase());
            });
        }
        return keywords;
    }
    findMatchedSkills(candidateSkills, preferredSkills) {
        return candidateSkills.filter(skill => preferredSkills.some(preferred => skill.toLowerCase().includes(preferred.toLowerCase()) ||
            preferred.toLowerCase().includes(skill.toLowerCase())));
    }
    findMatchedKeywords(candidateKeywords, searchedPositions) {
        return candidateKeywords.filter(keyword => searchedPositions.some(position => keyword.includes(position.toLowerCase()) ||
            position.toLowerCase().includes(keyword)));
    }
    async saveRecommendation(userId, candidateId, score, reason) {
        const existing = await this.recommendationRepo.findOne({
            where: { userId, candidateId },
        });
        if (existing) {
            existing.score = score;
            existing.reason = reason;
            existing.status = 'pending';
            existing.updatedAt = new Date();
            return this.recommendationRepo.save(existing);
        }
        const recommendation = this.recommendationRepo.create({
            id: (0, uuid_1.v4)(),
            userId,
            candidateId,
            score,
            reason,
            status: 'pending',
        });
        return this.recommendationRepo.save(recommendation);
    }
    async getUserRecommendations(userId, limit = 20) {
        const recommendations = await this.recommendationRepo.find({
            where: { userId, status: 'pending' },
            order: { score: 'DESC', createdAt: 'DESC' },
            take: limit,
        });
        const results = [];
        for (const rec of recommendations) {
            const candidate = await this.candidateRepo.findOne({
                where: { id: Number(rec.candidateId) },
            });
            if (candidate) {
                results.push({
                    id: rec.id,
                    candidateId: rec.candidateId,
                    candidate,
                    score: rec.score,
                    reason: rec.reason,
                    createdAt: rec.createdAt,
                });
            }
        }
        return results;
    }
    async updateRecommendationStatus(recommendationId, status) {
        await this.recommendationRepo.update(recommendationId, {
            status,
            updatedAt: new Date(),
        });
        this.logger.debug(`Recommendation ${recommendationId} status updated to ${status}`);
    }
    async bulkUpdateStatus(recommendationIds, status) {
        await this.recommendationRepo
            .createQueryBuilder()
            .update()
            .set({ status, updatedAt: new Date() })
            .where('id IN (:...ids)', { ids: recommendationIds })
            .execute();
        this.logger.debug(`Bulk updated ${recommendationIds.length} recommendations to ${status}`);
    }
    async clearUserCache(userId) {
        const pattern = `huntlink:cache:${this.CACHE_PREFIX}:user:${userId}:*`;
        await this.cacheService.deleteByPattern(pattern);
        this.logger.log(`Cleared cache for user ${userId}`);
    }
    async getRecommendationStats(userId) {
        const qb = this.recommendationRepo.createQueryBuilder('rec');
        if (userId) {
            qb.where('rec.user_id = :userId', { userId });
        }
        const total = await qb.getCount();
        const statusStats = await this.recommendationRepo
            .createQueryBuilder('rec')
            .select('rec.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('rec.status')
            .getRawMany();
        const avgScore = await this.recommendationRepo
            .createQueryBuilder('rec')
            .select('AVG(rec.score)', 'avg')
            .getRawOne();
        return {
            total,
            statusStats,
            avgScore: avgScore?.avg || 0,
        };
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = RecommendationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recommendation_entity_1.Recommendation)),
    __param(1, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        cache_service_1.CacheService])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map