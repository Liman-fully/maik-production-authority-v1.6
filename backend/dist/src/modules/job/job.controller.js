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
exports.JobController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const position_classifier_1 = require("../../common/classifiers/position-classifier");
const job_service_1 = require("./job.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const job_dto_1 = require("./dto/job.dto");
let JobController = class JobController {
    constructor(jobService) {
        this.jobService = jobService;
        this.classifier = new position_classifier_1.PositionClassifier();
    }
    async getMyJobs(params) {
        return this.jobService.findAll(params || {});
    }
    async createJob(dto, req) {
        const userId = req.user.id;
        return this.jobService.create(dto, userId);
    }
    getCategories() {
        return {
            success: true,
            data: {
                industries: this.classifier.getIndustries(),
                functions: this.classifier.getFunctions(),
            },
        };
    }
    classifyPosition(text) {
        const result = this.classifier.classify(text);
        return {
            success: true,
            data: result,
        };
    }
    batchClassify(body) {
        const results = this.classifier.batchClassify(body.texts);
        return {
            success: true,
            data: results,
            stats: {
                total: results.length,
                exact: results.filter(r => r.matchType === 'exact').length,
                partial: results.filter(r => r.matchType === 'partial').length,
                keyword: results.filter(r => r.matchType === 'keyword').length,
                failed: results.filter(r => r.confidence === 0).length,
            },
        };
    }
    getPositions(functionCode) {
        const positions = this.classifier.getPositionsByFunction(functionCode);
        return {
            success: true,
            data: positions,
            count: positions.length,
        };
    }
    getStats() {
        const industries = this.classifier.getIndustries();
        const functions = this.classifier.getFunctions();
        const totalPositions = functions.reduce((sum, f) => sum + (f.positions?.length || 0), 0);
        const totalKeywords = functions.reduce((sum, f) => sum + (f.keywords?.length || 0), 0);
        return {
            success: true,
            data: {
                industries: industries.length,
                functions: functions.length,
                positions: totalPositions,
                keywords: totalKeywords,
                avgKeywordsPerFunction: (totalKeywords / functions.length).toFixed(1),
            },
        };
    }
};
exports.JobController = JobController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取我的职位列表' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "getMyJobs", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '发布新职位' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [job_dto_1.CreateJobDto, Object]),
    __metadata("design:returntype", Promise)
], JobController.prototype, "createJob", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: '获取职位分类列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('classify'),
    (0, swagger_1.ApiOperation)({ summary: '智能分类职位名称' }),
    __param(0, (0, common_1.Query)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "classifyPosition", null);
__decorate([
    (0, common_1.Post)('classify/batch'),
    (0, swagger_1.ApiOperation)({ summary: '批量分类职位名称' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "batchClassify", null);
__decorate([
    (0, common_1.Get)('positions'),
    (0, swagger_1.ApiOperation)({ summary: '获取职能下的职位列表' }),
    __param(0, (0, common_1.Query)('functionCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getPositions", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '获取分类规则统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobController.prototype, "getStats", null);
exports.JobController = JobController = __decorate([
    (0, swagger_1.ApiTags)('职位管理'),
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [job_service_1.JobService])
], JobController);
//# sourceMappingURL=job.controller.js.map