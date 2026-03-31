import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Candidate } from '../candidate/candidate.entity';
import { Job } from '../job/job.entity';
import { Interview } from '../interview/interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Candidate, Job, Interview])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}
