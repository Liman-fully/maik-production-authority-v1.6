import { RecommendationService, UserBehavior } from './recommendation.service';
interface GenerateRecommendationsDto {
    behavior: UserBehavior;
    limit?: number;
}
interface UpdateStatusDto {
    status: 'shown' | 'clicked' | 'ignored';
}
export declare class RecommendationController {
    private readonly recommendationService;
    constructor(recommendationService: RecommendationService);
    generateRecommendations(req: any, body: GenerateRecommendationsDto, limit?: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        count?: undefined;
    } | {
        success: boolean;
        data: import("./recommendation.service").RecommendationResult[];
        count: number;
        message?: undefined;
    }>;
    getUserRecommendations(req: any, limit?: number): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        count?: undefined;
    } | {
        success: boolean;
        data: import("./recommendation.service").RecommendationResult[];
        count: number;
        message?: undefined;
    }>;
    updateRecommendationStatus(id: string, body: UpdateStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    bulkUpdateStatus(idsQuery: string, body: UpdateStatusDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getRecommendationStats(userId?: string): Promise<{
        success: boolean;
        data: any;
    }>;
    clearUserCache(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
