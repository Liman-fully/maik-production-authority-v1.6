# 搜索功能优化 - 部署验证指南

**版本**: v1.0  
**创建时间**: 2026-03-28 15:30  
**执行时间**: 5-10 分钟

---

## 一、快速验证（推荐）

### 1.1 自动验证脚本

```bash
cd /var/www/huntlink/backend
chmod +x scripts/deploy-verify-search.sh
./scripts/deploy-verify-search.sh
```

**预期输出**:
```
✅ PostgreSQL 连接成功
✅ 部分索引创建成功
✅ 物化视图创建成功
✅ 部署验证完成！
```

---

## 二、手动验证

### 2.1 执行 SQL 脚本

```bash
# 1. 部分索引
sudo -u postgres psql -d huntlink -f scripts/create-partial-indexes.sql

# 2. 物化视图
sudo -u postgres psql -d huntlink -f scripts/create-materialized-views.sql
```

### 2.2 验证索引

```sql
-- 查看索引
SELECT 
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE tablename = 'candidates'
  AND indexname LIKE 'idx_candidates%'
ORDER BY indexname;

-- 预期结果:
-- idx_candidates_active_search    | 8 MB
-- idx_candidates_active_skills    | 2 MB
-- idx_candidates_search_context   | 15 MB
```

### 2.3 验证物化视图

```sql
-- 查看物化视图
SELECT 
  matviewname,
  pg_size_pretty(pg_relation_size(matviewname::regclass)) as size
FROM pg_matviews
WHERE matviewname LIKE 'mv_hot_search%';

-- 预期结果:
-- mv_hot_search_java     | 1 MB
-- mv_hot_search_python   | 1 MB
-- mv_hot_search_frontend | 1 MB
```

### 2.4 测试搜索性能

```sql
-- 测试搜索性能（使用 EXPLAIN ANALYZE）
EXPLAIN ANALYZE
SELECT id, name, city
FROM candidates
WHERE search_context @@ to_tsquery('chinese', 'Java')
LIMIT 20;

-- 预期输出:
-- Execution Time: 20-50 ms  ✅
```

---

## 三、API 接口验证

### 3.1 测试搜索接口

```bash
# 第一次搜索（缓存未命中）
curl -X GET "http://localhost:3000/api/candidates/search?keyword=Java" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 查看日志，应包含:
# [Cache Miss] search:xxx

# 第二次搜索（缓存命中）
curl -X GET "http://localhost:3000/api/candidates/search?keyword=Java" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 查看日志，应包含:
# [Cache Hit] search:xxx
```

### 3.2 测试搜索建议

```bash
curl -X GET "http://localhost:3000/api/candidates/search/suggestions?q=北" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 预期返回:
# {"success": true, "data": ["北京", "北海", ...]}
```

### 3.3 测试搜索统计

```bash
curl -X GET "http://localhost:3000/api/candidates/search/stats?keyword=Java" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 预期返回:
# {"success": true, "data": {"cityStats": [...], "educationStats": [...], ...}}
```

---

## 四、性能基准测试

### 4.1 缓存命中率测试

```bash
# 连续搜索 10 次
for i in {1..10}; do
  curl -s "http://localhost:3000/api/candidates/search?keyword=Java" > /dev/null
done

# 查看日志
grep "Cache Hit" logs/app.log | wc -l  # 应 >= 7 (70% 命中率)
grep "Cache Miss" logs/app.log | wc -l # 应 <= 3
```

### 4.2 深分页性能测试

```bash
# 使用 Keyset 分页
curl -X GET "http://localhost:3000/api/candidates/search?keyword=Java&limit=20"
# 记录 last_cursor

curl -X GET "http://localhost:3000/api/candidates/search?keyword=Java&limit=20&cursor=LAST_CURSOR"
# 响应时间应 < 100ms
```

### 4.3 热门搜索性能测试

```sql
-- 直接查询物化视图
EXPLAIN ANALYZE
SELECT * FROM mv_hot_search_java;

-- 预期输出:
-- Execution Time: 5-20 ms  ✅
```

---

## 五、监控指标

### 5.1 Redis 缓存监控

```bash
# 查看缓存 Key
redis-cli keys "search:*" | wc -l

# 查看缓存大小
redis-cli memory usage search:xxx

# 查看缓存命中率（需要 Redis 4.0+）
redis-cli info stats | grep keyspace
```

### 5.2 数据库监控

```sql
-- 查看慢查询
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 查看索引使用率
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read
FROM pg_stat_user_indexes
WHERE tablename = 'candidates'
ORDER BY idx_scan DESC;
```

### 5.3 应用监控

```bash
# 查看 PM2 日志
pm2 logs huntlink-backend --lines 100

# 查看缓存命中日志
grep "Cache Hit" logs/app.log | wc -l
grep "Cache Miss" logs/app.log | wc -l

# 计算命中率
# 命中率 = Cache Hit / (Cache Hit + Cache Miss) * 100%
```

---

## 六、故障排查

### Q1: 缓存命中率低？

**A**: 
- 检查 Redis 连接是否正常
- 检查查询参数是否一致（hash 相同）
- 检查 TTL 是否过短（建议 300 秒）

### Q2: 物化视图刷新失败？

**A**:
```sql
-- 手动刷新测试
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hot_search_java;

-- 查看错误日志
SELECT pg_last_error();
```

### Q3: 搜索性能不达标？

**A**:
1. 检查 GIN 索引是否创建
2. 检查 ANALYZE 是否执行
3. 检查查询计划（EXPLAIN ANALYZE）
4. 检查内存配置（shared_buffers）

---

## 七、验收标准

### 7.1 功能验收

- [ ] 搜索接口可用
- [ ] 搜索建议接口可用
- [ ] 搜索统计接口可用
- [ ] 缓存命中日志正常
- [ ] 物化视图刷新正常

### 7.2 性能验收

| 指标 | 目标值 | 实测值 | 状态 |
|------|--------|--------|------|
| 简单搜索 | < 50ms | ___ms | ⬜ |
| 深分页 | < 100ms | ___ms | ⬜ |
| 热门搜索 | < 50ms | ___ms | ⬜ |
| 缓存命中率 | > 70% | ___% | ⬜ |

### 7.3 稳定性验收

- [ ] 连续运行 24 小时无故障
- [ ] 缓存命中率稳定 > 70%
- [ ] 物化视图每天自动刷新
- [ ] 内存占用稳定 < 80%

---

## 八、回滚方案

### 8.1 回滚索引

```sql
-- 删除部分索引
DROP INDEX IF EXISTS idx_candidates_active_search;
DROP INDEX IF EXISTS idx_candidates_active_skills;
```

### 8.2 回滚物化视图

```sql
-- 删除物化视图
DROP MATERIALIZED VIEW IF EXISTS mv_hot_search_java;
DROP MATERIALIZED VIEW IF EXISTS mv_hot_search_python;
DROP MATERIALIZED VIEW IF EXISTS mv_hot_search_frontend;
```

### 8.3 关闭缓存

```typescript
// 临时关闭缓存（修改 candidate.service.ts）
// 注释掉缓存相关代码
```

---

**右护法** | 镇抚司主官  
指南创建时间：2026-03-28 15:30

**都统请按照此指南执行部署验证！**
