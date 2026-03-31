export declare class DownloadLog {
    id: number;
    userId: number;
    resumeId: number;
    taskId: string;
    downloadType: 'single' | 'batch';
    fileFormat: string;
    fileSizeBytes: number;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed' | 'blocked';
    errorMessage: string;
    createdAt: Date;
}
