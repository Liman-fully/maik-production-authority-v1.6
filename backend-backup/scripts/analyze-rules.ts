import * as fs from 'fs';
import * as path from 'path';

async function analyzeRules() {
  const rulesPath = path.join(__dirname, '../../resume-classification-rules/rules/classification_rules.json');
  const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

  console.log('📊 规则文件结构分析:\n');
  
  console.log('顶层键:');
  console.log(Object.keys(rules));
  
  console.log('\nfunctions 结构:');
  const functions = rules.functions?.data || [];
  console.log(`  数量：${functions.length}`);
  
  if (functions.length > 0) {
    const firstFunc = functions[0];
    console.log(`  第一个职能的键：${Object.keys(firstFunc)}`);
    console.log(`  第一个职能：${JSON.stringify(firstFunc, null, 2).substring(0, 500)}...`);
  }
  
  console.log('\npositions 在哪里？');
  // 查找 positions 数据
  if (rules.positions) {
    console.log(`  ✅ 在 rules.positions 中找到，数量：${rules.positions.data?.length || 0}`);
  } else {
    console.log('  ❌ 未找到 positions');
  }
}

analyzeRules().catch(console.error);
