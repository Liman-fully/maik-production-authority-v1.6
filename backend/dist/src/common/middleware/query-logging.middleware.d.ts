import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class QueryLoggingMiddleware implements NestMiddleware {
    private readonly SLOW_THRESHOLD_MS;
    use(req: Request, res: Response, next: NextFunction): void;
}
