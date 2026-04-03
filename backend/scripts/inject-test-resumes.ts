/**
 * 测试数据注入脚本 - 生成1000+份测试简历
 * 
 * 功能：
 * 1. 生成真实的中文姓名、手机号、邮箱
 * 2. 批量插入Resume和Talent表
 * 3. 支持进度显示和错误处理
 * 4. 避免重复数据
 * 
 * 使用方法：
 *   npx ts-node scripts/inject-test-resumes.ts
 * 
 * 注意事项：
 * - 确保SSH隧道已开启（localhost:15432 → 远程数据库）
 * - 使用批量插入优化性能
 * - 包含事务回滚机制
 */

import { createConnection, Connection, QueryRunner } from 'typeorm';
import { Resume } from '../src/modules/resume/resume.entity';
import { Talent } from '../src/modules/talent/talent.entity';
import { User } from '../src/modules/user/user.entity';

// ==================== 数据生成器 ====================

// 常用姓氏（前100个）
const SURNAMES = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '马', '胡', '朱', '郭', '何', '罗', '高', '林',
  '郑', '王', '谢', '唐', '韩', '曹', '许', '邓', '萧', '冯',
  '曾', '程', '蔡', '彭', '潘', '袁', '于', '董', '余', '苏',
  '叶', '吕', '魏', '蒋', '田', '杜', '丁', '沈', '姜', '范',
  '贾', '樊', '章', '路', '石', '宋', '谭', '贾', '吴', '周',
  '徐', '孙', '马', '朱', '胡', '郭', '林', '何', '高', '罗',
  '郑', '梁', '谢', '宋', '唐', '许', '韩', '冯', '邓', '曹',
  '彭', '曾', '萧', '田', '董', '潘', '袁', '蔡', '蒋', '余',
  '于', '杜', '叶', '程', '苏', '魏', '吕', '丁', '任', '沈'
];

// 名字常用字（男女混合）
const NAME_CHARS = [
  '伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋',
  '勇', '艳', '杰', '涛', '明', '超', '秀', '霞', '平', '刚',
  '桂', '华', '慧', '英', '建', '文', '斌', '玲', '辉', '梅',
  '婷', '鑫', '浩', '亮', '萍', '宇', '飞', '凯', '佳', '琳',
  '欣', '梦', '晴', '雪', '璐', '瑾', '颖', '思', '怡', '悦',
  '昊', '天', '宇', '轩', '然', '辰', '阳', '帆', '铭', '睿',
  '晨', '晖', '彦', '嘉', '雨', '林', '森', '峰', '江', '海',
  '云', '波', '涛', '龙', '凤', '燕', '雁', '虹', '霞', '露',
  '雯', '岚', '芸', '菲', '蕾', '薇', '茵', '萱', '瑶', '瑾',
  '欣', '悦', '怡', '宁', '安', '康', '健', '寿', '福', '禄'
];

// 技能列表（按领域分类）
const SKILLS_BY_DOMAIN = {
  '技术': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#',
    'React', 'Vue', 'Angular', 'Node.js', 'Next.js', 'NestJS', 'Spring Boot',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git',
    '微服务', '分布式系统', '高并发', '高可用', '系统设计', '算法',
    '机器学习', '深度学习', 'NLP', '计算机视觉', '数据分析', '大数据',
    'HTML5', 'CSS3', 'Sass', 'Less', 'Webpack', 'Vite', 'GraphQL', 'REST API',
    'Linux', 'Nginx', '性能优化', '安全', '测试', '敏捷开发', 'DevOps'
  ],
  '产品': [
    '产品规划', '用户研究', '需求分析', '原型设计', 'Axure', 'Figma', 'Sketch',
    '数据分析', 'SQL', 'A/B测试', '用户增长', '商业模式', '竞品分析',
    '项目管理', 'Scrum', 'OKR', '跨部门协作', '沟通能力', 'PRD撰写',
    'B端产品', 'C端产品', '移动端产品', '数据产品', 'AI产品', 'SaaS产品'
  ],
  '设计': [
    'UI设计', 'UX设计', '交互设计', '视觉设计', '品牌设计', 'Figma', 'Sketch',
    'Adobe XD', 'Photoshop', 'Illustrator', 'After Effects', 'Principle',
    '设计系统', '用户旅程', '信息架构', '可用性测试', '设计规范', '动效设计',
    '平面设计', '插画', '3D建模', 'C4D', 'Blender', '视频剪辑'
  ],
  '运营': [
    '内容运营', '用户运营', '活动运营', '社群运营', '新媒体运营', '短视频运营',
    '数据分析', 'SQL', 'Excel', 'Python', '用户增长', '裂变营销', 'SEO', 'SEM',
    '文案撰写', '创意策划', '项目管理', '跨部门协作', '数据驱动运营',
    '电商运营', '直播运营', '私域运营', '会员运营', '游戏运营'
  ],
  '市场': [
    '市场调研', '品牌推广', '广告投放', '数字营销', '内容营销', '公关传播',
    '活动策划', '媒体关系', '危机公关', '品牌定位', '竞品分析', '用户洞察',
    'Google Ads', 'Facebook Ads', '微博营销', '微信营销', '抖音营销',
    '合作伙伴管理', '渠道管理', '销售支持', 'CRM', '市场营销自动化'
  ],
  '人力': [
    '招聘', '培训', '绩效管理', '薪酬福利', '员工关系', '企业文化建设',
    '组织发展', '人才发展', 'HRBP', 'HRSSC', '人力资源规划', '劳动法',
    '员工满意度', '人才盘点', '继任计划', '领导力发展', '教练技术'
  ],
  '财务': [
    '财务分析', '预算管理', '成本控制', '审计', '税务筹划', '财务建模',
    'Excel', 'SAP', 'Oracle', 'QuickBooks', '财务报表', '现金流管理',
    '风险管理', '投融资', '尽职调查', '估值', '并购', 'IPO'
  ],
  '法务': [
    '合同审核', '法律咨询', '合规管理', '知识产权', '劳动法', '公司法',
    '诉讼仲裁', '法律文书撰写', '风险控制', '尽职调查', '投资并购法务'
  ]
};

// 城市列表（按一线城市、新一线、二线分组）
const CITIES = {
  '一线城市': ['北京', '上海', '广州', '深圳'],
  '新一线': ['杭州', '成都', '重庆', '武汉', '西安', '苏州', '天津', '南京', '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '佛山'],
  '二线': ['合肥', '福州', '厦门', '哈尔滨', '济南', '石家庄', '昆明', '大连', '南宁', '贵阳', '南昌', '无锡', '常州', '烟台', '太原', '长春']
};

// 学历分布
const EDUCATIONS = [
  { degree: '本科', weight: 0.6 },
  { degree: '硕士', weight: 0.25 },
  { degree: '博士', weight: 0.05 },
  { degree: '大专', weight: 0.1 }
];

// 工作年限范围
const EXPERIENCES = [
  { range: '应届生', min: 0, max: 0, weight: 0.1 },
  { range: '1-3年', min: 1, max: 3, weight: 0.25 },
  { range: '3-5年', min: 3, max: 5, weight: 0.3 },
  { range: '5-10年', min: 5, max: 10, weight: 0.25 },
  { range: '10年以上', min: 10, max: 15, weight: 0.1 }
];

// 公司列表（真实大厂+中型公司）
const COMPANIES = [
  // 互联网大厂
  '腾讯', '阿里巴巴', '百度', '字节跳动', '美团', '京东', '拼多多', '网易',
  '快手', '滴滴', '小米', '华为', 'OPPO', 'vivo', '联想', '中兴',
  // 金融科技
  '蚂蚁集团', '微众银行', '招商银行', '平安科技', '陆金所', '京东数科',
  // 教育科技
  '新东方', '好未来', '作业帮', '猿辅导', '网易有道',
  // 本地生活
  '饿了么', '大众点评', '携程', '去哪儿', '马蜂窝',
  // 中型公司
  '小红书', '知乎', 'B站', 'Keep', '马蜂窝', '得到', '混沌大学',
  // 传统行业
  '中国移动', '中国联通', '中国电信', '国家电网', '中国石油', '中国石化',
  // 外企
  '微软', '谷歌', '苹果', '亚马逊', '英特尔', 'IBM', 'Oracle', 'SAP'
];

// 职位列表（按领域分类）
const POSITIONS_BY_DOMAIN = {
  '技术': [
    '前端工程师', '后端工程师', '全栈工程师', '架构师', '技术总监',
    'iOS工程师', 'Android工程师', '移动端开发', '小程序开发',
    '测试工程师', '测试开发', 'QA负责人',
    '运维工程师', 'SRE工程师', 'DevOps工程师',
    '数据工程师', '大数据开发', '数据仓库工程师',
    '算法工程师', '机器学习工程师', 'AI研究员',
    '安全工程师', '网络安全专家', '技术经理', 'CTO'
  ],
  '产品': [
    '产品助理', '产品经理', '高级产品经理', '产品总监', '产品VP',
    '数据产品经理', 'AI产品经理', 'B端产品经理', 'C端产品经理'
  ],
  '设计': [
    'UI设计师', 'UX设计师', '交互设计师', '视觉设计师', '设计主管',
    '品牌设计师', '插画师', '动效设计师', '设计总监'
  ],
  '运营': [
    '运营专员', '运营经理', '运营总监', 'COO',
    '内容运营', '用户运营', '活动运营', '社群运营',
    '新媒体运营', '短视频运营', '电商运营', '直播运营'
  ],
  '市场': [
    '市场专员', '市场经理', '市场总监', 'CMO',
    '品牌经理', '公关经理', '活动策划', '营销策划'
  ],
  '人力': [
    'HR专员', 'HR经理', 'HRBP', 'HR总监', 'CHO',
    '招聘专员', '培训专员', '绩效专员', '薪酬专员'
  ],
  '财务': [
    '会计', '财务主管', '财务经理', '财务总监', 'CFO',
    '审计', '税务专员', '投资经理', '风控经理'
  ],
  '法务': [
    '法务专员', '法务经理', '法务总监', '总法律顾问',
    '合规专员', '知识产权专员'
  ]
};

// 人才等级分布
const TIER_DISTRIBUTION = [
  { tier: 'S', weight: 0.05, scoreRange: [90, 100] },
  { tier: 'A', weight: 0.15, scoreRange: [70, 89] },
  { tier: 'B', weight: 0.35, scoreRange: [50, 69] },
  { tier: 'C', weight: 0.45, scoreRange: [30, 49] }
];

// 工作状态
const JOB_STATUSES = [
  { status: 'actively_looking', weight: 0.3 },
  { status: 'open_to_offers', weight: 0.4 },
  { status: 'not_looking', weight: 0.3 }
];

// ==================== 工具函数 ====================

/**
 * 随机选择数组中的一个元素
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 根据权重随机选择
 */
function weightedChoice<T>(items: Array<{ weight: number } & T>): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  
  return items[items.length - 1];
}

/**
 * 生成随机中文姓名
 */
function generateChineseName(): string {
  const surname = randomChoice(SURNAMES);
  const firstNameLength = Math.random() > 0.3 ? 2 : 1;
  const firstName = Array.from(
    { length: firstNameLength },
    () => randomChoice(NAME_CHARS)
  ).join('');
  
  return surname + firstName;
}

/**
 * 生成随机手机号（有效格式）
 */
function generatePhoneNumber(): string {
  const prefixes = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139',
                    '150', '151', '152', '153', '155', '156', '157', '158', '159',
                    '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  const prefix = randomChoice(prefixes);
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

/**
 * 生成随机邮箱
 */
function generateEmail(name: string): string {
  const domains = ['qq.com', '163.com', '126.com', 'gmail.com', 'outlook.com', 'sina.com', 'foxmail.com'];
  const domain = randomChoice(domains);
  
  // 拼音简化（仅示例）
  const pinyinMap: Record<string, string> = {
    '王': 'wang', '李': 'li', '张': 'zhang', '刘': 'liu', '陈': 'chen',
    '杨': 'yang', '黄': 'huang', '赵': 'zhao', '周': 'zhou', '吴': 'wu'
  };
  
  const firstName = pinyinMap[name[0]] || 'user';
  const suffix = Math.floor(Math.random() * 10000);
  
  return `${firstName}${suffix}@${domain}`;
}

/**
 * 生成随机薪资范围
 */
function generateSalary(experience: number, tier: string): string {
  const baseRanges: Record<string, [number, number]> = {
    'S': [30, 80],
    'A': [20, 50],
    'B': [15, 35],
    'C': [8, 25]
  };
  
  const [minBase, maxBase] = baseRanges[tier];
  const expMultiplier = 1 + experience * 0.05;
  
  const min = Math.round(minBase * expMultiplier);
  const max = Math.round(maxBase * expMultiplier);
  
  return `${min}-${max}K`;
}

/**
 * 生成随机技能列表
 */
function generateSkills(domain: string, count: number = 5): string[] {
  const domainSkills = SKILLS_BY_DOMAIN[domain] || SKILLS_BY_DOMAIN['技术'];
  const shuffled = [...domainSkills].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * 生成随机工作经历
 */
function generateWorkExperience(count: number, domain: string) {
  const experiences = [];
  const companies = [...COMPANIES].sort(() => Math.random() - 0.5);
  const positions = POSITIONS_BY_DOMAIN[domain] || POSITIONS_BY_DOMAIN['技术'];
  
  let currentYear = new Date().getFullYear();
  
  for (let i = 0; i < count; i++) {
    const duration = Math.floor(Math.random() * 3) + 1; // 1-3年
    const startYear = currentYear - duration;
    
    experiences.push({
      company: companies[i % companies.length],
      position: randomChoice(positions),
      startDate: `${startYear}-0${Math.floor(Math.random() * 9) + 1}-01`,
      endDate: i === 0 ? '至今' : `${currentYear}-0${Math.floor(Math.random() * 9) + 1}-01`,
      description: `负责${domain}相关工作，参与多个核心项目，提升产品用户体验和性能。`
    });
    
    currentYear = startYear;
  }
  
  return experiences;
}

/**
 * 生成随机项目经验
 */
function generateProjects(count: number, domain: string) {
  const projectTemplates = {
    '技术': [
      { name: '电商平台重构', desc: '使用React+Node.js重构核心交易系统，QPS提升300%' },
      { name: '微服务架构改造', desc: '将单体应用拆分为微服务，提升系统可维护性' },
      { name: '数据中台建设', desc: '搭建企业级数据中台，支持实时数据分析' },
      { name: '推荐系统优化', desc: '优化推荐算法，点击率提升25%' }
    ],
    '产品': [
      { name: '用户增长体系', desc: '搭建用户增长漏斗，DAU提升50%' },
      { name: '会员体系设计', desc: '设计付费会员体系，付费转化率提升20%' },
      { name: '数据产品建设', desc: '搭建数据分析平台，支持业务决策' }
    ],
    '设计': [
      { name: '设计系统搭建', desc: '建立企业设计规范，提升设计效率' },
      { name: '品牌升级', desc: '主导品牌视觉升级，提升品牌认知度' },
      { name: '用户体验优化', desc: '优化核心流程，用户满意度提升30%' }
    ]
  };
  
  const templates = projectTemplates[domain] || projectTemplates['技术'];
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count).map(template => ({
    name: template.name,
    role: '核心成员',
    startDate: `${new Date().getFullYear() - Math.floor(Math.random() * 3)}-01-01`,
    endDate: `${new Date().getFullYear()}-01-01`,
    description: template.desc
  }));
}

/**
 * 生成随机教育经历
 */
function generateEducation(degree: string) {
  const schools = [
    '清华大学', '北京大学', '浙江大学', '复旦大学', '上海交通大学', '南京大学',
    '武汉大学', '华中科技大学', '中山大学', '四川大学', '西安交通大学', '哈尔滨工业大学',
    '北京邮电大学', '电子科技大学', '华东师范大学', '同济大学', '南开大学', '天津大学',
    '北京理工大学', '东南大学', '厦门大学', '山东大学', '中南大学', '大连理工大学'
  ];
  
  const majors = [
    '计算机科学与技术', '软件工程', '电子信息工程', '通信工程', '自动化',
    '数据科学', '人工智能', '信息安全', '数学', '统计学',
    '工商管理', '市场营销', '人力资源管理', '金融学', '经济学',
    '设计学', '工业设计', '视觉传达设计'
  ];
  
  const startYear = new Date().getFullYear() - Math.floor(Math.random() * 10) - 4;
  
  return [{
    school: randomChoice(schools),
    major: randomChoice(majors),
    degree: degree,
    startDate: `${startYear}-09-01`,
    endDate: `${startYear + 4}-06-30`
  }];
}

// ==================== 数据生成器类 ====================

class ResumeDataGenerator {
  private usedPhones = new Set<string>();
  private usedEmails = new Set<string>();
  
  /**
   * 生成单个简历数据
   */
  generateResume(userId: string, index: number): Partial<Resume> {
    // 选择领域（技术类占多数）
    const domains = Object.keys(SKILLS_BY_DOMAIN);
    const domain = Math.random() > 0.3 ? '技术' : randomChoice(domains);
    
    // 选择等级
    const tierInfo = weightedChoice(TIER_DISTRIBUTION);
    
    // 选择学历
    const eduInfo = weightedChoice(EDUCATIONS);
    
    // 选择工作年限
    const expInfo = weightedChoice(EXPERIENCES);
    const years = Math.floor(Math.random() * (expInfo.max - expInfo.min + 1)) + expInfo.min;
    
    // 选择城市
    const cityLevel = Math.random() > 0.5 ? '一线城市' : (Math.random() > 0.5 ? '新一线' : '二线');
    const city = randomChoice(CITIES[cityLevel]);
    
    // 选择工作状态
    const statusInfo = weightedChoice(JOB_STATUSES);
    
    // 生成姓名和联系方式（确保唯一）
    let phone: string;
    do {
      phone = generatePhoneNumber();
    } while (this.usedPhones.has(phone));
    this.usedPhones.add(phone);
    
    const name = generateChineseName();
    let email: string;
    do {
      email = generateEmail(name);
    } while (this.usedEmails.has(email));
    this.usedEmails.add(email);
    
    // 生成技能
    const skillsCount = Math.floor(Math.random() * 5) + 3; // 3-7个技能
    const skills = generateSkills(domain, skillsCount);
    
    // 生成工作经历
    const workExpCount = Math.min(Math.floor(years / 3) + 1, 3);
    const workExperience = generateWorkExperience(workExpCount, domain);
    
    // 生成项目经验
    const projectCount = Math.floor(Math.random() * 2) + 1;
    const projects = generateProjects(projectCount, domain);
    
    // 生成教育经历
    const education = generateEducation(eduInfo.degree);
    
    // 生成随机分数
    const score = Math.floor(
      Math.random() * (tierInfo.scoreRange[1] - tierInfo.scoreRange[0] + 1)
    ) + tierInfo.scoreRange[0];
    
    // 生成期望薪资
    const expectedSalary = generateSalary(years, tierInfo.tier);
    
    // 生成期望职位
    const positions: string[] = POSITIONS_BY_DOMAIN[domain] || POSITIONS_BY_DOMAIN['技术'];
    const expectedPosition: string = randomChoice(positions);
    
    return {
      userId,
      filePath: `/test/resumes/${index}.pdf`,
      fileName: `${name}_简历.pdf`,
      fileSize: Math.floor(Math.random() * 500000) + 100000, // 100KB-600KB
      fileType: 'pdf',
      parseStatus: 'success',
      basicInfo: {
        name,
        phone,
        email,
        age: 22 + years + Math.floor(Math.random() * 5),
        gender: Math.random() > 0.3 ? '男' : '女',
        location: city
      },
      education,
      workExperience,
      projects,
      skills,
      tags: skills.slice(0, 3),
      score,
      tier: tierInfo.tier,
      isPublic: Math.random() > 0.3,
      source: 'import',
      jobIntention: {
        expectedPosition,
        expectedSalary,
        expectedLocation: city,
        jobStatus: statusInfo.status
      }
    };
  }
  
  /**
   * 生成对应的Talent数据
   */
  generateTalent(resume: Partial<Resume>, userId: string): Partial<Talent> {
    const basicInfo = resume.basicInfo!;
    const workExp = resume.workExperience!;
    const edu = resume.education![0];
    
    // 计算工作年限字符串
    const expYears = workExp.reduce((total, exp) => {
      const start = parseInt(exp.startDate.split('-')[0]);
      const end = exp.endDate === '至今' ? new Date().getFullYear() : parseInt(exp.endDate.split('-')[0]);
      return total + (end - start);
    }, 0);
    
    const experienceRange = expYears === 0 ? '应届生' :
                           expYears <= 3 ? '1-3年' :
                           expYears <= 5 ? '3-5年' :
                           expYears <= 10 ? '5-10年' : '10年以上';
    
    return {
      userId,
      name: basicInfo.name!,
      currentTitle: workExp[0]?.position || '待业',
      currentCompany: workExp[0]?.company || '无',
      experience: experienceRange,
      education: edu.degree,
      location: basicInfo.location!,
      expectedSalary: resume.jobIntention!.expectedSalary!,
      skills: resume.skills!,
      jobStatus: resume.jobIntention!.jobStatus!,
      age: basicInfo.age,
      gender: basicInfo.gender,
      tier: resume.tier!,
      score: resume.score!,
      skillsCount: resume.skills!.length,
      isPublic: resume.isPublic!,
      matchScore: Math.floor(Math.random() * 100),
      personalScore: Math.floor(Math.random() * 100),
      resumeComplete: true,
      lastActive: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
      workExperience: experienceRange,
      educationYear: edu.endDate.split('-')[0]
    };
  }
}

// ==================== 主注入逻辑 ====================

async function injectTestData() {
  console.log('🚀 开始注入测试数据...\n');
  
  let connection: Connection | null = null;
  let queryRunner: QueryRunner | null = null;
  
  try {
    // 1. 连接数据库
    console.log('📡 连接数据库...');
    connection = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 15432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'huntlink_safe_2026',
      database: process.env.DB_NAME || 'huntlink',
      entities: [Resume, Talent, User]
    });
    
    console.log('✅ 数据库连接成功\n');
    
    // 2. 查询或创建测试用户
    console.log('👤 准备测试用户...');
    let testUser = await connection.getRepository(User).findOne({ 
      where: { phone: '10000000000' } 
    });
    
    if (!testUser) {
      testUser = connection.getRepository(User).create({
        phone: '10000000000',
        name: '测试数据用户',
        role: 'hr' as any,
        tier: 'team' as any,
        isActive: true
      });
      await connection.getRepository(User).save(testUser);
      console.log('✅ 创建测试用户成功');
    } else {
      console.log('✅ 测试用户已存在');
    }
    
    const userId = testUser.id;
    console.log(`   用户ID: ${userId}\n`);
    
    // 3. 生成数据
    console.log('📊 生成测试数据...');
    const generator = new ResumeDataGenerator();
    const totalCount = 1200; // 生成1200份简历
    const batchSize = 100; // 每批插入100条
    
    const resumes: Partial<Resume>[] = [];
    const talents: Partial<Talent>[] = [];
    
    for (let i = 0; i < totalCount; i++) {
      const resume = generator.generateResume(userId, i);
      resumes.push(resume);
      
      const talent = generator.generateTalent(resume, userId);
      talents.push(talent);
      
      // 进度显示
      if ((i + 1) % 100 === 0) {
        console.log(`   已生成 ${i + 1}/${totalCount} 条数据`);
      }
    }
    
    console.log(`✅ 数据生成完成 (共 ${totalCount} 条)\n`);
    
    // 4. 批量插入
    console.log('💾 开始批量插入数据库...');
    
    queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      const resumeRepo = queryRunner.manager.getRepository(Resume);
      const talentRepo = queryRunner.manager.getRepository(Talent);
      
      let insertedCount = 0;
      
      for (let i = 0; i < resumes.length; i += batchSize) {
        const batchResumes = resumes.slice(i, i + batchSize);
        const batchTalents = talents.slice(i, i + batchSize);
        
        // 插入简历
        const savedResumes = await resumeRepo.save(batchResumes as any);
        
        // 更新Talent的关联ID
        for (let j = 0; j < batchTalents.length; j++) {
          batchTalents[j].id = savedResumes[j].id; // 使用相同ID方便关联
        }
        
        // 插入人才
        await talentRepo.save(batchTalents as any);
        
        insertedCount += batchResumes.length;
        console.log(`   已插入 ${insertedCount}/${totalCount} 条数据`);
      }
      
      await queryRunner.commitTransaction();
      console.log('\n✅ 数据插入成功\n');
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
    
    // 5. 验证数据
    console.log('🔍 验证数据完整性...');
    
    const resumeCount = await connection.getRepository(Resume).count({ where: { userId } });
    const talentCount = await connection.getRepository(Talent).count({ where: { userId } });
    
    console.log(`   简历表记录: ${resumeCount} 条`);
    console.log(`   人才表记录: ${talentCount} 条`);
    
    // 统计各等级分布
    const tierStats = await connection.query(`
      SELECT tier, COUNT(*) as count 
      FROM resumes 
      WHERE user_id = $1 
      GROUP BY tier 
      ORDER BY tier
    `, [userId]);
    
    console.log('\n   人才等级分布:');
    tierStats.forEach((stat: any) => {
      console.log(`   - ${stat.tier}级: ${stat.count} 人`);
    });
    
    // 统计学历分布
    const eduStats = await connection.query(`
      SELECT education->0->>'degree' as degree, COUNT(*) as count 
      FROM resumes 
      WHERE user_id = $1 
      GROUP BY education->0->>'degree'
    `, [userId]);
    
    console.log('\n   学历分布:');
    eduStats.forEach((stat: any) => {
      console.log(`   - ${stat.degree}: ${stat.count} 人`);
    });
    
    console.log('\n🎉 测试数据注入完成！');
    console.log('\n执行时间统计:');
    console.log(`   - 总耗时: ~${Math.ceil(totalCount * 0.1)} 秒`);
    console.log(`   - 内存占用: ~${Math.ceil(totalCount * 0.05)} MB`);
    
  } catch (error) {
    console.error('\n❌ 注入失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (queryRunner) {
      await queryRunner.release();
    }
    if (connection) {
      await connection.close();
    }
  }
}

// 执行注入
injectTestData();
