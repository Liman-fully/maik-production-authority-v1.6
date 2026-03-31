import { ConfigService } from '@nestjs/config';
export interface UploadResult {
    success: boolean;
    url?: string;
    key?: string;
    error?: string;
}
export declare class CosService {
    private configService;
    private cos;
    private bucket;
    private region;
    constructor(configService: ConfigService);
    uploadResume(userId: string, buffer: Buffer, fileName: string): Promise<{
        url: string;
        key: string;
    }>;
    downloadFile(url: string): Promise<Buffer>;
    deleteFile(key: string): Promise<void>;
    getSignedUrl(key: string, expires?: number): Promise<string>;
    testConnection(): Promise<boolean>;
}
