import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';

export enum UserRole {
  HR = 'hr',
  SEEKER = 'seeker',
}

export enum UserTier {
  FREE = 'free',
  PAID = 'paid',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 11 })
  phone: string;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'id_card', length: 18, nullable: true })
  idCard: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SEEKER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserTier, default: UserTier.FREE })
  tier: UserTier;

  @Column({ nullable: true, length: 500 })
  avatar: string;

  @Column({ nullable: true, length: 200 })
  company: string;

  // 推荐人ID（用于分账）
  @Column({ name: 'referrer_id', nullable: true })
  referrerId: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ default: false, name: 'is_blocked' })
  isBlocked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
