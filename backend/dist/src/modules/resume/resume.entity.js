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
exports.Resume = void 0;
const typeorm_1 = require("typeorm");
let Resume = class Resume {
};
exports.Resume = Resume;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Resume.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Resume.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path' }),
    __metadata("design:type", String)
], Resume.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_name' }),
    __metadata("design:type", String)
], Resume.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size' }),
    __metadata("design:type", Number)
], Resume.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_type', length: 20 }),
    __metadata("design:type", String)
], Resume.prototype, "fileType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cos_url', nullable: true }),
    __metadata("design:type", String)
], Resume.prototype, "cosUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cos_key', nullable: true }),
    __metadata("design:type", String)
], Resume.prototype, "cosKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'local_path', nullable: true }),
    __metadata("design:type", String)
], Resume.prototype, "localPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parse_status', default: 'pending' }),
    __metadata("design:type", String)
], Resume.prototype, "parseStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parse_error', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Resume.prototype, "parseError", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Resume.prototype, "basicInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Resume.prototype, "education", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Resume.prototype, "workExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Resume.prototype, "projects", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Resume.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Resume.prototype, "certifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Resume.prototype, "jobIntention", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Resume.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'talent_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Resume.prototype, "talentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'folder_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Resume.prototype, "folderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score', default: 0 }),
    __metadata("design:type", Number)
], Resume.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tier', length: 10, default: 'C' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Resume.prototype, "tier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_public', default: false }),
    __metadata("design:type", Boolean)
], Resume.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source', default: 'upload' }),
    __metadata("design:type", String)
], Resume.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Resume.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Resume.prototype, "updatedAt", void 0);
exports.Resume = Resume = __decorate([
    (0, typeorm_1.Entity)('resumes')
], Resume);
//# sourceMappingURL=resume.entity.js.map