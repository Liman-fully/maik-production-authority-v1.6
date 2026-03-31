"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var MembershipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const membership_entity_1 = require("./entities/membership.entity");
let MembershipService = MembershipService_1 = class MembershipService {
    constructor(membershipRepo) {
        this.membershipRepo = membershipRepo;
        this.logger = new common_1.Logger(MembershipService_1.name);
    }
    async onModuleInit() {
        this.logger.log('MembershipService initialized');
    }
    async getActiveMembership(userId) {
        return this.membershipRepo.findOne({
            where: {
                userId,
                isActive: true,
                expiresAt: (0, typeorm_2.MoreThan)(new Date()),
            },
            order: { expiresAt: 'DESC' },
        });
    }
    async createMembership(userId, level, days) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        const membership = this.membershipRepo.create({
            userId,
            level,
            expiresAt,
        });
        return this.membershipRepo.save(membership);
    }
    async checkPermission(userId, requiredLevel) {
        const active = await this.getActiveMembership(userId);
        if (!active)
            return requiredLevel === membership_entity_1.MembershipLevel.FREE;
        const levels = [membership_entity_1.MembershipLevel.FREE, membership_entity_1.MembershipLevel.VIP, membership_entity_1.MembershipLevel.SVIP];
        return levels.indexOf(active.level) >= levels.indexOf(requiredLevel);
    }
};
exports.MembershipService = MembershipService;
exports.MembershipService = MembershipService = MembershipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(membership_entity_1.Membership)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MembershipService);
//# sourceMappingURL=membership.service.js.map