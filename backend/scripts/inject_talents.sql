-- 注入测试人才数据
-- 列名需要使用双引号因为包含大写字母

INSERT INTO talents (id, user_id, name, "currentTitle", "currentCompany", experience, education, location, expected_salary, skills, job_status, age, industry, gender, work_experience, education_year, skills_count, last_active, match_score, personal_score, resume_complete, is_public, verified, created_at, updated_at, tier, classification, score)
SELECT 
  gen_random_uuid(),
  gen_random_uuid(),
  '人才' || i,
  (ARRAY['前端工程师', '后端工程师', '全栈工程师', '产品经理', 'UI设计师', '数据分析师', '算法工程师', '测试工程师', 'DevOps工程师', '移动端开发'])[1 + (i % 10)],
  (ARRAY['阿里巴巴', '腾讯', '字节跳动', '美团', '京东', '百度', '网易', '滴滴', '快手', '拼多多'])[1 + (i % 10)],
  (ARRAY['1-3年', '3-5年', '5-10年', '10年以上'])[1 + (i % 4)],
  (ARRAY['本科', '硕士', '博士', '大专'])[1 + (i % 4)],
  (ARRAY['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '西安', '南京', '苏州'])[1 + (i % 10)],
  (10 + (i % 40)) || 'K-' || (15 + (i % 40)) || 'K',
  'JavaScript, React, Node.js, Python, SQL',
  (ARRAY['open', 'interviewing', 'employed'])[1 + (i % 3)],
  22 + (i % 30),
  (ARRAY['互联网', '金融', '电商', '教育', '医疗', '游戏', '企业服务', '硬件'])[1 + (i % 8)],
  (ARRAY['男', '女'])[1 + (i % 2)],
  (ARRAY['1-3年', '3-5年', '5-10年', '10年以上'])[1 + (i % 4)],
  (ARRAY['本科', '硕士', '博士', '大专'])[1 + (i % 4)],
  3 + (i % 10),
  NOW() - ((i % 30) || ' days')::interval,
  60 + (i % 40),
  50 + (i % 50),
  true,
  true,
  i % 2 = 0,
  NOW() - ((i % 60) || ' days')::interval,
  NOW() - ((i % 30) || ' days')::interval,
  (ARRAY['A', 'B', 'C'])[1 + (i % 3)],
  '技术人才',
  60 + (i % 40)
FROM generate_series(11, 1034) AS i;