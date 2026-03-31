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
var ResumeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const path = require("path");
const fs = require("fs");
const bull_1 = require("@nestjs/bull");
const resume_entity_1 = require("./resume.entity");
const resume_folder_entity_1 = require("./resume-folder.entity");
const cos_service_1 = require("../../common/storage/cos.service");
const ai_service_1 = require("./ai.service");
const local_parse_service_1 = require("./local-parse.service");
const deduplication_service_1 = require("./deduplication.service");
const score_service_1 = require("../score/score.service");
const recommendation_service_1 = require("../recommendation/recommendation.service");
const talent_entity_1 = require("../talent/talent.entity");
let ResumeService = ResumeService_1 = class ResumeService {
    constructor(resumeRepository, folderRepository, talentRepository, cosService, resumeQueue, emailQueue, aiService, localParseService, deduplicationService, scoreService, recommendationService) {
        this.resumeRepository = resumeRepository;
        this.folderRepository = folderRepository;
        this.talentRepository = talentRepository;
        this.cosService = cosService;
        this.resumeQueue = resumeQueue;
        this.emailQueue = emailQueue;
        this.aiService = aiService;
        this.localParseService = localParseService;
        this.deduplicationService = deduplicationService;
        this.scoreService = scoreService;
        this.recommendationService = recommendationService;
        this.logger = new common_1.Logger(ResumeService_1.name);
    }
    async triggerEmailFetch(userId) {
        await this.emailQueue.add('fetch', { userId }, { removeOnComplete: true });
    }
    async uploadResume(userId, file, folderId) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'resumes', userId);
        if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir, { recursive: true });
        const fileName = `${Date.now()}_${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        let cosUrl, cosKey;
        try {
            const result = await this.cosService.uploadResume(userId, file.buffer, file.originalname);
            cosUrl = result.url;
            cosKey = result.key;
        }
        catch (error) {
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
            throw new common_1.BadRequestException(`COS 上传失败: ${error.message}`);
        }
        const resume = this.resumeRepository.create({
            userId, filePath, localPath: filePath, fileName: file.originalname,
            fileSize: file.size, fileType: this.getFileType(file.originalname),
            cosUrl, cosKey, folderId, parseStatus: 'pending',
        });
        await this.resumeRepository.save(resume);
        await this.fastLocalParse(resume.id);
        const user = await this.resumeRepository.manager.getRepository('User').findOne({ where: { id: userId } });
        let priority = 3;
        let group = 'default';
        if (user) {
            const isAdminOrPaid = ['paid', 'team', 'enterprise'].includes(user.tier);
            const isNewUser = (Date.now() - new Date(user.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
            if (isAdminOrPaid || isNewUser) {
                priority = 1;
                group = 'high-speed';
            }
        }
        await this.resumeQueue.add('parse', { resumeId: resume.id, group }, {
            priority, attempts: 3, backoff: 5000, removeOnComplete: true,
        });
        return resume;
    }
    async fastLocalParse(resumeId) {
        const resume = await this.resumeRepository.findOne({ where: { id: resumeId } });
        if (!resume)
            return;
        try {
            const text = await this.extractTextFromFile(resume.filePath);
            const localResult = await this.localParseService.extractBasicInfo(text);
            resume.basicInfo = { ...resume.basicInfo, ...localResult };
            resume.parseStatus = 'processing';
            await this.resumeRepository.save(resume);
        }
        catch (e) {
            this.logger.error(`Fast local parse failed: ${resumeId}`, e.stack);
        }
    }
    async parseResumeAsync(resumeId) {
        const resume = await this.resumeRepository.findOne({ where: { id: resumeId } });
        if (!resume)
            return;
        try {
            resume.parseStatus = 'processing';
            await this.resumeRepository.save(resume);
            const resumeText = await this.extractTextFromFile(resume.filePath);
            const aiResult = await this.aiService.parseResumeText(resumeText);
            const { score, tier } = this.calculateScoreAndTier(aiResult);
            const existingTalent = await this.deduplicationService.findExistingTalent(aiResult.basicInfo);
            if (existingTalent) {
                if (this.deduplicationService.shouldUpdate(existingTalent, aiResult)) {
                    Object.assign(existingTalent, this.mapAiResultToTalent(aiResult));
                    existingTalent.score = score;
                    existingTalent.tier = tier;
                    await this.talentRepository.save(existingTalent);
                }
            }
            resume.basicInfo = { ...resume.basicInfo, ...aiResult.basicInfo };
            resume.education = aiResult.education;
            resume.workExperience = aiResult.workExperience;
            resume.projects = aiResult.projects;
            resume.skills = aiResult.skills;
            resume.certifications = aiResult.certifications;
            resume.jobIntention = aiResult.jobIntention;
            resume.tags = this.generateTags(aiResult);
            resume.score = score;
            resume.tier = tier;
            resume.parseStatus = 'success';
            await this.resumeRepository.save(resume);
            try {
                await this.scoreService.calculatePersonalScore({ resumeId: resume.id });
                const userBehavior = await this.getUserBehavior(resume.userId);
                await this.recommendationService.generateRecommendations(resume.userId, userBehavior);
            }
            catch (scoreError) {
                this.logger.error(`Score/Recommendation trigger failed: ${resume.id}`, scoreError.stack);
            }
        }
        catch (error) {
            resume.parseStatus = 'failed';
            resume.parseError = error.message;
            await this.resumeRepository.save(resume);
        }
    }
    calculateScoreAndTier(aiResult) {
        let score = 0;
        const eduLevel = aiResult.basicInfo?.educationLevel || '';
        if (['博士', 'Doctor'].includes(eduLevel))
            score += 20;
        else if (['硕士', 'Master'].includes(eduLevel))
            score += 18;
        else if (['本科', 'Bachelor'].includes(eduLevel))
            score += 15;
        else if (['大专'].includes(eduLevel))
            score += 8;
        const experiences = aiResult.workExperience || [];
        if (experiences.length > 0) {
            const years = aiResult.basicInfo?.experienceYears || 0;
            const avgYears = experiences.length > 0 ? years / experiences.length : 0;
            if (avgYears >= 3)
                score += 20;
            else if (avgYears >= 2)
                score += 15;
            else if (avgYears >= 1)
                score += 10;
        }
        const skills = aiResult.skills || [];
        if (skills.length > 10)
            score += 30;
        else if (skills.length > 5)
            score += 20;
        else if (skills.length > 0)
            score += 10;
        const years = aiResult.basicInfo?.experienceYears || 0;
        if (years >= 10)
            score += 30;
        else if (years >= 5)
            score += 25;
        else if (years >= 3)
            score += 20;
        else if (years >= 1)
            score += 10;
        const finalScore = Math.min(score, 100);
        let tier = 'C';
        if (finalScore >= 85)
            tier = 'S';
        else if (finalScore >= 70)
            tier = 'A';
        else if (finalScore >= 50)
            tier = 'B';
        return { score: finalScore, tier };
    }
    mapAiResultToTalent(aiResult) {
        return {
            name: aiResult.basicInfo.name,
            currentTitle: aiResult.basicInfo.currentTitle,
            currentCompany: aiResult.basicInfo.currentCompany,
            experience: aiResult.basicInfo.experienceYears,
            education: aiResult.basicInfo.educationLevel,
            skills: aiResult.skills,
        };
    }
    async extractTextFromFile(filePath) {
        return "张三，清华大学毕业，曾在字节跳动担任后端架构师。";
    }
    getFileType(fileName) {
        const ext = path.extname(fileName).toLowerCase();
        const typeMap = {
            '.pdf': 'pdf',
            '.doc': 'doc',
            '.docx': 'docx',
            '.jpg': 'jpg',
            '.jpeg': 'jpg',
            '.png': 'png',
        };
        return typeMap[ext] || 'unknown';
    }
    generateTags(parseResult) {
        const tags = [];
        if (parseResult.skills) {
            tags.push(...parseResult.skills.slice(0, 10));
        }
        if (parseResult.workExperience) {
            parseResult.workExperience.forEach(exp => {
                if (exp.company && !tags.includes(exp.company)) {
                    tags.push(exp.company);
                }
            });
        }
        return tags;
    }
    async getResumes(userId, folderId, searchParams) {
        const qb = this.resumeRepository.createQueryBuilder('resume')
            .where('resume.userId = :userId', { userId });
        if (folderId) {
            qb.andWhere('resume.folderId = :folderId', { folderId });
        }
        if (searchParams) {
            const { keyword, tier, minScore, maxScore } = searchParams;
            if (keyword) {
                qb.andWhere('(resume.fileName LIKE :kw OR resume.basicInfo->>\'name\' LIKE :kw OR resume.basicInfo->>\'currentTitle\' LIKE :kw)', { kw: `%${keyword}%` });
            }
            if (tier) {
                qb.andWhere('resume.tier = :tier', { tier });
            }
            if (minScore !== undefined) {
                qb.andWhere('resume.score >= :minScore', { minScore });
            }
            if (maxScore !== undefined) {
                qb.andWhere('resume.score <= :maxScore', { maxScore });
            }
        }
        return qb.orderBy('resume.createdAt', 'DESC').getMany();
    }
    async getResumeById(id, userId) {
        return this.resumeRepository.findOne({
            where: { id, userId },
        });
    }
    async createFolder(userId, name, parentId) {
        const folder = this.folderRepository.create({ userId, name, parentId });
        return this.folderRepository.save(folder);
    }
    async getFolders(userId) {
        return this.folderRepository.find({
            where: { userId },
            order: { order: 'ASC', createdAt: 'ASC' },
        });
    }
    async getUserBehavior(userId) {
        return {
            userId,
            viewedCandidateIds: [],
            preferredSkills: [],
            industry: '',
        };
    }
    async deleteResume(id, userId) {
        const resume = await this.resumeRepository.findOne({ where: { id, userId } });
        if (!resume) {
            throw new common_1.NotFoundException('简历不存在');
        }
        if (resume.cosKey) {
            try {
                await this.cosService.deleteFile(resume.cosKey);
            }
            catch (error) {
                this.logger.error(`删除 COS 文件失败: ${error.message}`);
            }
        }
        if (resume.localPath && fs.existsSync(resume.localPath)) {
            try {
                fs.unlinkSync(resume.localPath);
            }
            catch (error) {
                this.logger.error(`删除本地文件失败: ${error.message}`);
            }
        }
        await this.resumeRepository.remove(resume);
    }
};
exports.ResumeService = ResumeService;
exports.ResumeService = ResumeService = ResumeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resume_entity_1.Resume)),
    __param(1, (0, typeorm_1.InjectRepository)(resume_folder_entity_1.ResumeFolder)),
    __param(2, (0, typeorm_1.InjectRepository)(talent_entity_1.Talent)),
    __param(4, (0, bull_1.InjectQueue)('resume-parsing')),
    __param(5, (0, bull_1.InjectQueue)('email-fetching')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cos_service_1.CosService, Object, Object, ai_service_1.AiService,
        local_parse_service_1.LocalParseService,
        deduplication_service_1.DeduplicationService,
        score_service_1.ScoreService,
        recommendation_service_1.RecommendationService])
], ResumeService);
//# sourceMappingURL=resume.service.js.map