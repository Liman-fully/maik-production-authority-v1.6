export interface ClassificationRule {
    code: string;
    name: string;
    keywords: string[];
    positions?: string[];
}
export interface ClassificationResult {
    industryCode?: string;
    industryName?: string;
    categoryCode?: string;
    categoryName?: string;
    positionName?: string;
    confidence: number;
    matchType: 'exact' | 'partial' | 'weighted' | 'keyword';
    matchedKeywords: string[];
    score?: number;
}
export declare class PositionClassifier {
    private industries;
    private functions;
    private positionMap;
    private positionKeywords;
    constructor();
    private loadPositionKeywords;
    private loadRules;
    classify(positionText: string): ClassificationResult;
    private classifyWithWeights;
    private getWeightedKeywords;
    private calculateWeightedScore;
    private classifyByKeywords;
    batchClassify(positions: string[]): ClassificationResult[];
    getIndustries(): ClassificationRule[];
    getFunctions(): ClassificationRule[];
    getPositionsByFunction(functionCode: string): string[];
}
