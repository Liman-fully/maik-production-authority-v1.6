import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { CandidateModule } from '../candidate/candidate.module';
import { JobModule } from '../job/job.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview]), CandidateModule, JobModule],
  controllers: [InterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
