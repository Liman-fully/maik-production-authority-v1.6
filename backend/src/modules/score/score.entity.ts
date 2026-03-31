import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('score_records')
export class ScoreRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Index()
  @Column({ name: 'talent_id', nullable: true })
  talentId: string;

  @Column({ name: 'resume_id', nullable: true })
  resumeId: string;

  @Column({ length: 20 })
  @Index()
  type: string; // personal | match

  @Column({ name: 'total_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalScore: number;

  @Column({ type: 'json', nullable: true })
  breakdown: {
    // 个人优秀度维度
    education?: { score: number; label: string; detail: string };
    experience?: { score: number; label: string; detail: string };
    skills?: { score: number; label: string; detail: string };
    certifications?: { score: number; label: string; detail: string };
    projects?: { score: number; label: string; detail: string };
    stability?: { score: number; label: string; detail: string };
    // 岗位匹配维度
    positionMatch?: { score: number; label: string; detail: string };
    salaryMatch?: { score: number; label: string; detail: string };
    locationMatch?: { score: number; label: string; detail: string };
    experienceMatch?: { score: number; label: string; detail: string };
    skillMatch?: { score: number; label: string; detail: string };
  };

  @Column({ type: 'json', nullable: true })
  matchContext: {
    jobId?: string;
    jobTitle?: string;
    jobRequirements?: string[];
    requiredSkills?: string[];
    salaryRange?: { min: number; max: number };
    location?: string;
    experienceRequired?: string;
  };

  @Column({ name: 'score_version', default: 'v1' })
  scoreVersion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
