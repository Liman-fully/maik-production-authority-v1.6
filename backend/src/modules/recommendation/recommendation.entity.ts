import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

/**
 * 推荐记录实体
 * 存储为用户生成的候选人推荐及其匹配分数
 */
@Entity('recommendations')
@Index(['userId', 'createdAt'])
@Index(['score'])
export class Recommendation {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Index()
  @Column('uuid', { name: 'candidate_id' })
  candidateId: string;

  /**
   * 推荐分数 (0.0000 - 1.0000)
   * 分数越高表示匹配度越好
   */
  @Column('decimal', { precision: 5, scale: 4, default: 0 })
  score: number;

  /**
   * 推荐理由（JSON 格式）
   * 包含各维度的匹配详情
   */
  @Column('json', { name: 'reason', nullable: true })
  reason: {
    skillMatch?: number;      // 技能匹配度 (0-1)
    industryMatch?: number;   // 行业匹配度 (0-1)
    positionMatch?: number;   // 职位匹配度 (0-1)
    popularity?: number;      // 热度分 (0-1)
    matchedSkills?: string[]; // 匹配的技能列表
    matchedKeywords?: string[]; // 匹配的关键词
  };

  /**
   * 推荐状态
   * pending: 待展示
   * shown: 已展示给用户
   * clicked: 用户点击查看
   * ignored: 用户忽略
   */
  @Column({ default: 'pending' })
  status: 'pending' | 'shown' | 'clicked' | 'ignored';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at', nullable: true })
  updatedAt: Date;
}
