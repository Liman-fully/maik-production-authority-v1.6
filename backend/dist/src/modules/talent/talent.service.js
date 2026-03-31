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
exports.TalentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const talent_entity_1 = require("./talent.entity");
const talent_filter_dto_1 = require("./dto/talent-filter.dto");
const redis_service_1 = require("../../common/redis/redis.service");
let TalentService = class TalentService {
    constructor(talentRepo, redisService) {
        this.talentRepo = talentRepo;
        this.redisService = redisService;
        this.CACHE_PREFIX = 'talent:search:';
        this.CACHE_TTL = 600;
    }
    getCacheKey(filter) {
        const serialized = JSON.stringify(filter);
        const hash = this.simpleHash(serialized);
        return `${this.CACHE_PREFIX}${hash}`;
    }
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
    async getFromCache(key) {
        try {
            const cached = await this.redisService.getClient().get(key);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.error('Redis cache get error:', error);
        }
        return null;
    }
    async setCache(key, value) {
        try {
            await this.redisService.getClient().setex(key, this.CACHE_TTL, JSON.stringify(value));
        }
        catch (error) {
            console.error('Redis cache set error:', error);
        }
    }
    async getTalents(filter) {
        const cacheKey = this.getCacheKey(filter);
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        const { page = 1, pageSize = 20, sortBy = talent_filter_dto_1.SortBy.LATEST, sortOrder = talent_filter_dto_1.SortOrder.DESC, ...filters } = filter;
        const skip = (page - 1) * pageSize;
        const queryBuilder = this.talentRepo.createQueryBuilder('talent');
        queryBuilder.select([
            'talent.id',
            'talent.userId',
            'talent.name',
            'talent.currentTitle',
            'talent.currentCompany',
            'talent.experience',
            'talent.education',
            'talent.location',
            'talent.expectedSalary',
            'talent.skills',
            'talent.jobStatus',
            'talent.age',
            'talent.industry',
            'talent.gender',
            'talent.jobType',
            'talent.matchScore',
            'talent.lastActive',
            'talent.verified',
            'talent.resumeComplete',
            'talent.createdAt',
        ]);
        const whereConditions = {};
        if (filters.location) {
            whereConditions.location = (0, typeorm_2.Like)(`%${filters.location}%`);
        }
        if (filters.experience) {
            whereConditions.experience = filters.experience;
        }
        if (filters.education) {
            whereConditions.education = filters.education;
        }
        if (filters.company) {
            whereConditions.currentCompany = (0, typeorm_2.Like)(`%${filters.company}%`);
        }
        if (filters.expectedSalary) {
            whereConditions.expectedSalary = filters.expectedSalary;
        }
        if (filters.jobStatus) {
            whereConditions.jobStatus = filters.jobStatus;
        }
        if (filters.industry) {
            whereConditions.industry = (0, typeorm_2.Like)(`%${filters.industry}%`);
        }
        if (filters.gender) {
            whereConditions.gender = filters.gender;
        }
        if (filters.jobType) {
            whereConditions.jobType = filters.jobType;
        }
        if (filters.workExperience) {
            whereConditions.workExperience = filters.workExperience;
        }
        if (filters.educationYear) {
            whereConditions.educationYear = filters.educationYear;
        }
        if (filters.resumeComplete !== undefined) {
            whereConditions.resumeComplete = filters.resumeComplete;
        }
        if (filters.verified !== undefined) {
            whereConditions.verified = filters.verified;
        }
        if (filters.skills) {
            const skillList = filters.skills.split(',').map(s => s.trim());
            whereConditions.skills = (0, typeorm_2.In)(skillList);
        }
        if (filters.age) {
            const [minAge, maxAge] = filters.age.split('-').map(Number);
            if (!isNaN(minAge) && !isNaN(maxAge)) {
                whereConditions.age = (0, typeorm_2.Between)(minAge, maxAge);
            }
        }
        if (filters.skillsCount) {
            const [minCount, maxCount] = filters.skillsCount.split('-').map(Number);
            if (!isNaN(minCount) && !isNaN(maxCount)) {
                whereConditions.skillsCount = (0, typeorm_2.Between)(minCount, maxCount);
            }
        }
        if (filters.matchScore) {
            const [minScore, maxScore] = filters.matchScore.split('-').map(Number);
            if (!isNaN(minScore) && !isNaN(maxScore)) {
                whereConditions.matchScore = (0, typeorm_2.Between)(minScore, maxScore);
            }
        }
        if (filters.lastActive) {
            const days = parseInt(filters.lastActive.replace('天', '').replace('最近', ''));
            if (!isNaN(days)) {
                const daysAgo = new Date();
                daysAgo.setDate(daysAgo.getDate() - days);
                whereConditions.lastActive = (0, typeorm_2.MoreThan)(daysAgo);
            }
        }
        if (Object.keys(whereConditions).length > 0) {
            queryBuilder.where(whereConditions);
        }
        switch (sortBy) {
            case talent_filter_dto_1.SortBy.ACTIVE:
                queryBuilder.orderBy('talent.lastActive', sortOrder === talent_filter_dto_1.SortOrder.ASC ? 'ASC' : 'DESC');
                break;
            case talent_filter_dto_1.SortBy.SCORE:
                queryBuilder.orderBy('talent.matchScore', sortOrder === talent_filter_dto_1.SortOrder.ASC ? 'ASC' : 'DESC');
                break;
            case talent_filter_dto_1.SortBy.LATEST:
            default:
                queryBuilder.orderBy('talent.createdAt', sortOrder === talent_filter_dto_1.SortOrder.ASC ? 'ASC' : 'DESC');
        }
        queryBuilder.skip(skip).take(pageSize);
        const [data, total] = await queryBuilder.getManyAndCount();
        const result = {
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
        this.setCache(cacheKey, result).catch(console.error);
        return result;
    }
    async clearSearchCache() {
        try {
            const redis = this.redisService.getClient();
            const keys = await redis.keys(`${this.CACHE_PREFIX}*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
        catch (error) {
            console.error('Clear cache error:', error);
        }
    }
};
exports.TalentService = TalentService;
exports.TalentService = TalentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(talent_entity_1.Talent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService])
], TalentService);
//# sourceMappingURL=talent.service.js.map