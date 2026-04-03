/**
 * 搜索性能测试脚本
 * 用于验证搜索优化效果
 * 
 * 使用方法:
 * npx ts-node src/performance/search-performance.test.ts
 */

import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { TalentModule } from '../modules/talent/talent.module';
import { TalentService } from '../modules/talent/talent.service';
import { TalentFilterDto, SortBy, SortOrder } from '../modules/talent/dto/talent-filter.dto';

interface PerformanceResult {
  testName: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
}

async function measurePerformance(
  service: TalentService,
  filter: TalentFilterDto,
  iterations: number = 5,
): Promise<PerformanceResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await service.getTalents(filter);
    const end = Date.now();
    times.push(end - start);
  }

  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const rps = iterations / (times.reduce((a, b) => a + b, 0) / 1000);

  return {
    testName: JSON.stringify(filter),
    avgResponseTime: avgTime,
    minResponseTime: minTime,
    maxResponseTime: maxTime,
    requestsPerSecond: rps,
  };
}

async function runPerformanceTests() {
  console.log('🚀 开始搜索性能测试...\n');

  const app = await NestFactory.createApplicationContext(TalentModule);
  const service = app.get(TalentService);

  const testCases: TalentFilterDto[] = [
    {
      page: 1,
      pageSize: 20,
      sortBy: SortBy.LATEST,
      sortOrder: SortOrder.DESC,
    },
    {
      page: 1,
      pageSize: 20,
      sortBy: SortBy.LATEST,
      sortOrder: SortOrder.DESC,
      jobStatus: '在职',
    },
    {
      page: 1,
      pageSize: 20,
      sortBy: SortBy.LATEST,
      sortOrder: SortOrder.DESC,
      location: '北京',
      experience: '3-5 年',
    },
    {
      page: 1,
      pageSize: 20,
      sortBy: SortBy.ACTIVE,
      sortOrder: SortOrder.DESC,
      jobStatus: '在职',
      location: '上海',
    },
    {
      page: 1,
      pageSize: 20,
      sortBy: SortBy.SCORE,
      sortOrder: SortOrder.DESC,
      matchScore: '80-100',
    },
  ];

  const results: PerformanceResult[] = [];

  for (const testCase of testCases) {
    console.log(`测试用例：${JSON.stringify(testCase)}`);
    const result = await measurePerformance(service, testCase, 5);
    results.push(result);
    console.log(`  平均响应时间：${result.avgResponseTime.toFixed(2)}ms`);
    console.log(`  最小响应时间：${result.minResponseTime}ms`);
    console.log(`  最大响应时间：${result.maxResponseTime}ms`);
    console.log(`  请求/秒：${result.requestsPerSecond.toFixed(2)}\n`);
  }

  // 生成报告
  console.log('📊 性能测试报告\n');
  console.log('='.repeat(80));
  console.log(`测试时间：${new Date().toISOString()}`);
  console.log(`目标响应时间：< 1000ms`);
  console.log('='.repeat(80));

  let allPassed = true;
  for (const result of results) {
    const status = result.avgResponseTime < 1000 ? '✅ PASS' : '❌ FAIL';
    if (result.avgResponseTime >= 1000) allPassed = false;
    
    console.log(`\n${status} - ${result.testName}`);
    console.log(`  平均：${result.avgResponseTime.toFixed(2)}ms | ` +
                `最小：${result.minResponseTime}ms | ` +
                `最大：${result.maxResponseTime}ms | ` +
                `RPS: ${result.requestsPerSecond.toFixed(2)}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log(`总体结果：${allPassed ? '✅ 所有测试通过' : '❌ 部分测试失败'}`);
  console.log('='.repeat(80));

  await app.close();
  
  return allPassed;
}

// 运行测试
runPerformanceTests()
  .then((passed) => {
    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('测试失败:', error);
    process.exit(1);
  });
