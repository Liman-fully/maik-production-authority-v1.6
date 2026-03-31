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
exports.DownloadRecord = void 0;
const typeorm_1 = require("typeorm");
let DownloadRecord = class DownloadRecord {
};
exports.DownloadRecord = DownloadRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DownloadRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DownloadRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resume_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DownloadRecord.prototype, "resumeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_file_name' }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "originalFileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'standard_file_name' }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "standardFileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_path' }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size' }),
    __metadata("design:type", Number)
], DownloadRecord.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'download_type' }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "downloadType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'candidate_name', nullable: true }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "candidateName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'candidate_phone', nullable: true }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "candidatePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_position', nullable: true }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "expectedPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', nullable: true }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', nullable: true }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'downloaded_at' }),
    __metadata("design:type", Date)
], DownloadRecord.prototype, "downloadedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_anonymized', default: true }),
    __metadata("design:type", Boolean)
], DownloadRecord.prototype, "isAnonymized", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'export_format', default: 'pdf' }),
    __metadata("design:type", String)
], DownloadRecord.prototype, "exportFormat", void 0);
exports.DownloadRecord = DownloadRecord = __decorate([
    (0, typeorm_1.Entity)('download_records')
], DownloadRecord);
//# sourceMappingURL=download-record.entity.js.map