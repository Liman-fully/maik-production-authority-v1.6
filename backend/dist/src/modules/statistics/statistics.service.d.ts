import { Repository } from 'typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { Job } from '../job/job.entity';
import { Interview } from '../interview/interview.entity';
export declare class StatisticsService {
    private readonly candidateRepository;
    private readonly jobRepository;
    private readonly interviewRepository;
    constructor(candidateRepository: Repository<Candidate>, jobRepository: Repository<Job>, interviewRepository: Repository<Interview>);
    getOverview(): Promise<{
        candidates: number;
        activeJobs: number;
        interviews: number;
        successRate: number;
    }>;
    getFunnel(): Promise<{
        step: string;
        count: number;
    }[]>;
    getTrend(): Promise<{
        month: string;
        candidates: number;
        interviews: number;
    }[]>;
}
