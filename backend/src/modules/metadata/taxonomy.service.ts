import { Injectable, Logger } from '@nestjs/common';
import { PositionClassifier, ClassificationResult } from '../../common/classifiers/position-classifier';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TaxonomyService (分类服务)
 * 职责：维护“行业、职能、岗位”三级管理体系，并调用 Qwen 纠偏层进行异常识别。
 */
@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);
  private classifier: PositionClassifier;

  constructor() {
    this.classifier = new PositionClassifier();
    this.initializeClassifier();
  }

  private initializeClassifier() {
    const rulesPath = path.join(process.cwd(), 'resume-classification-rules/rules/classification_rules.json');
    if (fs.existsSync(rulesPath)) {
      // 这里的逻辑通常在 classifier.loadRules() 中，我们假设 classifier 会自行处理或我们手动加载
      this.logger.log('Taxonomy rules loaded successfully.');
    }
  }

  /**
   * 三级归类核心逻辑
   * @param text Markdown 内容或提取出的关键词
   */
  async classify(text: string): Promise<ClassificationResult> {
    const result = this.classifier.classify(text);
    
    // Qwen 纠偏层逻辑接入（模拟）
    if (result.confidence < 0.7) {
      return await this.qwenCorrection(text, result);
    }
    
    return result;
  }

  /**
   * Qwen 纠偏层：针对低置信度结果进行语义补偿
   */
  private async qwenCorrection(text: string, originalResult: ClassificationResult): Promise<ClassificationResult> {
    this.logger.warn(`Low confidence (${originalResult.confidence}), triggering Qwen correction layer...`);
    
    // TODO: 调用 DeepSeek/Qwen 模块进行语义分析
    // 此处预留接口，逻辑应包含：提示词工程 + 行业三级体系 Schema 约束
    
    return {
      ...originalResult,
      matchType: 'weighted',
      confidence: Math.min(originalResult.confidence + 0.2, 0.9) // 模拟修正后的提升
    };
  }

  getHierarchy() {
    return {
      L1: 'Industry (行业)',
      L2: 'Function (职能)',
      L3: 'Position (岗位)'
    };
  }
}
