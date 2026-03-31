import * as fs from 'fs';
import * as path from 'path';

interface FunctionRule {
  code: string;
  name: string;
  keywords: string[];
}

interface PositionKeywords {
  positionCode: string;
  positionName: string;
  functionCode: string;
  keywords: {
    layer1_core: string[];
    layer2_framework: string[];
    layer3_tool: string[];
    layer4_skill: string[];
    layer5_exclude: string[];
  };
}

async function generatePositionKeywords() {
  console.log('🚀 开始生成职位关键词池...\n');

  // 读取规则文件
  const rulesPath = path.join(__dirname, '../../resume-classification-rules/rules/classification_rules.json');
  const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

  const functions: FunctionRule[] = rules.functions.data;
  const keywordsDir = path.join(__dirname, '../../resume-classification-rules/keywords');

  // 创建关键词目录
  if (!fs.existsSync(keywordsDir)) {
    fs.mkdirSync(keywordsDir, { recursive: true });
  }

  // 通用工具词和技能词
  const commonTools = ['Git', 'Docker', 'Linux', 'Windows', 'Office', 'Jira', 'Confluence'];
  const commonSkills = ['沟通能力', '团队合作', '问题解决', '学习能力', '抗压能力'];

  // 为每个职能创建关键词文件
  for (const func of functions) {
    const funcDir = path.join(keywordsDir, func.code);
    if (!fs.existsSync(funcDir)) {
      fs.mkdirSync(funcDir, { recursive: true });
    }

    console.log(`📊 处理职能：${func.name} (${func.code})`);

    // 从关键词中提取职位名称（排除通用词）
    const positionKeywords = extractPositionsFromKeywords(func.keywords);
    
    // 生成排除词（其他职能的核心词）
    const excludeKeywords = functions
      .filter(f => f.code !== func.code)
      .flatMap(f => f.keywords.slice(0, 10));

    // 为每个职位生成关键词
    let generatedCount = 0;
    for (const position of positionKeywords) {
      const pk: PositionKeywords = {
        positionCode: `${func.code}-P${String(generatedCount).padStart(3, '0')}`,
        positionName: position,
        functionCode: func.code,
        keywords: {
          layer1_core: [
            position,
            `${position}工程师`,
            `${position}专员`,
            `${position}经理`,
          ],
          layer2_framework: func.keywords.slice(0, 20),  // 取前 20 个相关词
          layer3_tool: commonTools,
          layer4_skill: commonSkills,
          layer5_exclude: excludeKeywords.slice(0, 30),  // 取 30 个排除词
        },
      };

      // 保存文件
      const fileName = `${position.replace(/[\s/]+/g, '_')}.json`;
      const filePath = path.join(funcDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(pk, null, 2));
      generatedCount++;
    }

    console.log(`  ✅ 生成 ${generatedCount} 个职位关键词文件`);
  }

  // 生成统计信息
  const stats = {
    totalFunctions: functions.length,
    totalKeywords: functions.reduce((sum, f) => sum + f.keywords.length, 0),
    generatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(keywordsDir, 'stats.json'),
    JSON.stringify(stats, null, 2)
  );

  console.log('\n✅ 关键词池生成完成!');
  console.log(`📊 统计:`);
  console.log(`   - 职能：${stats.totalFunctions}个`);
  console.log(`   - 关键词：${stats.totalKeywords}个`);
  console.log(`   - 输出目录：${keywordsDir}`);
}

/**
 * 从关键词中提取职位名称
 */
function extractPositionsFromKeywords(keywords: string[]): string[] {
  const positions: string[] = [];
  
  // 过滤规则：
  // 1. 排除编程语言（Java, Python 等）
  // 2. 排除工具（Docker, Git 等）
  // 3. 保留职位名称（包含"工程师"，"专员"，"经理"，"总监"等）
  
  const positionIndicators = [
    '工程师', '专员', '经理', '总监', '主管', '助理', '顾问', 
    '开发', '测试', '运维', '产品', '设计', '运营', '销售', '客服'
  ];
  
  const excludePatterns = [
    /^[A-Z]+$/,  // 纯大写字母（如 Java, Python）
    /^(Git|Docker|Linux|Windows|SQL|Vue|React|Node|PHP|Go|Golang|C\+\+|iOS|Android|SaaS|AI)$/,
  ];

  for (const kw of keywords) {
    // 检查是否是职位名称
    const isPosition = positionIndicators.some(ind => kw.includes(ind));
    
    // 检查是否应该排除
    const shouldExclude = excludePatterns.some(pattern => pattern.test(kw));
    
    if (isPosition && !shouldExclude && kw.length >= 2) {
      positions.push(kw);
    }
  }

  // 去重
  return [...new Set(positions)];
}

generatePositionKeywords().catch(err => {
  console.error('❌ 生成失败:', err);
  process.exit(1);
});
