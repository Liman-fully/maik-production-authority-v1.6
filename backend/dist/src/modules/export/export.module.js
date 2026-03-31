"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const export_task_entity_1 = require("./export-task.entity");
const resume_entity_1 = require("../resume/resume.entity");
const download_log_entity_1 = require("./download-log.entity");
const export_service_1 = require("./export.service");
const export_controller_1 = require("./export.controller");
const pdf_exporter_1 = require("./pdf-exporter");
const excel_exporter_1 = require("./excel-exporter");
const redis_service_1 = require("../../common/redis/redis.service");
const download_module_1 = require("../download/download.module");
let ExportModule = class ExportModule {
};
exports.ExportModule = ExportModule;
exports.ExportModule = ExportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([export_task_entity_1.ExportTask, resume_entity_1.Resume, download_log_entity_1.DownloadLog]),
            download_module_1.DownloadModule,
            bull_1.BullModule.registerQueue({ name: 'export' }),
        ],
        controllers: [export_controller_1.ExportController],
        providers: [
            export_service_1.ExportService,
            pdf_exporter_1.PdfExporter,
            excel_exporter_1.ExcelExporter,
            redis_service_1.RedisService,
        ],
        exports: [export_service_1.ExportService],
    })
], ExportModule);
//# sourceMappingURL=export.module.js.map