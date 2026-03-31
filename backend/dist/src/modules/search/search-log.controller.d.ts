import { SearchLogService } from './search-log.service';
export declare class SearchLogController {
    private readonly searchLogService;
    constructor(searchLogService: SearchLogService);
    getHotSearchTerms(days?: number, limit?: number): Promise<{
        success: boolean;
        data: import("./search-log.service").SearchTermStats[];
    }>;
    getZeroResultTerms(days?: number): Promise<{
        success: boolean;
        data: {
            query: string;
            count: number;
        }[];
    }>;
    getSearchStats(days?: number): Promise<{
        success: boolean;
        data: any;
    }>;
    getUserSearchHistory(req: any, limit?: number): Promise<{
        success: boolean;
        data: import("./search-log.entity").SearchLog[];
    }>;
    logSearch(req: any, body: {
        query: string;
        filters?: any;
        resultCount: number;
        responseTimeMs?: number;
        cacheHit?: boolean;
    }): Promise<{
        success: boolean;
        data: import("./search-log.entity").SearchLog;
    }>;
    logClick(body: {
        logId: number;
        candidateId: number;
    }): Promise<{
        success: boolean;
    }>;
    logContact(body: {
        logId: number;
        candidateId: number;
    }): Promise<{
        success: boolean;
    }>;
}
