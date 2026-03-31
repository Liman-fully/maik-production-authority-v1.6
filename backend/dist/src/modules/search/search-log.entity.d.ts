export declare class SearchLog {
    id: number;
    userId: number;
    query: string;
    filters: any;
    resultCount: number;
    clickedCandidateId: number;
    contactedCandidateId: number;
    responseTimeMs: number;
    cacheHit: boolean;
    createdAt: Date;
}
