import { ConfigService } from '@nestjs/config';
import { ResumeService } from './resume.service';
export declare class EmailFetchService {
    private configService;
    private resumeService;
    private readonly logger;
    private readonly accountsPath;
    constructor(configService: ConfigService, resumeService: ResumeService);
    fetchResumesFromEmail(agentEmail?: string): Promise<void>;
    private loadAccounts;
}
