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
exports.CandidateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const candidate_service_1 = require("./candidate.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CandidateController = class CandidateController {
    constructor(candidateService) {
        this.candidateService = candidateService;
    }
    async searchCandidates(query) {
        const results = await this.candidateService.searchCandidates(query);
        return {
            success: true,
            data: results,
        };
    }
    async getSearchSuggestions(query, limit = 5) {
        const suggestions = await this.candidateService.getSearchSuggestions(query, limit);
        return {
            success: true,
            data: suggestions,
        };
    }
    async getSearchStats(query) {
        const stats = await this.candidateService.getSearchStats(query);
        return {
            success: true,
            data: stats,
        };
    }
    async getCacheStats() {
        const stats = this.candidateService.getCacheStats();
        return {
            success: true,
            data: stats,
        };
    }
    async invalidateCache() {
        await this.candidateService.invalidateSearchCache();
        return {
            success: true,
            message: '缓存已失效',
        };
    }
    async getCandidate(id) {
        const candidate = await this.candidateService.findOne(id);
        return {
            success: true,
            data: candidate,
        };
    }
    async createCandidate(data) {
        return this.candidateService.create(data);
    }
    async updateCandidate(id, data) {
        return this.candidateService.update(id, data);
    }
    async deleteCandidate(id) {
        await this.candidateService.delete(id);
        return { success: true };
    }
    async updateTags(id, tags) {
        return this.candidateService.update(id, { tags });
    }
    async updateGroup(id, groupId, groupName) {
        return this.candidateService.update(id, { groupId, groupName });
    }
    async highlightResult(keyword, id) {
        const candidate = await this.candidateService.findOne(id);
        const result = this.candidateService.highlightResult(candidate, keyword);
        return {
            success: true,
            data: result,
        };
    }
};
exports.CandidateController = CandidateController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: '搜索候选人' }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false, description: '关键词（职位/技能）' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: '城市' }),
    (0, swagger_1.ApiQuery)({ name: 'educationLevel', required: false, description: '学历（1:本科，2:硕士，3:博士）' }),
    (0, swagger_1.ApiQuery)({ name: 'workYearsMin', required: false, description: '最小工作年限' }),
    (0, swagger_1.ApiQuery)({ name: 'workYearsMax', required: false, description: '最大工作年限' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, description: '排序方式' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "searchCandidates", null);
__decorate([
    (0, common_1.Get)('search/suggestions'),
    (0, swagger_1.ApiOperation)({ summary: '搜索建议（自动补全）' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, description: '搜索关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '建议数量' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getSearchSuggestions", null);
__decorate([
    (0, common_1.Get)('search/stats'),
    (0, swagger_1.ApiOperation)({ summary: '搜索结果统计' }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false, description: '关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'city', required: false, description: '城市' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getSearchStats", null);
__decorate([
    (0, common_1.Get)('cache-stats'),
    (0, swagger_1.ApiOperation)({ summary: '缓存统计（命中率监控）' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCacheStats", null);
__decorate([
    (0, common_1.Post)('cache/invalidate'),
    (0, swagger_1.ApiOperation)({ summary: '手动失效缓存（管理功能）' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "invalidateCache", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '获取候选人详情' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "getCandidate", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: '创建候选人' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "createCandidate", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '更新候选人' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateCandidate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: '删除候选人' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "deleteCandidate", null);
__decorate([
    (0, common_1.Patch)(':id/tags'),
    (0, swagger_1.ApiOperation)({ summary: '更新标签' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateTags", null);
__decorate([
    (0, common_1.Patch)(':id/group'),
    (0, swagger_1.ApiOperation)({ summary: '更新分组' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('groupId')),
    __param(2, (0, common_1.Body)('groupName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Get)(':id/highlight'),
    (0, swagger_1.ApiOperation)({ summary: '高亮显示搜索结果' }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: true, description: '关键词' }),
    __param(0, (0, common_1.Query)('keyword')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], CandidateController.prototype, "highlightResult", null);
exports.CandidateController = CandidateController = __decorate([
    (0, swagger_1.ApiTags)('候选人搜索'),
    (0, common_1.Controller)('candidates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [candidate_service_1.CandidateService])
], CandidateController);
//# sourceMappingURL=candidate.controller.js.map