import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

// 简化的角色类型 (避免TypeORM自动创建enum导致冲突)
export type ContributionRole = 'sower' | 'key_holder' | 'maintainer' | 'promoter' | 'reviewer';
export type ContributionStatus = 'pending' | 'confirmed' | 'paid' | 'disputed';

/**
 * ACN (Human Capital Network) 贡献日志表
 * 记录每次简历下载/推荐产生的贡献分配
 */
@Entity('resume_contribution_logs')
export class ResumeContributionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'resume_id' })
  resumeId: string;

  @Index()
  @Column({ name: 'downloader_id' })
  downloaderId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'platform_amount', type: 'decimal', precision: 10, scale: 2 })
  platformAmount: number;

  @Column({ name: 'pool_amount', type: 'decimal', precision: 10, scale: 2 })
  poolAmount: number;

  @Index()
  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId: string;

  @Column({ name: 'resume_title', nullable: true, length: 200 })
  resumeTitle: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;
}

/**
 * ACN 角色贡献明细表
 */
@Entity('acn_role_contributions')
export class AcnRoleContribution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'contribution_log_id' })
  contributionLogId: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 'sower' })
  role: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 0 })
  weight: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'paid_at', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

/**
 * ACN 角色权重配置
 */
@Entity('acn_role_weights')
export class AcnRoleWeight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  role: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}