import { Candidate } from '../candidate/candidate.entity';
import { Job } from '../job/job.entity';
export type InterviewStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export declare class Interview {
    id: string;
    candidateId: number;
    candidate: Candidate;
    jobId: string;
    job: Job;
    scheduledAt: Date;
    status: InterviewStatus;
    feedback: string;
    score: number;
    createdAt: Date;
}
