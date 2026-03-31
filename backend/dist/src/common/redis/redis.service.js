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
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor() {
        this.logger = new common_1.Logger(RedisService_1.name);
        this.redis = null;
        this.memoryCache = new Map();
        try {
            this.redis = new ioredis_1.default({
                host: process.env.REDIS_HOST || 'localhost',
                port: Number(process.env.REDIS_PORT) || 6379,
                password: process.env.REDIS_PASSWORD || undefined,
                db: Number(process.env.REDIS_DB) || 0,
                retryStrategy: () => null,
                maxRetriesPerRequest: 0,
                enableOfflineQueue: false,
            });
            this.redis.on('error', (err) => {
                this.logger.warn(`Redis连接失败，使用内存缓存: ${err.message}`);
                this.redis = null;
            });
            this.redis.on('connect', () => {
                this.logger.log('Redis连接成功');
            });
        }
        catch (err) {
            this.logger.warn(`Redis初始化失败，使用内存缓存: ${err.message}`);
            this.redis = null;
        }
    }
    getClient() {
        return this.redis;
    }
    async set(key, value, ttlSeconds) {
        if (this.redis) {
            try {
                if (ttlSeconds) {
                    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
                }
                else {
                    await this.redis.set(key, JSON.stringify(value));
                }
                return;
            }
            catch (err) {
                this.logger.warn(`Redis set失败，使用内存缓存: ${err.message}`);
            }
        }
        const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
        this.memoryCache.set(key, { value, expires });
    }
    async get(key) {
        if (this.redis) {
            try {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            }
            catch (err) {
                this.logger.warn(`Redis get失败，使用内存缓存: ${err.message}`);
            }
        }
        const cached = this.memoryCache.get(key);
        if (!cached)
            return null;
        if (cached.expires && cached.expires < Date.now()) {
            this.memoryCache.delete(key);
            return null;
        }
        return cached.value;
    }
    async del(key) {
        if (this.redis) {
            try {
                await this.redis.del(key);
                return;
            }
            catch (err) {
                this.logger.warn(`Redis del失败，使用内存缓存: ${err.message}`);
            }
        }
        this.memoryCache.delete(key);
    }
    async onModuleDestroy() {
        if (this.redis) {
            try {
                await this.redis.quit();
            }
            catch (err) {
            }
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map