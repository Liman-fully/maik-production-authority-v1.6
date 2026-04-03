import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * 简历下载记录实体
 * 用于追踪简历下载行为，保护平台资产
 */
@Entity('download_records')
export class DownloadRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'resume_id' })
  @Index()
  resumeId: string;

  @Column({ name: 'original_file_name' })
  originalFileName: string;

  @Column({ name: 'standard_file_name' })
  standardFileName: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'download_type' })
  downloadType: string; // single, batch

  @Column({ name: 'candidate_name', nullable: true })
  candidateName: string;

  @Column({ name: 'candidate_phone', nullable: true })
  candidatePhone: string;

  @Column({ name: 'expected_position', nullable: true })
  expectedPosition: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'downloaded_at' })
  downloadedAt: Date;

  @Column({ name: 'is_anonymized', default: true })
  isAnonymized: boolean;

  @Column({ name: 'export_format', default: 'pdf' })
  exportFormat: string; // pdf, excel
}
