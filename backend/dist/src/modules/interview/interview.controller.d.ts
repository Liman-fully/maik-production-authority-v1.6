import { InterviewService } from './interview.service';
import { CreateInterviewDto, UpdateFeedbackDto } from './dto/interview.dto';
export declare class InterviewController {
    private readonly interviewService;
    constructor(interviewService: InterviewService);
    findAll(page?: number, limit?: number, candidateId?: string, jobId?: string, status?: string): Promise<{
        data: import("./interview.entity").Interview[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("./interview.entity").Interview>;
    create(createInterviewDto: CreateInterviewDto): Promise<import("./interview.entity").Interview>;
    updateStatus(id: string, status: string): Promise<import("./interview.entity").Interview>;
    updateFeedback(id: string, updateFeedbackDto: UpdateFeedbackDto): Promise<import("./interview.entity").Interview>;
}
