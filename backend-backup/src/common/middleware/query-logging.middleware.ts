import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 查询日志中间件
 * 
 * 轻量级监控方案，只记录慢查询
 * 
 * 阈值配置:
 * - 默认：> 500ms 记录警告日志
 * - 可调整：根据服务器性能调整阈值
 * 
 * 日志格式:
 * [SlowQuery] METHOD PATH - DURATIONms
 * 
 * 示例:
 * [SlowQuery] GET /talents?location=北京 - 756ms
 */
@Injectable()
export class QueryLoggingMiddleware implements NestMiddleware {
  /**
   * 慢查询阈值（毫秒）
   */
  private readonly SLOW_THRESHOLD_MS = 500;

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    // 响应结束后记录
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      // 只记录慢查询
      if (duration > this.SLOW_THRESHOLD_MS) {
        const query = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
        console.warn(`[SlowQuery] ${req.method} ${req.path}${query} - ${duration}ms`);
      }
    });
    
    next();
  }
}
