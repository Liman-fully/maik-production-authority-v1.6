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
exports.CalculateMatchScoreDto = exports.CalculatePersonalScoreDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CalculatePersonalScoreDto {
}
exports.CalculatePersonalScoreDto = CalculatePersonalScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '简历ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePersonalScoreDto.prototype, "resumeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '人才ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculatePersonalScoreDto.prototype, "talentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '学历评分 0-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePersonalScoreDto.prototype, "education", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作年限评分 0-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePersonalScoreDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '技能评分 0-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePersonalScoreDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '证书评分 0-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePersonalScoreDto.prototype, "certifications", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '项目经验评分 0-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePersonalScoreDto.prototype, "projects", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '稳定性评分 0-100' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CalculatePersonalScoreDto.prototype, "stability", void 0);
class CalculateMatchScoreDto {
}
exports.CalculateMatchScoreDto = CalculateMatchScoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '人才ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateMatchScoreDto.prototype, "talentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '职位ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateMatchScoreDto.prototype, "jobId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '职位名称' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateMatchScoreDto.prototype, "jobTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '职位要求' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateMatchScoreDto.prototype, "jobRequirements", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '要求技能列表' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CalculateMatchScoreDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '薪资范围（最低）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateMatchScoreDto.prototype, "salaryMin", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '薪资范围（最高）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CalculateMatchScoreDto.prototype, "salaryMax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '工作地点' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateMatchScoreDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '经验要求' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateMatchScoreDto.prototype, "experienceRequired", void 0);
//# sourceMappingURL=score.dto.js.map