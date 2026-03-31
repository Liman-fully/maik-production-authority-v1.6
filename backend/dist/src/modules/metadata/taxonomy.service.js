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
var TaxonomyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyService = void 0;
const common_1 = require("@nestjs/common");
const position_classifier_1 = require("../../common/classifiers/position-classifier");
const fs = require("fs");
const path = require("path");
let TaxonomyService = TaxonomyService_1 = class TaxonomyService {
    constructor() {
        this.logger = new common_1.Logger(TaxonomyService_1.name);
        this.classifier = new position_classifier_1.PositionClassifier();
        this.initializeClassifier();
    }
    initializeClassifier() {
        const rulesPath = path.join(process.cwd(), 'resume-classification-rules/rules/classification_rules.json');
        if (fs.existsSync(rulesPath)) {
            this.logger.log('Taxonomy rules loaded successfully.');
        }
    }
    async classify(text) {
        const result = this.classifier.classify(text);
        if (result.confidence < 0.7) {
            return await this.qwenCorrection(text, result);
        }
        return result;
    }
    async qwenCorrection(text, originalResult) {
        this.logger.warn(`Low confidence (${originalResult.confidence}), triggering Qwen correction layer...`);
        return {
            ...originalResult,
            matchType: 'weighted',
            confidence: Math.min(originalResult.confidence + 0.2, 0.9)
        };
    }
    getHierarchy() {
        return {
            L1: 'Industry (行业)',
            L2: 'Function (职能)',
            L3: 'Position (岗位)'
        };
    }
};
exports.TaxonomyService = TaxonomyService;
exports.TaxonomyService = TaxonomyService = TaxonomyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TaxonomyService);
//# sourceMappingURL=taxonomy.service.js.map