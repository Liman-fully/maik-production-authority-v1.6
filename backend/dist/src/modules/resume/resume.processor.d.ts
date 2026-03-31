import { Job } from 'bull';
import { ResumeService } from './resume.service';
export declare class ResumeProcessor {
    private readonly resumeService;
    private readonly logger;
    private runningCount;
    private limits;
    constructor(resumeService: ResumeService);
    handleParsing(job: Job<{
        resumeId: string;
        group?: string;
    }>): Promise<void>;
}
