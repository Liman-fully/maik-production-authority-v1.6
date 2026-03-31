import { Job } from 'bull';
import { EmailFetchService } from './email-fetch.service';
export declare class EmailFetchProcessor {
    private readonly emailFetchService;
    private readonly logger;
    constructor(emailFetchService: EmailFetchService);
    handleFetch(job: Job): Promise<void>;
}
