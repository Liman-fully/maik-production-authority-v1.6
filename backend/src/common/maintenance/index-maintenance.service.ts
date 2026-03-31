import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

/**
 * 索引维护服务
 * 
 * 定时任务自动维护数据库索引统计信息
 * 
 * 执行时间:
 * - 每周日凌晨 3 点：ANALYZE（索引统计更新）
 * - 每天凌晨 4 点：检查慢查询
 * 
 * 资源友好:
 * - 低峰期执行
 * - 单表维护
 * - 错误不中断
 */
@Injectable()
export class IndexMaintenanceService {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  /**
   * 每周更新索引统计信息
   * 
   * 时间：每周日凌晨 3 点
   * 作用：优化查询计划，提升索引命中率
   */
  @Cron(CronExpression.EVERY_WEEK)
  async analyzeTables() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.query('ANALYZE talents');
      console.log('[Maintenance] Index statistics updated successfully');
    } catch (error) {
      console.error('[Maintenance] Failed to analyze tables:', error.message);
    }
  }

  /**
   * 每日检查慢查询
   * 
   * 时间：每天凌晨 4 点
   * 作用：记录慢查询，便于优化
   * PostgreSQL 使用 pg_stat_statements 扩展
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async checkSlowQueries() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      const result = await queryRunner.query(`
        SELECT query, calls, total_exec_time, mean_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `);
      
      if (result && result.length > 0) {
        console.warn(`[Maintenance] Found ${result.length} slow queries in the last 24 hours`);
      }
    } catch (error) {
      // pg_stat_statements 扩展可能未启用，忽略错误
    }
  }
}
