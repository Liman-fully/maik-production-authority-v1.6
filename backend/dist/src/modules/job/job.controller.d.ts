import { JobService } from './job.service';
import { CreateJobDto } from './dto/job.dto';
export declare class JobController {
    private readonly jobService;
    private classifier;
    constructor(jobService: JobService);
    getMyJobs(params: any): Promise<{
        data: import("./job.entity").Job[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createJob(dto: CreateJobDto, req: any): Promise<import("./job.entity").Job>;
    getCategories(): {
        success: boolean;
        data: {
            industries: import("../../common/classifiers/position-classifier").ClassificationRule[];
            functions: import("../../common/classifiers/position-classifier").ClassificationRule[];
        };
    };
    classifyPosition(text: string): {
        success: boolean;
        data: import("../../common/classifiers/position-classifier").ClassificationResult;
    };
    batchClassify(body: {
        texts: string[];
    }): {
        success: boolean;
        data: import("../../common/classifiers/position-classifier").ClassificationResult[];
        stats: {
            total: number;
            exact: number;
            partial: number;
            keyword: number;
            failed: number;
        };
    };
    getPositions(functionCode: string): {
        success: boolean;
        data: string[];
        count: number;
    };
    getStats(): {
        success: boolean;
        data: {
            industries: number;
            functions: number;
            positions: number;
            keywords: number;
            avgKeywordsPerFunction: string;
        };
    };
}
