import { NestFactory } from '@nestjs/core';
import { ResumeModule } from './resume.module';
import { ResumeService } from './resume.service';
import { AppModule } from '../../app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const resumeService = app.get(ResumeService);
  
  const userId = 'test-user-001';
  console.log('Starting full integration test...');
  
  // 1. 测试触发邮件拉取 (12 Agent Pool)
  console.log('Step 1: Triggering email fetch for 12 agents...');
  await resumeService.triggerEmailFetch(userId);
  console.log('Email fetch triggered. BullMQ should handle the rest.');
  
  // 2. 测试解析与评分
  // 模拟一个简历上传
  const mockFile = {
    originalname: 'test_resume.pdf',
    buffer: Buffer.from('mock resume content'),
    size: 1024
  };
  
  console.log('Step 2: Testing manual upload and AI parse flow...');
  const resume = await resumeService.uploadResume(userId, mockFile);
  console.log(`Resume uploaded: ${resume.id}. Status: ${resume.parseStatus}`);
  
  // 模拟队列触发解析
  console.log('Step 3: Simulating AI parsing...');
  await resumeService.parseResumeAsync(resume.id);
  
  const updatedResume = await resumeService.getResumeById(resume.id, userId);
  console.log(`Parse complete. Status: ${updatedResume.parseStatus}, Score: ${updatedResume.score}`);
  console.log(`Basic Info: ${JSON.stringify(updatedResume.basicInfo)}`);
  
  await app.close();
  process.exit(0);
}

bootstrap();
