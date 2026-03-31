import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  ],
  controllers: [ExportController],
  providers: [
    ExportService,
    PdfExporter,
    ExcelExporter,
    RedisService,
    {
      provide: 'EXPORT_QUEUE',
      useFactory: () => {
        const Queue = require('bull');
        return new Queue('export', {
          redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
        });
      },
    },
  ],
  exports: [ExportService],
})
export class ExportModule {}
