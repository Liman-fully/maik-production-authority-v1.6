export declare class Resume {
    id: string;
    userId: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    cosUrl: string;
    cosKey: string;
    localPath: string;
    parseStatus: string;
    parseError: string;
    basicInfo: {
        name?: string;
        phone?: string;
        email?: string;
        age?: number;
        gender?: string;
        location?: string;
    };
    education: Array<{
        school: string;
        major: string;
        degree: string;
        startDate: string;
        endDate: string;
    }>;
    workExperience: Array<{
        company: string;
        position: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    projects: Array<{
        name: string;
        role: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    skills: string[];
    certifications: Array<{
        name: string;
        date: string;
        organization: string;
    }>;
    jobIntention: {
        expectedPosition?: string;
        expectedSalary?: string;
        expectedLocation?: string;
        jobStatus?: string;
    };
    tags: string[];
    talentId: string;
    folderId: string;
    score: number;
    tier: string;
    isPublic: boolean;
    source: string;
    createdAt: Date;
    updatedAt: Date;
}
