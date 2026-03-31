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
export declare class ClassificationLogger {
    private logsRepo;
    constructor();
    log(input: ClassificationLogInput): Promise<ClassificationLog>;
    batchLog(inputs: ClassificationLogInput[]): Promise<void>;
    markError(logId: string, errorType: 'false_positive' | 'false_negative' | 'wrong_category', manualResultCategoryCode?: string): Promise<void>;
    getPendingReview(limit?: number): Promise<ClassificationLog[]>;
    getErrorStats(days?: number): Promise<{
        totalLogs: number;
        errorCount: number;
        errorRate: number;
        byType: Record<string, number>;
    }>;
    detectPotentialError(log: ClassificationLog): boolean;
    private generateId;
}
