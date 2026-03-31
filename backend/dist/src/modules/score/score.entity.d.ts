export declare class ScoreRecord {
    id: string;
    userId: string;
    talentId: string;
    resumeId: string;
    type: string;
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
    scoreVersion: string;
    createdAt: Date;
    updatedAt: Date;
}
