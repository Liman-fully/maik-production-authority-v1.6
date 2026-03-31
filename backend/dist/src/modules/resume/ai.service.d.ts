import { ConfigService } from '@nestjs/config';
export declare class AiService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    private readonly model;
    constructor(configService: ConfigService);
    private readonly localModelUrl;
    parseResumeText(text: string): Promise<any>;
    validateWithLocalQwen(text: string): Promise<boolean>;
    validateWithZhipu(text: string): Promise<boolean>;
    private mockParsing;
}
