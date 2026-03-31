import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchLog } from './search-log.entity';
import { SearchLogService } from './search-log.service';
import { SearchLogController } from './search-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog])],
  controllers: [SearchLogController],
  providers: [SearchLogService],
  exports: [SearchLogService],
})
export class SearchLogModule {}
