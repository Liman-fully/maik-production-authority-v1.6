import { Job } from 'bull';
import { ExportService } from './modules/export/export.service';
export declare class ExportProcessor {
    private readonly exportService;
    constructor(exportService: ExportService);
    handleExport(job: Job): Promise<void>;
}
