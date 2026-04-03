import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResumeContributionLog,
  AcnRoleContribution,
  AcnRoleWeight,
} from './acn.entity';

// 简化的角色类型
type ContributionRole = 'sower' | 'key_holder' | 'maintainer' | 'promoter' | 'reviewer';

/**
 * ACN (Human Capital Network) 分账服务
 * 实现40/60分成: 平台40%, 贡献池60%
 */
@Injectable()
export class AcnService {
  // 默认权重配置 (总和60%)
  private readonly DEFAULT_WEIGHTS: Record<ContributionRole, number> = {
    sower: 15,        // 初始上传者
    key_holder: 30,   // 关键信息持有者
    maintainer: 10,   // 维护者
    promoter: 35,     // 推广者
    reviewer: 10,     // 审核者
  };

  constructor(
    @InjectRepository(ResumeContributionLog)
    private contributionLogRepo: Repository<ResumeContributionLog>,
    @InjectRepository(AcnRoleContribution)
    private roleContributionRepo: Repository<AcnRoleContribution>,
    @InjectRepository(AcnRoleWeight)
    private roleWeightRepo: Repository<AcnRoleWeight>,
  ) {}

  /**
   * 执行分账计算
   */
  async distributeContribution(
    resumeId: string,
    downloaderId: string,
    amount: number,
    roleAssignments: Partial<Record<ContributionRole, string>>,
  ): Promise<ResumeContributionLog> {
    // 计算平台和贡献池金额 (40/60分成)
    const platformAmount = Math.round(amount * 0.4 * 100) / 100;
    const poolAmount = Math.round(amount * 0.6 * 100) / 100;

    // 创建贡献日志
    const contributionLog = this.contributionLogRepo.create({
      resumeId,
      downloaderId,
      totalAmount: amount,
      platformAmount,
      poolAmount,
      status: 'pending',
    });
    await this.contributionLogRepo.save(contributionLog);

    // 获取当前权重配置
    const weights = await this.getActiveWeights();

    // 为每个角色创建贡献明细
    const roleContributions: Partial<AcnRoleContribution>[] = [];
    
    for (const [role, userId] of Object.entries(roleAssignments)) {
      if (userId) {
        const roleKey = role as ContributionRole;
        const weight = weights[roleKey] || this.DEFAULT_WEIGHTS[roleKey] || 0;
        const roleAmount = Math.round((poolAmount * weight / 100) * 100) / 100;

        if (roleAmount > 0) {
          roleContributions.push({
            contributionLogId: contributionLog.id,
            userId,
            role: roleKey,
            amount: roleAmount,
            weight,
            status: 'pending',
          });
        }
      }
    }

    // 批量保存角色贡献
    if (roleContributions.length > 0) {
      await this.roleContributionRepo.save(roleContributions as AcnRoleContribution[]);
    }

    return contributionLog;
  }

  /**
   * 获取当前活跃的权重配置
   */
  async getActiveWeights(): Promise<Record<ContributionRole, number>> {
    const activeWeights = await this.roleWeightRepo.find({
      where: { isActive: true },
    });

    const weights: Record<string, number> = { ...this.DEFAULT_WEIGHTS };
    for (const w of activeWeights) {
      weights[w.role] = Number(w.weight);
    }
    return weights as Record<ContributionRole, number>;
  }

  /**
   * 确认并标记为已支付
   */
  async confirmPayment(contributionLogId: string): Promise<void> {
    await this.contributionLogRepo.update(contributionLogId, {
      status: 'confirmed',
      paidAt: new Date(),
    });

    await this.roleContributionRepo.update(
      { contributionLogId: contributionLogId },
      { status: 'confirmed', paidAt: new Date() },
    );
  }

  /**
   * 获取用户的累计收益
   */
  async getUserTotalEarnings(userId: string): Promise<number> {
    const result = await this.roleContributionRepo
      .createQueryBuilder('rc')
      .select('SUM(rc.amount)', 'total')
      .where('rc.userId = :userId', { userId })
      .andWhere('rc.status IN (:...statuses)', {
        statuses: ['confirmed', 'paid'],
      })
      .getRawOne();
    
    return Number(result?.total || 0);
  }

  /**
   * 获取用户的待结算收益
   */
  async getUserPendingEarnings(userId: string): Promise<number> {
    const result = await this.roleContributionRepo
      .createQueryBuilder('rc')
      .select('SUM(rc.amount)', 'total')
      .where('rc.userId = :userId', { userId })
      .andWhere('rc.status = :status', { status: 'pending' })
      .getRawOne();
    
    return Number(result?.total || 0);
  }

  /**
   * 初始化默认权重配置
   */
  async initializeDefaultWeights(): Promise<void> {
    for (const [role, weight] of Object.entries(this.DEFAULT_WEIGHTS)) {
      const existing = await this.roleWeightRepo.findOne({
        where: { role },
      });

      if (!existing) {
        await this.roleWeightRepo.save({
          role,
          weight,
          isActive: true,
        });
      }
    }
  }
}