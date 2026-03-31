export declare enum MembershipLevel {
    FREE = "free",
    VIP = "vip",
    SVIP = "svip"
}
export declare class Membership {
    id: string;
    userId: string;
    level: MembershipLevel;
    expiresAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
