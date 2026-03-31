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
exports.SearchLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_log_service_1 = require("./search-log.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SearchLogController = class SearchLogController {
    constructor(searchLogService) {
        this.searchLogService = searchLogService;
    }
    async getHotSearchTerms(days = 7, limit = 100) {
        const terms = await this.searchLogService.getHotSearchTerms(days, limit);
        return {
            success: true,
            data: terms,
        };
    }
    async getZeroResultTerms(days = 7) {
        const terms = await this.searchLogService.getZeroResultTerms(days);
        return {
            success: true,
            data: terms,
        };
    }
    async getSearchStats(days = 7) {
        const stats = await this.searchLogService.getSearchStats(days);
        return {
            success: true,
            data: stats,
        };
    }
    async getUserSearchHistory(req, limit = 20) {
        const history = await this.searchLogService.getUserSearchHistory(req.user.id, limit);
        return {
            success: true,
            data: history,
        };
    }
    async logSearch(req, body) {
        const log = await this.searchLogService.logSearch({
            userId: req.user.id,
            ...body,
        });
        return {
            success: true,
            data: log,
        };
    }
    async logClick(body) {
        await this.searchLogService.logClick(body.logId, body.candidateId);
        return {
            success: true,
        };
    }
    async logContact(body) {
        await this.searchLogService.logContact(body.logId, body.candidateId);
        return {
            success: true,
        };
    }
};
exports.SearchLogController = SearchLogController;
__decorate([
    (0, common_1.Get)('hot-terms'),
    (0, swagger_1.ApiOperation)({ summary: '获取热门搜索词' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Query)('days')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "getHotSearchTerms", null);
__decorate([
    (0, common_1.Get)('zero-results'),
    (0, swagger_1.ApiOperation)({ summary: '获取零结果搜索词' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "getZeroResultTerms", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取搜索统计' }),
    (0, swagger_1.ApiQuery)({ name: 'days', required: false }),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "getSearchStats", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: '获取用户搜索历史' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "getUserSearchHistory", null);
__decorate([
    (0, common_1.Post)('log'),
    (0, swagger_1.ApiOperation)({ summary: '记录搜索日志' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "logSearch", null);
__decorate([
    (0, common_1.Post)('click'),
    (0, swagger_1.ApiOperation)({ summary: '记录点击日志' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "logClick", null);
__decorate([
    (0, common_1.Post)('contact'),
    (0, swagger_1.ApiOperation)({ summary: '记录联系日志' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchLogController.prototype, "logContact", null);
exports.SearchLogController = SearchLogController = __decorate([
    (0, swagger_1.ApiTags)('搜索日志'),
    (0, common_1.Controller)('search-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [search_log_service_1.SearchLogService])
], SearchLogController);
//# sourceMappingURL=search-log.controller.js.map