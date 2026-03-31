export declare enum TaskStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare class ExportTask {
    id: string;
    userId: string;
    format: string;
    status: string;
    totalCount: number;
    processedCount: number;
    filePath: string;
    errorMessage: string;
    createdAt: Date;
    completedAt: Date;
}
