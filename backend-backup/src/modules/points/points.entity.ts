import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('points')
export class Points {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 0 })
  points: number;

  @Column({ name: 'total_earned', default: 0 })
  totalEarned: number;

  @Column({ name: 'total_spent', default: 0 })
  totalSpent: number;

  @Column({ nullable: true, length: 200 })
  reason: string;

  @Column({ name: 'related_type', nullable: true, length: 50 })
  relatedType: string; // resume_download, search, etc.

  @Column({ name: 'related_id', nullable: true })
  relatedId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
