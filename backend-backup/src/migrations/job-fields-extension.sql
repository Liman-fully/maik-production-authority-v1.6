-- Job实体字段扩展迁移脚本
-- 执行时间: 2026-04-01
-- 目的: 为职位表添加完整的功能字段

-- ========== 基础信息字段 ==========
ALTER TABLE job ADD COLUMN IF NOT EXISTS job_type VARCHAR(50);
ALTER TABLE job ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE job ADD COLUMN IF NOT EXISTS headcount INT;

-- ========== 薪资福利字段 ==========
ALTER TABLE job ADD COLUMN IF NOT EXISTS min_salary INT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS max_salary INT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS salary_negotiable BOOLEAN DEFAULT FALSE;
ALTER TABLE job ADD COLUMN IF NOT EXISTS benefits TEXT[];

-- ========== 职位要求字段 ==========
ALTER TABLE job ADD COLUMN IF NOT EXISTS education VARCHAR(20);
ALTER TABLE job ADD COLUMN IF NOT EXISTS min_experience INT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS max_experience INT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS skills TEXT[];

-- ========== 高级设置字段 ==========
ALTER TABLE job ADD COLUMN IF NOT EXISTS urgency VARCHAR(20) DEFAULT 'normal';
ALTER TABLE job ADD COLUMN IF NOT EXISTS referral_bonus INT;
ALTER TABLE job ADD COLUMN IF NOT EXISTS deadline TIMESTAMP;

-- ========== 创建索引以优化查询 ==========
CREATE INDEX IF NOT EXISTS idx_job_type ON job(job_type);
CREATE INDEX IF NOT EXISTS idx_job_location ON job(location);
CREATE INDEX IF NOT EXISTS idx_job_status ON job(status);
CREATE INDEX IF NOT EXISTS idx_job_urgency ON job(urgency);
CREATE INDEX IF NOT EXISTS idx_job_created_by ON job(created_by);

-- ========== 添加注释 ==========
COMMENT ON COLUMN job.job_type IS '职位类型：full-time/part-time/internship';
COMMENT ON COLUMN job.location IS '工作地点';
COMMENT ON COLUMN job.headcount IS '招聘人数';
COMMENT ON COLUMN job.min_salary IS '最低薪资（单位：元/月）';
COMMENT ON COLUMN job.max_salary IS '最高薪资（单位：元/月）';
COMMENT ON COLUMN job.salary_negotiable IS '是否面议';
COMMENT ON COLUMN job.benefits IS '福利待遇列表';
COMMENT ON COLUMN job.education IS '学历要求';
COMMENT ON COLUMN job.min_experience IS '最低工作年限';
COMMENT ON COLUMN job.max_experience IS '最高工作年限';
COMMENT ON COLUMN job.skills IS '技能标签列表';
COMMENT ON COLUMN job.urgency IS '紧急程度：normal/urgent/very-urgent';
COMMENT ON COLUMN job.referral_bonus IS '推荐奖励金额（元）';
COMMENT ON COLUMN job.deadline IS '截止日期';

-- ========== 验证迁移结果 ==========
DO $$
DECLARE
  col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_name = 'job' 
  AND column_name IN (
    'job_type', 'location', 'headcount', 'min_salary', 'max_salary',
    'salary_negotiable', 'benefits', 'education', 'min_experience',
    'max_experience', 'skills', 'urgency', 'referral_bonus', 'deadline'
  );
  
  IF col_count = 14 THEN
    RAISE NOTICE 'Job表字段迁移成功，共添加14个字段';
  ELSE
    RAISE EXCEPTION 'Job表字段迁移失败，预期14个字段，实际%', col_count;
  END IF;
END $$;
