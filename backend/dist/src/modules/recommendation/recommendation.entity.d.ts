export declare class Recommendation {
    id: string;
    userId: string;
    candidateId: string;
    score: number;
    reason: {
        skillMatch?: number;
        industryMatch?: number;
        positionMatch?: number;
        popularity?: number;
        matchedSkills?: string[];
        matchedKeywords?: string[];
    };
    status: 'pending' | 'shown' | 'clicked' | 'ignored';
    createdAt: Date;
    updatedAt: Date;
}
