import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { Job } from '../job/job.entity';
import { Interview } from '../interview/interview.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Interview)
    private readonly interviewRepository: Repository<Interview>,
  ) {}

  async getOverview() {
    const [candidateCount, jobCount, interviewCount] = await Promise.all([
      this.candidateRepository.count(),
      this.jobRepository.count({ where: { status: 'published' } }),
      this.interviewRepository.count(),
    ]);

    return {
      candidates: candidateCount,
      activeJobs: jobCount,
      interviews: interviewCount,
      successRate: 0.15, // Mock value for now
    };
  }

  async getFunnel() {
    // This is a simplified version of a recruitment funnel
    const total = await this.candidateRepository.count();
    const contacted = await this.candidateRepository.count({ where: { status: 'contacted' } });
    const interviewed = await this.interviewRepository.count();
    const offered = await this.candidateRepository.count({ where: { status: 'offered' } });

    return [
      { step: '简历获取', count: total },
      { step: '初步沟通', count: contacted },
      { step: '安排面试', count: interviewed },
      { step: '发送录取', count: offered },
    ];
  }

  async getTrend() {
    // Generate some mock trend data for the last 6 months
    const months = ['10月', '11月', '12月', '1月', '2月', '3月'];
    return months.map((month, index) => ({
      month,
      candidates: 10 + index * 5 + Math.floor(Math.random() * 5),
      interviews: 5 + index * 2 + Math.floor(Math.random() * 3),
    }));
  }
}
