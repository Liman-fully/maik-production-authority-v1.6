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
exports.ResumeController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const resume_service_1 = require("./resume.service");
const cos_service_1 = require("../../common/storage/cos.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ResumeController = class ResumeController {
    constructor(resumeService, cosService) {
        this.resumeService = resumeService;
        this.cosService = cosService;
    }
    async uploadResume(req, file, folderId) {
        if (!file) {
            return { success: false, message: '请上传文件' };
        }
        const resume = await this.resumeService.uploadResume(req.user.id, file, folderId);
        return {
            success: true,
            data: resume,
            message: '简历上传成功，正在解析中',
        };
    }
    async batchUpload(req, files, folderId) {
        return { success: true, message: '批量上传功能开发中' };
    }
    async getResumes(req, folderId, keyword, tier, minScore, maxScore) {
        const resumes = await this.resumeService.getResumes(req.user.id, folderId, {
            keyword,
            tier,
            minScore: minScore ? Number(minScore) : undefined,
            maxScore: maxScore ? Number(maxScore) : undefined,
        });
        return { success: true, data: resumes };
    }
    async getResume(req, id) {
        const resume = await this.resumeService.getResumeById(id, req.user.id);
        return { success: true, data: resume };
    }
    async getResumeStatus(req, id) {
        const resume = await this.resumeService.getResumeById(id, req.user.id);
        if (!resume) {
            return { success: false, message: '简历不存在' };
        }
        return {
            success: true,
            data: {
                id: resume.id,
                parseStatus: resume.parseStatus,
                parseError: resume.parseError,
            },
        };
    }
    async downloadResume(req, id, res) {
        const resume = await this.resumeService.getResumeById(id, req.user.id);
        if (!resume) {
            return res.status(404).json({ success: false, message: '简历不存在' });
        }
        if (!resume.cosUrl) {
            return res.status(400).json({ success: false, message: '简历文件不存在' });
        }
        try {
            const signedUrl = await this.cosService.getSignedUrl(resume.cosKey, 3600);
            return res.json({
                success: true,
                data: {
                    url: signedUrl,
                    fileName: resume.fileName,
                    fileSize: resume.fileSize,
                },
                message: '获取下载链接成功',
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: `获取下载链接失败: ${error.message}`,
            });
        }
    }
    async deleteResume(req, id) {
        await this.resumeService.deleteResume(id, req.user.id);
        return { success: true, message: '删除成功' };
    }
    async createFolder(req, name, parentId) {
        const folder = await this.resumeService.createFolder(req.user.id, name, parentId);
        return { success: true, data: folder };
    }
    async fetchFromEmail(req) {
        await this.resumeService.triggerEmailFetch(req.user.id);
        return { success: true, message: '邮件拉取任务已加入队列，后台处理中' };
    }
    async getFolders(req) {
        const folders = await this.resumeService.getFolders(req.user.id);
        return { success: true, data: folders };
    }
};
exports.ResumeController = ResumeController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
            const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
            if (allowedTypes.includes(ext)) {
                cb(null, true);
            }
            else {
                cb(new Error('不支持的文件类型'), false);
            }
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "uploadResume", null);
__decorate([
    (0, common_1.Post)('batch-upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('files')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "batchUpload", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('folderId')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('tier')),
    __param(4, (0, common_1.Query)('minScore')),
    __param(5, (0, common_1.Query)('maxScore')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "getResumes", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "getResume", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "getResumeStatus", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Response)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "downloadResume", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "deleteResume", null);
__decorate([
    (0, common_1.Post)('folder'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('parentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "createFolder", null);
__decorate([
    (0, common_1.Post)('fetch-from-email'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "fetchFromEmail", null);
__decorate([
    (0, common_1.Get)('folders'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResumeController.prototype, "getFolders", null);
exports.ResumeController = ResumeController = __decorate([
    (0, common_1.Controller)('resume'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [resume_service_1.ResumeService,
        cos_service_1.CosService])
], ResumeController);
//# sourceMappingURL=resume.controller.js.map