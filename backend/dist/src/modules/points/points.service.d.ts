import { Repository } from 'typeorm';
import { Points } from './points.entity';
export declare class PointsService {
    private pointsRepo;
    constructor(pointsRepo: Repository<Points>);
    getUserPoints(userId: string): Promise<number>;
    earnPoints(userId: string, points: number, reason: string, relatedType?: string, relatedId?: string): Promise<Points>;
    spendPoints(userId: string, points: number, reason: string, relatedType?: string, relatedId?: string): Promise<Points>;
}
