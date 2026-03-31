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
exports.IndexMaintenanceService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let IndexMaintenanceService = class IndexMaintenanceService {
    constructor(connection) {
        this.connection = connection;
    }
    async analyzeTables() {
        try {
            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.query('ANALYZE talents');
            console.log('[Maintenance] Index statistics updated successfully');
        }
        catch (error) {
            console.error('[Maintenance] Failed to analyze tables:', error.message);
        }
    }
    async checkSlowQueries() {
        try {
            const queryRunner = this.connection.createQueryRunner();
            const result = await queryRunner.query(`
        SELECT query, calls, total_exec_time, mean_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `);
            if (result && result.length > 0) {
                console.warn(`[Maintenance] Found ${result.length} slow queries in the last 24 hours`);
            }
        }
        catch (error) {
        }
    }
};
exports.IndexMaintenanceService = IndexMaintenanceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IndexMaintenanceService.prototype, "analyzeTables", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_4AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IndexMaintenanceService.prototype, "checkSlowQueries", null);
exports.IndexMaintenanceService = IndexMaintenanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectConnection)()),
    __metadata("design:paramtypes", [typeorm_2.Connection])
], IndexMaintenanceService);
//# sourceMappingURL=index-maintenance.service.js.map