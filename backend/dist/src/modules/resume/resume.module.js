"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const cos_module_1 = require("../../common/storage/cos.module");
const resume_controller_1 = require("./resume.controller");
const resume_service_1 = require("./resume.service");
const resume_entity_1 = require("./resume.entity");
const resume_folder_entity_1 = require("./resume-folder.entity");
const resume_processor_1 = require("./resume.processor");
const ai_service_1 = require("./ai.service");
const local_parse_service_1 = require("./local-parse.service");
const email_fetch_service_1 = require("./email-fetch.service");
const email_fetch_processor_1 = require("./email-fetch.processor");
const deduplication_service_1 = require("./deduplication.service");
const markdown_converter_1 = require("./conversion/markdown.converter");
const metadata_module_1 = require("../metadata/metadata.module");
const score_module_1 = require("../score/score.module");
const recommendation_module_1 = require("../recommendation/recommendation.module");
const talent_entity_1 = require("../talent/talent.entity");
let ResumeModule = class ResumeModule {
};
exports.ResumeModule = ResumeModule;
exports.ResumeModule = ResumeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([resume_entity_1.Resume, resume_folder_entity_1.ResumeFolder, talent_entity_1.Talent]),
            cos_module_1.CosModule,
            metadata_module_1.MetadataModule,
            score_module_1.ScoreModule,
            recommendation_module_1.RecommendationModule,
            bull_1.BullModule.registerQueue({ name: 'resume-parsing' }, { name: 'email-fetching' }),
        ],
        controllers: [resume_controller_1.ResumeController],
        providers: [
            resume_service_1.ResumeService,
            resume_processor_1.ResumeProcessor,
            ai_service_1.AiService,
            local_parse_service_1.LocalParseService,
            email_fetch_service_1.EmailFetchService,
            email_fetch_processor_1.EmailFetchProcessor,
            deduplication_service_1.DeduplicationService,
            markdown_converter_1.MarkdownConverter,
        ],
        exports: [resume_service_1.ResumeService, markdown_converter_1.MarkdownConverter],
    })
], ResumeModule);
//# sourceMappingURL=resume.module.js.map