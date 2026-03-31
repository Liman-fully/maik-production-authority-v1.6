import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Recommendation } from './recommendation.entity';
import { Candidate } from '../candidate/candidate.entity';
import { CacheService } from '../../common/cache/cache.service';

/**
 * 用户行为数据接口
 */
export interface UserBehavior {
  viewedCandidateIds?: string[];  // 浏览过的候选人 ID
  downloadedCandidateIds?: string[]; // 下载过的候选人 ID
  searchedPositions?: string[];   // 搜索过的职位
  industry?: string;              // 用户所在行业
  preferredSkills?: string[];     // 偏好的技能（从浏览/下载行为推断）
}

/**
 * 推荐结果接口
 */
export interface RecommendationResult {
  id: string;
  candidateId: string;
  candidate: any;  // 候选人详情
  score: number;
  reason: {
    skillMatch?: number;
    industryMatch?: number;
    positionMatch?: number;
    popularity?: number;
    matchedSkills?: string[];
    matchedKeywords?: string[];
  };
  createdAt: Date;
}

/**
 * 推荐查询参数
 */
export interface GetRecommendationsDto {
  userId: string;
  limit?: number;
  excludeCandidateIds?: string[];  // 已推荐过的候选人
}

/**
 * 推荐算法配置
 */
const RECOMMENDATION_WEIGHTS = {
  SKILL_MATCH: 0.4,      // 技能匹配度权重 40%
  INDUSTRY_MATCH: 0.25,  // 行业匹配度权重 25%
  POSITION_MATCH: 0.25,  // 职位匹配度权重 25%
  POPULARITY: 0.1,       // 热度权重 10%
};

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly CACHE_TTL = 600; // 10 分钟
  private readonly CACHE_PREFIX = 'recommendation';

  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepo: Repository<Recommendation>,
    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,
    private cacheService: CacheService,
  ) {}

  /**
   * 为用户生成推荐列表
   * @param userId 用户 ID
   * @param behavior 用户行为数据
   * @param limit 推荐数量
   */
  async generateRecommendations(
    userId: string,
    behavior: UserBehavior,
    limit: number = 20,
  ): Promise<RecommendationResult[]> {
    const cacheKey = `${this.CACHE_PREFIX}:user:${userId}:limit:${limit}`;
    
    // 尝试从缓存获取
    const cached = await this.cacheService.get<RecommendationResult[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for user ${userId}`);
      return cached;
    }

    this.logger.log(`Generating recommendations for user ${userId}...`);

    // 1. 获取所有候选人
    const allCandidates = await this.candidateRepo.find();
    
    // 2. 排除已推荐过的候选人
    const excludedIds = behavior.viewedCandidateIds || [];
    const filteredCandidates = allCandidates.filter(
      c => !excludedIds.includes(String(c.id)),
    );

    // 3. 为每个候选人计算匹配分数
    const scoredCandidates = filteredCandidates.map(candidate => {
      const scoreData = this.calculateMatchScore(candidate, behavior);
      return {
        candidate,
        ...scoreData,
      };
    });

    // 4. 按分数排序
    scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

    // 5. 取前 N 个
    const topCandidates = scoredCandidates.slice(0, limit);

    // 6. 保存推荐记录到数据库
    const recommendations: RecommendationResult[] = [];
    for (const item of topCandidates) {
      const recommendation = await this.saveRecommendation(
        userId,
        String(item.candidate.id),
        item.totalScore,
        item.reason,
      );
      recommendations.push({
        id: recommendation.id,
        candidateId: recommendation.candidateId,
        candidate: item.candidate,
        score: recommendation.score,
        reason: recommendation.reason,
        createdAt: recommendation.createdAt,
      });
    }

    // 7. 缓存结果
    await this.cacheService.set(cacheKey, recommendations, this.CACHE_TTL);

    this.logger.log(`Generated ${recommendations.length} recommendations for user ${userId}`);
    return recommendations;
  }

  /**
   * 计算候选人与用户行为的匹配分数
   */
  private calculateMatchScore(
    candidate: Candidate,
    behavior: UserBehavior,
  ): {
    totalScore: number;
    reason: RecommendationResult['reason'];
  } {
    // 解析候选人简历数据
    const resumeData = candidate.resumeJsonb || {};
    const candidateSkills = resumeData.skills || [];
    const candidateIndustry = resumeData.industry || '';
    const candidateTitle = resumeData.currentTitle || '';
    const candidateKeywords = this.extractKeywords(candidate);

    // 1. 技能匹配度 (0-1)
    const skillMatch = this.calculateSkillMatch(
      candidateSkills,
      behavior.preferredSkills || [],
    );

    // 2. 行业匹配度 (0-1)
    const industryMatch = this.calculateIndustryMatch(
      candidateIndustry,
      behavior.industry || '',
    );

    // 3. 职位匹配度 (0-1)
    const positionMatch = this.calculatePositionMatch(
      candidateTitle,
      candidateKeywords,
      behavior.searchedPositions || [],
    );

    // 4. 热度分 (基于创建时间，越新越热门)
    const popularity = this.calculatePopularity(candidate);

    // 5. 加权总分
    const totalScore = 
      skillMatch * RECOMMENDATION_WEIGHTS.SKILL_MATCH +
      industryMatch * RECOMMENDATION_WEIGHTS.INDUSTRY_MATCH +
      positionMatch * RECOMMENDATION_WEIGHTS.POSITION_MATCH +
      popularity * RECOMMENDATION_WEIGHTS.POPULARITY;

    return {
      totalScore: Math.min(totalScore, 1.0), // 确保不超过 1.0
      reason: {
        skillMatch,
        industryMatch,
        positionMatch,
        popularity,
        matchedSkills: skillMatch > 0 ? this.findMatchedSkills(candidateSkills, behavior.preferredSkills || []) : [],
        matchedKeywords: positionMatch > 0 ? this.findMatchedKeywords(candidateKeywords, behavior.searchedPositions || []) : [],
      },
    };
  }

  /**
   * 计算技能匹配度
   * 基于用户浏览/下载简历中的技能
   */
  private calculateSkillMatch(
    candidateSkills: string[],
    preferredSkills: string[],
  ): number {
    if (!preferredSkills || preferredSkills.length === 0) {
      return 0.3; // 默认基础分
    }

    const matchedCount = this.findMatchedSkills(candidateSkills, preferredSkills).length;
    if (matchedCount === 0) return 0;

    // 匹配技能数 / 用户偏好技能数
    return Math.min(matchedCount / preferredSkills.length, 1.0);
  }

  /**
   * 计算行业匹配度
   */
  private calculateIndustryMatch(
    candidateIndustry: string,
    userIndustry: string,
  ): number {
    if (!userIndustry) return 0.5; // 无偏好时给基础分
    if (!candidateIndustry) return 0.3;

    // 完全匹配
    if (candidateIndustry.toLowerCase() === userIndustry.toLowerCase()) {
      return 1.0;
    }

    // 部分匹配（包含关系）
    if (candidateIndustry.toLowerCase().includes(userIndustry.toLowerCase()) ||
        userIndustry.toLowerCase().includes(candidateIndustry.toLowerCase())) {
      return 0.7;
    }

    return 0.2;
  }

  /**
   * 计算职位匹配度
   * 基于用户搜索的职位关键词
   */
  private calculatePositionMatch(
    candidateTitle: string,
    candidateKeywords: string[],
    searchedPositions: string[],
  ): number {
    if (!searchedPositions || searchedPositions.length === 0) {
      return 0.5; // 无搜索历史时给基础分
    }

    const matchedCount = this.findMatchedKeywords(candidateKeywords, searchedPositions).length;
    if (matchedCount === 0) return 0.2;

    // 匹配关键词数 / 搜索关键词数
    return Math.min(matchedCount / searchedPositions.length, 1.0);
  }

  /**
   * 计算热度分
   * 基于候选人创建时间，越新越热门
   */
  private calculatePopularity(candidate: Candidate): number {
    const now = new Date().getTime();
    const createdAt = new Date(candidate.createdAt).getTime();
    const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);

    // 7 天内的简历热度最高
    if (daysSinceCreation <= 7) {
      return 1.0;
    } else if (daysSinceCreation <= 30) {
      return 0.7;
    } else if (daysSinceCreation <= 90) {
      return 0.4;
    } else {
      return 0.2;
    }
  }

  /**
   * 从候选人数据中提取关键词
   */
  private extractKeywords(candidate: Candidate): string[] {
    const resumeData = candidate.resumeJsonb || {};
    const keywords: string[] = [];

    // 当前职位
    if (resumeData.currentTitle) {
      keywords.push(resumeData.currentTitle.toLowerCase());
    }

    // 工作经历中的公司名和职位
    if (resumeData.workExperience) {
      resumeData.workExperience.forEach((exp: any) => {
        if (exp.position) keywords.push(exp.position.toLowerCase());
        if (exp.company) keywords.push(exp.company.toLowerCase());
      });
    }

    return keywords;
  }

  /**
   * 查找匹配的技能
   */
  private findMatchedSkills(candidateSkills: string[], preferredSkills: string[]): string[] {
    return candidateSkills.filter(skill =>
      preferredSkills.some(preferred =>
        skill.toLowerCase().includes(preferred.toLowerCase()) ||
        preferred.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  /**
   * 查找匹配的关键词
   */
  private findMatchedKeywords(candidateKeywords: string[], searchedPositions: string[]): string[] {
    return candidateKeywords.filter(keyword =>
      searchedPositions.some(position =>
        keyword.includes(position.toLowerCase()) ||
        position.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * 保存推荐记录到数据库
   */
  private async saveRecommendation(
    userId: string,
    candidateId: string,
    score: number,
    reason: RecommendationResult['reason'],
  ): Promise<Recommendation> {
    // 检查是否已存在
    const existing = await this.recommendationRepo.findOne({
      where: { userId, candidateId },
    });

    if (existing) {
      // 更新现有记录
      existing.score = score;
      existing.reason = reason;
      existing.status = 'pending';
      existing.updatedAt = new Date();
      return this.recommendationRepo.save(existing);
    }

    // 创建新记录
    const recommendation = this.recommendationRepo.create({
      id: uuidv4(),
      userId,
      candidateId,
      score,
      reason,
      status: 'pending',
    });

    return this.recommendationRepo.save(recommendation);
  }

  /**
   * 获取用户的推荐列表
   */
  async getUserRecommendations(
    userId: string,
    limit: number = 20,
  ): Promise<RecommendationResult[]> {
    const recommendations = await this.recommendationRepo.find({
      where: { userId, status: 'pending' },
      order: { score: 'DESC', createdAt: 'DESC' },
      take: limit,
    });

    // 获取候选人详情
    const results: RecommendationResult[] = [];
    for (const rec of recommendations) {
      const candidate = await this.candidateRepo.findOne({
        where: { id: Number(rec.candidateId) },
      });

      if (candidate) {
        results.push({
          id: rec.id,
          candidateId: rec.candidateId,
          candidate,
          score: rec.score,
          reason: rec.reason,
          createdAt: rec.createdAt,
        });
      }
    }

    return results;
  }

  /**
   * 更新推荐状态（用户交互后调用）
   */
  async updateRecommendationStatus(
    recommendationId: string,
    status: 'shown' | 'clicked' | 'ignored',
  ): Promise<void> {
    await this.recommendationRepo.update(recommendationId, {
      status,
      updatedAt: new Date(),
    });

    this.logger.debug(`Recommendation ${recommendationId} status updated to ${status}`);
  }

  /**
   * 批量更新推荐状态
   */
  async bulkUpdateStatus(
    recommendationIds: string[],
    status: 'shown' | 'clicked' | 'ignored',
  ): Promise<void> {
    await this.recommendationRepo
      .createQueryBuilder()
      .update()
      .set({ status, updatedAt: new Date() })
      .where('id IN (:...ids)', { ids: recommendationIds })
      .execute();

    this.logger.debug(`Bulk updated ${recommendationIds.length} recommendations to ${status}`);
  }

  /**
   * 清除用户推荐缓存
   */
  async clearUserCache(userId: string): Promise<void> {
    const pattern = `huntlink:cache:${this.CACHE_PREFIX}:user:${userId}:*`;
    await this.cacheService.deleteByPattern(pattern);
    this.logger.log(`Cleared cache for user ${userId}`);
  }

  /**
   * 获取推荐统计信息
   */
  async getRecommendationStats(userId?: string): Promise<any> {
    const qb = this.recommendationRepo.createQueryBuilder('rec');

    if (userId) {
      qb.where('rec.user_id = :userId', { userId });
    }

    const total = await qb.getCount();
    
    const statusStats = await this.recommendationRepo
      .createQueryBuilder('rec')
      .select('rec.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('rec.status')
      .getRawMany();

    const avgScore = await this.recommendationRepo
      .createQueryBuilder('rec')
      .select('AVG(rec.score)', 'avg')
      .getRawOne();

    return {
      total,
      statusStats,
      avgScore: avgScore?.avg || 0,
    };
  }
}
