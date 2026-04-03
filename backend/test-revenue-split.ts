import { NestFactory } from '@nestjs/core';
import { ResumeModule } from './src/modules/resume/resume.module';
import { RevenueSplitService } from './src/modules/resume/revenue-split.service';
import { ResumeService } from './src/modules/resume/resume.service';

async function testRevenueSplit() {
  console.log('🧪 测试资产闭环功能...\n');

  const app = await NestFactory.createApplicationContext(ResumeModule);
  
  try {
    const revenueSplitService = app.get(RevenueSplitService);
    const resumeService = app.get(ResumeService);

    // 1. 创建测试简历
    console.log('1. 创建测试简历...');
    const mockFile = {
      originalname: 'Test_Resume.pdf',
      buffer: Buffer.from('%PDF-1.4 Test resume content'),
      size: 2048,
    };

    const resume = await resumeService.uploadResume(
      'system-test-user-id',
      mockFile,
      null,
    );
    console.log(`   ✅ 简历创建成功: ID=${resume.id}`);

    // 2. 测试分账和MD名片生成
    console.log('\n2. 执行资产闭环（分账+MD名片）...');
    const result = await revenueSplitService.processRevenueSplit(
      resume.id,
      1000000, // ¥10,000
    );

    console.log(`   ✅ 分账完成:`);
    console.log(`      - 平台(30%): ¥${(result.splits.platform / 100).toFixed(2)}`);
    console.log(`      - 推荐人(40%): ¥${(result.splits.referrer / 100).toFixed(2)}`);
    console.log(`      - 候选人(30%): ¥${(result.splits.candidate / 100).toFixed(2)}`);
    
    console.log(`\n   ✅ MD名片生成:`);
    console.log(`      ${result.mdBusinessCard.substring(0, 200)}...`);

    console.log('\n🎉 资产闭环测试全部通过！');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await app.close();
  }
}

testRevenueSplit();
