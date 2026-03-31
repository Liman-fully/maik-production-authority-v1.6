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
exports.JobService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const job_entity_1 = require("./job.entity");
const points_service_1 = require("../points/points.service");
let JobService = class JobService {
    constructor(jobRepository, pointsService) {
        this.jobRepository = jobRepository;
        this.pointsService = pointsService;
    }
    async findAll(params) {
        const { page = 1, limit = 20, status, userId } = params;
        const queryBuilder = this.jobRepository.createQueryBuilder('job');
        if (status && status !== 'all') {
            queryBuilder.andWhere('job.status = :status', { status });
        }
        if (userId) {
            queryBuilder.andWhere('job.createdBy = :userId', { userId });
        }
        queryBuilder.skip((page - 1) * limit).take(limit);
        queryBuilder.orderBy('job.createdAt', 'DESC');
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
        const job = await this.jobRepository.findOne({ where: { id } });
        if (!job) {
            throw new common_1.NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }
    async create(createJobDto, userId) {
        const pointsRequired = 100;
        try {
            await this.pointsService.spendPoints(userId, pointsRequired, '发布职位');
        }
        catch (e) {
            throw new common_1.ForbiddenException('积分不足，无法发布职位');
        }
        const job = this.jobRepository.create({
            ...createJobDto,
            createdBy: userId,
        });
        if (job.status === 'published' && !job.publishedAt) {
            job.publishedAt = new Date();
        }
        return this.jobRepository.save(job);
    }
    async update(id, updateJobDto) {
        const job = await this.findOne(id);
        Object.assign(job, updateJobDto);
        if (job.status === 'published' && !job.publishedAt) {
            job.publishedAt = new Date();
        }
        return this.jobRepository.save(job);
    }
    async updateStatus(id, status) {
        const job = await this.findOne(id);
        job.status = status;
        if (status === 'published' && !job.publishedAt) {
            job.publishedAt = new Date();
        }
        return this.jobRepository.save(job);
    }
    async remove(id) {
        const job = await this.findOne(id);
        await this.jobRepository.remove(job);
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        points_service_1.PointsService])
], JobService);
//# sourceMappingURL=job.service.js.map