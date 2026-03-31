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
exports.DownloadLog = void 0;
const typeorm_1 = require("typeorm");
let DownloadLog = class DownloadLog {
};
exports.DownloadLog = DownloadLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DownloadLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], DownloadLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resume_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], DownloadLog.prototype, "resumeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'task_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DownloadLog.prototype, "taskId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'download_type', default: 'single' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DownloadLog.prototype, "downloadType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_format', nullable: true }),
    __metadata("design:type", String)
], DownloadLog.prototype, "fileFormat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size_bytes', nullable: true }),
    __metadata("design:type", Number)
], DownloadLog.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', nullable: true }),
    __metadata("design:type", String)
], DownloadLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', nullable: true }),
    __metadata("design:type", String)
], DownloadLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', default: 'success' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], DownloadLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'error_message', nullable: true }),
    __metadata("design:type", String)
], DownloadLog.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], DownloadLog.prototype, "createdAt", void 0);
exports.DownloadLog = DownloadLog = __decorate([
    (0, typeorm_1.Entity)('download_logs')
], DownloadLog);
//# sourceMappingURL=download-log.entity.js.map