import { Repository } from 'typeorm';
import { Interview } from './interview.entity';
import { CreateInterviewDto, UpdateFeedbackDto } from './dto/interview.dto';
interface FindAllParams {
    page?: number;
    limit?: number;
    candidateId?: string;
    jobId?: string;
    status?: string;
}
export declare class InterviewService {
    private readonly interviewRepository;
    constructor(interviewRepository: Repository<Interview>);
    findAll(params: FindAllParams): Promise<{
        data: Interview[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Interview>;
    create(createInterviewDto: CreateInterviewDto): Promise<Interview>;
    updateStatus(id: string, status: string): Promise<Interview>;
    private handleStatusTransition;
    updateFeedback(id: string, updateFeedbackDto: UpdateFeedbackDto): Promise<Interview>;
}
export {};
