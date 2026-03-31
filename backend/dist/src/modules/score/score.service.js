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
exports.ScoreService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const score_entity_1 = require("./score.entity");
const talent_entity_1 = require("../talent/talent.entity");
const resume_entity_1 = require("../resume/resume.entity");
let ScoreService = class ScoreService {
    constructor(scoreRepo, talentRepo, resumeRepo) {
        this.scoreRepo = scoreRepo;
        this.talentRepo = talentRepo;
        this.resumeRepo = resumeRepo;
    }
    async calculatePersonalScore(dto) {
        const breakdown = {};
        const weights = {
            education: 20,
            experience: 25,
            skills: 20,
            certifications: 10,
            projects: 15,
            stability: 10,
        };
        let resume = null;
        let talent = null;
        if (dto.resumeId) {
            resume = await this.resumeRepo.findOne({ where: { id: dto.resumeId } });
        }
        if (dto.talentId) {
            talent = await this.talentRepo.findOne({ where: { id: dto.talentId } });
        }
        const educationScore = dto.education ?? this.calcEducationScore(resume, talent);
        breakdown.education = {
            score: educationScore,
            label: '学历背景',
            detail: this.getEducationDetail(educationScore, weights.education),
        };
        const experienceScore = dto.experience ?? this.calcExperienceScore(resume, talent);
        breakdown.experience = {
            score: experienceScore,
            label: '工作年限',
            detail: this.getExperienceDetail(experienceScore, weights.experience),
        };
        const skillsScore = dto.skills ?? this.calcSkillsScore(resume, talent);
        breakdown.skills = {
            score: skillsScore,
            label: '专业技能',
            detail: this.getSkillsDetail(skillsScore, weights.skills),
        };
        const certificationsScore = dto.certifications ?? this.calcCertificationsScore(resume, talent);
        breakdown.certifications = {
            score: certificationsScore,
            label: '职业证书',
            detail: this.getCertificationsDetail(certificationsScore, weights.certifications),
        };
        const projectsScore = dto.projects ?? this.calcProjectsScore(resume, talent);
        breakdown.projects = {
            score: projectsScore,
            label: '项目经验',
            detail: this.getProjectsDetail(projectsScore, weights.projects),
        };
        const stabilityScore = dto.stability ?? this.calcStabilityScore(resume, talent);
        breakdown.stability = {
            score: stabilityScore,
            label: '职业稳定性',
            detail: this.getStabilityDetail(stabilityScore, weights.stability),
        };
        const totalScore = Object.values(breakdown).reduce((sum, b) => sum + b.score, 0);
        const existingRecord = await this.scoreRepo.findOne({
            where: {
                type: 'personal',
                ...(dto.resumeId ? { resumeId: dto.resumeId } : {}),
                ...(dto.talentId ? { talentId: dto.talentId } : {}),
            },
        });
        if (existingRecord) {
            existingRecord.totalScore = totalScore;
            existingRecord.breakdown = breakdown;
            return this.scoreRepo.save(existingRecord);
        }
        const record = this.scoreRepo.create({
            userId: talent?.userId || null,
            talentId: dto.talentId || null,
            resumeId: dto.resumeId || null,
            type: 'personal',
            totalScore,
            breakdown,
            scoreVersion: 'v1',
        });
        return this.scoreRepo.save(record);
    }
    async calculateMatchScore(dto) {
        const talent = await this.talentRepo.findOne({ where: { id: dto.talentId } });
        if (!talent) {
            throw new common_1.NotFoundException('人才不存在');
        }
        const breakdown = {};
        const matchContext = {
            jobId: dto.jobId,
            jobTitle: dto.jobTitle,
            jobRequirements: dto.jobRequirements ? dto.jobRequirements.split(',').map(s => s.trim()) : [],
            requiredSkills: dto.skills || [],
            salaryRange: dto.salaryMin ? { min: dto.salaryMin, max: dto.salaryMax || dto.salaryMin * 2 } : null,
            location: dto.location,
            experienceRequired: dto.experienceRequired,
        };
        const positionScore = this.calcPositionMatch(talent, dto.jobTitle, dto.jobRequirements);
        breakdown.positionMatch = {
            score: positionScore,
            label: '职位匹配',
            detail: `候选人当前职位的匹配度 ${positionScore}/30`,
        };
        const salaryScore = this.calcSalaryMatch(talent, dto.salaryMin, dto.salaryMax);
        breakdown.salaryMatch = {
            score: salaryScore,
            label: '薪资匹配',
            detail: `期望薪资与岗位薪资的匹配度 ${salaryScore}/20`,
        };
        const locationScore = this.calcLocationMatch(talent, dto.location);
        breakdown.locationMatch = {
            score: locationScore,
            label: '地点匹配',
            detail: `工作地点的匹配度 ${locationScore}/15`,
        };
        const experienceScore = this.calcExperienceMatch(talent, dto.experienceRequired);
        breakdown.experienceMatch = {
            score: experienceScore,
            label: '经验匹配',
            detail: `工作经验的匹配度 ${experienceScore}/20`,
        };
        const skillScore = this.calcSkillMatch(talent, dto.skills);
        breakdown.skillMatch = {
            score: skillScore,
            label: '技能匹配',
            detail: `专业技能的匹配度 ${skillScore}/15`,
        };
        const totalScore = Object.values(breakdown).reduce((sum, b) => sum + b.score, 0);
        const record = this.scoreRepo.create({
            userId: talent.userId,
            talentId: talent.id,
            type: 'match',
            totalScore,
            breakdown,
            matchContext,
            scoreVersion: 'v1',
        });
        return this.scoreRepo.save(record);
    }
    async getScores(talentId) {
        const [personal, match] = await Promise.all([
            this.scoreRepo.findOne({
                where: { talentId, type: 'personal' },
                order: { createdAt: 'DESC' },
            }),
            this.scoreRepo.find({
                where: { talentId, type: 'match' },
                order: { createdAt: 'DESC' },
                take: 20,
            }),
        ]);
        return { personal, match };
    }
    async getLeaderboard(type, limit = 50) {
        return this.scoreRepo.find({
            where: { type },
            order: { totalScore: 'DESC' },
            take: limit,
        });
    }
    calcEducationScore(resume, talent) {
        const edu = talent?.education || resume?.education?.[0]?.degree;
        if (!edu)
            return 5;
        const scoreMap = {
            '博士': 20, '硕士': 16, '研究生': 16,
            '本科': 13, '学士': 13,
            '大专': 9, '专科': 9,
            '高中': 5, '中专': 5,
        };
        for (const [key, score] of Object.entries(scoreMap)) {
            if (edu.includes(key))
                return score;
        }
        return 5;
    }
    calcExperienceScore(resume, talent) {
        const expText = talent?.experience || talent?.workExperience || '';
        const workExp = resume?.workExperience;
        const yearMatch = expText.match(/(\d+)/);
        let years = yearMatch ? parseInt(yearMatch[1]) : 0;
        if (!years && workExp && workExp.length > 0) {
            let totalMonths = 0;
            for (const job of workExp) {
                if (job.startDate && job.endDate) {
                    const start = new Date(job.startDate);
                    const end = new Date(job.endDate);
                    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
                    totalMonths += Math.max(diff, 0);
                }
            }
            years = Math.floor(totalMonths / 12);
        }
        if (years >= 10)
            return 25;
        if (years >= 7)
            return 22;
        if (years >= 5)
            return 19;
        if (years >= 3)
            return 15;
        if (years >= 1)
            return 10;
        return 5;
    }
    calcSkillsScore(resume, talent) {
        const skills = talent?.skills || resume?.skills || [];
        if (skills.length === 0)
            return 3;
        if (skills.length >= 10)
            return 20;
        if (skills.length >= 7)
            return 17;
        if (skills.length >= 5)
            return 14;
        if (skills.length >= 3)
            return 10;
        return 6;
    }
    calcCertificationsScore(resume, talent) {
        const certs = resume?.certifications || [];
        if (!certs || certs.length === 0)
            return 3;
        if (certs.length >= 5)
            return 10;
        if (certs.length >= 3)
            return 8;
        if (certs.length >= 1)
            return 6;
        return 3;
    }
    calcProjectsScore(resume, talent) {
        const projects = resume?.projects || [];
        if (!projects || projects.length === 0)
            return 3;
        if (projects.length >= 5)
            return 15;
        if (projects.length >= 3)
            return 12;
        if (projects.length >= 1)
            return 8;
        return 5;
    }
    calcStabilityScore(resume, talent) {
        const workExp = resume?.workExperience || [];
        if (workExp.length === 0)
            return 7;
        let totalMonths = 0;
        let jobCount = 0;
        for (const job of workExp) {
            if (job.startDate) {
                const start = new Date(job.startDate);
                const end = job.endDate ? new Date(job.endDate) : new Date();
                const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
                totalMonths += Math.max(diff, 1);
                jobCount++;
            }
        }
        const avgMonths = totalMonths / jobCount;
        if (avgMonths >= 36)
            return 10;
        if (avgMonths >= 24)
            return 8;
        if (avgMonths >= 12)
            return 6;
        if (avgMonths >= 6)
            return 4;
        return 2;
    }
    calcPositionMatch(talent, jobTitle, jobRequirements) {
        if (!jobTitle)
            return 10;
        const currentTitle = talent.currentTitle || '';
        const keywords = (jobRequirements || jobTitle).split(/[,，、\s]+/).filter(Boolean);
        let matchCount = 0;
        for (const kw of keywords) {
            if (currentTitle.includes(kw) || (talent.industry && talent.industry.includes(kw))) {
                matchCount++;
            }
        }
        const matchRate = keywords.length > 0 ? matchCount / keywords.length : 0.3;
        return Math.round(matchRate * 30);
    }
    calcSalaryMatch(talent, salaryMin, salaryMax) {
        if (!salaryMin || !talent.expectedSalary)
            return 10;
        const salaryStr = talent.expectedSalary;
        let expectedNum = 0;
        const numMatch = salaryStr.match(/(\d+)/);
        if (numMatch) {
            expectedNum = parseInt(numMatch[1]);
            if (salaryStr.includes('k') || salaryStr.includes('K') || salaryStr.includes('千')) {
                expectedNum *= 1000;
            }
            else if (salaryStr.includes('w') || salaryStr.includes('W') || salaryStr.includes('万')) {
                expectedNum *= 10000;
            }
        }
        if (!expectedNum)
            return 10;
        const max = salaryMax || salaryMin * 2;
        const mid = (salaryMin + max) / 2;
        const diff = Math.abs(expectedNum - mid) / mid;
        const score = Math.max(0, 20 - Math.round(diff * 20));
        return Math.min(20, score);
    }
    calcLocationMatch(talent, jobLocation) {
        if (!jobLocation || !talent.location)
            return 10;
        return talent.location === jobLocation ? 15 : 5;
    }
    calcExperienceMatch(talent, experienceRequired) {
        if (!experienceRequired || !talent.experience)
            return 10;
        const reqMatch = experienceRequired.match(/(\d+)/);
        const requiredYears = reqMatch ? parseInt(reqMatch[1]) : 0;
        const talentMatch = talent.experience.match(/(\d+)/);
        const talentYears = talentMatch ? parseInt(talentMatch[1]) : 0;
        if (!requiredYears)
            return 10;
        if (talentYears >= requiredYears)
            return 20;
        if (talentYears >= requiredYears * 0.7)
            return 14;
        return 8;
    }
    calcSkillMatch(talent, requiredSkills) {
        if (!requiredSkills || requiredSkills.length === 0)
            return 10;
        if (!talent.skills || talent.skills.length === 0)
            return 3;
        let matchCount = 0;
        for (const reqSkill of requiredSkills) {
            for (const hasSkill of talent.skills) {
                if (hasSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
                    reqSkill.toLowerCase().includes(hasSkill.toLowerCase())) {
                    matchCount++;
                    break;
                }
            }
        }
        const rate = matchCount / requiredSkills.length;
        return Math.round(rate * 15);
    }
    getEducationDetail(score, max) {
        if (score >= max * 0.9)
            return '学历优秀，达到顶尖水平';
        if (score >= max * 0.7)
            return '学历良好，高于平均水平';
        if (score >= max * 0.5)
            return '学历中等，满足基本要求';
        return '学历信息不完整或偏低';
    }
    getExperienceDetail(score, max) {
        if (score >= max * 0.9)
            return '经验丰富，资深从业者';
        if (score >= max * 0.7)
            return '经验充足，具备独立能力';
        if (score >= max * 0.5)
            return '经验尚可，有成长空间';
        return '经验不足或信息缺失';
    }
    getSkillsDetail(score, max) {
        if (score >= max * 0.9)
            return '技能全面，覆盖面广';
        if (score >= max * 0.7)
            return '技能匹配度较高';
        if (score >= max * 0.5)
            return '具备基本技能';
        return '技能信息缺失';
    }
    getCertificationsDetail(score, max) {
        if (score >= max * 0.8)
            return '持有多项专业证书';
        if (score >= max * 0.5)
            return '持有相关证书';
        return '暂无证书信息';
    }
    getProjectsDetail(score, max) {
        if (score >= max * 0.9)
            return '项目经验丰富';
        if (score >= max * 0.7)
            return '有高质量项目经验';
        if (score >= max * 0.5)
            return '有一定项目经验';
        return '项目经验不足';
    }
    getStabilityDetail(score, max) {
        if (score >= max * 0.8)
            return '职业稳定性好';
        if (score >= max * 0.5)
            return '稳定性尚可';
        return '跳槽频率较高，需关注';
    }
};
exports.ScoreService = ScoreService;
exports.ScoreService = ScoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(score_entity_1.ScoreRecord)),
    __param(1, (0, typeorm_1.InjectRepository)(talent_entity_1.Talent)),
    __param(2, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ScoreService);
//# sourceMappingURL=score.service.js.map