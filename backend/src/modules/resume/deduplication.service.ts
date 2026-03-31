import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './resume.entity';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
  ) {}

  /**
   * 科学去重判断逻辑
   * 维度：姓名 + (手机 OR 邮箱 OR (学校 + 公司 + 职位))
   */
  async findExistingTalent(parsedData: any): Promise<Resume | null> {
    const { name, phone, email, school, currentCompany, currentTitle } = parsedData;

    if (!name) return null;

    // 1. 强唯一标识匹配 (手机/邮箱)
    if (phone || email) {
      const query = this.resumeRepository.createQueryBuilder('resume')
        .where('resume.basicInfo->>\'name\' = :name', { name });
      
      if (phone) {
        query.andWhere('resume.basicInfo->>\'phone\' = :phone', { phone });
      }
      if (email) {
        query.andWhere('resume.basicInfo->>\'email\' = :email', { email });
      }
      
      const strongMatch = await query.getOne();
      if (strongMatch) return strongMatch;
    }

    // 2. 软属性组合匹配 (防混淆：更换手机号/邮箱的情况)
    // 逻辑：姓名一致 且 (学校一致 OR 公司+职位一致)
    const query = this.resumeRepository.createQueryBuilder('resume')
      .where('resume.basicInfo->>\'name\' = :name', { name });

    if (school) {
      query.andWhere('resume.education::text LIKE :school', { school: `%"school":"${school}"%` });
    } else if (currentCompany && currentTitle) {
      query.andWhere('resume.workExperience::text LIKE :company', { company: `%"company":"${currentCompany}"%` })
           .andWhere('resume.workExperience::text LIKE :title', { title: `%"title":"${currentTitle}"%` });
    }

    return await query.getOne();
  }

  /**
   * 更新决策逻辑：选择"最近"且"最完整"的简历
   */
  shouldUpdate(existing: Resume, newData: any): boolean {
    // 如果新简历的工作经历更多或包含了更高学历，则更新
    const existingCompleteness = this.calculateCompleteness(existing);
    const newCompleteness = this.calculateCompleteness(newData);
    
    return newCompleteness >= existingCompleteness;
  }

  private calculateCompleteness(data: any): number {
    let score = 0;
    if (data.basicInfo?.phone) score += 1;
    if (data.basicInfo?.email) score += 1;
    if (data.workExperience?.length > 0) score += 5;
    if (data.projects?.length > 0) score += 3;
    if (data.education?.length > 0) score += 2;
    return score;
  }
}
