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
exports.ScoreRecord = void 0;
const typeorm_1 = require("typeorm");
let ScoreRecord = class ScoreRecord {
};
exports.ScoreRecord = ScoreRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScoreRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], ScoreRecord.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'talent_id', nullable: true }),
    __metadata("design:type", String)
], ScoreRecord.prototype, "talentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resume_id', nullable: true }),
    __metadata("design:type", String)
], ScoreRecord.prototype, "resumeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ScoreRecord.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_score', type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], ScoreRecord.prototype, "totalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ScoreRecord.prototype, "breakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ScoreRecord.prototype, "matchContext", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'score_version', default: 'v1' }),
    __metadata("design:type", String)
], ScoreRecord.prototype, "scoreVersion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ScoreRecord.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ScoreRecord.prototype, "updatedAt", void 0);
exports.ScoreRecord = ScoreRecord = __decorate([
    (0, typeorm_1.Entity)('score_records')
], ScoreRecord);
//# sourceMappingURL=score.entity.js.map