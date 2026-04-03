-- 注入1024个测试人才数据
-- 使用generate_series生成批量数据

DO $$
DECLARE
  i INTEGER;
  titles TEXT[] := ARRAY['前端工程师', '后端工程师', '全栈工程师', '产品经理', 'UI设计师', '数据分析师', '算法工程师', '测试工程师', 'DevOps工程师', '移动端开发'];
  companies TEXT[] := ARRAY['阿里巴巴', '腾讯', '字节跳动', '美团', '京东', '百度', '网易', '滴滴', '快手', '拼多多'];
  locations TEXT[] := ARRAY['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '西安', '南京', '苏州'];
  educations TEXT[] := ARRAY['本科', '硕士', '博士', '大专'];
  industries TEXT[] := ARRAY['互联网', '金融', '电商', '教育', '医疗', '游戏', '企业服务', '硬件'];
  genders_arr TEXT[] := ARRAY['男', '女'];
  job_types TEXT[] := ARRAY['全职', '兼职', '实习'];
  experiences TEXT[] := ARRAY['1-3年', '3-5年', '5-10年', '10年以上'];
  statuses TEXT[] := ARRAY['open', 'interviewing', 'employed'];
  tiers_arr TEXT[] := ARRAY['A', 'B', 'C'];
BEGIN
  FOR i IN 1..1024 LOOP
    INSERT INTO talents (
      id, user_id, name, currentTitle, currentCompany, experience,
      education, location, expected_salary, skills, job_status,
      age, industry, gender, work_experience, education_year,
      skills_count, last_active, match_score, personal_score,
      resume_complete, is_public, verified, created_at, updated_at,
      tier, classification, score
    ) VALUES (
      gen_random_uuid(),
      gen_random_uuid(),
      '人才' || i,
      titles[1 + (i % 10)],
      companies[1 + (i % 10)],
      experiences[1 + (i % 4)],
      educations[1 + (i % 4)],
      locations[1 + (i % 10)],
      (10 + (i % 40)) || 'K-' || (15 + (i % 40)) || 'K',
      'JavaScript, React, Node.js, Python, SQL',
      statuses[1 + (i % 3)],
      22 + (i % 30),
      industries[1 + (i % 8)],
      genders_arr[1 + (i % 2)],
      experiences[1 + (i % 4)],
      educations[1 + (i % 4)],
      3 + (i % 10),
      NOW() - INTERVAL '1 day' * (i % 30),
      60 + (i % 40),
      50 + (i % 50),
      true,
      true,
      i % 2 = 0,
      NOW() - INTERVAL '1 day' * (i % 60),
      NOW() - INTERVAL '1 day' * (i % 30),
      tiers_arr[1 + (i % 3)],
      '技术人才',
      60 + (i % 40)
    );
  END LOOP;
END $$;

SELECT COUNT(*) as total FROM talents;