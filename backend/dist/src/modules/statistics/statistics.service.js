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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const candidate_entity_1 = require("../candidate/candidate.entity");
const job_entity_1 = require("../job/job.entity");
const interview_entity_1 = require("../interview/interview.entity");
let StatisticsService = class StatisticsService {
    constructor(candidateRepository, jobRepository, interviewRepository) {
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.interviewRepository = interviewRepository;
    }
    async getOverview() {
        const [candidateCount, jobCount, interviewCount] = await Promise.all([
            this.candidateRepository.count(),
            this.jobRepository.count({ where: { status: 'published' } }),
            this.interviewRepository.count(),
        ]);
        return {
            candidates: candidateCount,
            activeJobs: jobCount,
            interviews: interviewCount,
            successRate: 0.15,
        };
    }
    async getFunnel() {
        const total = await this.candidateRepository.count();
        const contacted = await this.candidateRepository.count({ where: { status: 'contacted' } });
        const interviewed = await this.interviewRepository.count();
        const offered = await this.candidateRepository.count({ where: { status: 'offered' } });
        return [
            { step: '简历获取', count: total },
            { step: '初步沟通', count: contacted },
            { step: '安排面试', count: interviewed },
            { step: '发送录取', count: offered },
        ];
    }
    async getTrend() {
        const months = ['10月', '11月', '12月', '1月', '2月', '3月'];
        return months.map((month, index) => ({
            month,
            candidates: 10 + index * 5 + Math.floor(Math.random() * 5),
            interviews: 5 + index * 2 + Math.floor(Math.random() * 3),
        }));
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(candidate_entity_1.Candidate)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __param(2, (0, typeorm_1.InjectRepository)(interview_entity_1.Interview)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map