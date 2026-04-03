import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type JobStatus = 'draft' | 'published' | 'closed';
export type JobType = 'full-time' | 'part-time' | 'internship';
export type UrgencyLevel = 'normal' | 'urgent' | 'very-urgent';

@Entity('job')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ========== 基础信息 ==========
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  jobType: JobType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'int', nullable: true })
  headcount: number;

  // ========== 薪资福利 ==========
  @Column({ type: 'int', nullable: true })
  minSalary: number;

  @Column({ type: 'int', nullable: true })
  maxSalary: number;

  @Column({ type: 'boolean', default: false })
  salaryNegotiable: boolean;

  @Column({ type: 'simple-array', nullable: true })
  benefits: string[];

  // ========== 职位要求 ==========
  @Column({ type: 'varchar', length: 20, nullable: true })
  education: string;

  @Column({ type: 'int', nullable: true })
  minExperience: number;

  @Column({ type: 'int', nullable: true })
  maxExperience: number;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  // ========== 职位描述 ==========
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  requirements: string;

  // ========== 高级设置 ==========
  @Column({ type: 'varchar', length: 20, default: 'normal' })
  urgency: UrgencyLevel;

  @Column({ type: 'int', nullable: true })
  referralBonus: number;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  // ========== 状态管理 ==========
  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: JobStatus;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
