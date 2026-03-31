import { PointsService } from './points.service';
export declare class PointsController {
    private readonly pointsService;
    constructor(pointsService: PointsService);
    getBalance(req: any): Promise<{
        success: boolean;
        data: {
            points: number;
        };
    }>;
    earnPoints(req: any, body: {
        points: number;
        reason: string;
    }): Promise<{
        success: boolean;
        data: import("./points.entity").Points;
    }>;
}
