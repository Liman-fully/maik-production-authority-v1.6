import { ScoreService } from './score.service';
import { CalculatePersonalScoreDto, CalculateMatchScoreDto } from './score.dto';
export declare class ScoreController {
    private readonly scoreService;
    constructor(scoreService: ScoreService);
    calculatePersonalScore(dto: CalculatePersonalScoreDto): Promise<{
        success: boolean;
        data: {
            totalScore: number;
            breakdown: {
                education?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                experience?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                skills?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                certifications?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                projects?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                stability?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                positionMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                salaryMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                locationMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                experienceMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                skillMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
            };
            type: string;
            calculatedAt: Date;
        };
    }>;
    calculateMatchScore(dto: CalculateMatchScoreDto): Promise<{
        success: boolean;
        data: {
            totalScore: number;
            breakdown: {
                education?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                experience?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                skills?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                certifications?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                projects?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                stability?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                positionMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                salaryMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                locationMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                experienceMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                skillMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
            };
            matchContext: {
                jobId?: string;
                jobTitle?: string;
                jobRequirements?: string[];
                requiredSkills?: string[];
                salaryRange?: {
                    min: number;
                    max: number;
                };
                location?: string;
                experienceRequired?: string;
            };
            type: string;
            calculatedAt: Date;
        };
    }>;
    getTalentScores(talentId: string): Promise<{
        success: boolean;
        data: {
            personal: {
                totalScore: number;
                breakdown: {
                    education?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    experience?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    skills?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    certifications?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    projects?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    stability?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    positionMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    salaryMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    locationMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    experienceMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    skillMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                };
            };
            match: {
                totalScore: number;
                breakdown: {
                    education?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    experience?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    skills?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    certifications?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    projects?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    stability?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    positionMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    salaryMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    locationMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    experienceMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                    skillMatch?: {
                        score: number;
                        label: string;
                        detail: string;
                    };
                };
                matchContext: {
                    jobId?: string;
                    jobTitle?: string;
                    jobRequirements?: string[];
                    requiredSkills?: string[];
                    salaryRange?: {
                        min: number;
                        max: number;
                    };
                    location?: string;
                    experienceRequired?: string;
                };
                calculatedAt: Date;
            }[];
        };
    }>;
    getPersonalLeaderboard(limit?: number): Promise<{
        success: boolean;
        data: {
            talentId: string;
            totalScore: number;
            breakdown: {
                education?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                experience?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                skills?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                certifications?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                projects?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                stability?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                positionMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                salaryMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                locationMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                experienceMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
                skillMatch?: {
                    score: number;
                    label: string;
                    detail: string;
                };
            };
        }[];
    }>;
    getMatchLeaderboard(limit?: number): Promise<{
        success: boolean;
        data: {
            talentId: string;
            totalScore: number;
            matchContext: {
                jobId?: string;
                jobTitle?: string;
                jobRequirements?: string[];
                requiredSkills?: string[];
                salaryRange?: {
                    min: number;
                    max: number;
                };
                location?: string;
                experienceRequired?: string;
            };
            calculatedAt: Date;
        }[];
    }>;
}
