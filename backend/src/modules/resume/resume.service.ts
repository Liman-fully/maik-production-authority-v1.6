import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Resume } from './resume.entity';
import { ResumeFolder } from './resume-folder.entity';
import { CosService } from '../../common/storage/cos.service';
import { AiService } from './ai.service';
import { LocalParseService } from './local-parse.service';
import { DeduplicationService } from './deduplication.service';
import { ScoreService } from '../score/score.service';
import { RecommendationService } from '../recommendation/recommendation.service';
import { Talent } from '../talent/talent.entity';

interface ParseResult {
  basicInfo?: any;
  education?: any[];
  workExperience?: any[];
  projects?: any[];
  skills?: string[];
  certifications?: any[];
  jobIntention?: any;
}

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(ResumeFolder)
    private folderRepository: Repository<ResumeFolder>,
    @InjectRepository(Talent)
    private talentRepository: Repository<Talent>,
    private cosService: CosService,
    @InjectQueue('resume-parsing')
    private resumeQueue: Queue,
    @InjectQueue('email-fetching')
    private emailQueue: Queue,
    private aiService: AiService,
    private localParseService: LocalParseService,
    private deduplicationService: DeduplicationService,
    private scoreService: ScoreService,
    private recommendationService: RecommendationService,
  ) {}

  async triggerEmailFetch(userId: string): Promise<void> {
    await this.emailQueue.add('fetch', { userId }, { removeOnComplete: true });
  }

  async uploadResume(userId: string, file: any, folderId?: string): Promise<Resume> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'resumes', userId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    let cosUrl: string, cosKey: string;
    try {
      const result = await this.cosService.uploadResume(userId, file.buffer, file.originalname);
      cosUrl = result.url;
      cosKey = result.key;
    } catch (error) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      throw new BadRequestException(`COS 上传失败: ${error.message}`);
    }

    const resume = this.resumeRepository.create({
      userId, filePath, localPath: filePath, fileName: file.originalname,
      fileSize: file.size, fileType: this.getFileType(file.originalname),
      cosUrl, cosKey, folderId, parseStatus: 'pending',
    });

    await this.resumeRepository.save(resume);
    await this.fastLocalParse(resume.id);
    
    // 获取用户等级与注册时间，决定优先级与并发组
    const user = await this.resumeRepository.manager.getRepository('User').findOne({ where: { id: userId } }) as any;
    let priority = 3; // 默认低优先级
    let group = 'default';

    if (user) {
      const isAdminOrPaid = ['paid', 'team', 'enterprise'].includes(user.tier);
      const isNewUser = (Date.now() - new Date(user.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
      
      if (isAdminOrPaid || isNewUser) {
        priority = 1; // 高优先级
        group = 'high-speed';
      }
    }

    await this.resumeQueue.add('parse', { resumeId: resume.id, group }, {
      priority, attempts: 3, backoff: 5000, removeOnComplete: true,
    });

    return resume;
  }

  private async fastLocalParse(resumeId: string): Promise<void> {
    const resume = await this.resumeRepository.findOne({ where: { id: resumeId } });
    if (!resume) return;
    try {
      const text = await this.extractTextFromFile(resume.filePath);
      const localResult = await this.localParseService.extractBasicInfo(text);
      resume.basicInfo = { ...resume.basicInfo, ...localResult };
      resume.parseStatus = 'processing';
      await this.resumeRepository.save(resume);
    } catch (e) {
      this.logger.error(`Fast local parse failed: ${resumeId}`, e.stack);
    }
  }

  async parseResumeAsync(resumeId: string): Promise<void> {
    const resume = await this.resumeRepository.findOne({ where: { id: resumeId } });
    if (!resume) return;

    try {
      resume.parseStatus = 'processing';
      await this.resumeRepository.save(resume);

      const resumeText = await this.extractTextFromFile(resume.filePath);
      const aiResult = await this.aiService.parseResumeText(resumeText);

      // --- 科学去重与合并逻辑 ---
      const { score, tier } = this.calculateScoreAndTier(aiResult);
      const existingTalent = await this.deduplicationService.findExistingTalent(aiResult.basicInfo);
      if (existingTalent) {
        if (this.deduplicationService.shouldUpdate(existingTalent, aiResult)) {
          Object.assign(existingTalent, this.mapAiResultToTalent(aiResult));
          existingTalent.score = score;
          existingTalent.tier = tier;
          await this.talentRepository.save(existingTalent as unknown as Talent);
        }
      }

      // 更新简历解析结果
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

      // --- 触发自动评分与推荐生成 ---
      try {
        await this.scoreService.calculatePersonalScore({ resumeId: resume.id });
        const userBehavior = await this.getUserBehavior(resume.userId);
        await this.recommendationService.generateRecommendations(resume.userId, userBehavior);
      } catch (scoreError) {
        this.logger.error(`Score/Recommendation trigger failed: ${resume.id}`, scoreError.stack);
      }
    } catch (error) {
      resume.parseStatus = 'failed';
      resume.parseError = error.message;
      await this.resumeRepository.save(resume);
    }
  }

  /**
   * AI 评分与分类算法 (0-100)
   * 权重：学历 20%，稳定性 20%，技能匹配 30%，经验深度 30%
   */
  private calculateScoreAndTier(aiResult: any): { score: number; tier: string } {
    let score = 0;

    // 1. 学历评分 (20%)
    const eduLevel = aiResult.basicInfo?.educationLevel || '';
    if (['博士', 'Doctor'].includes(eduLevel)) score += 20;
    else if (['硕士', 'Master'].includes(eduLevel)) score += 18;
    else if (['本科', 'Bachelor'].includes(eduLevel)) score += 15;
    else if (['大专'].includes(eduLevel)) score += 8;

    // 2. 稳定性评分 (20%) - 基于平均在职时长
    const experiences = aiResult.workExperience || [];
    if (experiences.length > 0) {
      const years = aiResult.basicInfo?.experienceYears || 0;
      const avgYears = experiences.length > 0 ? years / experiences.length : 0;
      if (avgYears >= 3) score += 20;
      else if (avgYears >= 2) score += 15;
      else if (avgYears >= 1) score += 10;
    }

    // 3. 技能广度/深度 (30%)
    const skills = aiResult.skills || [];
    if (skills.length > 10) score += 30;
    else if (skills.length > 5) score += 20;
    else if (skills.length > 0) score += 10;

    // 4. 经验溢价 (30%)
    const years = aiResult.basicInfo?.experienceYears || 0;
    if (years >= 10) score += 30;
    else if (years >= 5) score += 25;
    else if (years >= 3) score += 20;
    else if (years >= 1) score += 10;

    const finalScore = Math.min(score, 100);
    
    // 自动判定等级
    let tier = 'C';
    if (finalScore >= 85) tier = 'S';
    else if (finalScore >= 70) tier = 'A';
    else if (finalScore >= 50) tier = 'B';

    return { score: finalScore, tier };
  }

  private mapAiResultToTalent(aiResult: any): Partial<Talent> {
    return {
      name: aiResult.basicInfo.name,
      currentTitle: aiResult.basicInfo.currentTitle,
      currentCompany: aiResult.basicInfo.currentCompany,
      experience: aiResult.basicInfo.experienceYears,
      education: aiResult.basicInfo.educationLevel,
      skills: aiResult.skills,
    };
  }

  private async extractTextFromFile(filePath: string): Promise<string> {
    // 实际应调用 PDF/Docx 解析库，此处保留主逻辑框架
    return "张三，清华大学毕业，曾在字节跳动担任后端架构师。";
  }

  private getFileType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    const typeMap: Record<string, string> = {
      '.pdf': 'pdf',
      '.doc': 'doc',
      '.docx': 'docx',
      '.jpg': 'jpg',
      '.jpeg': 'jpg',
      '.png': 'png',
    };
    return typeMap[ext] || 'unknown';
  }

  private generateTags(parseResult: ParseResult): string[] {
    const tags: string[] = [];
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

  async getResumes(userId: string, folderId?: string, searchParams?: any): Promise<Resume[]> {
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

  async getResumeById(id: string, userId: string): Promise<Resume> {
    return this.resumeRepository.findOne({
      where: { id, userId },
    });
  }

  async createFolder(userId: string, name: string, parentId?: string): Promise<ResumeFolder> {
    const folder = this.folderRepository.create({ userId, name, parentId });
    return this.folderRepository.save(folder);
  }

  async getFolders(userId: string): Promise<ResumeFolder[]> {
    return this.folderRepository.find({
      where: { userId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * 获取用户行为数据用于推荐
   */
  private async getUserBehavior(userId: string): Promise<any> {
    // 基础行为数据：从之前的搜索、查看记录中聚合。此处返回占位逻辑，可后续扩展
    return {
      userId,
      viewedCandidateIds: [],
      preferredSkills: [],
      industry: '',
    };
  }

  async deleteResume(id: string, userId: string): Promise<void> {
    const resume = await this.resumeRepository.findOne({ where: { id, userId } });
    if (!resume) {
      throw new NotFoundException('简历不存在');
    }

    // 删除 COS 文件
    if (resume.cosKey) {
      try {
        await this.cosService.deleteFile(resume.cosKey);
      } catch (error) {
        this.logger.error(`删除 COS 文件失败: ${error.message}`);
      }
    }

    // 删除本地文件
    if (resume.localPath && fs.existsSync(resume.localPath)) {
      try {
        fs.unlinkSync(resume.localPath);
      } catch (error) {
        this.logger.error(`删除本地文件失败: ${error.message}`);
      }
    }

    // 删除记录
    await this.resumeRepository.remove(resume);
  }
}
