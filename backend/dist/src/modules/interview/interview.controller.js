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
exports.InterviewController = void 0;
const common_1 = require("@nestjs/common");
const interview_service_1 = require("./interview.service");
const interview_dto_1 = require("./dto/interview.dto");
let InterviewController = class InterviewController {
    constructor(interviewService) {
        this.interviewService = interviewService;
    }
    async findAll(page = 1, limit = 20, candidateId, jobId, status) {
        return this.interviewService.findAll({ page: Number(page), limit: Number(limit), candidateId, jobId, status });
    }
    async findOne(id) {
        return this.interviewService.findOne(id);
    }
    async create(createInterviewDto) {
        return this.interviewService.create(createInterviewDto);
    }
    async updateStatus(id, status) {
        return this.interviewService.updateStatus(id, status);
    }
    async updateFeedback(id, updateFeedbackDto) {
        return this.interviewService.updateFeedback(id, updateFeedbackDto);
    }
};
exports.InterviewController = InterviewController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('candidateId')),
    __param(3, (0, common_1.Query)('jobId')),
    __param(4, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], InterviewController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterviewController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [interview_dto_1.CreateInterviewDto]),
    __metadata("design:returntype", Promise)
], InterviewController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InterviewController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/feedback'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, interview_dto_1.UpdateFeedbackDto]),
    __metadata("design:returntype", Promise)
], InterviewController.prototype, "updateFeedback", null);
exports.InterviewController = InterviewController = __decorate([
    (0, common_1.Controller)('api/interviews'),
    __metadata("design:paramtypes", [interview_service_1.InterviewService])
], InterviewController);
//# sourceMappingURL=interview.controller.js.map