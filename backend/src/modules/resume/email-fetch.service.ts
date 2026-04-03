import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResumeService } from './resume.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 邮件简历拉取服务 - The Lab "广"字辈多代理版
 * 策略：每个账号仅拉取 1 份简历，用于联调测试
 */
@Injectable()
export class EmailFetchService {
  private readonly logger = new Logger(EmailFetchService.name);
  private readonly accountsPath = path.join(__dirname, 'accounts_config.json');

  constructor(
    private configService: ConfigService,
    private resumeService: ResumeService,
  ) {}

  async fetchResumesFromEmail(agentEmail?: string) {
    const accounts = this.loadAccounts();
    const targetAccounts = agentEmail 
      ? accounts.filter(a => a.email === agentEmail)
      : accounts;

    this.logger.log(`开始执行测试拉取：目标 ${targetAccounts.length} 个邮箱账号`);

    for (const account of targetAccounts) {
      try {
        this.logger.log(`[Agent: ${account.name}] 正在登录 ${account.email}...`);
        
        // --- 核心测试策略：Limit 1 ---
        // 1. 连接 IMAP (需底层依赖，此处模拟连接成功)
        // 2. 搜索邮件
        
        const mockFileName = `Resume_Test_${account.name}.pdf`;
        this.logger.log(`[Agent: ${account.name}] 发现 1 份新简历: ${mockFileName}`);

        // 3. 调用上传入库流水线 (同步触发本地快解析 -> 异步触发 AI 深层解析)
        const mockFile = {
          originalname: mockFileName,
          buffer: Buffer.from('%PDF-1.4 mock content'),
          size: 1024,
        };

        await this.resumeService.uploadResume(
          'system-test-user-id', 
          mockFile,
          null,
        );

        this.logger.log(`[Agent: ${account.name}] 测试简历拉取并入库成功`);
      } catch (e) {
        this.logger.error(`[Agent: ${account.name}] 拉取失败: ${e.message}`);
      }
    }
  }

  private loadAccounts() {
    try {
      const data = fs.readFileSync(this.accountsPath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      this.logger.error('无法加载邮箱账号配置文件');
      return [];
    }
  }
}
