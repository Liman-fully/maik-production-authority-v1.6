import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ResumeService } from './resume.service';
import { Logger } from '@nestjs/common';

@Processor('resume-parsing')
export class ResumeProcessor {
  private readonly logger = new Logger(ResumeProcessor.name);
  
  // 并发控制：普通用户并发 2，付费/新用户并发 10
  private runningCount = { 'default': 0, 'high-speed': 0 };
  private limits = { 'default': 2, 'high-speed': 10 };

  constructor(private readonly resumeService: ResumeService) {}

  @Process({ name: 'parse' })
  async handleParsing(job: Job<{ resumeId: string; group?: string }>) {
    const { resumeId, group = 'default' } = job.data;
    const limit = this.limits[group] || this.limits['default'];

    // 动态等待并发槽位
    while (this.runningCount[group] >= limit) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.runningCount[group]++;
    this.logger.log(`开始处理 [${group}] 简历解析任务 (${this.runningCount[group]}/${limit}): ${resumeId}`);
    
    try {
      await this.resumeService.parseResumeAsync(resumeId);
    } catch (error) {
      this.logger.error(`简历解析任务失败 [${group}]: ${resumeId}`, error.stack);
      throw error;
    } finally {
      this.runningCount[group]--;
      this.logger.log(`简历解析任务完成 [${group}]: ${resumeId} (活动任务: ${this.runningCount[group]})`);
    }
  }
}
