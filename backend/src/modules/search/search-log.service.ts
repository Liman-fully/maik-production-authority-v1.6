import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SearchLog } from './search-log.entity';

export interface SearchTermStats {
  query: string;
  count: number;
  avgResultCount: number;
  clickRate: number;
  contactRate: number;
}

@Injectable()
export class SearchLogService {
  constructor(
    @InjectRepository(SearchLog)
    private searchLogRepo: Repository<SearchLog>,
  ) {}

  /**
   * 记录搜索日志
   */
  async logSearch(params: {
    userId?: number;
    query: string;
    filters?: any;
    resultCount: number;
    responseTimeMs?: number;
    cacheHit?: boolean;
  }): Promise<SearchLog> {
    const log = this.searchLogRepo.create({
      userId: params.userId,
      query: params.query,
      filters: params.filters,
      resultCount: params.resultCount,
      responseTimeMs: params.responseTimeMs,
      cacheHit: params.cacheHit || false,
      createdAt: new Date(),
    });

    return await this.searchLogRepo.save(log);
  }

  /**
   * 记录点击
   */
  async logClick(logId: number, candidateId: number): Promise<void> {
    await this.searchLogRepo.update(logId, { clickedCandidateId: candidateId });
  }

  /**
   * 记录联系
   */
  async logContact(logId: number, candidateId: number): Promise<void> {
    await this.searchLogRepo.update(logId, { contactedCandidateId: candidateId });
  }

  /**
   * 获取热门搜索词（Top 100）
   */
  async getHotSearchTerms(days: number = 7, limit: number = 100): Promise<SearchTermStats[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(log.result_count)', 'avgResultCount')
      .addSelect(`
        COUNT(CASE WHEN log.clicked_candidate_id IS NOT NULL THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100
      `, 'clickRate')
      .addSelect(`
        COUNT(CASE WHEN log.contacted_candidate_id IS NOT NULL THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100
      `, 'contactRate')
      .where('log.created_at >= :since', { since })
      .groupBy('log.query')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map(r => ({
      query: r.query,
      count: parseInt(r.count),
      avgResultCount: parseFloat(r.avgResultCount),
      clickRate: parseFloat(r.clickRate),
      contactRate: parseFloat(r.contactRate),
    }));
  }

  /**
   * 获取零结果搜索词
   */
  async getZeroResultTerms(days: number = 7): Promise<{ query: string; count: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('log.query', 'query')
      .addSelect('COUNT(*)', 'count')
      .where('log.result_count = 0')
      .andWhere('log.created_at >= :since', { since })
      .groupBy('log.query')
      .orderBy('count', 'DESC')
      .limit(100)
      .getRawMany();

    return results.map(r => ({
      query: r.query,
      count: parseInt(r.count),
    }));
  }

  /**
   * 获取搜索统计
   */
  async getSearchStats(days: number = 7): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const totalSearches = await this.searchLogRepo
      .createQueryBuilder('log')
      .where('log.created_at >= :since', { since })
      .getCount();

    const zeroResultSearches = await this.searchLogRepo
      .createQueryBuilder('log')
      .where('log.created_at >= :since', { since })
      .andWhere('log.result_count = 0')
      .getCount();

    const avgResponseTime = await this.searchLogRepo
      .createQueryBuilder('log')
      .select('AVG(log.response_time_ms)', 'avg')
      .where('log.created_at >= :since', { since })
      .andWhere('log.response_time_ms IS NOT NULL')
      .getRawOne();

    const cacheHitRate = await this.searchLogRepo
      .createQueryBuilder('log')
      .select(`
        COUNT(CASE WHEN log.cache_hit = true THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100
      `, 'rate')
      .where('log.created_at >= :since', { since })
      .getRawOne();

    return {
      totalSearches,
      zeroResultSearches,
      zeroResultRate: totalSearches > 0 ? (zeroResultSearches / totalSearches * 100) : 0,
      avgResponseTime: parseFloat(avgResponseTime?.avg || 0),
      cacheHitRate: parseFloat(cacheHitRate?.rate || 0),
    };
  }

  /**
   * 获取用户搜索历史
   */
  async getUserSearchHistory(userId: number, limit: number = 20): Promise<SearchLog[]> {
    return await this.searchLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * 清理过期日志（保留 30 天）
   */
  async cleanupOldLogs(daysToKeep: number = 30): Promise<number> {
    const since = new Date();
    since.setDate(since.getDate() - daysToKeep);

    const result = await this.searchLogRepo
      .createQueryBuilder()
      .delete()
      .where('created_at < :since', { since })
      .execute();

    return result.affected || 0;
  }
}
