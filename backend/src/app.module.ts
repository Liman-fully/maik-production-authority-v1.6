import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { CacheModule } from './common/cache/cache.module';
import { CosModule } from './common/storage/cos.module';
import { HealthModule } from './common/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TalentModule } from './modules/talent/talent.module';
import { JobModule } from './modules/job/job.module';
import { ScoreModule } from './modules/score/score.module';
import { DeepSeekModule } from './modules/deepseek/deepseek.module';
import { QueueModule } from './modules/queue/queue.module';
import { ResumeModule } from './modules/resume/resume.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { MatchModule } from './modules/match/match.module';
import { ReportModule } from './modules/report/report.module';
import { PointsModule } from './modules/points/points.module';
import { MembershipModule } from './modules/membership/membership.module';
import { InvitationModule } from './modules/invitation/invitation.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { InterviewModule } from './modules/interview/interview.module';
import { ExportModule } from './modules/export/export.module';
import { DownloadModule } from './modules/download/download.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';
import { SearchLogModule } from './modules/search/search-log.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { IndexMaintenanceService } from './common/maintenance/index-maintenance.service';
import { QueryLoggingMiddleware } from './common/middleware/query-logging.middleware';
import { TalentEventListener } from './modules/talent/talent-event-listener';
// import { ExportProcessor } from './export.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule,
    CacheModule,
    CosModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: Number(process.env.REDIS_PORT) || 6379,
    //     connectTimeout: 1000,
    //     lazyConnect: true,
    //   },
    //   defaultJobOptions: {
    //     attempts: 1,
    //     removeOnComplete: 10,
    //     removeOnFail: 10,
    //   },
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || configService.get('DB_USER') || 'postgres',
        password: configService.get('DB_PASSWORD') || configService.get('DB_PASS') || '',
        database: configService.get('DB_DATABASE') || configService.get('DB_NAME') || 'huntlink',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 生产环境严禁自动同步，防止 OOM 和数据损坏
        logging: false,
        retryDelay: 5000,
        retryAttempts: 99,
      }),
      inject: [ConfigService],
    }),
    // QueueModule,
    DeepSeekModule,
    AuthModule,
    UserModule,
    TalentModule,
    JobModule,
    ScoreModule,
    ResumeModule, // ✅ 修复：启用简历模块，恢复邮箱拉取功能
    StatisticsModule,
    NotificationModule,
    AuthorizationModule,
    MatchModule,
    ReportModule,
    PointsModule,
    MembershipModule,
    InvitationModule,
    CandidateModule,
    InterviewModule,
    // ExportModule,
    DownloadModule,
    RecommendationModule,
    SearchLogModule,
    MetadataModule,
    HealthModule,
  ],
  providers: [
    IndexMaintenanceService,
    TalentEventListener,
    // ExportProcessor,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(QueryLoggingMiddleware)
      .forRoutes({ path: 'talents', method: RequestMethod.GET });
  }
}
