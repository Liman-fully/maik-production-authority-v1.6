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
exports.InterviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const interview_entity_1 = require("./interview.entity");
let InterviewService = class InterviewService {
    constructor(interviewRepository) {
        this.interviewRepository = interviewRepository;
    }
    async findAll(params) {
        const { page = 1, limit = 20, candidateId, jobId, status } = params;
        const queryBuilder = this.interviewRepository.createQueryBuilder('interview');
        if (candidateId) {
            queryBuilder.andWhere('interview.candidateId = :candidateId', { candidateId });
        }
        if (jobId) {
            queryBuilder.andWhere('interview.jobId = :jobId', { jobId });
        }
        if (status && status !== 'all') {
            queryBuilder.andWhere('interview.status = :status', { status });
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        queryBuilder.orderBy('interview.scheduledAt', 'DESC');
        const [data, total] = await queryBuilder.getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const interview = await this.interviewRepository.findOne({
            where: { id },
            relations: ['candidate', 'job'],
        });
        if (!interview) {
            throw new common_1.NotFoundException(`Interview with ID ${id} not found`);
        }
        return interview;
    }
    async create(createInterviewDto) {
        const interview = this.interviewRepository.create(createInterviewDto);
        return this.interviewRepository.save(interview);
    }
    async updateStatus(id, status) {
        const interview = await this.findOne(id);
        const oldStatus = interview.status;
        interview.status = status;
        const saved = await this.interviewRepository.save(interview);
        await this.handleStatusTransition(saved, oldStatus);
        return saved;
    }
    async handleStatusTransition(interview, oldStatus) {
        const newStatus = interview.status;
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            await this.interviewRepository.query('UPDATE candidates SET status = $1 WHERE id = $2', ['interviewed', interview.candidateId]);
        }
        if (newStatus === 'cancelled') {
            console.log(`[InterviewStateMachine] Interview ${interview.id} cancelled. Releasing resources...`);
        }
    }
    async updateFeedback(id, updateFeedbackDto) {
        const interview = await this.findOne(id);
        interview.feedback = updateFeedbackDto.feedback;
        if (updateFeedbackDto.score !== undefined) {
            interview.score = updateFeedbackDto.score;
        }
        return this.interviewRepository.save(interview);
    }
};
exports.InterviewService = InterviewService;
exports.InterviewService = InterviewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(interview_entity_1.Interview)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InterviewService);
//# sourceMappingURL=interview.service.js.map