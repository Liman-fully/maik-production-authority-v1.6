import { Injectable } from '@nestjs/common';
import { CacheStatsService } from '../../common/cache/cache-stats.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import { Candidate } from './candidate.entity';
import { CacheService } from '../../common/cache/cache.service';

export interface SearchCandidateDto {
  keyword?: string;        // 关键词搜索（姓名/职位/技能）
  city?: string;           // 城市
  educationLevel?: number; // 学历（1:本科，2:硕士，3:博士）
  workYearsMin?: number;   // 最小工作年限
  workYearsMax?: number;   // 最大工作年限
  skills?: string[];       // 技能标签
  page?: number;           // 页码
  limit?: number;          // 每页数量
  sortBy?: string;         // 排序字段（relevance/work_years/created_at）
  sortOrder?: 'ASC' | 'DESC'; // 排序方式
}

export interface SearchResults {
  data: Candidate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const EDUCATION_LABELS: Record<number, string> = {
  1: '本科',
  2: '硕士',
  3: '博士',
  4: '大专',
  5: '高中及以下',
};

@Injectable()
export class CandidateService {
  private readonly CACHE_TTL = 300; // 5 分钟
  private readonly CACHE_PREFIX = 'candidate:search';

  constructor(
    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,
    private cacheService: CacheService,
  ) {}

  /**
   * 搜索候选人（PostgreSQL LIKE + jsonb 查询）
   * 已集成 Redis 缓存层，TTL 5 分钟
   */
  async searchCandidates(query: SearchCandidateDto): Promise<SearchResults> {
    // 生成缓存键
    const cacheKey = this.cacheService.generateKey(
      this.CACHE_PREFIX,
      query,
    );

    // 使用缓存或执行查询
    return this.cacheService.getOrSet<SearchResults>(
      cacheKey,
      async () => {
        return this.executeSearch(query);
      },
      { ttl: this.CACHE_TTL },
    );
  }

  /**
   * 执行实际搜索查询（缓存未命中时调用）
   */
  private async executeSearch(query: SearchCandidateDto): Promise<SearchResults> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;

    const qb = this.candidateRepo.createQueryBuilder('candidate');

    // 关键词搜索 - 搜索姓名
    if (query.keyword) {
      qb.andWhere(
        new Brackets(qb => {
          qb.where('candidate.name LIKE :keyword', { keyword: `%${query.keyword}%` });
          // 搜索 JSON 中的内容（PostgreSQL: 将 jsonb 转为 text 进行 ILIKE 搜索）
          qb.orWhere(
            `candidate.resume_jsonb::text ILIKE :keywordVal`,
            { keywordVal: `%${query.keyword}%` },
          );
        }),
      );
    }

    // 城市过滤
    if (query.city) {
      qb.andWhere('candidate.city = :city', { city: query.city });
    }

    // 学历过滤
    if (query.educationLevel) {
      qb.andWhere('candidate.education_level >= :educationLevel', {
        educationLevel: query.educationLevel,
      });
    }

    // 工作年限过滤
    if (query.workYearsMin !== undefined) {
      qb.andWhere('candidate.work_years >= :workYearsMin', {
        workYearsMin: query.workYearsMin,
      });
    }
    if (query.workYearsMax !== undefined) {
      qb.andWhere('candidate.work_years <= :workYearsMax', {
        workYearsMax: query.workYearsMax,
      });
    }

    // 技能标签过滤（PostgreSQL jsonb @> 操作符）
    if (query.skills && query.skills.length > 0) {
      qb.andWhere(
        new Brackets(qb => {
          query.skills.forEach((skill, index) => {
            qb.orWhere(
              `candidate.resume_jsonb->'skills' @> :skill${index}::jsonb`,
              { [`skill${index}`]: JSON.stringify([skill]) },
            );
          });
        }),
      );
    }

    // 排序
    const sortOrder = query.sortOrder || 'DESC';
    if (query.sortBy === 'work_years') {
      qb.orderBy('candidate.work_years', sortOrder);
    } else if (query.sortBy === 'created_at') {
      qb.orderBy('candidate.created_at', sortOrder);
    } else {
      // 默认按创建时间排序
      qb.orderBy('candidate.created_at', 'DESC');
    }

    // 分页
    qb.skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 获取搜索建议（自动补全）- 基于城市名和姓名
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!query || query.length < 1) {
      return [];
    }

    const results = await this.candidateRepo
      .createQueryBuilder('candidate')
      .select('DISTINCT candidate.city', 'suggestion')
      .where('candidate.city LIKE :query', { query: `${query}%` })
      .limit(limit)
      .getRawMany();

    return results.map(r => r.suggestion).filter(Boolean);
  }

  /**
   * 高亮显示搜索结果（应用层高亮）
   */
  highlightResult(candidate: Candidate, keyword: string): any {
    if (!keyword || !candidate) return candidate;

    const highlightText = (text: string): string => {
      if (!text) return '';
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<b>$1</b>');
    };

    // 解析 JSON 数据进行高亮
    const resumeData = candidate.resumeJsonb || {};
    return {
      ...candidate,
      highlightedName: highlightText(candidate.name),
      highlightedTitle: resumeData.currentTitle ? highlightText(resumeData.currentTitle) : '',
      highlightedCompany: resumeData.currentCompany ? highlightText(resumeData.currentCompany) : '',
    };
  }

  /**
   * 获取单个候选人详情
   */
  async findOne(id: number): Promise<Candidate> {
    return this.candidateRepo.findOne({ where: { id } });
  }

  /**
   * 创建候选人
   * 创建后自动失效相关搜索缓存
   */
  async create(candidateData: Partial<Candidate>): Promise<Candidate> {
    const candidate = this.candidateRepo.create(candidateData);
    const result = await this.candidateRepo.save(candidate);
    
    // 失效搜索缓存
    await this.invalidateSearchCache();
    
    return result;
  }

  /**
   * 更新候选人
   * 更新后自动失效相关搜索缓存
   */
  async update(id: number, data: Partial<Candidate>): Promise<Candidate> {
    await this.candidateRepo.update(id, data);
    const result = await this.findOne(id);
    
    // 失效搜索缓存
    await this.invalidateSearchCache();
    
    return result;
  }

  /**
   * 删除候选人
   * 删除后自动失效相关搜索缓存
   */
  async delete(id: number): Promise<void> {
    await this.candidateRepo.delete(id);
    
    // 失效搜索缓存
    await this.invalidateSearchCache();
  }

  /**
   * 失效搜索缓存
   * 当候选人数据发生变化时调用
   */
  async invalidateSearchCache(): Promise<void> {
    const pattern = `huntlink:cache:${this.CACHE_PREFIX}:*`;
    await this.cacheService.deleteByPattern(pattern);
    console.log('[CandidateService] Search cache invalidated');
  }

  /**
   * 获取缓存命中率统计
   */
  getCacheStats() {
    return this.cacheService.getStats();
  }

  /**
   * 统计搜索结果的分布
   */
  async getSearchStats(query: SearchCandidateDto): Promise<any> {
    const baseQb = this.candidateRepo.createQueryBuilder('candidate');

    // 应用搜索条件
    if (query.keyword) {
      baseQb.andWhere(
        new Brackets(qb => {
          qb.where('candidate.name LIKE :keyword', { keyword: `%${query.keyword}%` });
          qb.orWhere(
            `candidate.resume_jsonb LIKE :keywordJson`,
            { keywordJson: `%${query.keyword}%` },
          );
        }),
      );
    }
    if (query.city) {
      baseQb.andWhere('candidate.city = :city', { city: query.city });
    }

    // 城市分布 TOP 10
    const cityStats = await this.candidateRepo
      .createQueryBuilder('candidate')
      .select('candidate.city', 'label')
      .addSelect('COUNT(*)', 'count')
      .groupBy('candidate.city')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 学历分布
    const educationStats = await this.candidateRepo
      .createQueryBuilder('candidate')
      .select('candidate.education_level', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('candidate.education_level IS NOT NULL')
      .groupBy('candidate.education_level')
      .orderBy('candidate.education_level', 'ASC')
      .getRawMany()
      .then(rows => rows.map(r => ({
        level: r.level,
        label: EDUCATION_LABELS[r.level] || '未知',
        count: Number(r.count),
      })));

    // 工作年限分布
    const workYearStats = await this.candidateRepo
      .createQueryBuilder('candidate')
      .select("CASE WHEN candidate.work_years < 3 THEN '0-3年' WHEN candidate.work_years < 5 THEN '3-5年' WHEN candidate.work_years < 10 THEN '5-10年' ELSE '10年以上' END", 'range')
      .addSelect('COUNT(*)', 'count')
      .where('candidate.work_years IS NOT NULL')
      .groupBy('range')
      .getRawMany();

    return { cityStats, educationStats, workYearStats };
  }
}
