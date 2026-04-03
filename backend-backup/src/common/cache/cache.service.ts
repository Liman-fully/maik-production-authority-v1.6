import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // 过期时间（秒），默认 300 秒（5 分钟）
  prefix?: string; // 缓存键前缀
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

/**
 * 缓存服务 - 提供 Redis 缓存功能
 * 功能：
 * - 缓存读写
 * - TTL 自动过期（默认 5 分钟）
 * - 缓存键生成规则
 * - 缓存命中率监控
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly DEFAULT_TTL = 300; // 5 分钟
  private readonly CACHE_PREFIX = 'huntlink:cache:';
  
  // 命中率统计
  private stats: {
    hits: number;
    misses: number;
  } = {
    hits: 0,
    misses: 0,
  };

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,
      // 连接池配置 - 本地开发环境禁用重试
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,
      retryStrategy: () => null,
      connectTimeout: 1000,
    });

    // 监听连接错误
    this.redis.on('error', (err) => {
      console.error('[CacheService] Redis connection error:', err.message);
    });

    this.redis.on('connect', () => {
      console.log('[CacheService] Redis connected');
    });
  }

  /**
   * 生成缓存键
   * 规则：prefix + ':' + 方法名 + ':' + 参数哈希
   */
  generateKey(methodName: string, params: any, prefix?: string): string {
    const basePrefix = prefix || this.CACHE_PREFIX;
    const paramsHash = this.hashParams(params);
    return `${basePrefix}${methodName}:${paramsHash}`;
  }

  /**
   * 参数哈希生成（用于缓存键）
   */
  private hashParams(params: any): string {
    if (!params || typeof params !== 'object') {
      return String(params || '');
    }
    const sorted = JSON.stringify(params, Object.keys(params).sort());
    return this.simpleHash(sorted);
  }

  /**
   * 简单哈希函数（用于缓存键生成）
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 从缓存获取数据
   * @param key 缓存键
   * @returns 缓存的数据，如果不存在则返回 null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (data) {
        this.stats.hits++;
        return JSON.parse(data) as T;
      }
      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('[CacheService] Get error:', error.message);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（秒），默认 300 秒
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expireTime = ttl || this.DEFAULT_TTL;
      await this.redis.setex(key, expireTime, serialized);
    } catch (error) {
      console.error('[CacheService] Set error:', error.message);
    }
  }

  /**
   * 获取或设置缓存（缓存穿透保护）
   * @param key 缓存键
   * @param factory 数据工厂函数（缓存未命中时调用）
   * @param options 缓存选项
   * @returns 缓存或新获取的数据
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，执行工厂函数获取数据
    const data = await factory();
    
    // 设置缓存
    await this.set(key, data, options?.ttl);
    
    return data;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('[CacheService] Delete error:', error.message);
    }
  }

  /**
   * 批量删除缓存（支持通配符）
   * @param pattern 缓存键模式（如 'huntlink:cache:search:*'）
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`[CacheService] Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('[CacheService] DeleteByPattern error:', error.message);
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[CacheService] Exists error:', error.message);
      return false;
    }
  }

  /**
   * 获取缓存命中率统计
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Number(hitRate.toFixed(2)),
    };
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('[CacheService] Health check failed:', error.message);
      return false;
    }
  }

  /**
   * 清理资源
   */
  async onModuleDestroy() {
    await this.redis.quit();
    console.log('[CacheService] Redis connection closed');
  }
}
