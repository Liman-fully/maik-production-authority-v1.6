import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadRecord } from './download-record.entity';
import { DownloadRecordService } from './download-record.service';

@Module({
  imports: [TypeOrmModule.forFeature([DownloadRecord])],
  providers: [DownloadRecordService],
  exports: [DownloadRecordService],
})
export class DownloadModule {}
