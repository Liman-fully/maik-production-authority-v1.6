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
exports.RecommendationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recommendation_service_1 = require("./recommendation.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RecommendationController = class RecommendationController {
    constructor(recommendationService) {
        this.recommendationService = recommendationService;
    }
    async generateRecommendations(req, body, limit) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return {
                success: false,
                message: '未找到用户 ID',
            };
        }
        const recommendations = await this.recommendationService.generateRecommendations(userId, body.behavior, limit || 20);
        return {
            success: true,
            data: recommendations,
            count: recommendations.length,
        };
    }
    async getUserRecommendations(req, limit) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return {
                success: false,
                message: '未找到用户 ID',
            };
        }
        const recommendations = await this.recommendationService.getUserRecommendations(userId, limit || 20);
        return {
            success: true,
            data: recommendations,
            count: recommendations.length,
        };
    }
    async updateRecommendationStatus(id, body) {
        await this.recommendationService.updateRecommendationStatus(id, body.status);
        return {
            success: true,
            message: `推荐状态已更新为 ${body.status}`,
        };
    }
    async bulkUpdateStatus(idsQuery, body) {
        const ids = idsQuery.split(',').filter(Boolean);
        if (ids.length === 0) {
            return {
                success: false,
                message: '未提供推荐 ID 列表',
            };
        }
        await this.recommendationService.bulkUpdateStatus(ids, body.status);
        return {
            success: true,
            message: `已更新 ${ids.length} 条推荐状态为 ${body.status}`,
        };
    }
    async getRecommendationStats(userId) {
        const stats = await this.recommendationService.getRecommendationStats(userId);
        return {
            success: true,
            data: stats,
        };
    }
    async clearUserCache(req) {
        const userId = req.user?.userId || req.user?.id;
        if (!userId) {
            return {
                success: false,
                message: '未找到用户 ID',
            };
        }
        await this.recommendationService.clearUserCache(userId);
        return {
            success: true,
            message: '推荐缓存已清除',
        };
    }
};
exports.RecommendationController = RecommendationController;
__decorate([
    (0, common_1.Post)('generate'),
    (0, swagger_1.ApiOperation)({ summary: '为用户生成推荐列表' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '推荐数量，默认 20' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Number]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "generateRecommendations", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户的推荐列表' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '数量，默认 20' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getUserRecommendations", null);
__decorate([
    (0, common_1.Post)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: '更新推荐状态（用户交互后调用）' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "updateRecommendationStatus", null);
__decorate([
    (0, common_1.Post)('bulk-status'),
    (0, swagger_1.ApiOperation)({ summary: '批量更新推荐状态' }),
    (0, swagger_1.ApiQuery)({ name: 'ids', required: true, description: '推荐 ID 列表，逗号分隔' }),
    __param(0, (0, common_1.Query)('ids')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "bulkUpdateStatus", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取推荐统计信息' }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: false, description: '用户 ID，不传则统计全部' }),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "getRecommendationStats", null);
__decorate([
    (0, common_1.Post)('cache/clear'),
    (0, swagger_1.ApiOperation)({ summary: '清除用户推荐缓存' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "clearUserCache", null);
exports.RecommendationController = RecommendationController = __decorate([
    (0, swagger_1.ApiTags)('人才推荐'),
    (0, common_1.Controller)('recommendations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationService])
], RecommendationController);
//# sourceMappingURL=recommendation.controller.js.map