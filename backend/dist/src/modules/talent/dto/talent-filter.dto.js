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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalentFilterDto = exports.SortOrder = exports.SortBy = exports.Gender = exports.JobStatus = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var JobStatus;
(function (JobStatus) {
    JobStatus["ACTIVELY_LOOKING"] = "actively_looking";
    JobStatus["OPEN_TO_OFFERS"] = "open_to_offers";
    JobStatus["NOT_LOOKING"] = "not_looking";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var SortBy;
(function (SortBy) {
    SortBy["LATEST"] = "latest";
    SortBy["ACTIVE"] = "active";
    SortBy["SCORE"] = "score";
})(SortBy || (exports.SortBy = SortBy = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
class TalentFilterDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
        this.sortBy = SortBy.LATEST;
        this.sortOrder = SortOrder.DESC;
    }
}
exports.TalentFilterDto = TalentFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作地点' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作经验' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '学历' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '技能标签（逗号分隔）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '公司名称' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '期望薪资' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "expectedSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '求职状态', enum: JobStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(JobStatus),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "jobStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '年龄范围（25-35）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '性别', enum: Gender }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '行业' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "jobType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作年限范围（3-8）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "workExperience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '毕业年份范围（2015-2020）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "educationYear", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '技能数量范围（5-20）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "skillsCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '最后活跃时间范围（7 天，30 天）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "lastActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '匹配分数范围（80-100）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "matchScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '简历完整度' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TalentFilterDto.prototype, "resumeComplete", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '已认证用户' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TalentFilterDto.prototype, "verified", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '页码', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TalentFilterDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '每页数量', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TalentFilterDto.prototype, "pageSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序字段', enum: SortBy, default: 'latest' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortBy),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序方式', enum: SortOrder, default: 'desc' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortOrder),
    __metadata("design:type", String)
], TalentFilterDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=talent-filter.dto.js.map