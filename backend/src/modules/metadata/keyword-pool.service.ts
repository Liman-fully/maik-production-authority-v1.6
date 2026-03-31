import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TaxonomyService } from './taxonomy.service';

/**
 * KeywordPoolService (知识进化池)
 * 职责：从解析成功的 Markdown 中根据语义频率自动提取新关键词，并尝试将其映射/归类。
 * 核心逻辑：
 * 1. 词频统计（结合位置加权）
 * 2. 去重、分词、评分 (0.1 ~ 1.0)
 * 3. 映射到 Taxonomy (三级体系)
 */
@Injectable()
export class KeywordPoolService {
  private readonly logger = new Logger(KeywordPoolService.name);

  constructor(private taxonomyService: TaxonomyService) { }

  /**
   * 进化流程开始
   * @param markdownContent 简历 MD
   */
  async evolveKeywords(markdownContent: string): Promise<string[]> {
    this.logger.log('🚀 Starting Keyword Evolution based on content...');

    // 1. 语义频率提取（模拟分词和统计）
    const candidateKeywords = this.extractCandidates(markdownContent);
    this.logger.debug(`Found ${candidateKeywords.length} candidate keywords.`);

    // 2. 映射归类逻辑
    const evolvedList: string[] = [];
    for (const kw of candidateKeywords) {
      if (!this.isTooCommon(kw)) {
        // 尝试使用三级分类器获取其所属的岗位/职能
        const classification = await this.taxonomyService.classify(kw);
        if (classification.categoryName) {
          this.logger.log(`Mapped [${kw}] to Category: ${classification.categoryName}`);
          evolvedList.push(kw);
          
          // 更新关键词池
          this.persistNewKeyword(kw, classification.categoryCode);
        }
      }
    }

    return evolvedList;
  }

  /**
   * 关键词加权：前 200 个字出现的重要词汇加分 (模拟位置加分 +0.2)
   */
  private extractCandidates(content: string): string[] {
    // 此处为简化逻辑：通常会使用 nodejieba 或 compromise 等库进行分词
    const firstPart = content.substring(0, 500);
    // 这里模拟提取出高频词/专有名词
    const mockedKws = ['AI Agent', 'Python', 'NestJS', 'PostgreSQL', 'NLP', 'TensorFlow'];
    return mockedKws;
  }

  private isTooCommon(kw: string): boolean {
    const commonWords = ['经验', '负责', '简历', '内容', '开发'];
    return commonWords.includes(kw);
  }

  private persistNewKeyword(kw: string, categoryCode: string) {
    const poolDir = path.join(process.cwd(), 'resume-classification-rules/keywords/autonomous_pool');
    if (!fs.existsSync(poolDir)) {
      fs.mkdirSync(poolDir, { recursive: true });
    }
    // TODO: 真正的进化是将该词写入特定 JSON 文件，下次加载规则时自动包含
  }
}
