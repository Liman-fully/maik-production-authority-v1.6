"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchLogModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const search_log_entity_1 = require("./search-log.entity");
const search_log_service_1 = require("./search-log.service");
const search_log_controller_1 = require("./search-log.controller");
let SearchLogModule = class SearchLogModule {
};
exports.SearchLogModule = SearchLogModule;
exports.SearchLogModule = SearchLogModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([search_log_entity_1.SearchLog])],
        controllers: [search_log_controller_1.SearchLogController],
        providers: [search_log_service_1.SearchLogService],
        exports: [search_log_service_1.SearchLogService],
    })
], SearchLogModule);
//# sourceMappingURL=search-log.module.js.map