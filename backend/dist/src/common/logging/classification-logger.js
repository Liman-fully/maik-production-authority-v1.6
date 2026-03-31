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
exports.ClassificationLogger = void 0;
const common_1 = require("@nestjs/common");
let ClassificationLogger = class ClassificationLogger {
    constructor() {
    }
    async log(input) {
        const log = {
            id: this.generateId(),
            isManualOverride: false,
            ...input,
            createdAt: new Date(),
        };
        console.log('[ClassificationLogger] Log:', JSON.stringify(log).substring(0, 200));
        return log;
    }
    async batchLog(inputs) {
        console.log(`[ClassificationLogger] Batch log: ${inputs.length} entries`);
    }
    async markError(logId, errorType, manualResultCategoryCode) {
        console.log(`[ClassificationLogger] Mark error: ${logId} -> ${errorType}`);
    }
    async getPendingReview(limit = 100) {
        return [];
    }
    async getErrorStats(days = 7) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - days);
            const logs = await this.logsRepo.find({
                where: { createdAt: since },
            });
            const totalLogs = logs.length;
            const errorCount = logs.filter(l => l.errorType).length;
            const byType = {};
            for (const log of logs) {
                if (log.errorType) {
                    byType[log.errorType] = (byType[log.errorType] || 0) + 1;
                }
            }
            return {
                totalLogs,
                errorCount,
                errorRate: totalLogs > 0 ? errorCount / totalLogs : 0,
                byType,
            };
        }
        catch (error) {
            console.error('[ClassificationLogger] Failed to get error stats:', error);
            return {
                totalLogs: 0,
                errorCount: 0,
                errorRate: 0,
                byType: {},
            };
        }
    }
    detectPotentialError(log) {
        if (log.confidence < 0.5)
            return true;
        if (log.matchedKeywords.length < 3)
            return true;
        if (log.isManualOverride)
            return true;
        return false;
    }
    generateId() {
        return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
};
exports.ClassificationLogger = ClassificationLogger;
exports.ClassificationLogger = ClassificationLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ClassificationLogger);
//# sourceMappingURL=classification-logger.js.map