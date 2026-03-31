"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MarkdownConverter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownConverter = void 0;
const common_1 = require("@nestjs/common");
const taxonomy_service_1 = require("../../metadata/taxonomy.service");
const keyword_pool_service_1 = require("../../metadata/keyword-pool.service");
let MarkdownConverter = MarkdownConverter_1 = class MarkdownConverter {
    constructor(taxonomyService, keywordPool) {
        this.taxonomyService = taxonomyService;
        this.keywordPool = keywordPool;
        this.logger = new common_1.Logger(MarkdownConverter_1.name);
    }
    async convertToMarkdownAndClassify(sourcePath) {
        this.logger.log(`🔄 Merging Conversion Flow for: ${sourcePath}`);
        const markdownResult = await this.runMarkerConversion(sourcePath);
        this.logger.log(`✅ Marker-PDF Output Complete (${markdownResult.length} chars).`);
        const classification = await this.taxonomyService.classify(markdownResult);
        this.logger.log(`📌 Industry: ${classification.industryName}, Function: ${classification.categoryName}, Pos: ${classification.positionName}`);
        const evolvedKeywords = await this.keywordPool.evolveKeywords(markdownResult);
        if (evolvedKeywords.length > 0) {
            this.logger.log(`🧬 Knowledge Evovled: [${evolvedKeywords.join(', ')}] added to pool.`);
        }
        return markdownResult;
    }
    async runMarkerConversion(source) {
        const mockMd = `# 简历预览 (由 Marker-PDF 转换)\n- 关键词: NLP, Agentic Workflow\n- 简介: 五年 AI 经验...`;
        return mockMd;
    }
};
exports.MarkdownConverter = MarkdownConverter;
exports.MarkdownConverter = MarkdownConverter = MarkdownConverter_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [taxonomy_service_1.TaxonomyService,
        keyword_pool_service_1.KeywordPoolService])
], MarkdownConverter);
//# sourceMappingURL=markdown.converter.js.map