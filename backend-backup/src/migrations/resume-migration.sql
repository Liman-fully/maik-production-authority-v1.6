-- 简历库数据库迁移脚本 (PostgreSQL 版本)
-- 执行时间: 2026-03-27

-- 1. 简历表
CREATE TABLE IF NOT EXISTS resumes (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(20) NOT NULL,
  folder_id VARCHAR(36),
  
  -- 解析后数据
  parse_status VARCHAR(20) DEFAULT 'pending',
  parse_error TEXT,
  
  -- 解析后的结构化数据（JSON）
  basic_info JSONB,
  education JSONB,
  work_experience JSONB,
  projects JSONB,
  skills JSONB,
  certifications JSONB,
  job_intention JSONB,
  tags TEXT[],
  
  -- 是否公开到人才广场
  is_public BOOLEAN DEFAULT FALSE,
  source VARCHAR(50) DEFAULT 'upload',
  talent_id VARCHAR(36),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_folder_id ON resumes(folder_id);
CREATE INDEX IF NOT EXISTS idx_resumes_parse_status ON resumes(parse_status);
CREATE INDEX IF NOT EXISTS idx_resumes_is_public ON resumes(is_public);
CREATE INDEX IF NOT EXISTS idx_resumes_talent_id ON resumes(talent_id);

-- 更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_resumes_updated_at ON resumes;
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON resumes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. 简历文件夹表
CREATE TABLE IF NOT EXISTS resume_folders (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  parent_id VARCHAR(36),
  description TEXT,
  "order" INT DEFAULT 0,
  resume_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_folders_user_id ON resume_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_folders_parent_id ON resume_folders(parent_id);

DROP TRIGGER IF EXISTS update_resume_folders_updated_at ON resume_folders;
CREATE TRIGGER update_resume_folders_updated_at BEFORE UPDATE ON resume_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. 简历更新记录表(积分消费场景)
CREATE TABLE IF NOT EXISTS resume_updates (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  resume_id VARCHAR(36) NOT NULL,
  from_version INT NOT NULL,
  to_version INT NOT NULL,
  points_spent INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resume_updates_user_id ON resume_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_updates_resume_id ON resume_updates(resume_id);

-- 4. 邮箱配置表
CREATE TABLE IF NOT EXISTS email_configs (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  email VARCHAR(100) NOT NULL,
  imap_host VARCHAR(100) NOT NULL,
  imap_port INT NOT NULL,
  imap_user VARCHAR(100),
  imap_password VARCHAR(255),
  last_sync_at TIMESTAMP,
  sync_enabled BOOLEAN DEFAULT TRUE,
  auto_parse BOOLEAN DEFAULT TRUE,
  target_folder_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_configs_user_id ON email_configs(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uk_email_configs_user_email ON email_configs(user_id, email);

DROP TRIGGER IF EXISTS update_email_configs_updated_at ON email_configs;
CREATE TRIGGER update_email_configs_updated_at BEFORE UPDATE ON email_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 插入系统默认文件夹
INSERT INTO resume_folders (id, user_id, name, "order") VALUES
('folder-all', 'system', '全部简历', 0),
('folder-upload', 'system', '上传简历', 1),
('folder-email', 'system', '邮箱导入', 2)
ON CONFLICT (id) DO NOTHING;

-- 6. 添加积分消费记录字段（如果表存在）
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'points_transactions') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'points_transactions' AND column_name = 'resource_type') THEN
      ALTER TABLE points_transactions ADD COLUMN resource_type VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'points_transactions' AND column_name = 'resource_id') THEN
      ALTER TABLE points_transactions ADD COLUMN resource_id VARCHAR(36);
    END IF;
  END IF;
END $$;
