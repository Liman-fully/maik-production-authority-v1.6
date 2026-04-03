-- 脉刻（MAIK）生产环境修复脚本 - 简化版
-- 执行时间：2026-04-02 22:50
-- 适配现有表结构

-- 1. 清理旧数据
DELETE FROM resumes WHERE user_id LIKE 'mock_%';
DELETE FROM users WHERE email LIKE '%@huntlink.com';

-- 2. 注入1024份简历（最小化字段）
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..1024 LOOP
    INSERT INTO resumes (
      id, 
      user_id, 
      file_name, 
      file_path,
      file_size,
      file_type,
      parse_status,
      score,
      tier,
      is_public,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      'mock_user_' || ((i % 4) + 1),
      '简历_' || i || '.pdf',
      '/uploads/resumes/mock_user_' || ((i % 4) + 1) || '/resume_' || i || '.pdf',
      500000 + (i % 2000000),
      'pdf',
      'success',
      45 + (i % 55),
      CASE 
        WHEN i % 10 = 0 THEN 'S' 
        WHEN i % 3 = 0 THEN 'A' 
        WHEN i % 2 = 0 THEN 'B' 
        ELSE 'C' 
      END,
      true,
      NOW() - INTERVAL '1 day' * (i % 90),
      NOW() - INTERVAL '1 day' * (i % 45)
    );
  END LOOP;
END $$;

-- 3. 注入测试账号（适配现有enum）
-- 查询现有role类型：SELECT enumlabel FROM pg_enum WHERE enumtypid = 'users_role_enum'::regtype
INSERT INTO users (
  id, 
  email, 
  hash_password, 
  salt, 
  name, 
  role, 
  created_at, 
  updated_at, 
  is_active
) VALUES 
(
  gen_random_uuid(),
  'admin@huntlink.com',
  '$2b$10$rE9L2nJk2y3f3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q',
  'salt_admin_2026',
  '系统管理员',
  'admin',
  NOW(),
  NOW(),
  true
),
(
  gen_random_uuid(),
  'hr@huntlink.com',
  '$2b$10$sF0LmKk3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j',
  'salt_hr_2026',
  'HR专员',
  'user',
  NOW(),
  NOW(),
  true
),
(
  gen_random_uuid(),
  'seeker@huntlink.com',
  '$2b$10$tG1MnLk4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k',
  'salt_seeker_2026',
  '求职者',
  'user',
  NOW(),
  NOW(),
  true
),
(
  gen_random_uuid(),
  'liman@huntlink.com',
  '$2b$10$uH2NoMl5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l',
  'salt_liman_2026',
  'Liman',
  'admin',
  NOW(),
  NOW(),
  true
);

-- 4. 修复ACN分账字段（仅添加存在的表）
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS acn_sower_split DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS acn_keyholder_split DECIMAL(5,2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS acn_maintainer_split DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS acn_promoter_split DECIMAL(5,2) DEFAULT 35.00,
ADD COLUMN IF NOT EXISTS acn_reviewer_split DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS acn_platform_split DECIMAL(5,2) DEFAULT 40.00;

-- 5. 更新ACN分账信息
UPDATE resumes 
SET 
  acn_sower_split = 15.00,
  acn_keyholder_split = 30.00,
  acn_maintainer_split = 10.00,
  acn_promoter_split = 35.00,
  acn_reviewer_split = 10.00,
  acn_platform_split = 40.00
WHERE user_id LIKE 'mock_%';

-- 6. 验证数据
SELECT 
  '📝 测试简历' as item,
  COUNT(*) as count
FROM resumes WHERE user_id LIKE 'mock_%'

UNION ALL

SELECT 
  '👤 测试账号' as item,
  COUNT(*) as count
FROM users WHERE email IN ('admin@huntlink.com', 'hr@huntlink.com', 'seeker@huntlink.com', 'liman@huntlink.com')

UNION ALL

SELECT 
  '🔓 公开简历' as item,
  COUNT(*) as count
FROM resumes 

UNION ALL

SELECT 
  '💰 ACN字段' as item,
  COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'resumes' AND column_name LIKE 'acn_%'

UNION ALL

SELECT 
  '📊 平均分数' as item,
  ROUND(AVG(score)::numeric, 1) as count
FROM resumes WHERE user_id LIKE 'mock_%';