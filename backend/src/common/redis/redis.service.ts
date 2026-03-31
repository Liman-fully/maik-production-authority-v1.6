import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: any; expires: number }>();

  constructor() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        db: Number(process.env.REDIS_DB) || 0,
        retryStrategy: () => null, // 禁用重试
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
    } catch (err) {
      this.logger.warn(`Redis初始化失败，使用内存缓存: ${err.message}`);
      this.redis = null;
    }
  }

  getClient(): Redis | null {
    return this.redis;
  }

  // 内存缓存方法
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (this.redis) {
      try {
        if (ttlSeconds) {
          await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        } else {
          await this.redis.set(key, JSON.stringify(value));
        }
        return;
      } catch (err) {
        this.logger.warn(`Redis set失败，使用内存缓存: ${err.message}`);
      }
    }
    
    const expires = ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0;
    this.memoryCache.set(key, { value, expires });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        this.logger.warn(`Redis get失败，使用内存缓存: ${err.message}`);
      }
    }
    
    const cached = this.memoryCache.get(key);
    if (!cached) return null;
    
    if (cached.expires && cached.expires < Date.now()) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return cached.value;
  }

  async del(key: string): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.del(key);
        return;
      } catch (err) {
        this.logger.warn(`Redis del失败，使用内存缓存: ${err.message}`);
      }
    }
    
    this.memoryCache.delete(key);
  }

  async onModuleDestroy() {
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (err) {
        // 忽略退出错误
      }
    }
  }
}
