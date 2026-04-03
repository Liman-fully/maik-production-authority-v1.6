import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * 缓存模块 - 全局模块
 * 提供 CacheService 给整个应用使用
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
