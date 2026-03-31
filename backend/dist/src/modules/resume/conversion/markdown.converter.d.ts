import { TaxonomyService } from '../../metadata/taxonomy.service';
import { KeywordPoolService } from '../../metadata/keyword-pool.service';
export declare class MarkdownConverter {
    private taxonomyService;
    private keywordPool;
    private readonly logger;
    constructor(taxonomyService: TaxonomyService, keywordPool: KeywordPoolService);
    convertToMarkdownAndClassify(sourcePath: string): Promise<string>;
    private runMarkerConversion;
}
