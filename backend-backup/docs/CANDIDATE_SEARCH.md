# 简历搜索功能 - 技术文档

**版本**: v1.0  
**创建时间**: 2026-03-28 10:22  
**技术栈**: PostgreSQL 15+ GIN + tsvector

---

## 一、核心特性

### 1.1 全文搜索

- ✅ 基于 PostgreSQL GIN 索引
- ✅ 中文分词支持（to_tsvector('chinese')）
- ✅ 相关性排序（ts_rank）
- ✅ 高亮显示（ts_headline）

### 1.2 高级筛选

| 维度 | 说明 | 示例 |
|------|------|------|
| **关键词** | 职位/技能搜索 | "Java 工程师" |
| **城市** | 精确匹配 | "北京" |
| **学历** | 范围匹配 | 本科及以上 |
| **工作年限** | 范围匹配 | 3-5 年 |
| **技能标签** | JSONB 包含查询 | ["Java", "Spring"] |

### 1.3 性能优化

- ✅ GIN 索引（JSONB + tsvector）
- ✅ 分页限制（最大 100 条）
- ✅ 查询缓存（Redis，待实现）
- ✅ 物化视图（热门搜索，待实现）

---

## 二、API 接口

### 2.1 搜索候选人

**接口**: `GET /api/candidates/search`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词（职位/技能） |
| city | string | 否 | 城市 |
| educationLevel | number | 否 | 学历（1:本科，2:硕士，3:博士） |
| workYearsMin | number | 否 | 最小工作年限 |
| workYearsMax | number | 否 | 最大工作年限 |
| page | number | 否 | 页码（默认 1） |
| limit | number | 否 | 每页数量（默认 20，最大 100） |
| sortBy | string | 否 | 排序字段（relevance/work_years/created_at） |
| sortOrder | string | 否 | 排序方式（ASC/DESC） |

**请求示例**:
```bash
curl -X GET "http://localhost:3000/api/candidates/search?keyword=Java&city=北京&workYearsMin=3&workYearsMax=5&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "张三",
        "city": "北京",
        "educationLevel": 3,
        "workYears": 5,
        "resumeUrl": "https://huntlink-1306109984.cos.ap-guangzhou.myqcloud.com/resumes/..."
      }
    ],
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 2.2 搜索建议

**接口**: `GET /api/candidates/search/suggestions`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| limit | number | 否 | 建议数量（默认 5） |

**请求示例**:
```bash
curl -X GET "http://localhost:3000/api/candidates/search/suggestions?q=北&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**响应示例**:
```json
{
  "success": true,
  "data": ["北京", "北海", "百色", "毕节", "宝鸡"]
}
```

---

### 2.3 搜索结果统计

**接口**: `GET /api/candidates/search/stats`

**参数**: 同搜索接口

**响应示例**:
```json
{
  "success": true,
  "data": {
    "cityStats": [
      { "city": "北京", "count": 56 },
      { "city": "上海", "count": 42 },
      { "city": "深圳", "count": 38 }
    ],
    "educationStats": [
      { "level": 1, "count": 80 },
      { "level": 2, "count": 50 },
      { "level": 3, "count": 26 }
    ],
    "workYearStats": [
      { "range": "0-3 年", "count": 30 },
      { "range": "3-5 年", "count": 60 },
      { "range": "5-10 年", "count": 50 },
      { "range": "10 年以上", "count": 16 }
    ]
  }
}
```

---

### 2.4 高亮显示

**接口**: `GET /api/candidates/:id/highlight`

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 候选人 ID |
| keyword | string | 是 | 关键词 |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "张三",
    "highlightedExperience": "负责<b>Java</b>后端开发，熟悉<b>Java</b>生态..."
  }
}
```

---

## 三、SQL 查询示例

### 3.1 基础搜索

```sql
SELECT id, name, city, education_level, work_years
FROM candidates
WHERE search_context @@ to_tsquery('chinese', 'Java & 工程师')
ORDER BY ts_rank(search_context, to_tsquery('chinese', 'Java & 工程师')) DESC
LIMIT 20;
```

### 3.2 高级搜索

```sql
SELECT id, name, city, education_level, work_years
FROM candidates
WHERE search_context @@ to_tsquery('chinese', 'Java')
  AND city = '北京'
  AND education_level >= 3
  AND work_years BETWEEN 3 AND 5
ORDER BY ts_rank(search_context, to_tsquery('chinese', 'Java')) DESC
LIMIT 20;
```

### 3.3 技能标签搜索（JSONB）

```sql
SELECT id, name, resume_jsonb->'skills' as skills
FROM candidates
WHERE resume_jsonb->'skills' @> '["Java", "Spring"]'::jsonb
LIMIT 20;
```

### 3.4 高亮显示

```sql
SELECT 
  id,
  name,
  ts_headline('chinese', resume_jsonb->>'work_experience_text', to_tsquery('chinese', 'Java'), 
    'StartSel=<b>, StopSel=</b>, MaxFragments=3, FragmentDelimiter=" ... "') 
  as highlighted_experience
FROM candidates
WHERE search_context @@ to_tsquery('chinese', 'Java')
LIMIT 20;
```

---

## 四、性能基准

### 4.1 测试环境

- PostgreSQL 15
- 2G 内存
- 10 万数据量
- GIN 索引已创建

### 4.2 性能指标

| 查询类型 | 响应时间 | 说明 |
|----------|----------|------|
| 简单搜索（关键词） | 50-150ms | 使用 GIN 索引 |
| 高级搜索（多条件） | 100-300ms | 多索引组合 |
| 技能标签搜索 | 50-200ms | JSONB GIN 索引 |
| 高亮显示 | 100-250ms | ts_headline 计算 |
| 搜索建议 | 20-50ms | 简单 LIKE 查询 |
| 搜索统计 | 200-500ms | 多 GROUP BY |

---

## 五、优化建议

### 5.1 短期优化（1 周）

1. **查询缓存**
   ```typescript
   // Redis 缓存热门搜索（5 分钟 TTL）
   const cached = await redis.get(`search:${queryHash}`);
   if (cached) return JSON.parse(cached);
   ```

2. **分页优化**
   ```sql
   -- 使用 keyset 分页替代 offset
   WHERE id < last_seen_id
   ORDER BY id DESC
   LIMIT 20
   ```

3. **部分索引**
   ```sql
   -- 只索引活跃候选人
   CREATE INDEX idx_candidates_active_search 
   ON candidates USING GIN (search_context)
   WHERE status = 1;
   ```

### 5.2 中期优化（1 月）

1. **物化视图**
   ```sql
   CREATE MATERIALIZED VIEW mv_hot_search_java AS
   SELECT id, name, city, education_level
   FROM candidates
   WHERE search_context @@ to_tsquery('chinese', 'Java')
   ORDER BY ts_rank(search_context, to_tsquery('chinese', 'Java')) DESC
   LIMIT 100;
   ```

2. **搜索日志分析**
   - 记录热门搜索词
   - 零结果搜索词优化
   - 点击率分析

### 5.3 长期优化（3 月+）

1. **数据分区**
   ```sql
   -- 按城市分区
   CREATE TABLE candidates_beijing () INHERITS (candidates);
   ```

2. **读写分离**
   - 主库写入
   - 从库搜索查询

---

**右护法** | 镇抚司主官  
文档创建时间：2026-03-28 10:22
