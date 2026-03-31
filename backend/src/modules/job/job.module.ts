import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { Job } from './job.entity';
import { PointsModule } from '../points/points.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job]),
    PointsModule,
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
