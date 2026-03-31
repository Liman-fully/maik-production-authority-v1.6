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
exports.SearchLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const search_log_entity_1 = require("./search-log.entity");
let SearchLogService = class SearchLogService {
    constructor(searchLogRepo) {
        this.searchLogRepo = searchLogRepo;
    }
    async logSearch(params) {
        const log = this.searchLogRepo.create({
            userId: params.userId,
            query: params.query,
            filters: params.filters,
            resultCount: params.resultCount,
            responseTimeMs: params.responseTimeMs,
            cacheHit: params.cacheHit || false,
            createdAt: new Date(),
        });
        return await this.searchLogRepo.save(log);
    }
    async logClick(logId, candidateId) {
        await this.searchLogRepo.update(logId, { clickedCandidateId: candidateId });
    }
    async logContact(logId, candidateId) {
        await this.searchLogRepo.update(logId, { contactedCandidateId: candidateId });
    }
    async getHotSearchTerms(days = 7, limit = 100) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const results = await this.searchLogRepo
            .createQueryBuilder('log')
            .select('log.query', 'query')
            .addSelect('COUNT(*)', 'count')
            .addSelect('AVG(log.result_count)', 'avgResultCount')
            .addSelect(`
        COUNT(CASE WHEN log.clicked_candidate_id IS NOT NULL THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100
      `, 'clickRate')
            .addSelect(`
        COUNT(CASE WHEN log.contacted_candidate_id IS NOT NULL THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100
      `, 'contactRate')
            .where('log.created_at >= :since', { since })
            .groupBy('log.query')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();
        return results.map(r => ({
            query: r.query,
            count: parseInt(r.count),
            avgResultCount: parseFloat(r.avgResultCount),
            clickRate: parseFloat(r.clickRate),
            contactRate: parseFloat(r.contactRate),
        }));
    }
    async getZeroResultTerms(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const results = await this.searchLogRepo
            .createQueryBuilder('log')
            .select('log.query', 'query')
            .addSelect('COUNT(*)', 'count')
            .where('log.result_count = 0')
            .andWhere('log.created_at >= :since', { since })
            .groupBy('log.query')
            .orderBy('count', 'DESC')
            .limit(100)
            .getRawMany();
        return results.map(r => ({
            query: r.query,
            count: parseInt(r.count),
        }));
    }
    async getSearchStats(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const totalSearches = await this.searchLogRepo
            .createQueryBuilder('log')
            .where('log.created_at >= :since', { since })
            .getCount();
        const zeroResultSearches = await this.searchLogRepo
            .createQueryBuilder('log')
            .where('log.created_at >= :since', { since })
            .andWhere('log.result_count = 0')
            .getCount();
        const avgResponseTime = await this.searchLogRepo
            .createQueryBuilder('log')
            .select('AVG(log.response_time_ms)', 'avg')
            .where('log.created_at >= :since', { since })
            .andWhere('log.response_time_ms IS NOT NULL')
            .getRawOne();
        const cacheHitRate = await this.searchLogRepo
            .createQueryBuilder('log')
            .select(`
        COUNT(CASE WHEN log.cache_hit = true THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100
      `, 'rate')
            .where('log.created_at >= :since', { since })
            .getRawOne();
        return {
            totalSearches,
            zeroResultSearches,
            zeroResultRate: totalSearches > 0 ? (zeroResultSearches / totalSearches * 100) : 0,
            avgResponseTime: parseFloat(avgResponseTime?.avg || 0),
            cacheHitRate: parseFloat(cacheHitRate?.rate || 0),
        };
    }
    async getUserSearchHistory(userId, limit = 20) {
        return await this.searchLogRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async cleanupOldLogs(daysToKeep = 30) {
        const since = new Date();
        since.setDate(since.getDate() - daysToKeep);
        const result = await this.searchLogRepo
            .createQueryBuilder()
            .delete()
            .where('created_at < :since', { since })
            .execute();
        return result.affected || 0;
    }
};
exports.SearchLogService = SearchLogService;
exports.SearchLogService = SearchLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(search_log_entity_1.SearchLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SearchLogService);
//# sourceMappingURL=search-log.service.js.map