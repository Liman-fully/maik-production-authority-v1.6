"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const position_classifier_1 = require("../src/common/classifiers/position-classifier");
const testCases = [
    {
        input: 'Java 开发工程师',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.9,
        description: '精确匹配 - Java 开发',
    },
    {
        input: 'Python 后端开发',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.8,
        description: '精确匹配 - Python 开发',
    },
    {
        input: '产品经理',
        expectedCategory: '产品',
        expectedConfidenceMin: 0.8,
        description: '精确匹配 - 产品',
    },
    {
        input: 'UI 设计师',
        expectedCategory: '设计',
        expectedConfidenceMin: 0.8,
        description: '精确匹配 - 设计',
    },
    {
        input: '销售经理',
        expectedCategory: '销售/客服',
        expectedConfidenceMin: 0.7,
        description: '精确匹配 - 销售',
    },
    {
        input: '技术产品经理',
        expectedCategory: '产品',
        expectedConfidenceMin: 0.6,
        description: '跨职能 - 技术产品经理（应该是产品而非技术）',
    },
    {
        input: '测试开发工程师',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.6,
        description: '跨职能 - 测试开发',
    },
    {
        input: 'Java 前端开发',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0,
        description: '排除词 - Java 前端（前端是 IT 的排除词）',
    },
    {
        input: 'Python 测试工程师',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0,
        description: '排除词 - Python 测试',
    },
    {
        input: '实习生',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.3,
        description: '边界案例 - 通用职位',
    },
    {
        input: '总监',
        expectedCategory: '高级管理',
        expectedConfidenceMin: 0.5,
        description: '边界案例 - 管理职位',
    },
    {
        input: '工程师',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.4,
        description: '边界案例 - 通用工程师',
    },
    {
        input: 'Java Java Java 开发工程师，熟悉 Java 开发',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.95,
        description: '词频加分 - 多次出现 Java',
    },
    {
        input: 'Python 开发工程师，5 年经验',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.85,
        description: '位置加分 - Python 在开头',
    },
    {
        input: '5 年工作经验，熟悉 Python 开发',
        expectedCategory: 'IT 互联网技术',
        expectedConfidenceMin: 0.7,
        description: '位置测试 - Python 在中间',
    },
];
async function runTests() {
    console.log('🧪 开始运行分类器测试...\n');
    const classifier = new position_classifier_1.PositionClassifier();
    let passed = 0;
    let failed = 0;
    const failures = [];
    for (const tc of testCases) {
        const result = classifier.classify(tc.input);
        const passedTest = result.categoryName === tc.expectedCategory &&
            result.confidence >= tc.expectedConfidenceMin;
        if (passedTest) {
            passed++;
            console.log(`✅ ${tc.description}`);
            console.log(`   输入：${tc.input}`);
            console.log(`   输出：${result.categoryName} (${result.confidence.toFixed(2)})\n`);
        }
        else {
            failed++;
            failures.push({
                test: tc.description,
                expected: tc.expectedCategory,
                actual: result.categoryName || '未匹配',
                confidence: result.confidence,
            });
            console.log(`❌ ${tc.description}`);
            console.log(`   输入：${tc.input}`);
            console.log(`   期望：${tc.expectedCategory} (≥${tc.expectedConfidenceMin})`);
            console.log(`   实际：${result.categoryName || '未匹配'} (${result.confidence.toFixed(2)})\n`);
        }
    }
    console.log('\n' + '='.repeat(50));
    console.log(`📊 测试结果：${passed} 通过，${failed} 失败，总计 ${testCases.length} 个`);
    console.log(`📈 通过率：${((passed / testCases.length) * 100).toFixed(1)}%`);
    if (failures.length > 0) {
        console.log('\n❌ 失败用例:');
        for (const f of failures) {
            console.log(`   - ${f.test}`);
            console.log(`     期望：${f.expected}, 实际：${f.actual} (${f.confidence.toFixed(2)})`);
        }
    }
    const accuracy = (passed / testCases.length) * 100;
    if (accuracy >= 98) {
        console.log('\n✅ 达到目标准确率（98%+）!');
    }
    else if (accuracy >= 95) {
        console.log('\n⚠️  接近目标（95-98%），需要继续优化');
    }
    else {
        console.log('\n❌ 未达到目标（< 95%），需要大幅优化');
    }
}
runTests().catch(console.error);
//# sourceMappingURL=position-classifier.test.js.map