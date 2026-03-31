# 搜索功能优化 - Phase 2 实施计划

**阶段**: Phase 2 - 搜索日志 + 数据分区  
**时间**: 2026-03-29 - 2026-03-30  
**目标**: 性能再提升 20%

---

## 一、搜索日志分析（1 天）

### 1.1 搜索日志表

```sql
CREATE TABLE search_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  query TEXT NOT NULL,
  filters JSONB,
  result_count INT,
  clicked_candidate_id INT,
  contacted_candidate_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_search_logs_query ON search_logs USING GIN (to_tsvector('chinese', query));
CREATE INDEX idx_search_logs_created_at ON search_logs (created_at);
CREATE INDEX idx_search_logs_user_id ON search_logs (user_id);
```

### 1.2 搜索日志服务

```typescript
// backend/src/modules/search/search-log.service.ts
@Injectable()
export class SearchLogService {
  async logSearch(userId: number, query: string, resultCount: number) {
    await this.searchLogRepo.save({
      userId,
      query,
      resultCount,
      createdAt: new Date(),
    });
  }

  async getHotSearchTerms(days: number = 7, limit: number = 100) {
    return await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('log.created_at > NOW() - :days * INTERVAL \'1 day\'', { days })
      .groupBy('log.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getZeroResultTerms(days: number = 7) {
    return await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.query', 'query')
      .where('log.result_count = 0')
      .andWhere('log.created_at > NOW() - :days * INTERVAL \'1 day\'', { days })
      .groupBy('log.query')
      .orderBy('COUNT(*)', 'DESC')
      .getRawMany();
  }
}
```

### 1.3 分析指标

| 指标 | 说明 | 目标值 |
|------|------|--------|
| 热门搜索词 | Top 100 | 用于物化视图 |
| 零结果搜索词 | 无结果搜索 | < 5% |
| 点击率 | 点击/搜索 | > 20% |
| 转化率 | 联系/搜索 | > 5% |

---

## 二、数据分区（> 500 万数据时）

### 2.1 按城市分区

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

CREATE TABLE candidates_guangzhou PARTITION OF candidates
  FOR VALUES IN ('广州');
```

### 2.2 分区优势

| 优势 | 说明 | 提升 |
|------|------|------|
| 查询性能 | 只扫描对应分区 | +50% |
| 维护效率 | 可单独维护分区 | +80% |
| 备份效率 | 可分区备份 | +60% |
| 归档效率 | 可快速归档旧分区 | +90% |

---

## 三、读写分离（可选）

### 3.1 架构设计

```
主库（写入） → 从库 1（搜索查询）
           → 从库 2（统计分析）
```

### 3.2 TypeORM 配置

```typescript
const dataSource = new DataSource({
  type: 'postgres',
  entities: [Candidate],
  replicas: [
    { dataSource: { host: 'master', read: false } },  // 写入
    { dataSource: { host: 'slave1', read: true } },   // 搜索
    { dataSource: { host: 'slave2', read: true } },   // 统计
  ],
});
```

---

## 四、性能目标

| 指标 | Phase 1 | Phase 2 | 提升 |
|------|---------|---------|------|
| 简单搜索 | 20-50ms | 10-30ms | +50% |
| 深分页 | 50ms | 30ms | +40% |
| 热门搜索 | 20-50ms | 5-20ms | +60% |
| 缓存命中率 | 70-80% | 80-90% | +12% |

---

## 五、实施时间表

| 时间 | 任务 | 负责人 |
|------|------|--------|
| 03-29 上午 | 搜索日志表 + 服务 | 右护法 |
| 03-29 下午 | 分析指标 + 报表 | 右护法 |
| 03-30 上午 | 数据分区方案 | 右护法 |
| 03-30 下午 | 性能测试 + 文档 | 右护法 |

---

**右护法** | 镇抚司主官  
计划制定时间：2026-03-28 15:30
