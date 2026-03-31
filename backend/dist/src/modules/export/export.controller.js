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
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const export_service_1 = require("./export.service");
const export_task_entity_1 = require("./export-task.entity");
const path = require("path");
const fs = require("fs");
const download_limit_guard_1 = require("../../common/guards/download-limit.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const download_log_entity_1 = require("./download-log.entity");
let ExportController = class ExportController {
    constructor(exportService, downloadLogRepository) {
        this.exportService = exportService;
        this.downloadLogRepository = downloadLogRepository;
    }
    async getExportStatus(req, taskId) {
        const task = await this.exportService.getTaskStatus(taskId, req.user.id);
        return {
            success: true,
            data: {
                taskId: task.id,
                status: task.status,
                totalCount: task.totalCount,
                processedCount: task.processedCount,
                filePath: task.filePath,
                errorMessage: task.errorMessage,
                createdAt: task.createdAt,
                completedAt: task.completedAt,
                progress: task.totalCount > 0
                    ? Math.round((task.processedCount / task.totalCount) * 100)
                    : 0,
            },
        };
    }
    async downloadExport(req, taskId, res) {
        const task = await this.exportService.getTaskStatus(taskId, req.user.id);
        if (task.status !== export_task_entity_1.TaskStatus.COMPLETED || !task.filePath) {
            await this.logDownload(req, taskId, null, 'failed', '文件未生成或已过期');
            throw new common_1.NotFoundException('文件未生成或已过期');
        }
        const fullPath = path.join(process.cwd(), task.filePath);
        if (!fs.existsSync(fullPath)) {
            await this.logDownload(req, taskId, null, 'failed', '文件不存在');
            throw new common_1.NotFoundException('文件不存在');
        }
        try {
            const fileName = path.basename(task.filePath);
            const stats = fs.statSync(fullPath);
            await this.logDownload(req, taskId, null, 'success', null, fileName, stats.size);
            res.download(fullPath, fileName);
        }
        catch (error) {
            await this.logDownload(req, taskId, null, 'failed', error.message);
            throw error;
        }
    }
    async logDownload(req, taskId, resumeId, status, errorMessage, fileName, fileSize) {
        const log = this.downloadLogRepository.create({
            userId: req.user?.id,
            taskId,
            resumeId,
            downloadType: 'single',
            fileFormat: fileName ? path.extname(fileName).slice(1) : null,
            fileSizeBytes: fileSize || null,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
            status,
            errorMessage,
        });
        await this.downloadLogRepository.save(log);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('status/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: '查询导出进度' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "getExportStatus", null);
__decorate([
    (0, common_1.Get)('download/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: '下载导出文件' }),
    (0, common_1.UseGuards)(download_limit_guard_1.DownloadLimitGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "downloadExport", null);
exports.ExportController = ExportController = __decorate([
    (0, swagger_1.ApiTags)('导出'),
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __param(1, (0, typeorm_1.InjectRepository)(download_log_entity_1.DownloadLog)),
    __metadata("design:paramtypes", [export_service_1.ExportService,
        typeorm_2.Repository])
], ExportController);
//# sourceMappingURL=export.controller.js.map