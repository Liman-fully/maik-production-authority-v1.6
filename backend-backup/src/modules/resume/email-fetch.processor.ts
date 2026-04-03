import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { EmailFetchService } from './email-fetch.service';

@Processor('email-fetching')
export class EmailFetchProcessor {
  private readonly logger = new Logger(EmailFetchProcessor.name);

  constructor(private readonly emailFetchService: EmailFetchService) {}

  @Process('fetch')
  async handleFetch(job: Job) {
    this.logger.log('开始执行邮件简历拉取任务...');
    try {
      await this.emailFetchService.fetchResumesFromEmail();
      this.logger.log('邮件简历拉取任务完成');
    } catch (error) {
      this.logger.error('邮件简历拉取任务失败', error.stack);
      throw error;
    }
  }
}
