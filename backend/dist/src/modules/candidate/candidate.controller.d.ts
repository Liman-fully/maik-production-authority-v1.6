import { CandidateService, SearchCandidateDto } from './candidate.service';
export declare class CandidateController {
    private readonly candidateService;
    constructor(candidateService: CandidateService);
    searchCandidates(query: SearchCandidateDto): Promise<{
        success: boolean;
        data: import("./candidate.service").SearchResults;
    }>;
    getSearchSuggestions(query: string, limit?: number): Promise<{
        success: boolean;
        data: string[];
    }>;
    getSearchStats(query: SearchCandidateDto): Promise<{
        success: boolean;
        data: any;
    }>;
    getCacheStats(): Promise<{
        success: boolean;
        data: import("../../common/cache/cache.service").CacheStats;
    }>;
    invalidateCache(): Promise<{
        success: boolean;
        message: string;
    }>;
    getCandidate(id: number): Promise<{
        success: boolean;
        data: import("./candidate.entity").Candidate;
    }>;
    createCandidate(data: any): Promise<import("./candidate.entity").Candidate>;
    updateCandidate(id: number, data: any): Promise<import("./candidate.entity").Candidate>;
    deleteCandidate(id: number): Promise<{
        success: boolean;
    }>;
    updateTags(id: number, tags: string[]): Promise<import("./candidate.entity").Candidate>;
    updateGroup(id: number, groupId: number, groupName: string): Promise<import("./candidate.entity").Candidate>;
    highlightResult(keyword: string, id: number): Promise<{
        success: boolean;
        data: any;
    }>;
}
