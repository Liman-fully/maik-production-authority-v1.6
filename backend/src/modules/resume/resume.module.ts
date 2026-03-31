import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CosModule } from '../../common/storage/cos.module';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { Resume } from './resume.entity';
import { ResumeFolder } from './resume-folder.entity';
import { ResumeProcessor } from './resume.processor';
import { AiService } from './ai.service';
import { LocalParseService } from './local-parse.service';
import { EmailFetchService } from './email-fetch.service';
import { EmailFetchProcessor } from './email-fetch.processor';
import { DeduplicationService } from './deduplication.service';
import { MarkdownConverter } from './conversion/markdown.converter';
import { MetadataModule } from '../metadata/metadata.module';
import { ScoreModule } from '../score/score.module';
import { RecommendationModule } from '../recommendation/recommendation.module';
import { Talent } from '../talent/talent.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, ResumeFolder, Talent]),
    CosModule,
    MetadataModule,
    ScoreModule,
    RecommendationModule,
    BullModule.registerQueue(
      { name: 'resume-parsing' },
      { name: 'email-fetching' },
    ),
  ],
  controllers: [ResumeController],
  providers: [
    ResumeService,
    ResumeProcessor,
    AiService,
    LocalParseService,
    EmailFetchService,
    EmailFetchProcessor,
    DeduplicationService,
    MarkdownConverter,
  ],
  exports: [ResumeService, MarkdownConverter],
})
export class ResumeModule {}
