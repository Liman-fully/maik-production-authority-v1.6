import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';

/**
 * 下载频率限制 Guard
 * 
 * 限制策略：
 * - 每分钟最多 5 份
 * - 每小时最多 50 份
 * - 每天最多 200 份
 */
@Injectable()
export class DownloadLimitGuard implements CanActivate {
  private readonly LIMITS = {
    PER_MINUTE: 5,
    PER_HOUR: 50,
    PER_DAY: 200,
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      // 没有用户信息，跳过限制（由 JWT Guard 处理）
      return true;
    }

    const now = Date.now();
    const minuteKey = `download_limit:${userId}:minute:${Math.floor(now / 60000)}`;
    const hourKey = `download_limit:${userId}:hour:${Math.floor(now / 3600000)}`;
    const dayKey = `download_limit:${userId}:day:${Math.floor(now / 86400000)}`;

    // 并发检查所有限制
    const [minuteCount, hourCount, dayCount] = await Promise.all([
      this.redisService.getClient().get(minuteKey),
      this.redisService.getClient().get(hourKey),
      this.redisService.getClient().get(dayKey),
    ]);

    const currentMinute = parseInt(minuteCount || '0', 10);
    const currentHour = parseInt(hourCount || '0', 10);
    const currentDay = parseInt(dayCount || '0', 10);

    // 检查是否超过限制
    if (currentMinute >= this.LIMITS.PER_MINUTE) {
      throw new ForbiddenException('下载频率过高，请稍后再试（限制：每分钟 5 份）');
    }

    if (currentHour >= this.LIMITS.PER_HOUR) {
      throw new ForbiddenException('下载频率过高，请稍后再试（限制：每小时 50 份）');
    }

    if (currentDay >= this.LIMITS.PER_DAY) {
      throw new ForbiddenException('下载频率过高，请稍后再试（限制：每天 200 份）');
    }

    // 增加计数
    const pipeline = this.redisService.getClient().multi();
    
    pipeline.incr(minuteKey);
    pipeline.expire(minuteKey, 60); // 1 分钟过期
    
    pipeline.incr(hourKey);
    pipeline.expire(hourKey, 3600); // 1 小时过期
    
    pipeline.incr(dayKey);
    pipeline.expire(dayKey, 86400); // 24 小时过期

    await pipeline.exec();

    return true;
  }
}
