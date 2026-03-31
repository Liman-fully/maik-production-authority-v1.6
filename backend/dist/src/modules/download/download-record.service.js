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
exports.DownloadRecordService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const download_record_entity_1 = require("./download-record.entity");
let DownloadRecordService = class DownloadRecordService {
    constructor(recordRepo) {
        this.recordRepo = recordRepo;
    }
    async createRecord(data) {
        const record = this.recordRepo.create({
            userId: data.userId,
            resumeId: data.resumeId,
            originalFileName: data.originalFileName,
            standardFileName: data.standardFileName,
            filePath: data.filePath,
            fileSize: data.fileSize,
            downloadType: data.downloadType,
            candidateName: data.candidateName,
            candidatePhone: data.candidatePhone,
            expectedPosition: data.expectedPosition,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            exportFormat: data.exportFormat || 'pdf',
            isAnonymized: true,
        });
        return await this.recordRepo.save(record);
    }
    async getUserRecords(userId, limit = 50, offset = 0) {
        const [records, total] = await this.recordRepo.findAndCount({
            where: { userId },
            order: { downloadedAt: 'DESC' },
            take: limit,
            skip: offset,
        });
        return { records, total };
    }
    async getResumeDownloadHistory(resumeId) {
        return await this.recordRepo.find({
            where: { resumeId },
            order: { downloadedAt: 'DESC' },
        });
    }
    async getDownloadStats(userId, startDate, endDate) {
        const query = this.recordRepo
            .createQueryBuilder('record')
            .where('record.userId = :userId', { userId });
        if (startDate) {
            query.andWhere('record.downloadedAt >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('record.downloadedAt <= :endDate', { endDate });
        }
        const totalCount = await query.getCount();
        const pdfCount = await query
            .clone()
            .andWhere('record.exportFormat = :format', { format: 'pdf' })
            .getCount();
        const excelCount = await query
            .clone()
            .andWhere('record.exportFormat = :format', { format: 'excel' })
            .getCount();
        return { totalCount, pdfCount, excelCount };
    }
};
exports.DownloadRecordService = DownloadRecordService;
exports.DownloadRecordService = DownloadRecordService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(download_record_entity_1.DownloadRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DownloadRecordService);
//# sourceMappingURL=download-record.service.js.map