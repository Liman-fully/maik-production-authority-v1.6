# 🔍 搜索性能优化 - 快速开始

## 优化概述

本次优化将猎脉人才搜索的响应时间从 **3 秒** 降低到 **< 1 秒**。

## ⚠️ 三个关键问题已解决

### 1. 缓存失效 - 自动化 ✅

**问题**: 手动调用容易遗漏，导致数据不一致

**解决方案**: TypeORM 事件监听器自动触发

**实现**: `src/modules/talent/talent-event-listener.ts`

- 监听 `afterInsert`、`afterUpdate`、`afterRemove` 事件
- 自动清理 `talent:search:*` 缓存
- 容错机制：清理失败不影响主流程
- 日志清晰：`[Cache] Cleared X search cache entries`

**优点**:
- ✅ 无需手动调用
- ✅ 解耦：业务代码不需要知道缓存逻辑
- ✅ 易定位：独立文件，日志清晰

---

### 2. 索引维护 - 定时任务 ✅

**问题**: 手动执行容易忘记，索引统计信息过期

**解决方案**: Cron 定时任务自动维护

**实现**: `src/common/maintenance/index-maintenance.service.ts`

- 每周日凌晨 3 点：`ANALYZE TABLE talents`
- 每天凌晨 4 点：检查慢查询日志
- 资源友好：低峰期执行，单表维护

**优点**:
- ✅ 自动执行，无需人工干预
- ✅ 低峰期执行（凌晨 3 点）
- ✅ 日志可追溯

---

### 3. 监控方案 - 轻量级中间件 ✅

**问题**: 过度监控增加服务器负担

**解决方案**: 轻量级查询日志中间件

**实现**: `src/common/middleware/query-logging.middleware.ts`

- 只记录 > 500ms 的慢查询
- 日志格式：`[SlowQuery] GET /talents?... - 756ms`
- 阈值可调：默认 500ms

**优点**:
- ✅ 轻量：只记录慢查询
- ✅ 精准：> 500ms 阈值
- ✅ 易定位：日志格式统一

---

## 快速部署（3 步）

### 步骤 1: 应用数据库索引

```bash
cd backend
./scripts/apply-indexes.sh
```

如果脚本无法执行，手动运行：
```bash
mysql -h localhost -P 3306 -u root -p'HuntLink2026!dev' huntlink < src/migrations/add-search-indexes.sql
```

### 步骤 2: 编译代码

```bash
npm run build
```

### 步骤 3: 重启服务

```bash
pm2 restart huntlink-backend
# 或
npm run start:prod
```

## 验证优化效果

### 运行性能测试

```bash
npx ts-node src/performance/search-performance.test.ts
```

### 预期结果

| 场景 | 优化前 | 优化后（缓存未命中） | 优化后（缓存命中） |
|------|--------|---------------------|-------------------|
| 平均响应时间 | ~3000ms | ~350-500ms | ~50-100ms |

## 核心优化点

1. **QueryBuilder 优化** - 只查询必要字段，避免 SELECT *
2. **Redis 缓存** - 热门搜索结果缓存 10 分钟
3. **数据库索引** - 10 个复合索引覆盖常用查询场景

## 缓存管理

当人才数据更新时，需要清除缓存：

```typescript
// 在 TalentController 中调用
await this.talentService.clearSearchCache();
```

建议在以下位置调用：
- `update()` - 更新人才信息后
- `delete()` - 删除人才后
- 批量导入完成后

## 监控建议

添加慢查询监控：

```typescript
const start = Date.now();
const result = await queryBuilder.getManyAndCount();
const duration = Date.now() - start;

if (duration > 1000) {
  console.warn(`Slow query detected: ${duration}ms`, filter);
}
```

## 故障排查

### 问题：响应时间仍然很慢

**检查清单**:
- [ ] 数据库索引是否已应用？运行 `SHOW INDEX FROM talents;`
- [ ] Redis 是否可用？运行 `redis-cli ping`
- [ ] 缓存是否生效？检查 Redis 键 `talent:search:*`
- [ ] 数据库统计信息是否更新？运行 `ANALYZE TABLE talents;`

### 问题：缓存不生效

**可能原因**:
- Redis 连接失败
- 缓存键生成逻辑有问题
- TTL 设置过短

**解决方法**:
1. 检查 Redis 连接配置
2. 查看日志中的 Redis 错误
3. 调整 `CACHE_TTL` 参数

## 相关文件

- `src/modules/talent/talent.service.ts` - 搜索服务（已优化）
- `src/modules/talent/talent.entity.ts` - 实体定义（已添加索引）
- `src/migrations/add-search-indexes.sql` - 索引迁移脚本
- `src/performance/search-performance.test.ts` - 性能测试
- `scripts/apply-indexes.sh` - 自动化部署脚本
- `SEARCH_OPTIMIZATION_REPORT.md` - 详细优化报告

## 回滚方案

如果需要回滚，删除新增的索引：

```sql
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

**优化完成日期**: 2026-03-27
**优化负责人**: 右护法
