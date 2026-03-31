import { OnModuleDestroy } from '@nestjs/common';
export interface CacheOptions {
    ttl?: number;
    prefix?: string;
}
export interface CacheStats {
    hits: number;
    misses: number;
    hitRate: number;
}
export declare class CacheService implements OnModuleDestroy {
    private readonly redis;
    private readonly DEFAULT_TTL;
    private readonly CACHE_PREFIX;
    private stats;
    constructor();
    generateKey(methodName: string, params: any, prefix?: string): string;
    private hashParams;
    private simpleHash;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
    delete(key: string): Promise<void>;
    deleteByPattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    getStats(): CacheStats;
    resetStats(): void;
    healthCheck(): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
}
