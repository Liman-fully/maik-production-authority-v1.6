import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

/**
 * 下载审计日志
 * 记录所有简历下载操作，用于安全审计和频率限制分析
 */
@Entity('download_logs')
export class DownloadLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: number;

  @Column({ name: 'resume_id', nullable: true })
  @Index()
  resumeId: number;

  @Column({ name: 'task_id', nullable: true })
  @Index()
  taskId: string;

  @Column({ name: 'download_type', default: 'single' })
  @Index()
  downloadType: 'single' | 'batch';

  @Column({ name: 'file_format', nullable: true })
  fileFormat: string;

  @Column({ name: 'file_size_bytes', nullable: true })
  fileSizeBytes: number;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'status', default: 'success' })
  @Index()
  status: 'success' | 'failed' | 'blocked';

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
