-- 职位分类表 (PostgreSQL 版本)
CREATE TABLE IF NOT EXISTS job_categories (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  level INT NOT NULL,
  parent_code VARCHAR(10),
  name VARCHAR(100) NOT NULL,
  keywords TEXT,
  positions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_categories_level ON job_categories(level);
CREATE INDEX IF NOT EXISTS idx_job_categories_parent ON job_categories(parent_code);
CREATE INDEX IF NOT EXISTS idx_job_categories_code ON job_categories(code);

COMMENT ON TABLE job_categories IS '职位分类表';

-- 人才职位扩展字段
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'talents' AND column_name = 'category_code') THEN
    ALTER TABLE talents ADD COLUMN category_code VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'talents' AND column_name = 'industry_code') THEN
    ALTER TABLE talents ADD COLUMN industry_code VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'talents' AND column_name = 'job_level') THEN
    ALTER TABLE talents ADD COLUMN job_level VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'talents' AND column_name = 'position_name') THEN
    ALTER TABLE talents ADD COLUMN position_name VARCHAR(100);
  END IF;
END $$;

-- 索引
CREATE INDEX IF NOT EXISTS idx_talents_category ON talents(category_code);
CREATE INDEX IF NOT EXISTS idx_talents_industry ON talents(industry_code);
CREATE INDEX IF NOT EXISTS idx_talents_job_level ON talents(job_level);

-- 分类日志表（用于持续优化）
CREATE TABLE IF NOT EXISTS classification_logs (
  id VARCHAR(36) PRIMARY KEY,
  input_text TEXT NOT NULL,
  result_category_code VARCHAR(10),
  result_category_name VARCHAR(100),
  result_industry_code VARCHAR(10),
  result_industry_name VARCHAR(100),
  confidence DECIMAL(3,2),
  match_type VARCHAR(20),
  matched_keywords TEXT,
  is_manual_override BOOLEAN DEFAULT FALSE,
  manual_result_category_code VARCHAR(10),
  error_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classification_logs_confidence ON classification_logs(confidence);
CREATE INDEX IF NOT EXISTS idx_classification_logs_manual_override ON classification_logs(is_manual_override);
CREATE INDEX IF NOT EXISTS idx_classification_logs_created_at ON classification_logs(created_at);

COMMENT ON TABLE classification_logs IS '分类日志表';
