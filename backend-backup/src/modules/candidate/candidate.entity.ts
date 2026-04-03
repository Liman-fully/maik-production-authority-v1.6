import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 20, unique: true })
  mobile: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Index()
  @Column({ name: 'work_years', default: 0 })
  workYears: number;

  @Index()
  @Column({ length: 50, nullable: true })
  city: string;

  @Index()
  @Column({ name: 'education_level', nullable: true })
  educationLevel: number;  // 1:本科，2:硕士，3:博士

  @Column({ name: 'resume_jsonb', type: 'json', nullable: true })
  resumeJsonb: any;

  @Column({ name: 'resume_url', length: 255, nullable: true })
  resumeUrl: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'group_id', nullable: true })
  groupId: number;

  @Column({ name: 'group_name', length: 50, nullable: true })
  groupName: string;

  // 猎头业务扩展字段
  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 50, default: 'new' })
  status: string; // new, contacted, interviewed, offered, rejected

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
