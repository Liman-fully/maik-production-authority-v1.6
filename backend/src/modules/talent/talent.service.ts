import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThan, LessThan, In, SelectQueryBuilder } from 'typeorm';
import { Talent } from './talent.entity';
import { TalentFilterDto, SortBy, SortOrder } from './dto/talent-filter.dto';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class TalentService {
  private readonly CACHE_PREFIX = 'talent:search:';
  private readonly CACHE_TTL = 600; // 10 分钟 TTL

  constructor(
    @InjectRepository(Talent)
    private talentRepo: Repository<Talent>,
    private redisService: RedisService,
  ) {}

  /**
   * 生成缓存键
   */
  private getCacheKey(filter: TalentFilterDto): string {
    const serialized = JSON.stringify(filter);
    const hash = this.simpleHash(serialized);
    return `${this.CACHE_PREFIX}${hash}`;
  }

  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 从缓存获取数据
   */
  private async getFromCache(key: string): Promise<any | null> {
    try {
      // 修复: 使用 redisService.get() 支持降级
      const cached = await this.redisService.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis cache get error:', error);
    }
    return null;
  }

  /**
   * 设置缓存
   */
  private async setCache(key: string, value: any): Promise<void> {
    try {
      // 修复: 使用 redisService.set() 支持降级
      await this.redisService.set(key, JSON.stringify(value), this.CACHE_TTL);
    } catch (error) {
      console.error('Redis cache set error:', error);
    }
  }

  async getTalents(filter: TalentFilterDto) {
    const cacheKey = this.getCacheKey(filter);
    
    // 尝试从缓存获取
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const { 
      page = 1, 
      pageSize = 20, 
      sortBy = SortBy.LATEST, 
      sortOrder = SortOrder.DESC, 
      ...filters 
    } = filter;
    
    const skip = (page - 1) * pageSize;

    // 使用 QueryBuilder 优化查询，只选择必要字段
    const queryBuilder = this.talentRepo.createQueryBuilder('talent');

    // 只查询必要字段，避免 SELECT *
    queryBuilder.select([
      'talent.id',
      'talent.userId',
      'talent.name',
      'talent.currentTitle',
      'talent.currentCompany',
      'talent.experience',
      'talent.education',
      'talent.location',
      'talent.expectedSalary',
      'talent.skills',
      'talent.jobStatus',
      'talent.age',
      'talent.industry',
      'talent.gender',
      'talent.jobType',
      'talent.matchScore',
      'talent.lastActive',
      'talent.verified',
      'talent.resumeComplete',
      'talent.createdAt',
    ]);

    // 构建查询条件
    const whereConditions: any = {};
    
    // 精确匹配和模糊匹配
    if (filters.location) {
      whereConditions.location = Like(`%${filters.location}%`);
    }
    if (filters.experience) {
      whereConditions.experience = filters.experience;
    }
    if (filters.education) {
      whereConditions.education = filters.education;
    }
    if (filters.company) {
      whereConditions.currentCompany = Like(`%${filters.company}%`);
    }
    if (filters.expectedSalary) {
      whereConditions.expectedSalary = filters.expectedSalary;
    }
    if (filters.jobStatus) {
      whereConditions.jobStatus = filters.jobStatus;
    }
    if (filters.industry) {
      whereConditions.industry = Like(`%${filters.industry}%`);
    }
    if (filters.gender) {
      whereConditions.gender = filters.gender;
    }
    if (filters.jobType) {
      whereConditions.jobType = filters.jobType;
    }
    if (filters.workExperience) {
      whereConditions.workExperience = filters.workExperience;
    }
    if (filters.educationYear) {
      whereConditions.educationYear = filters.educationYear;
    }
    if (filters.resumeComplete !== undefined) {
      whereConditions.resumeComplete = filters.resumeComplete;
    }
    if (filters.verified !== undefined) {
      whereConditions.verified = filters.verified;
    }

    // 技能标签（数组包含）
    if (filters.skills) {
      const skillList = filters.skills.split(',').map(s => s.trim());
      whereConditions.skills = In(skillList);
    }

    // 年龄范围解析
    if (filters.age) {
      const [minAge, maxAge] = filters.age.split('-').map(Number);
      if (!isNaN(minAge) && !isNaN(maxAge)) {
        whereConditions.age = Between(minAge, maxAge);
      }
    }

    // 技能数量范围解析
    if (filters.skillsCount) {
      const [minCount, maxCount] = filters.skillsCount.split('-').map(Number);
      if (!isNaN(minCount) && !isNaN(maxCount)) {
        whereConditions.skillsCount = Between(minCount, maxCount);
      }
    }

    // 匹配分数范围解析
    if (filters.matchScore) {
      const [minScore, maxScore] = filters.matchScore.split('-').map(Number);
      if (!isNaN(minScore) && !isNaN(maxScore)) {
        whereConditions.matchScore = Between(minScore, maxScore);
      }
    }

    // 最后活跃时间范围解析
    if (filters.lastActive) {
      const days = parseInt(filters.lastActive.replace('天', '').replace('最近', ''));
      if (!isNaN(days)) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - days);
        whereConditions.lastActive = MoreThan(daysAgo);
      }
    }

    // 应用 WHERE 条件
    if (Object.keys(whereConditions).length > 0) {
      queryBuilder.where(whereConditions);
    }

    // 排序优化
    switch (sortBy) {
      case SortBy.ACTIVE:
        queryBuilder.orderBy('talent.lastActive', sortOrder === SortOrder.ASC ? 'ASC' : 'DESC');
        break;
      case SortBy.SCORE:
        queryBuilder.orderBy('talent.matchScore', sortOrder === SortOrder.ASC ? 'ASC' : 'DESC');
        break;
      case SortBy.LATEST:
      default:
        queryBuilder.orderBy('talent.createdAt', sortOrder === SortOrder.ASC ? 'ASC' : 'DESC');
    }

    // 分页
    queryBuilder.skip(skip).take(pageSize);

    // 执行查询
    const [data, total] = await queryBuilder.getManyAndCount();

    const result = {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    // 异步写入缓存（不阻塞响应）
    this.setCache(cacheKey, result).catch(console.error);

    return result;
  }

  /**
   * 清除搜索缓存（当数据更新时调用）
   */
  async clearSearchCache(): Promise<void> {
    try {
      const redis = this.redisService.getClient();
      const keys = await redis.keys(`${this.CACHE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }
}
