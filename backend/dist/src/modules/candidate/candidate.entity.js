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
exports.Candidate = void 0;
const typeorm_1 = require("typeorm");
let Candidate = class Candidate {
};
exports.Candidate = Candidate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Candidate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Candidate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ length: 20, unique: true }),
    __metadata("design:type", String)
], Candidate.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Candidate.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'work_years', default: 0 }),
    __metadata("design:type", Number)
], Candidate.prototype, "workYears", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Candidate.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'education_level', nullable: true }),
    __metadata("design:type", Number)
], Candidate.prototype, "educationLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resume_jsonb', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Candidate.prototype, "resumeJsonb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resume_url', length: 255, nullable: true }),
    __metadata("design:type", String)
], Candidate.prototype, "resumeUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], Candidate.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group_id', nullable: true }),
    __metadata("design:type", Number)
], Candidate.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'group_name', length: 50, nullable: true }),
    __metadata("design:type", String)
], Candidate.prototype, "groupName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Candidate.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Candidate.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'new' }),
    __metadata("design:type", String)
], Candidate.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Candidate.prototype, "createdAt", void 0);
exports.Candidate = Candidate = __decorate([
    (0, typeorm_1.Entity)('candidates')
], Candidate);
//# sourceMappingURL=candidate.entity.js.map