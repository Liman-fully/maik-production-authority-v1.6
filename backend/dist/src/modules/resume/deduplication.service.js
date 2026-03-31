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
var DeduplicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeduplicationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resume_entity_1 = require("./resume.entity");
let DeduplicationService = DeduplicationService_1 = class DeduplicationService {
    constructor(resumeRepository) {
        this.resumeRepository = resumeRepository;
        this.logger = new common_1.Logger(DeduplicationService_1.name);
    }
    async findExistingTalent(parsedData) {
        const { name, phone, email, school, currentCompany, currentTitle } = parsedData;
        if (!name)
            return null;
        if (phone || email) {
            const query = this.resumeRepository.createQueryBuilder('resume')
                .where('resume.basicInfo->>\'name\' = :name', { name });
            if (phone) {
                query.andWhere('resume.basicInfo->>\'phone\' = :phone', { phone });
            }
            if (email) {
                query.andWhere('resume.basicInfo->>\'email\' = :email', { email });
            }
            const strongMatch = await query.getOne();
            if (strongMatch)
                return strongMatch;
        }
        const query = this.resumeRepository.createQueryBuilder('resume')
            .where('resume.basicInfo->>\'name\' = :name', { name });
        if (school) {
            query.andWhere('resume.education::text LIKE :school', { school: `%"school":"${school}"%` });
        }
        else if (currentCompany && currentTitle) {
            query.andWhere('resume.workExperience::text LIKE :company', { company: `%"company":"${currentCompany}"%` })
                .andWhere('resume.workExperience::text LIKE :title', { title: `%"title":"${currentTitle}"%` });
        }
        return await query.getOne();
    }
    shouldUpdate(existing, newData) {
        const existingCompleteness = this.calculateCompleteness(existing);
        const newCompleteness = this.calculateCompleteness(newData);
        return newCompleteness >= existingCompleteness;
    }
    calculateCompleteness(data) {
        let score = 0;
        if (data.basicInfo?.phone)
            score += 1;
        if (data.basicInfo?.email)
            score += 1;
        if (data.workExperience?.length > 0)
            score += 5;
        if (data.projects?.length > 0)
            score += 3;
        if (data.education?.length > 0)
            score += 2;
        return score;
    }
};
exports.DeduplicationService = DeduplicationService;
exports.DeduplicationService = DeduplicationService = DeduplicationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DeduplicationService);
//# sourceMappingURL=deduplication.service.js.map