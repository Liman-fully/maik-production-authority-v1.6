import { Redis } from 'ioredis';
export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
    avgResponseTime: number;
    memoryUsage?: number;
}
export interface ModuleStats {
    module: string;
    hits: number;
    misses: number;
    hitRate: number;
}
export declare class CacheStatsService {
    private redis;
    private statsWindow;
    private hitCounts;
    private missCounts;
    private responseTimes;
    private moduleStats;
    constructor(redis: Redis);
    recordHit(module: string, responseTime: number): void;
    recordMiss(module: string, responseTime: number): void;
    getStats(): CacheStats;
    getModuleStats(): ModuleStats[];
    getCacheKeysByPrefix(prefix: string): Promise<number>;
    getMemoryUsage(): Promise<number>;
    clearStats(): void;
    healthCheck(): Promise<boolean>;
    private updateModuleStats;
    private trimWindow;
}
