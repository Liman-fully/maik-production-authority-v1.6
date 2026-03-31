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
exports.Talent = void 0;
const typeorm_1 = require("typeorm");
let Talent = class Talent {
};
exports.Talent = Talent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Talent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Talent.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Talent.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "currentTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "currentCompany", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "education", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_salary', length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "expectedSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Talent.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_status', length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "jobStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Talent.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "industry", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'job_type', length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "jobType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_experience', length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "workExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'education_year', length: 20, nullable: true }),
    __metadata("design:type", String)
], Talent.prototype, "educationYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skills_count', nullable: true }),
    __metadata("design:type", Number)
], Talent.prototype, "skillsCount", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'last_active', nullable: true }),
    __metadata("design:type", Date)
], Talent.prototype, "lastActive", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'match_score', default: 0 }),
    __metadata("design:type", Number)
], Talent.prototype, "matchScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'personal_score', default: 0 }),
    __metadata("design:type", Number)
], Talent.prototype, "personalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resume_complete', default: false }),
    __metadata("design:type", Boolean)
], Talent.prototype, "resumeComplete", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: false }),
    __metadata("design:type", Boolean)
], Talent.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier', length: 10, default: 'C' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Talent.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'classification', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Talent.prototype, "classification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score', default: 0 }),
    __metadata("design:type", Number)
], Talent.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Talent.prototype, "verified", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Talent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Talent.prototype, "updatedAt", void 0);
exports.Talent = Talent = __decorate([
    (0, typeorm_1.Entity)('talents'),
    (0, typeorm_1.Index)(['location', 'experience']),
    (0, typeorm_1.Index)(['location', 'education']),
    (0, typeorm_1.Index)(['jobStatus', 'location']),
    (0, typeorm_1.Index)(['jobStatus', 'experience']),
    (0, typeorm_1.Index)(['jobStatus', 'education']),
    (0, typeorm_1.Index)(['createdAt'])
], Talent);
//# sourceMappingURL=talent.entity.js.map