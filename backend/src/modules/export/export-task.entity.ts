import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('export_tasks')
export class ExportTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 20 })
  format: string; // pdf | excel

  @Column({ length: 20, default: 'pending' })
  status: string; // pending, processing, completed, failed

  @Column({ name: 'total_count', default: 0 })
  totalCount: number;

  @Column({ name: 'processed_count', default: 0 })
  processedCount: number;

  @Column({ name: 'file_path', nullable: true })
  filePath: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;
}
