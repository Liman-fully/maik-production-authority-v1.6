import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,
    });
  }

  getClient(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
