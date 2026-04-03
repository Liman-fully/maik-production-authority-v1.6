-- 数据分区方案（按城市分区）
-- 适用场景：数据量 > 500 万

-- 1. 创建分区表（PostgreSQL 10+）
CREATE TABLE candidates_partitioned (
  id SERIAL,
  name VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(100),
  work_years INT DEFAULT 0,
  city VARCHAR(50) NOT NULL,
  education_level INT,
  resume_jsonb JSONB,
  search_context tsvector,
  resume_url VARCHAR(255),
  status INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, city)
) PARTITION BY LIST (city);

-- 2. 创建分区（主要城市）
CREATE TABLE candidates_beijing PARTITION OF candidates_partitioned
  FOR VALUES IN ('北京');

CREATE TABLE candidates_shanghai PARTITION OF candidates_partitioned
  FOR VALUES IN ('上海');

CREATE TABLE candidates_shenzhen PARTITION OF candidates_partitioned
  FOR VALUES IN ('深圳');

CREATE TABLE candidates_guangzhou PARTITION OF candidates_partitioned
  FOR VALUES IN ('广州');

CREATE TABLE candidates_hangzhou PARTITION OF candidates_partitioned
  FOR VALUES IN ('杭州');

CREATE TABLE candidates_chengdu PARTITION OF candidates_partitioned
  FOR VALUES IN ('成都');

-- 3. 其他城市分区（默认分区）
CREATE TABLE candidates_other PARTITION OF candidates_partitioned
  DEFAULT;

-- 4. 创建索引（每个分区自动创建）
CREATE INDEX idx_candidates_partitioned_search_context 
  ON candidates_partitioned USING GIN (search_context);

CREATE INDEX idx_candidates_partitioned_resume_jsonb 
  ON candidates_partitioned USING GIN (resume_jsonb);

CREATE INDEX idx_candidates_partitioned_city 
  ON candidates_partitioned (city);

CREATE INDEX idx_candidates_partitioned_created_at 
  ON candidates_partitioned (created_at);

-- 5. 创建触发器（自动更新 search_context）
CREATE OR REPLACE FUNCTION update_candidate_search_vector_partitioned()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_context := 
    setweight(to_tsvector('chinese', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('chinese', coalesce(NEW.resume_jsonb->>'current_position', '')), 'A') ||
    setweight(to_tsvector('chinese', coalesce(array_to_string(NEW.resume_jsonb->'skills', ' '), '')), 'B') ||
    setweight(to_tsvector('chinese', coalesce(NEW.resume_jsonb->>'work_experience_text', '')), 'C') ||
    setweight(to_tsvector('chinese', coalesce(NEW.resume_jsonb->>'education_text', '')), 'D');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_search_vector_partitioned
BEFORE INSERT OR UPDATE ON candidates_partitioned
FOR EACH ROW
EXECUTE FUNCTION update_candidate_search_vector_partitioned();

-- 6. 数据迁移（从原表迁移到分区表）
-- INSERT INTO candidates_partitioned SELECT * FROM candidates;

-- 7. 验证分区
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'candidates_%'
ORDER BY tablename;

-- 8. 查询性能对比
-- 原表查询（扫描全表）
EXPLAIN ANALYZE SELECT * FROM candidates WHERE city = '北京' LIMIT 20;

-- 分区表查询（只扫描北京分区）
EXPLAIN ANALYZE SELECT * FROM candidates_partitioned WHERE city = '北京' LIMIT 20;
