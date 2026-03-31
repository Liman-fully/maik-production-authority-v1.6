import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { CacheService } from '../../common/cache/cache.service';
export interface SearchCandidateDto {
    keyword?: string;
    city?: string;
    educationLevel?: number;
    workYearsMin?: number;
    workYearsMax?: number;
    skills?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface SearchResults {
    data: Candidate[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class CandidateService {
    private candidateRepo;
    private cacheService;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    constructor(candidateRepo: Repository<Candidate>, cacheService: CacheService);
    searchCandidates(query: SearchCandidateDto): Promise<SearchResults>;
    private executeSearch;
    getSearchSuggestions(query: string, limit?: number): Promise<string[]>;
    highlightResult(candidate: Candidate, keyword: string): any;
    findOne(id: number): Promise<Candidate>;
    create(candidateData: Partial<Candidate>): Promise<Candidate>;
    update(id: number, data: Partial<Candidate>): Promise<Candidate>;
    delete(id: number): Promise<void>;
    invalidateSearchCache(): Promise<void>;
    getCacheStats(): import("../../common/cache/cache.service").CacheStats;
    getSearchStats(query: SearchCandidateDto): Promise<any>;
}
