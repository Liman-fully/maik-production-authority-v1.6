export declare enum ExportFormat {
    PDF = "pdf",
    EXCEL = "excel"
}
export declare class ExportRequestDto {
    resumeIds: string[];
    format: ExportFormat;
}
