import { Repository } from 'typeorm';
import { SearchLog } from './search-log.entity';
export interface SearchTermStats {
    query: string;
    count: number;
    avgResultCount: number;
    clickRate: number;
    contactRate: number;
}
export declare class SearchLogService {
    private searchLogRepo;
    constructor(searchLogRepo: Repository<SearchLog>);
    logSearch(params: {
        userId?: number;
        query: string;
        filters?: any;
        resultCount: number;
        responseTimeMs?: number;
        cacheHit?: boolean;
    }): Promise<SearchLog>;
    logClick(logId: number, candidateId: number): Promise<void>;
    logContact(logId: number, candidateId: number): Promise<void>;
    getHotSearchTerms(days?: number, limit?: number): Promise<SearchTermStats[]>;
    getZeroResultTerms(days?: number): Promise<{
        query: string;
        count: number;
    }[]>;
    getSearchStats(days?: number): Promise<any>;
    getUserSearchHistory(userId: number, limit?: number): Promise<SearchLog[]>;
    cleanupOldLogs(daysToKeep?: number): Promise<number>;
}
