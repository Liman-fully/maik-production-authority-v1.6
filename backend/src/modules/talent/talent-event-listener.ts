import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, RemoveEvent, InsertEvent } from 'typeorm';
import { RedisService } from '../../common/redis/redis.service';
import { Talent } from './talent.entity';

/**
 * 人才实体事件监听器
 * 
 * 自动触发缓存清理，无需手动调用
 * 
 * 触发场景:
 * - afterInsert: 新增人才后
 * - afterUpdate: 更新人才信息后
 * - afterRemove: 删除人才后
 * 
 * 容错机制:
 * - 缓存清理失败不影响主流程
 * - 错误日志记录，便于排查
 */
@EventSubscriber()
export class TalentEventListener implements EntitySubscriberInterface<Talent> {
  /**
   * 指定监听实体
   */
  listenTo() {
    return Talent;
  }

  /**
   * 插入后清理缓存
   */
  async afterInsert(event: InsertEvent<Talent>) {
    await this.clearSearchCache(event.connection);
  }

  /**
   * 更新后清理缓存
   */
  async afterUpdate(event: UpdateEvent<Talent>) {
    await this.clearSearchCache(event.connection);
  }

  /**
   * 删除后清理缓存
   */
  async afterRemove(event: RemoveEvent<Talent>) {
    await this.clearSearchCache(event.connection);
  }

  /**
   * 清理搜索缓存
   * 
   * 私有方法，不对外暴露
   * 只清理 talent:search:* 前缀的键
   */
  private async clearSearchCache(connection: any) {
    try {
      const redis = (connection.options.extra as any)?.redisService as RedisService;
      if (!redis) {
        console.warn('[TalentEventListener] RedisService not found in connection options');
        return;
      }

      const client = redis.getClient();
      const keys = await client.keys('talent:search:*');
      
      if (keys.length > 0) {
        await client.del(...keys);
        console.log(`[Cache] Cleared ${keys.length} search cache entries`);
      }
    } catch (error) {
      // 不抛出异常，避免影响主流程
      console.error('[TalentEventListener] Failed to clear cache:', error.message);
    }
  }
}
