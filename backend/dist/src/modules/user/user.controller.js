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
var UserController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_service_1 = require("./user.service");
const membership_service_1 = require("../membership/membership.service");
const points_service_1 = require("../points/points.service");
let UserController = UserController_1 = class UserController {
    constructor(userService, membershipService, pointsService) {
        this.userService = userService;
        this.membershipService = membershipService;
        this.pointsService = pointsService;
        this.logger = new common_1.Logger(UserController_1.name);
    }
    async getProfile(req) {
        const userId = req.user.id;
        const user = await this.userService.findById(userId);
        const membership = await this.membershipService.getActiveMembership(userId);
        const points = await this.pointsService.getUserPoints(userId);
        return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            company: user.company,
            membership: membership ? {
                level: membership.level,
                expiresAt: membership.expiresAt,
            } : null,
            points,
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfile", null);
exports.UserController = UserController = UserController_1 = __decorate([
    (0, common_1.Controller)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [user_service_1.UserService,
        membership_service_1.MembershipService,
        points_service_1.PointsService])
], UserController);
//# sourceMappingURL=user.controller.js.map