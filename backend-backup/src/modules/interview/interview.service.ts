import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class InterviewService {
  constructor(
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  async findAll(params: FindAllParams) {
    const { page = 1, limit = 20, candidateId, jobId, status } = params;
    const queryBuilder = this.interviewRepository.createQueryBuilder('interview');

    if (candidateId) {
      queryBuilder.andWhere('interview.candidateId = :candidateId', { candidateId });
    }

    if (jobId) {
      queryBuilder.andWhere('interview.jobId = :jobId', { jobId });
    }

    if (status && status !== 'all') {
      queryBuilder.andWhere('interview.status = :status', { status });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);
    queryBuilder.orderBy('interview.scheduledAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Interview> {
    const interview = await this.interviewRepository.findOne({
      where: { id },
      relations: ['candidate', 'job'],
    });

    if (!interview) {
      throw new NotFoundException(`Interview with ID ${id} not found`);
    }

    return interview;
  }

  async create(createInterviewDto: CreateInterviewDto): Promise<Interview> {
    const interview = this.interviewRepository.create(createInterviewDto);
    return this.interviewRepository.save(interview);
  }

  async updateStatus(id: string, status: string): Promise<Interview> {
    const interview = await this.findOne(id);
    const oldStatus = interview.status;
    interview.status = status as any;
    const saved = await this.interviewRepository.save(interview);
    
    // 状态机流转后的自动处理逻辑
    await this.handleStatusTransition(saved, oldStatus);
    
    return saved;
  }

  /**
   * 面试状态机核心逻辑：处理状态转换后的副作用
   */
  private async handleStatusTransition(interview: Interview, oldStatus: string) {
    const newStatus = interview.status;
    
    // 如果面试完成，自动触发候选人状态更新
    if (newStatus === 'completed' && oldStatus !== 'completed') {
      // 这里的逻辑应调用 CandidateService，末将选择通过事件或直接引用
      // 为了 2G 内存下的简单直接，此处采用直接更新
      await this.interviewRepository.query(
        'UPDATE candidates SET status = $1 WHERE id = $2',
        ['interviewed', interview.candidateId]
      );
    }
    
    // 如果面试取消，释放资源或发送通知
    if (newStatus === 'cancelled') {
      console.log(`[InterviewStateMachine] Interview ${interview.id} cancelled. Releasing resources...`);
    }
  }

  async updateFeedback(id: string, updateFeedbackDto: UpdateFeedbackDto): Promise<Interview> {
    const interview = await this.findOne(id);
    interview.feedback = updateFeedbackDto.feedback;
    if (updateFeedbackDto.score !== undefined) {
      interview.score = updateFeedbackDto.score;
    }
    return this.interviewRepository.save(interview);
  }
}
