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
exports.SearchLog = void 0;
const typeorm_1 = require("typeorm");
let SearchLog = class SearchLog {
};
exports.SearchLog = SearchLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SearchLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], SearchLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SearchLog.prototype, "query", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SearchLog.prototype, "filters", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'result_count', default: 0 }),
    __metadata("design:type", Number)
], SearchLog.prototype, "resultCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'clicked_candidate_id', nullable: true }),
    __metadata("design:type", Number)
], SearchLog.prototype, "clickedCandidateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contacted_candidate_id', nullable: true }),
    __metadata("design:type", Number)
], SearchLog.prototype, "contactedCandidateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'response_time_ms', nullable: true }),
    __metadata("design:type", Number)
], SearchLog.prototype, "responseTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cache_hit', default: false }),
    __metadata("design:type", Boolean)
], SearchLog.prototype, "cacheHit", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], SearchLog.prototype, "createdAt", void 0);
exports.SearchLog = SearchLog = __decorate([
    (0, typeorm_1.Entity)('search_logs')
], SearchLog);
//# sourceMappingURL=search-log.entity.js.map