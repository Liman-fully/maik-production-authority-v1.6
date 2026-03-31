import { UserService } from './user.service';
import { MembershipService } from '../membership/membership.service';
import { PointsService } from '../points/points.service';
export declare class UserController {
    private userService;
    private membershipService;
    private pointsService;
    private readonly logger;
    constructor(userService: UserService, membershipService: MembershipService, pointsService: PointsService);
    getProfile(req: any): Promise<{
        id: string;
        name: string;
        phone: string;
        role: import("./user.entity").UserRole;
        avatar: string;
        company: string;
        membership: {
            level: import("../membership/entities/membership.entity").MembershipLevel;
            expiresAt: Date;
        };
        points: number;
    }>;
}
