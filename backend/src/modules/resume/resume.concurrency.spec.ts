import { Test, TestingModule } from '@nestjs/testing';
import { ResumeProcessor } from './resume.processor';
import { ResumeService } from './resume.service';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

describe('ResumeProcessor Concurrency Test', () => {
  let processor: ResumeProcessor;
  let service: ResumeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeProcessor,
        {
          provide: ResumeService,
          useValue: {
            parseResumeAsync: jest.fn().mockImplementation(async () => {
              // 模拟 100ms 的处理时间
              await new Promise(resolve => setTimeout(resolve, 100));
            }),
          },
        },
      ],
    }).compile();

    processor = module.get<ResumeProcessor>(ResumeProcessor);
    service = module.get<ResumeService>(ResumeService);
  });

  it('New user (high-speed) group should run with high concurrency (10)', async () => {
    const jobsCount = 20;
    const group = 'high-speed';
    const startTime = Date.now();

    const jobs = Array.from({ length: jobsCount }).map((_, i) => ({
      data: { resumeId: `job-${i}`, group },
    } as Job));

    // 并发执行所有任务
    await Promise.all(jobs.map(job => processor.handleParsing(job)));

    const duration = Date.now() - startTime;
    // 如果并发为 10，20 个任务（每个 100ms）理论上耗时约 200ms
    // 如果并发为 1，耗时约 2000ms
    console.log(`[Verify] New User Performance: ${jobsCount} jobs took ${duration}ms`);
    expect(duration).toBeLessThan(500); // 宽松一点
  });

  it('Regular user (default) group should run with low concurrency (2)', async () => {
    const jobsCount = 10;
    const group = 'default';
    const startTime = Date.now();

    const jobs = Array.from({ length: jobsCount }).map((_, i) => ({
      data: { resumeId: `job-low-${i}`, group },
    } as Job));

    await Promise.all(jobs.map(job => processor.handleParsing(job)));

    const duration = Date.now() - startTime;
    // 如果并发为 2，10 个任务理论耗时约 500ms
    console.log(`[Verify] Regular User Performance: ${jobsCount} jobs took ${duration}ms`);
    expect(duration).toBeGreaterThanOrEqual(450);
  });
});
