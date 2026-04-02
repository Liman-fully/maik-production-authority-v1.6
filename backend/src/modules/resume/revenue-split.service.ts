import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './resume.entity';
import { User } from '../user/user.entity';

interface RevenueSplit {
  platform: number;    // 30% - 平台
  referrer: number;    // 40% - 推荐人
  candidate: number;   // 30% - 候选人
}

interface SplitResult {
  resumeId: string;
  totalRevenue: number;
  splits: RevenueSplit;
  mdBusinessCard: string;
}

@Injectable()
export class RevenueSplitService {
  private readonly logger = new Logger(RevenueSplitService.name);

  constructor(
    @InjectRepository(Resume)
    private resumeRepository: Repository<Resume>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 资产闭环：简历识别 -> 提取附件 -> MD名片 -> 分账30/40/30
   * @param resumeId 简历ID
   * @param placementRevenue 成功入职后的总收益（单位：分）
   */
  async processRevenueSplit(resumeId: string, placementRevenue: number): Promise<SplitResult> {
    this.logger.log(`[资产闭环] 开始处理简历ID: ${resumeId}, 总收益: ¥${placementRevenue / 100}`);

    // 1. 获取简历信息
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId },
      relations: ['user'],
    });

    if (!resume) {
      throw new Error(`简历不存在: ${resumeId}`);
    }

    // 2. 获取推荐人信息（如果有）
    const referrer = resume.user?.referrerId 
      ? await this.userRepository.findOne({ where: { id: resume.user.referrerId } })
      : null;

    // 3. 计算分账
    const splits = this.calculateSplit(placementRevenue);

    // 4. 生成MD名片
    const mdBusinessCard = this.generateMDBusinessCard(resume, splits);

    // 5. 保存分账记录到简历元数据
    await this.saveSplitRecord(resumeId, splits, mdBusinessCard);

    const result: SplitResult = {
      resumeId,
      totalRevenue: placementRevenue,
      splits,
      mdBusinessCard,
    };

    this.logger.log(`[资产闭环] 处理完成:`, result);
    return result;
  }

  /**
   * 计算30/40/30分账
   */
  private calculateSplit(totalRevenue: number): RevenueSplit {
    const platform = Math.floor(totalRevenue * 0.30);   // 30% - 平台运营
    const referrer = Math.floor(totalRevenue * 0.40);   // 40% - 推荐人奖励
    const candidate = Math.floor(totalRevenue * 0.30);  // 30% - 候选人

    return { platform, referrer, candidate };
  }

  /**
   * 生成MD格式商务名片
   */
  private generateMDBusinessCard(resume: Resume, splits: RevenueSplit): string {
    const candidateName = resume.basicInfo?.name || '未知';
    const position = resume.jobIntention?.expectedPosition || '未知';
    const company = resume.workExperience?.[0]?.company || '未知';
    const email = resume.basicInfo?.email || '未提供';
    const phone = resume.basicInfo?.phone || '未提供';
    
    const md = `# 人才商务名片

## 基本信息
- **姓名**: ${candidateName}
- **职位**: ${position}
- **公司**: ${company}
- **简历来源**: ${resume.source || '邮箱同步'}

## 技能标签
${resume.skills?.map(skill => `- ${skill}`).join('\n') || '暂无技能标签'}

## 工作经历
${resume.workExperience?.map(exp => `### ${exp.company} (${exp.startDate} - ${exp.endDate})
- **职位**: ${exp.position}
- **描述**: ${exp.description || '暂无描述'}`).join('\n\n') || '暂无工作经历'}

## 分账方案 (30/40/30)
- **平台收益**: ¥${(splits.platform / 100).toFixed(2)} (30%)
- **推荐人收益**: ¥${(splits.referrer / 100).toFixed(2)} (40%)
- **候选人收益**: ¥${(splits.candidate / 100).toFixed(2)} (30%)

## 联系方式
- **邮箱**: ${email}
- **电话**: ${phone}
- **LinkedIn**: 未提供

---
*生成时间: ${new Date().toLocaleString()}*
*简历ID: ${resume.id}*
`;

    return md;
  }

  /**
   * 保存分账记录到简历元数据
   */
  private async saveSplitRecord(resumeId: string, splits: RevenueSplit, mdBusinessCard: string): Promise<void> {
    await this.resumeRepository.update(resumeId, {
      metadata: {
        ...({} as any),
        revenueSplit: splits,
        mdBusinessCard,
        splitProcessedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * 批量处理简历分账（用于后台任务）
   */
  async batchProcessSplits(resumeIds: string[], placementRevenue: number): Promise<SplitResult[]> {
    const results: SplitResult[] = [];

    for (const resumeId of resumeIds) {
      try {
        const result = await this.processRevenueSplit(resumeId, placementRevenue);
        results.push(result);
      } catch (error) {
        this.logger.error(`[资产闭环] 批量处理失败: ${resumeId}`, error);
      }
    }

    return results;
  }
}
