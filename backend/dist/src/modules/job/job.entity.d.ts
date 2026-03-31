export type JobStatus = 'draft' | 'published' | 'closed';
export declare class Job {
    id: string;
    title: string;
    description: string;
    requirements: string;
    status: JobStatus;
    createdBy: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
