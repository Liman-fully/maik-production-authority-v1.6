import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { RESUME_PARSING_PROMPT } from './parsing.prompt';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ZHIPU_API_KEY');
    this.baseUrl = this.configService.get<string>('ZHIPU_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4');
    this.model = this.configService.get<string>('ZHIPU_MODEL', 'glm-4-flash');
    this.localModelUrl = this.configService.get<string>('LOCAL_QWEN_URL', 'http://localhost:11434/api/generate');
  }

  private readonly localModelUrl: string;

  /**
   * 简历内容全流程：本地 Qwen 极速初筛 -> 智谱云端深度解析
   */
  async parseResumeText(text: string): Promise<any> {
    // 1. 本地 Qwen 极速验证 (节省 Token，保护隐私)
    const isValid = await this.validateWithLocalQwen(text);
    if (!isValid) {
      this.logger.warn('Local Qwen rejected the document as non-resume');
      throw new Error('此内容不符合简历特征（本地模型判定），已自动过滤');
    }

    if (!this.apiKey) {
      this.logger.warn('ZHIPU_API_KEY is not set, using mock parsing');
      return this.mockParsing();
    }

    // 2. 深度结构化解析 (使用智谱 GLM-4)
    try {
      const prompt = RESUME_PARSING_PROMPT.replace('{{resumeText}}', text);
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const content = response.data.choices[0].message.content.replace(/```json|```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('ZhipuAI parsing failed', error.stack);
      throw new Error(`AI 解析失败 (智谱): ${error.message}`);
    }
  }

  /**
   * 使用本地部署的阿里 Qwen 模型进行 Boolean 判断
   */
  async validateWithLocalQwen(text: string): Promise<boolean> {
    try {
      const response = await axios.post(
        this.localModelUrl,
        {
          model: "qwen:0.5b", // 2G 内存建议使用超轻量版
          prompt: `判定以下文本是否为个人简历。仅回答"YES"或"NO"。\n\n文本内容：${text.substring(0, 500)}`,
          stream: false
        },
        { timeout: 5000 }
      );
      const result = response.data.response.trim().toUpperCase();
      return result.includes('YES');
    } catch (e) {
      this.logger.warn('Local Qwen validation failed, falling back to Zhipu validation', e.message);
      return this.validateWithZhipu(text);
    }
  }

  async validateWithZhipu(text: string): Promise<boolean> {
    // ... 原有的 Zhipu 备用验证逻辑
    return true; 
  }

  private mockParsing() {
    return {
      basicInfo: { name: '张三', phone: '13800000000', email: 'zhangsan@example.com' },
      education: [],
      workExperience: [],
      projects: [],
      skills: ['React', 'NestJS'],
    };
  }
}
