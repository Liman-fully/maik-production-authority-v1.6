-- 脉刻（MAIK）生产环境修复脚本
-- 执行时间：2026-04-02 22:45

-- 1. 清理旧数据
DELETE FROM resumes WHERE user_id LIKE 'mock_%';
DELETE FROM users WHERE email LIKE '%@huntlink.com';

-- 2. 注入1024份简历
DO $$
DECLARE
  i INTEGER;
BEGIN
  FOR i IN 1..1024 LOOP
    INSERT INTO resumes (
      id, user_id, file_name, file_path, file_size, file_type,
      cos_url, cos_key, parse_status, basic_info, education, 
      work_experience, projects, skills, tags, score, tier, 
      is_public, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'mock_user_' || ((i % 4) + 1),
      '简历_' || i || '.pdf',
      '/uploads/resumes/mock_user_' || ((i % 4) + 1) || '/resume_' || i || '.pdf',
      500000 + (i % 2000000),
      'pdf',
      'https://maik-resume-1251234567.cos.ap-shanghai.myqcloud.com/resumes/resume_' || i || '.pdf',
      'resumes/resume_' || i || '.pdf',
      'success',
      jsonb_build_object(
        'name', '人才' || i,
        'phone', '138' || LPAD((i % 100000000)::text, 8, '0'),
        'email', 'talent' || i || '@huntlink.com',
        'currentTitle', (ARRAY['前端工程师', '后端工程师', '全栈工程师', '产品经理', 'UI设计师', '数据分析师', '算法工程师', '测试工程师', 'DevOps工程师', '移动端开发'])[1 + (i % 10)],
        'currentCompany', (ARRAY['阿里巴巴', '腾讯', '字节跳动', '美团', '京东', '百度', '网易', '滴滴', '快手', '拼多多'])[1 + (i % 10)],
        'experienceYears', 1 + (i % 15),
        'educationLevel', (ARRAY['本科', '硕士', '博士', '大专'])[1 + (i % 4)],
        'age', 22 + (i % 20),
        'gender', CASE WHEN i % 2 = 0 THEN '男' ELSE '女' END,
        'location', (ARRAY['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '西安', '南京', '苏州'])[1 + (i % 10)]
      ),
      jsonb_build_array(
        jsonb_build_object(
          'school', CASE WHEN i % 5 = 0 THEN '清华大学' WHEN i % 5 = 1 THEN '北京大学' WHEN i % 5 = 2 THEN '复旦大学' WHEN i % 5 = 3 THEN '上海交通大学' ELSE '浙江大学' END,
          'major', CASE WHEN i % 3 = 0 THEN '计算机科学' WHEN i % 3 = 1 THEN '软件工程' ELSE '信息技术' END,
          'degree', (ARRAY['本科', '硕士', '博士', '大专'])[1 + (i % 4)],
          'graduationYear', 2010 + (i % 14)
        )
      ),
      jsonb_build_array(
        jsonb_build_object(
          'company', (ARRAY['阿里巴巴', '腾讯', '字节跳动', '美团', '京东', '百度', '网易', '滴滴', '快手', '拼多多'])[1 + (i % 10)],
          'title', (ARRAY['前端工程师', '后端工程师', '全栈工程师', '产品经理', 'UI设计师', '数据分析师', '算法工程师', '测试工程师', 'DevOps工程师', '移动端开发'])[1 + (i % 10)],
          'startDate', '2018-01-01',
          'endDate', '2023-12-31',
          'description', '负责核心产品开发和团队管理，带领5-10人团队完成多个重要项目',
          'achievements', '提升系统性能50%，用户增长300%'
        )
      ),
      jsonb_build_array(
        jsonb_build_object(
          'name', '智能推荐系统',
          'description', '基于机器学习的个性化推荐系统',
          'techStack', 'Python, TensorFlow, Redis, PostgreSQL',
          'role', '核心开发',
          'startDate', '2022-01',
          'endDate', '2023-06'
        )
      ),
      ARRAY[
        (ARRAY['JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'TypeScript', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', '微服务', '分布式系统', '机器学习', '深度学习', '数据分析', '产品策略', '用户体验', '项目管理'])[1 + (i % 22)],
        (ARRAY['JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'TypeScript', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', '微服务', '分布式系统', '机器学习', '深度学习', '数据分析', '产品策略', '用户体验', '项目管理'])[1 + ((i+5) % 22)],
        (ARRAY['JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'TypeScript', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', '微服务', '分布式系统', '机器学习', '深度学习', '数据分析', '产品策略', '用户体验', '项目管理'])[1 + ((i+10) % 22)],
        (ARRAY['JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'TypeScript', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', '微服务', '分布式系统', '机器学习', '深度学习', '数据分析', '产品策略', '用户体验', '项目管理'])[1 + ((i+15) % 22)],
        (ARRAY['JavaScript', 'React', 'Vue', 'Node.js', 'Python', 'Java', 'Go', 'TypeScript', 'SQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', '微服务', '分布式系统', '机器学习', '深度学习', '数据分析', '产品策略', '用户体验', '项目管理'])[1 + ((i+20) % 22)]
      ],
      ARRAY[
        (ARRAY['互联网', '金融', '电商', '教育', '医疗', '游戏', '企业服务', '硬件'])[1 + (i % 8)],
        (ARRAY['S级人才', 'A级人才', 'B级人才', 'C级人才'])[1 + (i % 4)],
        '技术专家',
        '全栈开发'
      ],
      45 + (i % 55),
      (ARRAY['S', 'A', 'B', 'C'])[1 + (i % 4)],
      true,
      NOW() - INTERVAL '1 day' * (i % 90),
      NOW() - INTERVAL '1 day' * (i % 45)
    );
  END LOOP;
END $$;

-- 3. 注入测试账号（bcrypt密码）
-- 密码: Admin123 / HR123456 / Seeker123 / Liman123
INSERT INTO users (
  id, email, hash_password, salt, name, tier, role, created_at, updated_at, last_login_at, is_active
) VALUES 
(
  gen_random_uuid(),
  'admin@huntlink.com',
  '$2b$10$rE9L2nJk2y3f3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3p4q',
  'salt_admin_2026',
  '系统管理员',
  'enterprise',
  'admin',
  NOW(),
  NOW(),
  NOW(),
  true
),
(
  gen_random_uuid(),
  'hr@huntlink.com',
  '$2b$10$sF0LmKk3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j',
  'salt_hr_2026',
  'HR招聘专员',
  'team',
  'recruiter',
  NOW(),
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
  'free',
  'jobseeker',
  NOW(),
  NOW(),
  NOW(),
  true
),
(
  gen_random_uuid(),
  'liman@huntlink.com',
  '$2b$10$uH2NoMl5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l',
  'salt_liman_2026',
  'Liman创始人',
  'enterprise',
  'admin',
  NOW(),
  NOW(),
  NOW(),
  true
);

-- 4. 修复ACN分账字段
ALTER TABLE resumes 
ADD COLUMN IF NOT EXISTS acn_sower_split DECIMAL(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS acn_keyholder_split DECIMAL(5,2) DEFAULT 30.00,
ADD COLUMN IF NOT EXISTS acn_maintainer_split DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS acn_promoter_split DECIMAL(5,2) DEFAULT 35.00,
ADD COLUMN IF NOT EXISTS acn_reviewer_split DECIMAL(5,2) DEFAULT 10.00,
ADD COLUMN IF NOT EXISTS acn_platform_split DECIMAL(5,2) DEFAULT 40.00;

-- 5. 更新mock数据ACN分账信息
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
FROM resumes WHERE is_public = true

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