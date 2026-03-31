import { Repository } from 'typeorm';
import { Recommendation } from './recommendation.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CacheService } from '../../common/cache/cache.service';
export interface UserBehavior {
    viewedCandidateIds?: string[];
    downloadedCandidateIds?: string[];
    searchedPositions?: string[];
    industry?: string;
    preferredSkills?: string[];
}
export interface RecommendationResult {
    id: string;
    candidateId: string;
    candidate: any;
    score: number;
    reason: {
        skillMatch?: number;
        industryMatch?: number;
        positionMatch?: number;
        popularity?: number;
        matchedSkills?: string[];
        matchedKeywords?: string[];
    };
    createdAt: Date;
}
export interface GetRecommendationsDto {
    userId: string;
    limit?: number;
    excludeCandidateIds?: string[];
}
export declare class RecommendationService {
    private recommendationRepo;
    private candidateRepo;
    private cacheService;
    private readonly logger;
    private readonly CACHE_TTL;
    private readonly CACHE_PREFIX;
    constructor(recommendationRepo: Repository<Recommendation>, candidateRepo: Repository<Candidate>, cacheService: CacheService);
    generateRecommendations(userId: string, behavior: UserBehavior, limit?: number): Promise<RecommendationResult[]>;
    private calculateMatchScore;
    private calculateSkillMatch;
    private calculateIndustryMatch;
    private calculatePositionMatch;
    private calculatePopularity;
    private extractKeywords;
    private findMatchedSkills;
    private findMatchedKeywords;
    private saveRecommendation;
    getUserRecommendations(userId: string, limit?: number): Promise<RecommendationResult[]>;
    updateRecommendationStatus(recommendationId: string, status: 'shown' | 'clicked' | 'ignored'): Promise<void>;
    bulkUpdateStatus(recommendationIds: string[], status: 'shown' | 'clicked' | 'ignored'): Promise<void>;
    clearUserCache(userId: string): Promise<void>;
    getRecommendationStats(userId?: string): Promise<any>;
}
