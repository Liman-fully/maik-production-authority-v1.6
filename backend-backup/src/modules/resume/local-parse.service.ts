import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 本地解析服务 (Hybrid Strategy Phase 1)
 * 优先级: 本地规则正则提取 > 结构化关键信息匹配 > AI 接口兜底
 */
@Injectable()
export class LocalParseService {
  private readonly logger = new Logger(LocalParseService.name);

  async extractBasicInfo(text: string): Promise<any> {
    this.logger.log('执行本地规则提取...');
    
    // 1. 手机号匹配
    const phoneMatch = text.match(/1[3-9]\d{9}/);
    
    // 2. 邮箱匹配
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    
    // 3. 姓名尝试匹配 (基于简历常见格式：姓名：xxx 或 居中的前两个字)
    let name = null;
    const namePatterns = [/姓名[:：\s]*([\u4e00-\u9fa5]{2,4})/, /^([\u4e00-\u9fa5]{2,4})\s+/m];
    for (const pattern of namePatterns) {
      const m = text.match(pattern);
      if (m) { name = m[1]; break; }
    }

    return {
      name,
      phone: phoneMatch ? phoneMatch[0] : null,
      email: emailMatch ? emailMatch[0] : null,
      isLocalSuccess: !!(name && (phoneMatch || emailMatch))
    };
  }

  /**
   * 判断是否需要 AI 介入
   * 如果本地提取到了核心联系方式和姓名，则标记为“基本成功”
   * 但为了“深层结构化”（如工作经历、项目经历），仍建议在后台低优先级调用 AI
   */
  shouldUseAi(localInfo: any): boolean {
    // 如果本地连名字和电话都没抓到，必须 AI 介入
    if (!localInfo.name || !localInfo.phone) return true;
    return false; // 暂时策略：只要本地抓到核心，就优先展示本地
  }
}
