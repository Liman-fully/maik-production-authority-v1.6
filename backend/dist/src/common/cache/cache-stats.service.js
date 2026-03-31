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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStatsService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CacheStatsService = class CacheStatsService {
    constructor(redis) {
        this.redis = redis;
        this.statsWindow = 60;
        this.hitCounts = [];
        this.missCounts = [];
        this.responseTimes = [];
        this.moduleStats = new Map();
    }
    recordHit(module, responseTime) {
        this.hitCounts.push(1);
        this.responseTimes.push(responseTime);
        this.updateModuleStats(module, true);
        this.trimWindow();
    }
    recordMiss(module, responseTime) {
        this.missCounts.push(1);
        this.responseTimes.push(responseTime);
        this.updateModuleStats(module, false);
        this.trimWindow();
    }
    getStats() {
        const hits = this.hitCounts.reduce((a, b) => a + b, 0);
        const misses = this.missCounts.reduce((a, b) => a + b, 0);
        const total = hits + misses;
        return {
            hits,
            misses,
            hitRate: total > 0 ? (hits / total) * 100 : 0,
            avgResponseTime: this.responseTimes.length > 0
                ? this.responseTimes.reduce((a, b) => a + b, 0) /
                    this.responseTimes.length
                : 0,
        };
    }
    getModuleStats() {
        const result = [];
        this.moduleStats.forEach((stats, module) => {
            const total = stats.hits + stats.misses;
            result.push({
                module,
                hits: stats.hits,
                misses: stats.misses,
                hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
            });
        });
        return result.sort((a, b) => b.hits - a.hits);
    }
    async getCacheKeysByPrefix(prefix) {
        const keys = await this.redis.keys(`huntlink:cache:${prefix}:*`);
        return keys.length;
    }
    async getMemoryUsage() {
        const info = await this.redis.info('memory');
        const match = info.match(/used_memory_human:(.+)/);
        return match ? parseFloat(match[1].trim()) : 0;
    }
    clearStats() {
        this.hitCounts = [];
        this.missCounts = [];
        this.responseTimes = [];
        this.moduleStats.clear();
    }
    async healthCheck() {
        try {
            await this.redis.ping();
            return true;
        }
        catch {
            return false;
        }
    }
    updateModuleStats(module, isHit) {
        if (!this.moduleStats.has(module)) {
            this.moduleStats.set(module, { hits: 0, misses: 0 });
        }
        const stats = this.moduleStats.get(module);
        if (isHit) {
            stats.hits++;
        }
        else {
            stats.misses++;
        }
    }
    trimWindow() {
        if (this.hitCounts.length > 1000) {
            this.hitCounts.splice(0, this.hitCounts.length - 1000);
            this.missCounts.splice(0, this.missCounts.length - 1000);
            this.responseTimes.splice(0, this.responseTimes.length - 1000);
        }
    }
};
exports.CacheStatsService = CacheStatsService;
exports.CacheStatsService = CacheStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], CacheStatsService);
//# sourceMappingURL=cache-stats.service.js.map