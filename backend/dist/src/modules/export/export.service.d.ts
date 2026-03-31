import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { ExportTask } from './export-task.entity';
import { Resume } from '../resume/resume.entity';
import { PdfExporter } from './pdf-exporter';
import { ExcelExporter } from './excel-exporter';
import { DownloadRecordService } from '../download/download-record.service';
export declare class ExportService {
    private taskRepo;
    private resumeRepo;
    private exportQueue;
    private pdfExporter;
    private excelExporter;
    private downloadRecordService;
    constructor(taskRepo: Repository<ExportTask>, resumeRepo: Repository<Resume>, exportQueue: Queue, pdfExporter: PdfExporter, excelExporter: ExcelExporter, downloadRecordService: DownloadRecordService);
    createExportTask(userId: string, resumeIds: string[], format: string): Promise<ExportTask>;
    getTaskStatus(taskId: string, userId: string): Promise<ExportTask>;
    processExport(data: any): Promise<{
        success: boolean;
        filePath: string;
        standardFileName: string;
    }>;
    private getResumes;
    private uploadToCos;
    generateStandardFileName(resume: Resume): string;
    private cleanFileName;
}
