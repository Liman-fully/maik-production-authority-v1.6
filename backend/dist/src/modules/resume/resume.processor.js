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
var ResumeProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const resume_service_1 = require("./resume.service");
const common_1 = require("@nestjs/common");
let ResumeProcessor = ResumeProcessor_1 = class ResumeProcessor {
    constructor(resumeService) {
        this.resumeService = resumeService;
        this.logger = new common_1.Logger(ResumeProcessor_1.name);
        this.runningCount = { 'default': 0, 'high-speed': 0 };
        this.limits = { 'default': 2, 'high-speed': 10 };
    }
    async handleParsing(job) {
        const { resumeId, group = 'default' } = job.data;
        const limit = this.limits[group] || this.limits['default'];
        while (this.runningCount[group] >= limit) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.runningCount[group]++;
        this.logger.log(`开始处理 [${group}] 简历解析任务 (${this.runningCount[group]}/${limit}): ${resumeId}`);
        try {
            await this.resumeService.parseResumeAsync(resumeId);
        }
        catch (error) {
            this.logger.error(`简历解析任务失败 [${group}]: ${resumeId}`, error.stack);
            throw error;
        }
        finally {
            this.runningCount[group]--;
            this.logger.log(`简历解析任务完成 [${group}]: ${resumeId} (活动任务: ${this.runningCount[group]})`);
        }
    }
};
exports.ResumeProcessor = ResumeProcessor;
__decorate([
    (0, bull_1.Process)({ name: 'parse' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResumeProcessor.prototype, "handleParsing", null);
exports.ResumeProcessor = ResumeProcessor = ResumeProcessor_1 = __decorate([
    (0, bull_1.Processor)('resume-parsing'),
    __metadata("design:paramtypes", [resume_service_1.ResumeService])
], ResumeProcessor);
//# sourceMappingURL=resume.processor.js.map