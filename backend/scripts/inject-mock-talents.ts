import { createConnection } from 'typeorm';

// 人才数据 - 带有[审美分层]质感
const mockTalents = [
  {
    name: '张明轩',
    title: '资深全栈工程师',
    experience: '8年',
    education: '清华大学 计算机硕士',
    location: '北京',
    salary: '45-60K',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker', '微服务'],
    tags: ['技术专家', '架构师', '团队管理'],
    avatar_color: '#4F46E5',
    vip_level: 3,
    description: '拥有8年全栈开发经验，主导过多个千万级用户产品。擅长高性能架构设计和团队技术培养。'
  },
  {
    name: '李思雨',
    title: '产品设计总监',
    experience: '10年',
    education: '浙江大学 设计学博士',
    location: '杭州',
    salary: '50-70K',
    skills: ['UX设计', '产品策略', '用户研究', '团队管理', 'A/B测试'],
    tags: ['设计专家', '产品思维', '领导力'],
    avatar_color: '#EC4899',
    vip_level: 4,
    description: '10年产品设计经验，曾任职于阿里巴巴和腾讯。擅长从0到1构建产品体验体系。'
  },
  {
    name: '王浩然',
    title: '数据科学家',
    experience: '6年',
    education: '上海交通大学 人工智能硕士',
    location: '上海',
    salary: '40-55K',
    skills: ['Python', '机器学习', '深度学习', '大数据', 'SQL', '统计学'],
    tags: ['AI专家', '算法工程师', '数据分析'],
    avatar_color: '#10B981',
    vip_level: 2,
    description: '专注于机器学习算法在商业场景的应用，擅长用户画像构建和推荐系统优化。'
  },
  {
    name: '赵晓婷',
    title: '市场营销总监',
    experience: '9年',
    education: '复旦大学 MBA',
    location: '深圳',
    salary: '48-65K',
    skills: ['品牌策略', '数字营销', '社交媒体', '内容营销', '数据分析'],
    tags: ['营销专家', '品牌建设', '增长黑客'],
    avatar_color: '#F59E0B',
    vip_level: 3,
    description: '拥有丰富的品牌建设和数字营销经验，成功打造多个知名品牌营销案例。'
  },
  {
    name: '陈宇航',
    title: 'DevOps工程师',
    experience: '7年',
    education: '华中科技大学 软件工程学士',
    location: '武汉',
    salary: '35-50K',
    skills: ['Kubernetes', 'Docker', 'CI/CD', 'AWS', '监控系统', '自动化'],
    tags: ['运维专家', '云原生', 'SRE'],
    avatar_color: '#3B82F6',
    vip_level: 2,
    description: '专注于云原生架构和DevOps实践，擅长构建高可用、可扩展的微服务基础设施。'
  },
  {
    name: '刘诗涵',
    title: '前端架构师',
    experience: '8年',
    education: '北京邮电大学 计算机科学硕士',
    location: '北京',
    salary: '42-58K',
    skills: ['React', 'Vue', 'TypeScript', 'Webpack', '性能优化', '跨端开发'],
    tags: ['前端专家', '性能优化', '架构设计'],
    avatar_color: '#8B5CF6',
    vip_level: 3,
    description: '前端技术专家，擅长复杂SPA应用架构设计和性能优化，有丰富的团队管理经验。'
  },
  {
    name: '孙宇航',
    title: '后端架构师',
    experience: '9年',
    education: '南京大学 软件工程硕士',
    location: '南京',
    salary: '45-62K',
    skills: ['Java', 'Spring Cloud', '微服务', '分布式系统', '数据库优化'],
    tags: ['后端专家', '高并发', '系统架构'],
    avatar_color: '#EF4444',
    vip_level: 4,
    description: '专注后端高并发系统设计，有丰富的分布式系统架构和性能优化经验。'
  },
  {
    name: '周雨欣',
    title: 'UI/UX设计师',
    experience: '5年',
    education: '中国美术学院 视觉传达学士',
    location: '上海',
    salary: '30-45K',
    skills: ['Figma', 'Sketch', '动效设计', '用户研究', '设计系统'],
    tags: ['UI设计', '用户体验', '视觉设计'],
    avatar_color: '#06B6D4',
    vip_level: 1,
    description: '专注于用户体验和界面设计，擅长创建直观、美观的产品界面和设计系统。'
  },
  {
    name: '吴子轩',
    title: '移动开发工程师',
    experience: '6年',
    education: '西安电子科技大学 计算机科学学士',
    location: '西安',
    salary: '35-48K',
    skills: ['Flutter', 'React Native', 'iOS', 'Android', '跨平台开发'],
    tags: ['移动开发', '跨平台', 'App开发'],
    avatar_color: '#84CC16',
    vip_level: 2,
    description: '移动开发专家，精通跨平台开发技术，有多个成功上线的App产品经验。'
  },
  {
    name: '郑雅文',
    title: '商业分析师',
    experience: '7年',
    education: '中山大学 经济学硕士',
    location: '广州',
    salary: '38-52K',
    skills: ['数据分析', 'SQL', 'Tableau', '商业建模', '市场研究'],
    tags: ['商业分析', '数据驱动', '战略规划'],
    avatar_color: '#F97316',
    vip_level: 2,
    description: '擅长通过数据分析提供商业洞察，有丰富的市场研究和战略规划经验。'
  }
];

async function injectMockTalents() {
  console.log('开始注入[审美分层]质感的人才卡片数据...');

  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 15432,
    username: 'huntlink',
    password: 'huntlink_safe_2026',
    database: 'huntlink',
  });

  console.log('数据库连接成功');

  // 检查resumes表是否存在
  const tableExists = await connection.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'resumes'
    )
  `);

  if (!tableExists[0].exists) {
    console.error('resumes表不存在，请先创建表结构');
    await connection.close();
    return;
  }

  console.log('正在清空现有测试数据...');
  await connection.query(`DELETE FROM resumes WHERE is_mock = true`);

  console.log('开始注入10份高质量人才数据...');
  
  for (let i = 0; i < mockTalents.length; i++) {
    const talent = mockTalents[i];
    const userId = `mock_user_${i + 1}`;
    
    await connection.query(`
      INSERT INTO resumes (
        id, user_id, name, title, experience, education, location, 
        salary_expectation, skills, tags, avatar_color, vip_level, 
        description, is_mock, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW(), NOW()
      )
    `, [
      userId,
      talent.name,
      talent.title,
      talent.experience,
      talent.education,
      talent.location,
      talent.salary,
      JSON.stringify(talent.skills),
      JSON.stringify(talent.tags),
      talent.avatar_color,
      talent.vip_level,
      talent.description
    ]);

    console.log(`✓ 注入人才: ${talent.name} - ${talent.title}`);
  }

  // 验证数据
  const countResult = await connection.query('SELECT COUNT(*) as count FROM resumes WHERE is_mock = true');
  console.log(`\n✅ 数据注入完成！共注入 ${countResult[0].count} 份人才数据`);
  console.log('🎨 所有数据均带有[审美分层]质感，包含：');
  console.log('   - 丰富的技能标签');
  console.log('   - VIP等级标识');
  console.log('   - 个性化头像颜色');
  console.log('   - 详细的职业描述');
  console.log('   - 合理的薪资范围');

  await connection.close();
}

injectMockTalents().catch(err => {
  console.error('数据注入失败:', err);
  process.exit(1);
});