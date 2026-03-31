import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { CandidateService } from './candidate.service';
import { CandidateController } from './candidate.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candidate]),
  ],
  controllers: [CandidateController],
  providers: [CandidateService],
  exports: [CandidateService],
})
export class CandidateModule {}
