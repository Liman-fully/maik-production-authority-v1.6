import { Injectable } from '@nestjs/common';

export interface ClassificationLogInput {
  inputText: string;
  resultCategoryCode?: string;
  resultCategoryName?: string;
  resultIndustryCode?: string;
  resultIndustryName?: string;
  confidence: number;
  matchType: 'exact' | 'partial' | 'weighted' | 'keyword';
  matchedKeywords: string[];
  userId?: string;
}

export interface ClassificationLog extends ClassificationLogInput {
  id: string;
  isManualOverride: boolean;
  manualResultCategoryCode?: string;
  errorType?: 'false_positive' | 'false_negative' | 'wrong_category';
  createdAt: Date;
}

@Injectable()
export class ClassificationLogger {
  private logsRepo: any;

  constructor() {
    // TODO: 注入 ClassificationLog 实体后改为 @InjectRepository(ClassificationLog)
  }

  /**
   * 记录分类日志
   */
  async log(input: ClassificationLogInput): Promise<ClassificationLog> {
    const log: ClassificationLog = {
      id: this.generateId(),
      isManualOverride: false,
      ...input,
      createdAt: new Date(),
    };

    // TODO: 实现数据库持久化
    console.log('[ClassificationLogger] Log:', JSON.stringify(log).substring(0, 200));
    return log;
  }

  async batchLog(inputs: ClassificationLogInput[]): Promise<void> {
    console.log(`[ClassificationLogger] Batch log: ${inputs.length} entries`);
  }

  async markError(
    logId: string,
    errorType: 'false_positive' | 'false_negative' | 'wrong_category',
    manualResultCategoryCode?: string,
  ): Promise<void> {
    console.log(`[ClassificationLogger] Mark error: ${logId} -> ${errorType}`);
  }

  async getPendingReview(limit: number = 100): Promise<ClassificationLog[]> {
    return [];
  }

  /**
   * 获取错误统计
   */
  async getErrorStats(days: number = 7): Promise<{
    totalLogs: number;
    errorCount: number;
    errorRate: number;
    byType: Record<string, number>;
  }> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const logs = await this.logsRepo.find({
        where: { createdAt: since },
      });

      const totalLogs = logs.length;
      const errorCount = logs.filter(l => l.errorType).length;
      const byType: Record<string, number> = {};

      for (const log of logs) {
        if (log.errorType) {
          byType[log.errorType] = (byType[log.errorType] || 0) + 1;
        }
      }

      return {
        totalLogs,
        errorCount,
        errorRate: totalLogs > 0 ? errorCount / totalLogs : 0,
        byType,
      };
    } catch (error) {
      console.error('[ClassificationLogger] Failed to get error stats:', error);
      return {
        totalLogs: 0,
        errorCount: 0,
        errorRate: 0,
        byType: {},
      };
    }
  }

  /**
   * 检测潜在错误
   */
  detectPotentialError(log: ClassificationLog): boolean {
    // 规则 1: 置信度<0.5
    if (log.confidence < 0.5) return true;

    // 规则 2: 关键词匹配<3 个
    if (log.matchedKeywords.length < 3) return true;

    // 规则 3: 被人工覆盖
    if (log.isManualOverride) return true;

    return false;
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
