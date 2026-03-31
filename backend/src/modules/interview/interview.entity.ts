import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { Job } from '../job/job.entity';

export type InterviewStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

@Entity('interview')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  candidateId: number;

  @ManyToOne(() => Candidate, { nullable: false })
  @JoinColumn({ name: 'candidateId' })
  candidate: Candidate;

  @Column({ type: 'uuid' })
  jobId: string;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: InterviewStatus;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'int', nullable: true })
  score: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}

