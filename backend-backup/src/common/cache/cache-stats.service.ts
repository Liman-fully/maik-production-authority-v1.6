import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  avgResponseTime: number;
  memoryUsage?: number;
}

export interface ModuleStats {
  module: string;
  hits: number;
  misses: number;
  hitRate: number;
}

@Injectable()
export class CacheStatsService {
  private statsWindow = 60; // 60 秒时间窗口
  private hitCounts: number[] = [];
  private missCounts: number[] = [];
  private responseTimes: number[] = [];
  private moduleStats: Map<string, { hits: number; misses: number }> = new Map();

  constructor(private redis: Redis) {}

  /**
   * 记录缓存命中
   */
  recordHit(module: string, responseTime: number): void {
    this.hitCounts.push(1);
    this.responseTimes.push(responseTime);
    this.updateModuleStats(module, true);
    this.trimWindow();
  }

  /**
   * 记录缓存未命中
   */
  recordMiss(module: string, responseTime: number): void {
    this.missCounts.push(1);
    this.responseTimes.push(responseTime);
    this.updateModuleStats(module, false);
    this.trimWindow();
  }

  /**
   * 获取总体统计信息
   */
  getStats(): CacheStats {
    const hits = this.hitCounts.reduce((a, b) => a + b, 0);
    const misses = this.missCounts.reduce((a, b) => a + b, 0);
    const total = hits + misses;

    return {
      hits,
      misses,
      hitRate: total > 0 ? (hits / total) * 100 : 0,
      avgResponseTime:
        this.responseTimes.length > 0
          ? this.responseTimes.reduce((a, b) => a + b, 0) /
            this.responseTimes.length
          : 0,
    };
  }

  /**
   * 获取模块统计信息
   */
  getModuleStats(): ModuleStats[] {
    const result: ModuleStats[] = [];

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

  /**
   * 按前缀统计缓存键
   */
  async getCacheKeysByPrefix(prefix: string): Promise<number> {
    const keys = await this.redis.keys(`huntlink:cache:${prefix}:*`);
    return keys.length;
  }

  /**
   * 获取内存使用量
   */
  async getMemoryUsage(): Promise<number> {
    const info = await this.redis.info('memory');
    const match = info.match(/used_memory_human:(.+)/);
    return match ? parseFloat(match[1].trim()) : 0;
  }

  /**
   * 清除所有统计
   */
  clearStats(): void {
    this.hitCounts = [];
    this.missCounts = [];
    this.responseTimes = [];
    this.moduleStats.clear();
  }

  /**
   * Redis 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  private updateModuleStats(
    module: string,
    isHit: boolean,
  ): void {
    if (!this.moduleStats.has(module)) {
      this.moduleStats.set(module, { hits: 0, misses: 0 });
    }

    const stats = this.moduleStats.get(module)!;
    if (isHit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
  }

  private trimWindow(): void {
    // 每秒清理一次，保持 60 秒时间窗口
    if (this.hitCounts.length > 1000) {
      this.hitCounts.splice(0, this.hitCounts.length - 1000);
      this.missCounts.splice(0, this.missCounts.length - 1000);
      this.responseTimes.splice(0, this.responseTimes.length - 1000);
    }
  }
}
