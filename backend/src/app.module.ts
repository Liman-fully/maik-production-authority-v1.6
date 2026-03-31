import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './common/redis/redis.module';
import { CacheModule } from './common/cache/cache.module';
import { CosModule } from './common/storage/cos.module';
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
import { ExportProcessor } from './export.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    RedisModule,
    CacheModule,
    CosModule,
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),
    TypeOrmModule.forRootAsync({
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
    QueueModule,
    DeepSeekModule,
    AuthModule,
    UserModule,
    TalentModule,
    JobModule,
    ScoreModule,
    ResumeModule,
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
    ExportModule,
    DownloadModule,
    RecommendationModule,
    SearchLogModule,
    MetadataModule,
  ],
  providers: [
    IndexMaintenanceService,
    TalentEventListener,
    ExportProcessor,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(QueryLoggingMiddleware)
      .forRoutes({ path: 'talents', method: RequestMethod.GET });
  }
}
