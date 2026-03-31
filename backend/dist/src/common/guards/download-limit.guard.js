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
exports.DownloadLimitGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const redis_service_1 = require("../redis/redis.service");
let DownloadLimitGuard = class DownloadLimitGuard {
    constructor(reflector, redisService) {
        this.reflector = reflector;
        this.redisService = redisService;
        this.LIMITS = {
            PER_MINUTE: 5,
            PER_HOUR: 50,
            PER_DAY: 200,
        };
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) {
            return true;
        }
        const now = Date.now();
        const minuteKey = `download_limit:${userId}:minute:${Math.floor(now / 60000)}`;
        const hourKey = `download_limit:${userId}:hour:${Math.floor(now / 3600000)}`;
        const dayKey = `download_limit:${userId}:day:${Math.floor(now / 86400000)}`;
        const [minuteCount, hourCount, dayCount] = await Promise.all([
            this.redisService.getClient().get(minuteKey),
            this.redisService.getClient().get(hourKey),
            this.redisService.getClient().get(dayKey),
        ]);
        const currentMinute = parseInt(minuteCount || '0', 10);
        const currentHour = parseInt(hourCount || '0', 10);
        const currentDay = parseInt(dayCount || '0', 10);
        if (currentMinute >= this.LIMITS.PER_MINUTE) {
            throw new common_1.ForbiddenException('下载频率过高，请稍后再试（限制：每分钟 5 份）');
        }
        if (currentHour >= this.LIMITS.PER_HOUR) {
            throw new common_1.ForbiddenException('下载频率过高，请稍后再试（限制：每小时 50 份）');
        }
        if (currentDay >= this.LIMITS.PER_DAY) {
            throw new common_1.ForbiddenException('下载频率过高，请稍后再试（限制：每天 200 份）');
        }
        const pipeline = this.redisService.getClient().multi();
        pipeline.incr(minuteKey);
        pipeline.expire(minuteKey, 60);
        pipeline.incr(hourKey);
        pipeline.expire(hourKey, 3600);
        pipeline.incr(dayKey);
        pipeline.expire(dayKey, 86400);
        await pipeline.exec();
        return true;
    }
};
exports.DownloadLimitGuard = DownloadLimitGuard;
exports.DownloadLimitGuard = DownloadLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        redis_service_1.RedisService])
], DownloadLimitGuard);
//# sourceMappingURL=download-limit.guard.js.map