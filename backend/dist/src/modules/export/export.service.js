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
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const typeorm_2 = require("typeorm");
const export_task_entity_1 = require("./export-task.entity");
const resume_entity_1 = require("../resume/resume.entity");
const pdf_exporter_1 = require("./pdf-exporter");
const excel_exporter_1 = require("./excel-exporter");
const download_record_service_1 = require("../download/download-record.service");
let ExportService = class ExportService {
    constructor(taskRepo, resumeRepo, exportQueue, pdfExporter, excelExporter, downloadRecordService) {
        this.taskRepo = taskRepo;
        this.resumeRepo = resumeRepo;
        this.exportQueue = exportQueue;
        this.pdfExporter = pdfExporter;
        this.excelExporter = excelExporter;
        this.downloadRecordService = downloadRecordService;
    }
    async createExportTask(userId, resumeIds, format) {
        const task = this.taskRepo.create({
            userId,
            format,
            status: export_task_entity_1.TaskStatus.PENDING,
            totalCount: resumeIds.length,
            processedCount: 0,
        });
        await this.taskRepo.save(task);
        await this.exportQueue.add({
            taskId: task.id,
            userId,
            resumeIds,
            format,
        });
        return task;
    }
    async getTaskStatus(taskId, userId) {
        const task = await this.taskRepo.findOne({
            where: { id: taskId, userId },
        });
        if (!task)
            throw new Error('任务不存在');
        return task;
    }
    async processExport(data) {
        const { taskId, userId, resumeIds, format } = data;
        try {
            await this.taskRepo.update(taskId, { status: export_task_entity_1.TaskStatus.PROCESSING });
            const resumes = await this.getResumes(resumeIds, userId);
            let filePath;
            let standardFileName;
            if (format === 'pdf') {
                filePath = await this.pdfExporter.export(resumes, userId);
                if (resumes.length === 1) {
                    standardFileName = this.generateStandardFileName(resumes[0]);
                }
            }
            else {
                filePath = await this.excelExporter.export(resumes, userId);
                standardFileName = `批量导出_${resumes.length}份_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
            }
            for (const resume of resumes) {
                await this.downloadRecordService.createRecord({
                    userId,
                    resumeId: resume.id,
                    originalFileName: resume.fileName,
                    standardFileName: standardFileName || this.generateStandardFileName(resume),
                    filePath,
                    fileSize: resume.fileSize,
                    downloadType: resumes.length === 1 ? 'single' : 'batch',
                    candidateName: resume.basicInfo?.name,
                    candidatePhone: resume.basicInfo?.phone,
                    expectedPosition: resume.jobIntention?.expectedPosition,
                    exportFormat: format,
                });
            }
            await this.taskRepo.update(taskId, {
                status: export_task_entity_1.TaskStatus.COMPLETED,
                filePath,
                processedCount: resumes.length,
                completedAt: new Date(),
            });
            return { success: true, filePath, standardFileName };
        }
        catch (error) {
            await this.taskRepo.update(taskId, {
                status: export_task_entity_1.TaskStatus.FAILED,
                errorMessage: error.message,
            });
            throw error;
        }
    }
    async getResumes(resumeIds, userId) {
        const resumes = await this.resumeRepo.findByIds(resumeIds);
        return resumes.filter(r => r.userId === userId);
    }
    async uploadToCos(filePath) {
        return filePath;
    }
    generateStandardFileName(resume) {
        const name = resume.basicInfo?.name || '未知姓名';
        const sanitizedName = name.trim().slice(0, 10);
        let maskedPhone = '000****0000';
        if (resume.basicInfo?.phone) {
            const phone = resume.basicInfo.phone.replace(/\D/g, '');
            if (phone.length === 11) {
                maskedPhone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
            }
        }
        const position = resume.jobIntention?.expectedPosition || '未填写职位';
        const sanitizedPosition = position.trim().slice(0, 10);
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const cleanName = this.cleanFileName(sanitizedName);
        const cleanPosition = this.cleanFileName(sanitizedPosition);
        return `${cleanName}_${maskedPhone}_${cleanPosition}_${dateStr}.pdf`;
    }
    cleanFileName(str) {
        return str
            .replace(/[<>:"/\\|？*]/g, '')
            .replace(/\s+/g, '_')
            .trim();
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(export_task_entity_1.ExportTask)),
    __param(1, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __param(2, (0, bull_1.InjectQueue)('export')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, pdf_exporter_1.PdfExporter,
        excel_exporter_1.ExcelExporter,
        download_record_service_1.DownloadRecordService])
], ExportService);
//# sourceMappingURL=export.service.js.map