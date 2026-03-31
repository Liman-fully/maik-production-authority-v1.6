import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
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
