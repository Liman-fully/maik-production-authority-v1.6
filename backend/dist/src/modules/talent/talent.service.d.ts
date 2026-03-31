import { Repository } from 'typeorm';
import { Talent } from './talent.entity';
import { TalentFilterDto } from './dto/talent-filter.dto';
import { RedisService } from '../../common/redis/redis.service';
export declare class TalentService {
    private talentRepo;
    private redisService;
    private readonly CACHE_PREFIX;
    private readonly CACHE_TTL;
    constructor(talentRepo: Repository<Talent>, redisService: RedisService);
    private getCacheKey;
    private simpleHash;
    private getFromCache;
    private setCache;
    getTalents(filter: TalentFilterDto): Promise<any>;
    clearSearchCache(): Promise<void>;
}
