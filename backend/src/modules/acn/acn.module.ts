import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcnService } from './acn.service';
import { AcnController } from './acn.controller';
import {
  ResumeContributionLog,
  AcnRoleContribution,
  AcnRoleWeight,
} from './acn.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResumeContributionLog,
      AcnRoleContribution,
      AcnRoleWeight,
    ]),
  ],
  controllers: [AcnController],
  providers: [AcnService],
  exports: [AcnService],
})
export class AcnModule {}