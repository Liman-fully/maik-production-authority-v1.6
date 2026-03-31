import { Repository } from 'typeorm';
import { Resume } from './resume.entity';
export declare class DeduplicationService {
    private resumeRepository;
    private readonly logger;
    constructor(resumeRepository: Repository<Resume>);
    findExistingTalent(parsedData: any): Promise<Resume | null>;
    shouldUpdate(existing: Resume, newData: any): boolean;
    private calculateCompleteness;
}
