"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const redis_module_1 = require("./common/redis/redis.module");
const cache_module_1 = require("./common/cache/cache.module");
const cos_module_1 = require("./common/storage/cos.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const talent_module_1 = require("./modules/talent/talent.module");
const job_module_1 = require("./modules/job/job.module");
const score_module_1 = require("./modules/score/score.module");
const deepseek_module_1 = require("./modules/deepseek/deepseek.module");
const queue_module_1 = require("./modules/queue/queue.module");
const resume_module_1 = require("./modules/resume/resume.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const notification_module_1 = require("./modules/notification/notification.module");
const authorization_module_1 = require("./modules/authorization/authorization.module");
const match_module_1 = require("./modules/match/match.module");
const report_module_1 = require("./modules/report/report.module");
const points_module_1 = require("./modules/points/points.module");
const membership_module_1 = require("./modules/membership/membership.module");
const invitation_module_1 = require("./modules/invitation/invitation.module");
const candidate_module_1 = require("./modules/candidate/candidate.module");
const interview_module_1 = require("./modules/interview/interview.module");
const export_module_1 = require("./modules/export/export.module");
const download_module_1 = require("./modules/download/download.module");
const recommendation_module_1 = require("./modules/recommendation/recommendation.module");
const search_log_module_1 = require("./modules/search/search-log.module");
const metadata_module_1 = require("./modules/metadata/metadata.module");
const index_maintenance_service_1 = require("./common/maintenance/index-maintenance.service");
const query_logging_middleware_1 = require("./common/middleware/query-logging.middleware");
const talent_event_listener_1 = require("./modules/talent/talent-event-listener");
const export_processor_1 = require("./export.processor");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(query_logging_middleware_1.QueryLoggingMiddleware)
            .forRoutes({ path: 'talents', method: common_1.RequestMethod.GET });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            redis_module_1.RedisModule,
            cache_module_1.CacheModule,
            cos_module_1.CosModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            bull_1.BullModule.forRoot({
                redis: {
                    host: process.env.REDIS_HOST || 'localhost',
                    port: Number(process.env.REDIS_PORT) || 6379,
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    host: process.env.DB_HOST || 'localhost',
                    port: Number(process.env.DB_PORT) || 5432,
                    username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
                    password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
                    database: process.env.DB_DATABASE || process.env.DB_NAME || 'huntlink',
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: process.env.NODE_ENV !== 'production',
                    logging: false,
                    retryDelay: 5000,
                    retryAttempts: 99,
                }),
            }),
            queue_module_1.QueueModule,
            deepseek_module_1.DeepSeekModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            talent_module_1.TalentModule,
            job_module_1.JobModule,
            score_module_1.ScoreModule,
            resume_module_1.ResumeModule,
            statistics_module_1.StatisticsModule,
            notification_module_1.NotificationModule,
            authorization_module_1.AuthorizationModule,
            match_module_1.MatchModule,
            report_module_1.ReportModule,
            points_module_1.PointsModule,
            membership_module_1.MembershipModule,
            invitation_module_1.InvitationModule,
            candidate_module_1.CandidateModule,
            interview_module_1.InterviewModule,
            export_module_1.ExportModule,
            download_module_1.DownloadModule,
            recommendation_module_1.RecommendationModule,
            search_log_module_1.SearchLogModule,
            metadata_module_1.MetadataModule,
        ],
        providers: [
            index_maintenance_service_1.IndexMaintenanceService,
            talent_event_listener_1.TalentEventListener,
            export_processor_1.ExportProcessor,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map