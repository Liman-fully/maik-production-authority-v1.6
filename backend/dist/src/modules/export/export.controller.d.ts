import { ExportService } from './export.service';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { DownloadLog } from './download-log.entity';
export declare class ExportController {
    private readonly exportService;
    private readonly downloadLogRepository;
    constructor(exportService: ExportService, downloadLogRepository: Repository<DownloadLog>);
    getExportStatus(req: any, taskId: string): Promise<{
        success: boolean;
        data: {
            taskId: string;
            status: string;
            totalCount: number;
            processedCount: number;
            filePath: string;
            errorMessage: string;
            createdAt: Date;
            completedAt: Date;
            progress: number;
        };
    }>;
    downloadExport(req: any, taskId: string, res: Response): Promise<void>;
    private logDownload;
}
