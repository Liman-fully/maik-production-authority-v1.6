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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const score_service_1 = require("./score.service");
const score_dto_1 = require("./score.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ScoreController = class ScoreController {
    constructor(scoreService) {
        this.scoreService = scoreService;
    }
    async calculatePersonalScore(dto) {
        const record = await this.scoreService.calculatePersonalScore(dto);
        return {
            success: true,
            data: {
                totalScore: Number(record.totalScore),
                breakdown: record.breakdown,
                type: 'personal',
                calculatedAt: record.createdAt,
            },
        };
    }
    async calculateMatchScore(dto) {
        const record = await this.scoreService.calculateMatchScore(dto);
        return {
            success: true,
            data: {
                totalScore: Number(record.totalScore),
                breakdown: record.breakdown,
                matchContext: record.matchContext,
                type: 'match',
                calculatedAt: record.createdAt,
            },
        };
    }
    async getTalentScores(talentId) {
        const scores = await this.scoreService.getScores(talentId);
        return {
            success: true,
            data: {
                personal: scores.personal
                    ? { totalScore: Number(scores.personal.totalScore), breakdown: scores.personal.breakdown }
                    : null,
                match: scores.match.map(r => ({
                    totalScore: Number(r.totalScore),
                    breakdown: r.breakdown,
                    matchContext: r.matchContext,
                    calculatedAt: r.createdAt,
                })),
            },
        };
    }
    async getPersonalLeaderboard(limit = 50) {
        const records = await this.scoreService.getLeaderboard('personal', limit);
        return {
            success: true,
            data: records.map(r => ({
                talentId: r.talentId,
                totalScore: Number(r.totalScore),
                breakdown: r.breakdown,
            })),
        };
    }
    async getMatchLeaderboard(limit = 50) {
        const records = await this.scoreService.getLeaderboard('match', limit);
        return {
            success: true,
            data: records.map(r => ({
                talentId: r.talentId,
                totalScore: Number(r.totalScore),
                matchContext: r.matchContext,
                calculatedAt: r.createdAt,
            })),
        };
    }
};
exports.ScoreController = ScoreController;
__decorate([
    (0, common_1.Post)('personal'),
    (0, swagger_1.ApiOperation)({ summary: '计算个人优秀度评分 (0-100)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [score_dto_1.CalculatePersonalScoreDto]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "calculatePersonalScore", null);
__decorate([
    (0, common_1.Post)('match'),
    (0, swagger_1.ApiOperation)({ summary: '计算岗位匹配度评分 (0-100)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [score_dto_1.CalculateMatchScoreDto]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "calculateMatchScore", null);
__decorate([
    (0, common_1.Get)('talent/:talentId'),
    (0, swagger_1.ApiOperation)({ summary: '获取人才的所有评分' }),
    __param(0, (0, common_1.Param)('talentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "getTalentScores", null);
__decorate([
    (0, common_1.Get)('leaderboard/personal'),
    (0, swagger_1.ApiOperation)({ summary: '个人优秀度排行榜' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "getPersonalLeaderboard", null);
__decorate([
    (0, common_1.Get)('leaderboard/match'),
    (0, swagger_1.ApiOperation)({ summary: '岗位匹配度排行榜' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScoreController.prototype, "getMatchLeaderboard", null);
exports.ScoreController = ScoreController = __decorate([
    (0, swagger_1.ApiTags)('评分系统'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('scores'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [score_service_1.ScoreService])
], ScoreController);
//# sourceMappingURL=score.controller.js.map