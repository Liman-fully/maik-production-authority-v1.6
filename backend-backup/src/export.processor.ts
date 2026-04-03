import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ExportService } from './modules/export/export.service';

@Processor('export')
export class ExportProcessor {
  constructor(private readonly exportService: ExportService) {}

  @Process()
  async handleExport(job: Job) {
    await this.exportService.processExport(job.data);
  }
}
