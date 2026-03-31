import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly pointsService: PointsService,
  ) {}

  async findAll(params: FindAllParams) {
    const { page = 1, limit = 20, status, userId } = params;
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    if (status && status !== 'all') {
      queryBuilder.andWhere('job.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('job.createdBy = :userId', { userId });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);
    queryBuilder.orderBy('job.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async create(createJobDto: CreateJobDto, userId: string): Promise<Job> {
    // 扣除积分逻辑 (发布职位扣除100积分)
    const pointsRequired = 100;
    try {
      await this.pointsService.spendPoints(userId, pointsRequired, '发布职位');
    } catch (e) {
      throw new ForbiddenException('积分不足，无法发布职位');
    }

    const job = this.jobRepository.create({
      ...createJobDto,
      createdBy: userId,
    });
    
    if (job.status === 'published' && !job.publishedAt) {
      job.publishedAt = new Date();
    }
    return this.jobRepository.save(job);
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);
    Object.assign(job, updateJobDto);
    if (job.status === 'published' && !job.publishedAt) {
      job.publishedAt = new Date();
    }
    return this.jobRepository.save(job);
  }

  async updateStatus(id: string, status: string): Promise<Job> {
    const job = await this.findOne(id);
    job.status = status as any;
    if (status === 'published' && !job.publishedAt) {
      job.publishedAt = new Date();
    }
    return this.jobRepository.save(job);
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepository.remove(job);
  }
}
