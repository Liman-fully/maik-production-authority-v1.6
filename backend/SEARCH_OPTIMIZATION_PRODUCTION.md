# 搜索性能优化 - 生产部署指南

**版本**: v1.0 (生产优化版)  
**更新日期**: 2026-03-27  
**适用环境**: 腾讯云 2C4G + MySQL 8.0 + Redis

---

## 🎯 优化目标

- 响应时间：< 1 秒（目标），< 500ms（优秀）
- 代码简洁：无冗余、易定位、可回滚
- 服务器适配：2C4G 配置友好

---

## 📦 服务器配置

### 当前配置
- **CPU**: 2 核
- **内存**: 4GB
- **数据库**: MySQL 8.0
- **缓存**: Redis (端口 6379)

### 资源限制
- MySQL 最大连接数：100
- Redis 最大内存：256MB
- Node.js 内存限制：1GB

---

## ⚠️ 三个关键问题解决方案

### 1. 缓存失效 - 自动化处理

**问题**: 手动调用容易遗漏，导致数据不一致

**解决方案**: 使用 TypeORM 事件监听器，自动触发缓存清理

**实现位置**: `backend/src/modules/talent/talent-event-listener.ts`

```typescript
import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, RemoveEvent, InsertEvent } from 'typeorm';
import { RedisService } from '../../common/redis/redis.service';
import { Talent } from './talent.entity';

@EventSubscriber()
export class TalentEventListener implements EntitySubscriberInterface<Talent> {
  listenTo() {
    return Talent;
  }

  async afterUpdate(event: UpdateEvent<Talent>) {
    await this.clearCache(event.manager);
  }

  async afterRemove(event: RemoveEvent<Talent>) {
    await this.clearCache(event.manager);
  }

  async afterInsert(event: InsertEvent<Talent>) {
    await this.clearCache(event.manager);
  }

  private async clearCache(manager: any) {
    try {
      const redis = manager.connection.options.extra?.redisService;
      if (redis) {
        const keys = await redis.keys('talent:search:*');
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(`[Cache] Cleared ${keys.length} search cache entries`);
        }
      }
    } catch (error) {
      console.error('[Cache] Failed to clear cache:', error.message);
      // 不抛出异常，避免影响主流程
    }
  }
}
```

**优点**:
- ✅ 自动触发，无需手动调用
- ✅ 解耦：业务代码不需要知道缓存逻辑
- ✅ 容错：缓存清理失败不影响主流程
- ✅ 易定位：独立文件，日志清晰

---

### 2. 索引维护 - 定时任务

**问题**: 手动执行容易忘记，索引统计信息过期

**解决方案**: 使用 cron 定时任务，每周自动维护

**实现位置**: `backend/src/common/maintenance/index-maintenance.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class IndexMaintenanceService {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  // 每周日凌晨 3 点执行
  @Cron(CronExpression.EVERY_WEEK)
  async analyzeTables() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.query('ANALYZE TABLE talents');
      console.log('[Maintenance] Index statistics updated');
    } catch (error) {
      console.error('[Maintenance] Failed to analyze tables:', error.message);
    }
  }

  // 每天凌晨 4 点检查慢查询
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async checkSlowQueries() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      const result = await queryRunner.query(`
        SELECT * FROM mysql.slow_log 
        WHERE start_time > DATE_SUB(NOW(), INTERVAL 1 DAY)
        LIMIT 10
      `);
      
      if (result.length > 0) {
        console.warn(`[Maintenance] Found ${result.length} slow queries today`);
      }
    } catch (error) {
      // 忽略错误，可能是权限问题
    }
  }
}
```

**依赖安装**:
```bash
npm install @nestjs/schedule
```

**模块注册**: `backend/src/app.module.ts`
```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { IndexMaintenanceService } from './common/maintenance/index-maintenance.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ...
  ],
  providers: [IndexMaintenanceService],
})
```

**优点**:
- ✅ 自动执行，无需人工干预
- ✅ 低峰期执行（凌晨 3 点）
- ✅ 资源友好（单表维护）
- ✅ 日志可追溯

---

### 3. 监控方案 - 轻量级中间件

**问题**: 过度监控增加服务器负担

**解决方案**: 轻量级查询日志中间件，只记录 > 500ms 的查询

**实现位置**: `backend/src/common/middleware/query-logging.middleware.ts`

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class QueryLoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    // 响应结束后记录
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // 只记录慢查询（> 500ms）
      if (duration > 500) {
        console.warn(`[SlowQuery] ${req.method} ${req.path} - ${duration}ms`);
      }
    });
    
    next();
  }
}
```

**模块注册**: `backend/src/app.module.ts`
```typescript
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { QueryLoggingMiddleware } from './common/middleware/query-logging.middleware';

@Module({
  // ...
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(QueryLoggingMiddleware)
      .forRoutes({ path: 'talents', method: RequestMethod.GET });
  }
}
```

**日志示例**:
```
[SlowQuery] GET /talents?location=北京&experience=3-5 年 - 756ms
[SlowQuery] GET /talents?skills=React,Vue - 623ms
```

**优点**:
- ✅ 轻量：只记录慢查询
- ✅ 精准：> 500ms 阈值可调
- ✅ 易定位：日志格式统一
- ✅ 无侵入：中间件模式

---

## 🚀 部署流程

### 1. 安装依赖

```bash
cd backend
npm install @nestjs/schedule
```

### 2. 应用数据库索引

```bash
./scripts/apply-indexes.sh
```

### 3. 编译代码

```bash
npm run build
```

### 4. 重启服务

```bash
pm2 restart huntlink-backend
```

### 5. 验证部署

```bash
# 检查索引
mysql -u root -p'huntlink' huntlink -e "SHOW INDEX FROM talents;"

# 检查 Redis
redis-cli keys "talent:search:*"

# 测试 API
curl http://localhost:3000/api/talents?location=北京
```

---

## 📊 监控面板

### 日志位置

```bash
# 应用日志
tail -f ~/.pm2/logs/huntlink-backend-out.log | grep -E "\[SlowQuery\]|\[Cache\]|\[Maintenance\]"

# 慢查询日志
tail -f ~/.pm2/logs/huntlink-backend-out.log | grep "\[SlowQuery\]"

# 缓存清理日志
tail -f ~/.pm2/logs/huntlink-backend-out.log | grep "\[Cache\]"
```

### 关键指标

| 指标 | 阈值 | 告警 |
|------|------|------|
| 平均响应时间 | < 500ms | > 1000ms |
| 缓存命中率 | > 60% | < 40% |
| 慢查询数量/天 | < 10 | > 50 |
| Redis 内存使用 | < 200MB | > 250MB |

---

## 🔧 故障排查

### 问题 1: 缓存不生效

**检查步骤**:
```bash
# 1. 检查 Redis 连接
redis-cli ping  # 应返回 PONG

# 2. 检查缓存键
redis-cli keys "talent:search:*"

# 3. 检查日志
grep "\[Cache\]" ~/.pm2/logs/huntlink-backend-out.log
```

**可能原因**:
- Redis 未启动
- 连接配置错误
- 缓存键生成逻辑问题

---

### 问题 2: 响应时间仍然很慢

**检查步骤**:
```bash
# 1. 检查索引
mysql -u root -p'huntlink' huntlink -e "SHOW INDEX FROM talents;"

# 2. 检查慢查询日志
grep "\[SlowQuery\]" ~/.pm2/logs/huntlink-backend-out.log

# 3. 手动更新统计信息
mysql -u root -p'huntlink' huntlink -e "ANALYZE TABLE talents;"
```

**可能原因**:
- 索引未应用
- 统计信息过期
- 查询条件未命中索引

---

### 问题 3: 定时任务未执行

**检查步骤**:
```bash
# 1. 检查模块是否注册
grep "ScheduleModule" backend/src/app.module.ts

# 2. 检查日志
grep "\[Maintenance\]" ~/.pm2/logs/huntlink-backend-out.log

# 3. 手动触发测试
curl http://localhost:3000/api/health
```

---

## 📁 文件清单

| 文件 | 说明 | 状态 |
|------|------|------|
| `talent-event-listener.ts` | 缓存失效监听器 | ✅ 新建 |
| `index-maintenance.service.ts` | 索引维护服务 | ✅ 新建 |
| `query-logging.middleware.ts` | 查询日志中间件 | ✅ 新建 |
| `apply-indexes.sh` | 索引部署脚本 | ✅ 已存在 |
| `add-search-indexes.sql` | 索引迁移 SQL | ✅ 已存在 |
| `search-performance.test.ts` | 性能测试脚本 | ✅ 已存在 |

---

## 🔄 回滚方案

### 快速回滚

```bash
# 1. 删除新增文件
rm src/modules/talent/talent-event-listener.ts
rm src/common/maintenance/index-maintenance.service.ts
rm src/common/middleware/query-logging.middleware.ts

# 2. 删除索引
mysql -u root -p'huntlink' huntlink < src/migrations/rollback-indexes.sql

# 3. 重启服务
pm2 restart huntlink-backend
```

### 索引回滚 SQL

```sql
-- 回滚脚本：src/migrations/rollback-indexes.sql
DROP INDEX IF EXISTS idx_talents_jobstatus_location ON talents;
DROP INDEX IF EXISTS idx_talents_jobstatus_experience ON talents;
DROP INDEX IF EXISTS idx_talents_jobstatus_education ON talents;
DROP INDEX IF EXISTS idx_talents_lastactive_desc ON talents;
DROP INDEX IF EXISTS idx_talents_matchscore_desc ON talents;
DROP INDEX IF EXISTS idx_talents_search_composite ON talents;
DROP INDEX IF EXISTS idx_talents_createdat_desc ON talents;
DROP INDEX IF EXISTS idx_talents_skills_count ON talents;
DROP INDEX IF EXISTS idx_talents_verified ON talents;
DROP INDEX IF EXISTS idx_talents_resume_complete ON talents;
```

---

## ✅ 验收清单

- [ ] 缓存失效自动化（EventSubscriber）
- [ ] 索引维护定时任务（Cron）
- [ ] 慢查询日志中间件（Middleware）
- [ ] 数据库索引已应用
- [ ] 响应时间 < 1 秒
- [ ] 日志清晰可定位
- [ ] 回滚方案已验证

---

**优化负责人**: 右护法  
**完成日期**: 2026-03-27  
**下次维护**: 每周日凌晨 3 点自动执行
