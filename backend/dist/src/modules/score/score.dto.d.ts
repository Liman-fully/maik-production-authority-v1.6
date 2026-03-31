export declare class CalculatePersonalScoreDto {
    resumeId?: string;
    talentId?: string;
    education?: number;
    experience?: number;
    skills?: number;
    certifications?: number;
    projects?: number;
    stability?: number;
}
export declare class CalculateMatchScoreDto {
    talentId: string;
    jobId?: string;
    jobTitle: string;
    jobRequirements?: string;
    skills?: string[];
    salaryMin?: number;
    salaryMax?: number;
    location?: string;
    experienceRequired?: string;
}
