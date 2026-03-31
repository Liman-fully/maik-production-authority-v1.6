import { TaxonomyService } from './taxonomy.service';
export declare class KeywordPoolService {
    private taxonomyService;
    private readonly logger;
    constructor(taxonomyService: TaxonomyService);
    evolveKeywords(markdownContent: string): Promise<string[]>;
    private extractCandidates;
    private isTooCommon;
    private persistNewKeyword;
}
