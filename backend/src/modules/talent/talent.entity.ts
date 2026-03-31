import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('talents')
@Index(['location', 'experience'])
@Index(['location', 'education'])
@Index(['jobStatus', 'location'])
@Index(['jobStatus', 'experience'])
@Index(['jobStatus', 'education'])
@Index(['createdAt'])
export class Talent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  currentTitle: string;

  @Column({ length: 100, nullable: true })
  currentCompany: string;

  @Column({ length: 20, nullable: true })
  experience: string; // 1-3 年，3-5 年，etc.

  @Column({ length: 20, nullable: true })
  education: string; // 本科，硕士，etc.

  @Column({ length: 50, nullable: true })
  location: string;

  @Column({ name: 'expected_salary', length: 20, nullable: true })
  expectedSalary: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ name: 'job_status', length: 20, nullable: true })
  jobStatus: string;

  @Column({ nullable: true })
  age: number;

  @Column({ length: 50, nullable: true })
  industry: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ name: 'job_type', length: 20, nullable: true })
  jobType: string; // 全职，兼职，实习

  @Column({ name: 'work_experience', length: 20, nullable: true })
  workExperience: string; // 工作年限范围

  @Column({ name: 'education_year', length: 20, nullable: true })
  educationYear: string; // 毕业年份范围

  @Column({ name: 'skills_count', nullable: true })
  skillsCount: number;

  @Index()
  @Column({ name: 'last_active', nullable: true })
  lastActive: Date;

  @Index()
  @Column({ name: 'match_score', default: 0 })
  matchScore: number;

  @Column({ name: 'personal_score', default: 0 })
  personalScore: number;

  @Column({ name: 'resume_complete', default: false })
  resumeComplete: boolean;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'tier', length: 10, default: 'C' }) // S, A, B, C
  @Index()
  tier: string;

  @Column({ name: 'classification', type: 'simple-array', nullable: true })
  classification: string[]; // ['技术', '前端', 'React']

  @Column({ name: 'score', default: 0 })
  score: number;

  @Column({ default: true })
  verified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
