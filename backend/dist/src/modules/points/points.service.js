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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const points_entity_1 = require("./points.entity");
let PointsService = class PointsService {
    constructor(pointsRepo) {
        this.pointsRepo = pointsRepo;
    }
    async getUserPoints(userId) {
        const record = await this.pointsRepo.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        return record?.points || 0;
    }
    async earnPoints(userId, points, reason, relatedType, relatedId) {
        const currentPoints = await this.getUserPoints(userId);
        const record = this.pointsRepo.create({
            userId,
            points: currentPoints + points,
            totalEarned: points,
            reason,
            relatedType,
            relatedId,
        });
        return this.pointsRepo.save(record);
    }
    async spendPoints(userId, points, reason, relatedType, relatedId) {
        const currentPoints = await this.getUserPoints(userId);
        if (currentPoints < points) {
            throw new Error('积分不足');
        }
        const record = this.pointsRepo.create({
            userId,
            points: currentPoints - points,
            totalSpent: points,
            reason,
            relatedType,
            relatedId,
        });
        return this.pointsRepo.save(record);
    }
};
exports.PointsService = PointsService;
exports.PointsService = PointsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(points_entity_1.Points)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PointsService);
//# sourceMappingURL=points.service.js.map