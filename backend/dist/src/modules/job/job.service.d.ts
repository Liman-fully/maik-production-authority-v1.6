import { Repository } from 'typeorm';
import { Job } from './job.entity';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { PointsService } from '../points/points.service';
interface FindAllParams {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
}
export declare class JobService {
    private readonly jobRepository;
    private readonly pointsService;
    constructor(jobRepository: Repository<Job>, pointsService: PointsService);
    findAll(params: FindAllParams): Promise<{
        data: Job[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Job>;
    create(createJobDto: CreateJobDto, userId: string): Promise<Job>;
    update(id: string, updateJobDto: UpdateJobDto): Promise<Job>;
    updateStatus(id: string, status: string): Promise<Job>;
    remove(id: string): Promise<void>;
}
export {};
