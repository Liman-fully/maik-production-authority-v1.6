import { createConnection } from 'typeorm';
import { Talent } from '../src/modules/talent/talent.entity';

// 生成随机技能
const skillsPool = [
  'React', 'Vue', 'TypeScript', 'Node.js', 'Python', 'Java', 'Go', 'Kubernetes', 'Docker',
  'AWS', 'GCP', 'Azure', 'MySQL', 'PostgreSQL', 'Redis', 'MongoDB', 'GraphQL', 'REST API',
  '微服务', 'DevOps', 'CI/CD', '敏捷开发', 'Scrum', '产品设计', '用户体验', '数据分析',
  '机器学习', '深度学习', '自然语言处理', '计算机视觉'
];

const getRandomSkills = () => {
  const count = Math.floor(Math.random() * 5) + 3; // 3-7个技能
  const shuffled = [...skillsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 生成随机公司
const companies = [
  '腾讯', '阿里巴巴', '字节跳动', '百度', '美团', '滴滴', '京东', '拼多多', '网易',
  '小米', '华为', 'OPPO', 'VIVO', '大疆', '商汤科技', '旷视科技', '依图科技',
  '微软中国', '谷歌中国', '亚马逊AWS', 'IBM', 'Oracle', 'SAP', '思科'
];

// 生成随机职位
const titles = [
  '高级前端工程师', '资深后端开发', '全栈工程师', '技术专家', '架构师',
  '产品经理', '高级设计师', '数据科学家', '算法工程师', '运维工程师',
  '测试开发工程师', '安全工程师', '移动端开发', '大数据工程师'
];

// 生成随机地点
const locations = [
  '北京', '上海', '深圳', '广州', '杭州', '成都', '南京', '武汉', '西安', '苏州'
];

// 生成随机教育背景
const educations = ['本科', '硕士', '博士', 'MBA'];

// 生成随机工作经验
const experiences = ['1-3年', '3-5年', '5-8年', '8-10年', '10年以上'];

// 生成随机期望薪资
const salaries = ['20-30k', '30-40k', '40-50k', '50-70k', '70-100k', '100k+'];

// 生成随机行业
const industries = ['互联网', '金融科技', '人工智能', '电子商务', '游戏', '教育', '医疗健康', '企业服务'];

// 生成随机职能
const functions = ['技术', '产品', '设计', '运营', '市场', '销售', '人事', '财务'];

async function injectRealTalents() {
  console.log('🚀 开始注入真实人才数据...');
  
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 15432,
    username: 'huntlink',
    password: 'huntlink_safe_2026',
    database: 'huntlink',
    entities: [Talent],
    synchronize: false,
  });

  try {
    // 检查现有数据数量
    const existingCount = await connection.manager.count(Talent);
    console.log(`📊 现有数据量: ${existingCount} 条`);
    
    // 如果已有数据，可以选择不清空，直接添加新数据
    if (existingCount > 0) {
      console.log('ℹ️  保留现有数据，追加新的人才记录');
    }

    // 创建10份带有不同 logic_tier 的人才记录
    const talents: Partial<Talent>[] = [];
    const tiers = ['S', 'A', 'B', 'C'];
    
    for (let i = 1; i <= 10; i++) {
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const matchScore = tier === 'S' ? 85 + Math.random() * 15 : 
                        tier === 'A' ? 70 + Math.random() * 15 :
                        tier === 'B' ? 50 + Math.random() * 20 : 30 + Math.random() * 20;
      
      const talent: Partial<Talent> = {
        userId: `user_${1000 + i}`,
        name: `人才${String.fromCharCode(65 + (i - 1) % 26)}${i}`,
        currentTitle: titles[Math.floor(Math.random() * titles.length)],
        currentCompany: companies[Math.floor(Math.random() * companies.length)],
        experience: experiences[Math.floor(Math.random() * experiences.length)],
        education: educations[Math.floor(Math.random() * educations.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        expectedSalary: salaries[Math.floor(Math.random() * salaries.length)],
        skills: getRandomSkills(),
        jobStatus: Math.random() > 0.3 ? '积极寻找' : '观望机会',
        age: 25 + Math.floor(Math.random() * 15),
        industry: industries[Math.floor(Math.random() * industries.length)],
        gender: Math.random() > 0.5 ? 'male' : 'female',
        jobType: '全职',
        workExperience: `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 5) + 6}年`,
        educationYear: `${2010 + Math.floor(Math.random() * 10)}-${2014 + Math.floor(Math.random() * 10)}`,
        skillsCount: 5 + Math.floor(Math.random() * 10),
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 30天内
        matchScore: Math.round(matchScore),
        personalScore: Math.round(60 + Math.random() * 40),
        resumeComplete: Math.random() > 0.2,
        isPublic: true,
        tier: tier,
        classification: [functions[Math.floor(Math.random() * functions.length)], '高级'],
        score: Math.round(70 + Math.random() * 30),
        verified: Math.random() > 0.1,
      };

      talents.push(talent);
    }

    // 批量插入
    const result = await connection.manager.save(Talent, talents as any);
    console.log(`✅ 成功注入 ${result.length} 份人才数据`);
    
    // 显示统计数据
    const tierStats: Record<string, number> = {};
    talents.forEach(t => {
      const tier = t.tier || 'C';
      tierStats[tier] = (tierStats[tier] || 0) + 1;
    });
    
    console.log('📊 人才等级分布:');
    Object.entries(tierStats).forEach(([tier, count]) => {
      console.log(`   ${tier}级: ${count}人`);
    });

    console.log('🎯 职场人脉数值已激活，可在 199 页面实时滚动查看');

  } catch (error) {
    console.error('❌ 注入人才数据失败:', error);
  } finally {
    await connection.close();
    console.log('🔗 数据库连接已关闭');
  }
}

// 执行注入
injectRealTalents().catch(console.error);