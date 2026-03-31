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
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let CacheService = class CacheService {
    constructor() {
        this.DEFAULT_TTL = 300;
        this.CACHE_PREFIX = 'huntlink:cache:';
        this.stats = {
            hits: 0,
            misses: 0,
        };
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            db: Number(process.env.REDIS_DB) || 0,
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                if (times > 3) {
                    return null;
                }
                return Math.min(times * 50, 2000);
            },
        });
        this.redis.on('error', (err) => {
            console.error('[CacheService] Redis connection error:', err.message);
        });
        this.redis.on('connect', () => {
            console.log('[CacheService] Redis connected');
        });
    }
    generateKey(methodName, params, prefix) {
        const basePrefix = prefix || this.CACHE_PREFIX;
        const paramsHash = this.hashParams(params);
        return `${basePrefix}${methodName}:${paramsHash}`;
    }
    hashParams(params) {
        if (!params || typeof params !== 'object') {
            return String(params || '');
        }
        const sorted = JSON.stringify(params, Object.keys(params).sort());
        return this.simpleHash(sorted);
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
    async get(key) {
        try {
            const data = await this.redis.get(key);
            if (data) {
                this.stats.hits++;
                return JSON.parse(data);
            }
            this.stats.misses++;
            return null;
        }
        catch (error) {
            console.error('[CacheService] Get error:', error.message);
            this.stats.misses++;
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            const serialized = JSON.stringify(value);
            const expireTime = ttl || this.DEFAULT_TTL;
            await this.redis.setex(key, expireTime, serialized);
        }
        catch (error) {
            console.error('[CacheService] Set error:', error.message);
        }
    }
    async getOrSet(key, factory, options) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const data = await factory();
        await this.set(key, data, options?.ttl);
        return data;
    }
    async delete(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            console.error('[CacheService] Delete error:', error.message);
        }
    }
    async deleteByPattern(pattern) {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                console.log(`[CacheService] Deleted ${keys.length} keys matching pattern: ${pattern}`);
            }
        }
        catch (error) {
            console.error('[CacheService] DeleteByPattern error:', error.message);
        }
    }
    async exists(key) {
        try {
            const result = await this.redis.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error('[CacheService] Exists error:', error.message);
            return false;
        }
    }
    getStats() {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
        return {
            hits: this.stats.hits,
            misses: this.stats.misses,
            hitRate: Number(hitRate.toFixed(2)),
        };
    }
    resetStats() {
        this.stats = { hits: 0, misses: 0 };
    }
    async healthCheck() {
        try {
            await this.redis.ping();
            return true;
        }
        catch (error) {
            console.error('[CacheService] Health check failed:', error.message);
            return false;
        }
    }
    async onModuleDestroy() {
        await this.redis.quit();
        console.log('[CacheService] Redis connection closed');
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CacheService);
//# sourceMappingURL=cache.service.js.map