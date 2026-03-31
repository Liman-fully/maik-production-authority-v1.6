import { JobStatus } from '../job.entity';
export declare class CreateJobDto {
    title: string;
    description?: string;
    requirements?: string;
    status?: JobStatus;
}
export declare class UpdateJobDto {
    title?: string;
    description?: string;
    requirements?: string;
    status?: JobStatus;
}
