# 搜索功能优化实施方案

**版本**: v1.1（优化版）  
**创建时间**: 2026-03-28 11:32  
**目标**: 性能提升 50%+

---

## 一、短期优化（本周执行）

### 1.1 Redis 查询缓存

**实现**:
```typescript
// backend/src/modules/candidate/candidate.service.ts
async searchCandidates(query: SearchCandidateDto): Promise<SearchResults> {
  // 生成缓存 Key
  const cacheKey = `search:${this.hashQuery(query)}`;
  
  // 检查缓存
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 查询数据库
  const results = await this.searchFromDatabase(query);
  
  // 写入缓存（5 分钟 TTL）
  await this.redis.setex(cacheKey, 300, JSON.stringify(results));
  
  return results;
}

private hashQuery(query: SearchCandidateDto): string {
  return crypto.createHash('md5').update(JSON.stringify(query)).digest('hex');
}
```

**预期效果**:
- 缓存命中率：70-80%
- 平均响应：150-300ms → 50-100ms
- 数据库负载：-60%

---

### 1.2 Keyset 分页（替代 offset）

**问题**: offset 在大数据量时性能差

**优化前**:
```sql
SELECT * FROM candidates
WHERE ...
ORDER BY created_at DESC
OFFSET 10000 LIMIT 20;  -- 慢！
```

**优化后**:
```sql
SELECT * FROM candidates
WHERE ...
  AND created_at < :last_seen_at
ORDER BY created_at DESC
LIMIT 20;  -- 快！
```

**实现**:
```typescript
async searchCandidates(query: SearchCandidateDto, cursor?: string): Promise<SearchResults> {
  const qb = this.candidateRepo.createQueryBuilder('candidate');
  
  // Keyset 分页
  if (cursor) {
    qb.andWhere('candidate.created_at < :cursor', { cursor });
  }
  
  qb.orderBy('candidate.created_at', 'DESC')
    .take(query.limit || 20);
  
  const data = await qb.getMany();
  
  return {
    data,
    nextCursor: data[data.length - 1]?.created_at,
    hasMore: data.length === query.limit,
  };
}
```

**预期效果**:
- 深分页性能：1000ms → 50ms
- 提升：95%

---

### 1.3 部分索引（只索引活跃候选人）

**实现**:
```sql
-- 创建部分索引
CREATE INDEX idx_candidates_active_search 
ON candidates USING GIN (search_context)
WHERE status = 1;

-- 技能标签部分索引
CREATE INDEX idx_candidates_active_skills 
ON candidates USING GIN (resume_jsonb->'skills')
WHERE status = 1;
```

**预期效果**:
- 索引大小：-70%（只索引活跃用户）
- 查询性能：+30%
- 写入性能：+20%

---

## 二、中期优化（本月执行）

### 2.1 物化视图（热门搜索预计算）

**实现**:
```sql
-- 创建物化视图
CREATE MATERIALIZED VIEW mv_hot_search_java AS
SELECT id, name, city, education_level, work_years, resume_url
FROM candidates
WHERE search_context @@ to_tsquery('chinese', 'Java')
  AND status = 1
ORDER BY ts_rank(search_context, to_tsquery('chinese', 'Java')) DESC
LIMIT 100;

-- 创建索引
CREATE UNIQUE INDEX ON mv_hot_search_java (id);

-- 每天刷新（凌晨 3 点）
CREATE OR REPLACE FUNCTION refresh_mv_hot_search()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hot_search_java;
END;
$$ LANGUAGE plpgsql;
```

**定时任务**:
```typescript
// backend/src/common/tasks/refresh-materialized-views.ts
@Cron(CronExpression.EVERY_DAY_AT_3AM)
async refreshMaterializedViews() {
  await this.dataSource.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_hot_search_java');
  console.log('[Task] Materialized view refreshed');
}
```

**预期效果**:
- 热门搜索响应：100-300ms → 20-50ms
- 提升：80%

---

### 2.2 搜索日志分析

**实现**:
```sql
-- 搜索日志表
CREATE TABLE search_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  query TEXT,
  filters JSONB,
  result_count INT,
  clicked_candidate_id INT,
  contacted_candidate_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_search_logs_query ON search_logs USING GIN (to_tsquery('chinese', query));
CREATE INDEX idx_search_logs_created_at ON search_logs (created_at);
```

**分析指标**:
- 热门搜索词（Top 100）
- 零结果搜索词（需要优化）
- 点击率（搜索结果质量）
- 转化率（联系人才比例）

---

## 三、长期优化（3 月+）

### 3.1 数据分区（按城市）

**实现**:
```sql
-- 创建分区表
CREATE TABLE candidates (
  id SERIAL,
  name VARCHAR(50),
  city VARCHAR(50),
  ...
) PARTITION BY LIST (city);

-- 创建分区
CREATE TABLE candidates_beijing PARTITION OF candidates
  FOR VALUES IN ('北京');

CREATE TABLE candidates_shanghai PARTITION OF candidates
  FOR VALUES IN ('上海');

CREATE TABLE candidates_shenzhen PARTITION OF candidates
  FOR VALUES IN ('深圳');
```

**预期效果**:
- 查询性能：+50%（只扫描对应分区）
- 维护效率：+80%（可单独维护分区）

---

### 3.2 读写分离

**架构**:
```
主库（写入） → 从库 1（搜索查询）
           → 从库 2（统计分析）
```

**配置**:
```typescript
// TypeORM 多数据源配置
const dataSource = new DataSource({
  type: 'postgres',
  entities: [Candidate],
  replicas: [
    { dataSource: { host: 'master' } },  // 写入
    { dataSource: { host: 'slave1' } },  // 搜索
    { dataSource: { host: 'slave2' } },  // 统计
  ],
});
```

**预期效果**:
- 写入性能：+100%
- 读取性能：+50%
- 可用性：+99.9%

---

## 四、性能对比

| 优化项 | 优化前 | 优化后 | 提升 |
|--------|--------|--------|------|
| **简单搜索** | 50-150ms | 20-50ms | +70% |
| **高级搜索** | 100-300ms | 50-150ms | +60% |
| **深分页** | 1000ms+ | 50ms | +95% |
| **热门搜索** | 100-300ms | 20-50ms | +80% |
| **技能搜索** | 50-200ms | 30-100ms | +50% |

---

## 五、实施计划

### 阶段 1: Redis 缓存（1 天）
- [ ] 安装 Redis 模块
- [ ] 实现查询缓存
- [ ] 测试验证

### 阶段 2: Keyset 分页（0.5 天）
- [ ] 修改分页逻辑
- [ ] 前端适配（cursor 传递）
- [ ] 测试验证

### 阶段 3: 部分索引（0.5 天）
- [ ] 创建部分索引
- [ ] 验证查询计划
- [ ] 性能测试

### 阶段 4: 物化视图（1 天）
- [ ] 创建物化视图
- [ ] 定时任务配置
- [ ] 测试验证

**总计**: 3 天

---

## 六、监控指标

### 6.1 性能指标

- P50 响应时间：< 100ms
- P95 响应时间：< 300ms
- P99 响应时间：< 500ms
- 缓存命中率：> 70%

### 6.2 业务指标

- 搜索使用率：> 80%
- 零结果率：< 5%
- 点击率：> 20%
- 转化率：> 5%

---

**右护法** | 镇抚司主官  
方案制定时间：2026-03-28 11:32
