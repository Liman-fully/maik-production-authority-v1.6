-- 搜索日志表
CREATE TABLE IF NOT EXISTS search_logs (
  id SERIAL PRIMARY KEY,
  user_id INT,
  query TEXT NOT NULL,
  filters JSONB,
  result_count INT DEFAULT 0,
  clicked_candidate_id INT,
  contacted_candidate_id INT,
  response_time_ms INT,
  cache_hit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_search_logs_query ON search_logs USING GIN (to_tsvector('chinese', query));
CREATE INDEX IF NOT EXISTS idx_search_logs_created_at ON search_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_id ON search_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_result_count ON search_logs (result_count);

-- 查看表大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'search_logs';
