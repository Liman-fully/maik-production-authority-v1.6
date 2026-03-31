import { Repository } from 'typeorm';
import { DownloadRecord } from './download-record.entity';
export declare class DownloadRecordService {
    private recordRepo;
    constructor(recordRepo: Repository<DownloadRecord>);
    createRecord(data: {
        userId: string;
        resumeId: string;
        originalFileName: string;
        standardFileName: string;
        filePath: string;
        fileSize: number;
        downloadType: string;
        candidateName?: string;
        candidatePhone?: string;
        expectedPosition?: string;
        ipAddress?: string;
        userAgent?: string;
        exportFormat?: string;
    }): Promise<DownloadRecord>;
    getUserRecords(userId: string, limit?: number, offset?: number): Promise<{
        records: DownloadRecord[];
        total: number;
    }>;
    getResumeDownloadHistory(resumeId: string): Promise<DownloadRecord[]>;
    getDownloadStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
        totalCount: number;
        pdfCount: number;
        excelCount: number;
    }>;
}
