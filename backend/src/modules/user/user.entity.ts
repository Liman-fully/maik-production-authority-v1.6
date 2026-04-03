import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, BeforeInsert, BeforeUpdate
} from 'typeorm';
import * as bcrypt from 'bcrypt';

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

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 11, nullable: true })
  phone: string;

  @Index({ unique: true })
  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50 })
  name: string;

  @Column({ name: 'hash_password', length: 255, nullable: true })
  hashPassword: string;

  @Column({ length: 32, nullable: true })
  salt: string;

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

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 100, nullable: true })
  location: string;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', length: 45, nullable: true })
  lastLoginIp: string;

  @Column({ name: 'is_onboarding_completed', default: false })
  isOnboardingCompleted: boolean;

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
    if (this.hashPassword && !this.hashPassword.startsWith('$2b$')) {
      const saltRounds = 10;
      this.salt = await bcrypt.genSalt(saltRounds);
      this.hashPassword = await bcrypt.hash(this.hashPassword, this.salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.hashPassword) return false;
    return bcrypt.compare(password, this.hashPassword);
  }
}
