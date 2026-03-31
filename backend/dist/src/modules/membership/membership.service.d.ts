import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Membership, MembershipLevel } from './entities/membership.entity';
export declare class MembershipService implements OnModuleInit {
    private membershipRepo;
    private readonly logger;
    constructor(membershipRepo: Repository<Membership>);
    onModuleInit(): Promise<void>;
    getActiveMembership(userId: string): Promise<Membership>;
    createMembership(userId: string, level: MembershipLevel, days: number): Promise<Membership>;
    checkPermission(userId: string, requiredLevel: MembershipLevel): Promise<boolean>;
}
