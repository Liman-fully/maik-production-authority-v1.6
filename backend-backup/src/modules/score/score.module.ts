import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoreRecord } from './score.entity';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { Talent } from '../talent/talent.entity';
import { Resume } from '../resume/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScoreRecord, Talent, Resume]),
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
  exports: [ScoreService],
})
export class ScoreModule {}
