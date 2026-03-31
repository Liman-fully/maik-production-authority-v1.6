import { ResumeService } from './resume.service';
import { CosService } from '../../common/storage/cos.service';
export declare class ResumeController {
    private readonly resumeService;
    private readonly cosService;
    constructor(resumeService: ResumeService, cosService: CosService);
    uploadResume(req: any, file: any, folderId?: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: import("./resume.entity").Resume;
        message: string;
    }>;
    batchUpload(req: any, files: any[], folderId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getResumes(req: any, folderId?: string, keyword?: string, tier?: string, minScore?: number, maxScore?: number): Promise<{
        success: boolean;
        data: import("./resume.entity").Resume[];
    }>;
    getResume(req: any, id: string): Promise<{
        success: boolean;
        data: import("./resume.entity").Resume;
    }>;
    getResumeStatus(req: any, id: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            parseStatus: string;
            parseError: string;
        };
        message?: undefined;
    }>;
    downloadResume(req: any, id: string, res: any): Promise<any>;
    deleteResume(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    createFolder(req: any, name: string, parentId?: string): Promise<{
        success: boolean;
        data: import("./resume-folder.entity").ResumeFolder;
    }>;
    fetchFromEmail(req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getFolders(req: any): Promise<{
        success: boolean;
        data: import("./resume-folder.entity").ResumeFolder[];
    }>;
}
