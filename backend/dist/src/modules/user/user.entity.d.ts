export declare enum UserRole {
    HR = "hr",
    SEEKER = "seeker"
}
export declare enum UserTier {
    FREE = "free",
    PAID = "paid",
    TEAM = "team",
    ENTERPRISE = "enterprise"
}
export declare class User {
    id: string;
    phone: string;
    name: string;
    idCard: string;
    role: UserRole;
    tier: UserTier;
    avatar: string;
    company: string;
    isActive: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}
