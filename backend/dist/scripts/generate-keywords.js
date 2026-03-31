"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
async function generatePositionKeywords() {
    console.log('🚀 开始生成职位关键词池...\n');
    const rulesPath = path.join(__dirname, '../../resume-classification-rules/rules/classification_rules.json');
    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
    const functions = rules.functions.data;
    const keywordsDir = path.join(__dirname, '../../resume-classification-rules/keywords');
    if (!fs.existsSync(keywordsDir)) {
        fs.mkdirSync(keywordsDir, { recursive: true });
    }
    const commonTools = ['Git', 'Docker', 'Linux', 'Windows', 'Office', 'Jira', 'Confluence'];
    const commonSkills = ['沟通能力', '团队合作', '问题解决', '学习能力', '抗压能力'];
    for (const func of functions) {
        const funcDir = path.join(keywordsDir, func.code);
        if (!fs.existsSync(funcDir)) {
            fs.mkdirSync(funcDir, { recursive: true });
        }
        console.log(`📊 处理职能：${func.name} (${func.code})`);
        const positionKeywords = extractPositionsFromKeywords(func.keywords);
        const excludeKeywords = functions
            .filter(f => f.code !== func.code)
            .flatMap(f => f.keywords.slice(0, 10));
        let generatedCount = 0;
        for (const position of positionKeywords) {
            const pk = {
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
                    layer2_framework: func.keywords.slice(0, 20),
                    layer3_tool: commonTools,
                    layer4_skill: commonSkills,
                    layer5_exclude: excludeKeywords.slice(0, 30),
                },
            };
            const fileName = `${position.replace(/[\s/]+/g, '_')}.json`;
            const filePath = path.join(funcDir, fileName);
            fs.writeFileSync(filePath, JSON.stringify(pk, null, 2));
            generatedCount++;
        }
        console.log(`  ✅ 生成 ${generatedCount} 个职位关键词文件`);
    }
    const stats = {
        totalFunctions: functions.length,
        totalKeywords: functions.reduce((sum, f) => sum + f.keywords.length, 0),
        generatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(path.join(keywordsDir, 'stats.json'), JSON.stringify(stats, null, 2));
    console.log('\n✅ 关键词池生成完成!');
    console.log(`📊 统计:`);
    console.log(`   - 职能：${stats.totalFunctions}个`);
    console.log(`   - 关键词：${stats.totalKeywords}个`);
    console.log(`   - 输出目录：${keywordsDir}`);
}
function extractPositionsFromKeywords(keywords) {
    const positions = [];
    const positionIndicators = [
        '工程师', '专员', '经理', '总监', '主管', '助理', '顾问',
        '开发', '测试', '运维', '产品', '设计', '运营', '销售', '客服'
    ];
    const excludePatterns = [
        /^[A-Z]+$/,
        /^(Git|Docker|Linux|Windows|SQL|Vue|React|Node|PHP|Go|Golang|C\+\+|iOS|Android|SaaS|AI)$/,
    ];
    for (const kw of keywords) {
        const isPosition = positionIndicators.some(ind => kw.includes(ind));
        const shouldExclude = excludePatterns.some(pattern => pattern.test(kw));
        if (isPosition && !shouldExclude && kw.length >= 2) {
            positions.push(kw);
        }
    }
    return [...new Set(positions)];
}
generatePositionKeywords().catch(err => {
    console.error('❌ 生成失败:', err);
    process.exit(1);
});
//# sourceMappingURL=generate-keywords.js.map