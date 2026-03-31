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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportRequestDto = exports.ExportFormat = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["PDF"] = "pdf";
    ExportFormat["EXCEL"] = "excel";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
class ExportRequestDto {
}
exports.ExportRequestDto = ExportRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '简历 ID 列表', isArray: true }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)({ each: true }),
    __metadata("design:type", Array)
], ExportRequestDto.prototype, "resumeIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '导出格式', enum: ExportFormat }),
    (0, class_validator_1.IsEnum)(ExportFormat),
    __metadata("design:type", String)
], ExportRequestDto.prototype, "format", void 0);
//# sourceMappingURL=export-request.dto.js.map