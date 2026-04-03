import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

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
  @Column({ length: 11, nullable: true })
  phone: string;

  @Index({ unique: true })
  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ name: 'hash_password', nullable: true })
  hashPassword: string;

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

  @Column({ nullable: true, length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true, length: 100 })
  location: string;

  @Column({ nullable: true, length: 10 })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ name: 'last_login_ip', nullable: true, length: 45 })
  lastLoginIp: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'is_onboarding_completed', default: false })
  isOnboardingCompleted: boolean;

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPasswordBeforeSave() {
    if (this.hashPassword && !this.hashPassword.startsWith('$2')) {
      this.hashPassword = await bcrypt.hash(this.hashPassword, 10);
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    if (!this.hashPassword) return false;
    return bcrypt.compare(plainPassword, this.hashPassword);
  }
}
