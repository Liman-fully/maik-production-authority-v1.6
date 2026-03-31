import { ConfigService } from '@nestjs/config';
export declare class SmsService {
    private configService;
    private readonly logger;
    private client;
    constructor(configService: ConfigService);
    sendVerificationCode(phone: string, code: string, templateId: string): Promise<boolean>;
}
