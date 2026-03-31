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
exports.TalentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const talent_service_1 = require("./talent.service");
const talent_filter_dto_1 = require("./dto/talent-filter.dto");
let TalentController = class TalentController {
    constructor(talentService) {
        this.talentService = talentService;
    }
    async getTalents(filter) {
        return this.talentService.getTalents(filter);
    }
};
exports.TalentController = TalentController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '获取人才列表' }),
    (0, swagger_1.ApiQuery)({ name: 'location', required: false, type: String, description: '工作地点' }),
    (0, swagger_1.ApiQuery)({ name: 'experience', required: false, type: String, description: '工作经验' }),
    (0, swagger_1.ApiQuery)({ name: 'education', required: false, type: String, description: '学历' }),
    (0, swagger_1.ApiQuery)({ name: 'skills', required: false, type: String, description: '技能标签（逗号分隔）' }),
    (0, swagger_1.ApiQuery)({ name: 'company', required: false, type: String, description: '公司名称' }),
    (0, swagger_1.ApiQuery)({ name: 'expectedSalary', required: false, type: String, description: '期望薪资' }),
    (0, swagger_1.ApiQuery)({ name: 'jobStatus', required: false, enum: talent_filter_dto_1.JobStatus, description: '求职状态' }),
    (0, swagger_1.ApiQuery)({ name: 'age', required: false, type: String, description: '年龄范围：25-35' }),
    (0, swagger_1.ApiQuery)({ name: 'gender', required: false, enum: ['male', 'female'], description: '性别' }),
    (0, swagger_1.ApiQuery)({ name: 'industry', required: false, type: String, description: '行业' }),
    (0, swagger_1.ApiQuery)({ name: 'jobType', required: false, type: String, description: '工作类型' }),
    (0, swagger_1.ApiQuery)({ name: 'workExperience', required: false, type: String, description: '工作年限范围' }),
    (0, swagger_1.ApiQuery)({ name: 'educationYear', required: false, type: String, description: '毕业年份范围' }),
    (0, swagger_1.ApiQuery)({ name: 'skillsCount', required: false, type: String, description: '技能数量范围' }),
    (0, swagger_1.ApiQuery)({ name: 'lastActive', required: false, type: String, description: '最后活跃时间范围' }),
    (0, swagger_1.ApiQuery)({ name: 'matchScore', required: false, type: String, description: '匹配分数范围' }),
    (0, swagger_1.ApiQuery)({ name: 'resumeComplete', required: false, type: Boolean, description: '简历完整度' }),
    (0, swagger_1.ApiQuery)({ name: 'verified', required: false, type: Boolean, description: '已认证用户' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: '页码' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, type: Number, description: '每页数量' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, enum: talent_filter_dto_1.SortBy, description: '排序字段' }),
    (0, swagger_1.ApiQuery)({ name: 'sortOrder', required: false, enum: talent_filter_dto_1.SortOrder, description: '排序方式' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [talent_filter_dto_1.TalentFilterDto]),
    __metadata("design:returntype", Promise)
], TalentController.prototype, "getTalents", null);
exports.TalentController = TalentController = __decorate([
    (0, swagger_1.ApiTags)('人才广场'),
    (0, common_1.Controller)('talents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [talent_service_1.TalentService])
], TalentController);
//# sourceMappingURL=talent.controller.js.map