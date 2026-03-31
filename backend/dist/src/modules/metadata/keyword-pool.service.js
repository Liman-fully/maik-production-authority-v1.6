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
var KeywordPoolService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordPoolService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const taxonomy_service_1 = require("./taxonomy.service");
let KeywordPoolService = KeywordPoolService_1 = class KeywordPoolService {
    constructor(taxonomyService) {
        this.taxonomyService = taxonomyService;
        this.logger = new common_1.Logger(KeywordPoolService_1.name);
    }
    async evolveKeywords(markdownContent) {
        this.logger.log('🚀 Starting Keyword Evolution based on content...');
        const candidateKeywords = this.extractCandidates(markdownContent);
        this.logger.debug(`Found ${candidateKeywords.length} candidate keywords.`);
        const evolvedList = [];
        for (const kw of candidateKeywords) {
            if (!this.isTooCommon(kw)) {
                const classification = await this.taxonomyService.classify(kw);
                if (classification.categoryName) {
                    this.logger.log(`Mapped [${kw}] to Category: ${classification.categoryName}`);
                    evolvedList.push(kw);
                    this.persistNewKeyword(kw, classification.categoryCode);
                }
            }
        }
        return evolvedList;
    }
    extractCandidates(content) {
        const firstPart = content.substring(0, 500);
        const mockedKws = ['AI Agent', 'Python', 'NestJS', 'PostgreSQL', 'NLP', 'TensorFlow'];
        return mockedKws;
    }
    isTooCommon(kw) {
        const commonWords = ['经验', '负责', '简历', '内容', '开发'];
        return commonWords.includes(kw);
    }
    persistNewKeyword(kw, categoryCode) {
        const poolDir = path.join(process.cwd(), 'resume-classification-rules/keywords/autonomous_pool');
        if (!fs.existsSync(poolDir)) {
            fs.mkdirSync(poolDir, { recursive: true });
        }
    }
};
exports.KeywordPoolService = KeywordPoolService;
exports.KeywordPoolService = KeywordPoolService = KeywordPoolService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [taxonomy_service_1.TaxonomyService])
], KeywordPoolService);
//# sourceMappingURL=keyword-pool.service.js.map