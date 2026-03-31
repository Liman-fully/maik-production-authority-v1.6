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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandidateService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const candidate_entity_1 = require("./candidate.entity");
const cache_service_1 = require("../../common/cache/cache.service");
const EDUCATION_LABELS = {
    1: '本科',
    2: '硕士',
    3: '博士',
    4: '大专',
    5: '高中及以下',
};
let CandidateService = class CandidateService {
    constructor(candidateRepo, cacheService) {
        this.candidateRepo = candidateRepo;
        this.cacheService = cacheService;
        this.CACHE_TTL = 300;
        this.CACHE_PREFIX = 'candidate:search';
    }
    async searchCandidates(query) {
        const cacheKey = this.cacheService.generateKey(this.CACHE_PREFIX, query);
        return this.cacheService.getOrSet(cacheKey, async () => {
            return this.executeSearch(query);
        }, { ttl: this.CACHE_TTL });
    }
    async executeSearch(query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const offset = (page - 1) * limit;
        const qb = this.candidateRepo.createQueryBuilder('candidate');
        if (query.keyword) {
            qb.andWhere(new typeorm_2.Brackets(qb => {
                qb.where('candidate.name LIKE :keyword', { keyword: `%${query.keyword}%` });
                qb.orWhere(`candidate.resume_jsonb::text ILIKE :keywordVal`, { keywordVal: `%${query.keyword}%` });
            }));
        }
        if (query.city) {
            qb.andWhere('candidate.city = :city', { city: query.city });
        }
        if (query.educationLevel) {
            qb.andWhere('candidate.education_level >= :educationLevel', {
                educationLevel: query.educationLevel,
            });
        }
        if (query.workYearsMin !== undefined) {
            qb.andWhere('candidate.work_years >= :workYearsMin', {
                workYearsMin: query.workYearsMin,
            });
        }
        if (query.workYearsMax !== undefined) {
            qb.andWhere('candidate.work_years <= :workYearsMax', {
                workYearsMax: query.workYearsMax,
            });
        }
        if (query.skills && query.skills.length > 0) {
            qb.andWhere(new typeorm_2.Brackets(qb => {
                query.skills.forEach((skill, index) => {
                    qb.orWhere(`candidate.resume_jsonb->'skills' @> :skill${index}::jsonb`, { [`skill${index}`]: JSON.stringify([skill]) });
                });
            }));
        }
        const sortOrder = query.sortOrder || 'DESC';
        if (query.sortBy === 'work_years') {
            qb.orderBy('candidate.work_years', sortOrder);
        }
        else if (query.sortBy === 'created_at') {
            qb.orderBy('candidate.created_at', sortOrder);
        }
        else {
            qb.orderBy('candidate.created_at', 'DESC');
        }
        qb.skip(offset).take(limit);
        const [data, total] = await qb.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSearchSuggestions(query, limit = 5) {
        if (!query || query.length < 1) {
            return [];
        }
        const results = await this.candidateRepo
            .createQueryBuilder('candidate')
            .select('DISTINCT candidate.city', 'suggestion')
            .where('candidate.city LIKE :query', { query: `${query}%` })
            .limit(limit)
            .getRawMany();
        return results.map(r => r.suggestion).filter(Boolean);
    }
    highlightResult(candidate, keyword) {
        if (!keyword || !candidate)
            return candidate;
        const highlightText = (text) => {
            if (!text)
                return '';
            const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<b>$1</b>');
        };
        const resumeData = candidate.resumeJsonb || {};
        return {
            ...candidate,
            highlightedName: highlightText(candidate.name),
            highlightedTitle: resumeData.currentTitle ? highlightText(resumeData.currentTitle) : '',
            highlightedCompany: resumeData.currentCompany ? highlightText(resumeData.currentCompany) : '',
        };
    }
    async findOne(id) {
        return this.candidateRepo.findOne({ where: { id } });
    }
    async create(candidateData) {
        const candidate = this.candidateRepo.create(candidateData);
        const result = await this.candidateRepo.save(candidate);
        await this.invalidateSearchCache();
        return result;
    }
    async update(id, data) {
        await this.candidateRepo.update(id, data);
        const result = await this.findOne(id);
        await this.invalidateSearchCache();
        return result;
    }
    async delete(id) {
        await this.candidateRepo.delete(id);
        await this.invalidateSearchCache();
    }
    async invalidateSearchCache() {
        const pattern = `huntlink:cache:${this.CACHE_PREFIX}:*`;
        await this.cacheService.deleteByPattern(pattern);
        console.log('[CandidateService] Search cache invalidated');
    }
    getCacheStats() {
        return this.cacheService.getStats();
    }
    async getSearchStats(query) {
        const baseQb = this.candidateRepo.createQueryBuilder('candidate');
        if (query.keyword) {
            baseQb.andWhere(new typeorm_2.Brackets(qb => {
                qb.where('candidate.name LIKE :keyword', { keyword: `%${query.keyword}%` });
                qb.orWhere(`candidate.resume_jsonb LIKE :keywordJson`, { keywordJson: `%${query.keyword}%` });
            }));
        }
        if (query.city) {
            baseQb.andWhere('candidate.city = :city', { city: query.city });
        }
        const cityStats = await this.candidateRepo
            .createQueryBuilder('candidate')
            .select('candidate.city', 'label')
            .addSelect('COUNT(*)', 'count')
            .groupBy('candidate.city')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();
        const educationStats = await this.candidateRepo
            .createQueryBuilder('candidate')
            .select('candidate.education_level', 'level')
            .addSelect('COUNT(*)', 'count')
            .where('candidate.education_level IS NOT NULL')
            .groupBy('candidate.education_level')
            .orderBy('candidate.education_level', 'ASC')
            .getRawMany()
            .then(rows => rows.map(r => ({
            level: r.level,
            label: EDUCATION_LABELS[r.level] || '未知',
            count: Number(r.count),
        })));
        const workYearStats = await this.candidateRepo
            .createQueryBuilder('candidate')
            .select("CASE WHEN candidate.work_years < 3 THEN '0-3年' WHEN candidate.work_years < 5 THEN '3-5年' WHEN candidate.work_years < 10 THEN '5-10年' ELSE '10年以上' END", 'range')
            .addSelect('COUNT(*)', 'count')
            .where('candidate.work_years IS NOT NULL')
            .groupBy('range')
            .getRawMany();
        return { cityStats, educationStats, workYearStats };
    }
};
exports.CandidateService = CandidateService;
exports.CandidateService = CandidateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cache_service_1.CacheService])
], CandidateService);
//# sourceMappingURL=candidate.service.js.map