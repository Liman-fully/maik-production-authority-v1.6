import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('resumes')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @Column({ name: 'file_type', length: 20 })
  fileType: string; // pdf, docx, jpg, png

  // COS 存储相关字段
  @Column({ name: 'cos_url', nullable: true })
  cosUrl: string; // COS 文件 URL

  @Column({ name: 'cos_key', nullable: true })
  cosKey: string; // COS 对象 key，用于删除

  @Column({ name: 'local_path', nullable: true })
  localPath: string; // 本地备份路径

  @Column({ name: 'parse_status', default: 'pending' })
  parseStatus: string; // pending, processing, success, failed

  @Column({ name: 'parse_error', type: 'text', nullable: true })
  parseError: string;

  // 解析后的结构化数据
  @Column({ type: 'json', nullable: true })
  basicInfo: {
    name?: string;
    phone?: string;
    email?: string;
    age?: number;
    gender?: string;
    location?: string;
  };

  @Column({ type: 'json', nullable: true })
  education: Array<{
    school: string;
    major: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;

  @Column({ type: 'json', nullable: true })
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  @Column({ type: 'json', nullable: true })
  projects: Array<{
    name: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;

  @Column({ type: 'json', nullable: true })
  skills: string[];

  @Column({ type: 'json', nullable: true })
  certifications: Array<{
    name: string;
    date: string;
    organization: string;
  }>;

  @Column({ type: 'json', nullable: true })
  jobIntention: {
    expectedPosition?: string;
    expectedSalary?: string;
    expectedLocation?: string;
    jobStatus?: string; // actively_looking, open_to_offers, not_looking
  };

  // 自动生成的标签
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // 关联的人才ID（如果已入库到人才库）
  @Column({ name: 'talent_id', nullable: true })
  @Index()
  talentId: string;

  // 文件夹ID
  @Column({ name: 'folder_id', nullable: true })
  @Index()
  folderId: string;

  @Column({ name: 'score', default: 0 })
  score: number;

  @Column({ name: 'tier', length: 10, default: 'C' }) // S, A, B, C
  @Index()
  tier: string;

  // 是否公开到人才广场
  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  // 来源
  @Column({ name: 'source', default: 'upload' })
  source: string; // upload, email, import

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
