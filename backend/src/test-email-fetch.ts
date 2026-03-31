import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EmailFetchService } from './modules/resume/email-fetch.service';
import { Resume } from './modules/resume/resume.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const emailFetchService = app.get(EmailFetchService);
  const resumeRepository = app.get<Repository<Resume>>(getRepositoryToken(Resume));

  console.log('--- Starting Email Fetch Test ---');
  
  // 1. Clear existing resumes for test user (optional but good for verification)
  const testUserId = 'system-test-user-id';
  await resumeRepository.delete({ userId: testUserId });
  console.log(`Cleared existing resumes for user: ${testUserId}`);

  // 2. Execute fetchResumesFromEmail (Limit 1 strategy is already implemented in the service)
  await emailFetchService.fetchResumesFromEmail();
  console.log('fetchResumesFromEmail execution completed.');

  // 3. Verify database entries
  const count = await resumeRepository.count({ where: { userId: testUserId } });
  const resumes = await resumeRepository.find({ where: { userId: testUserId } });
  
  console.log(`--- Test Result ---`);
  console.log(`Resumes found in DB: ${count}`);
  
  resumes.forEach((r, i) => {
    console.log(`[${i+1}] ID: ${r.id}, Name: ${r.fileName}, Status: ${r.parseStatus}, BasicInfo: ${JSON.stringify(r.basicInfo)}`);
  });

  if (count === 12) {
    console.log('SUCCESS: All 12 accounts processed and entries created.');
  } else {
    console.log(`FAILURE: Expected 12 entries, found ${count}.`);
  }

  await app.close();
}

bootstrap();
