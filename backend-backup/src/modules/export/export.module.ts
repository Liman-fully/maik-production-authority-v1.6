import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ExportTask } from './export-task.entity';
import { Resume } from '../resume/resume.entity';
import { DownloadLog } from './download-log.entity';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { PdfExporter } from './pdf-exporter';
import { ExcelExporter } from './excel-exporter';
import { RedisService } from '../../common/redis/redis.service';
import { DownloadModule } from '../download/download.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportTask, Resume, DownloadLog]),
    DownloadModule,
    BullModule.registerQueue({
      name: 'export',
      redis: process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost' ? {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      } : undefined,
    }),
  ],
  controllers: [ExportController],
  providers: [
    ExportService,
    PdfExporter,
    ExcelExporter,
    RedisService,
  ],
  exports: [ExportService],
})
export class ExportModule {}
