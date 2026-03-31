export declare enum JobStatus {
    ACTIVELY_LOOKING = "actively_looking",
    OPEN_TO_OFFERS = "open_to_offers",
    NOT_LOOKING = "not_looking"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare enum SortBy {
    LATEST = "latest",
    ACTIVE = "active",
    SCORE = "score"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare class TalentFilterDto {
    location?: string;
    experience?: string;
    education?: string;
    skills?: string;
    company?: string;
    expectedSalary?: string;
    jobStatus?: JobStatus;
    age?: string;
    gender?: Gender;
    industry?: string;
    jobType?: string;
    workExperience?: string;
    educationYear?: string;
    skillsCount?: string;
    lastActive?: string;
    matchScore?: string;
    resumeComplete?: boolean;
    verified?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
}
