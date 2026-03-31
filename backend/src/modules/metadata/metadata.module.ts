import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { KeywordPoolService } from './keyword-pool.service';

@Module({
  providers: [TaxonomyService, KeywordPoolService],
  exports: [TaxonomyService, KeywordPoolService],
})
export class MetadataModule {}
