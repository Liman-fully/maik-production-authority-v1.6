import { InterviewStatus } from '../interview.entity';
export declare class CreateInterviewDto {
    candidateId: number;
    jobId: string;
    scheduledAt: string;
    status?: InterviewStatus;
}
export declare class UpdateFeedbackDto {
    feedback: string;
    score?: number;
}
