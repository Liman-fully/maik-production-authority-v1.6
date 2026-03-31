import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Membership, MembershipLevel } from './entities/membership.entity';

@Injectable()
export class MembershipService implements OnModuleInit {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    @InjectRepository(Membership)
    private membershipRepo: Repository<Membership>,
  ) {}

  async onModuleInit() {
    this.logger.log('MembershipService initialized');
  }

  async getActiveMembership(userId: string): Promise<Membership> {
    return this.membershipRepo.findOne({
      where: {
        userId,
        isActive: true,
        expiresAt: MoreThan(new Date()),
      },
      order: { expiresAt: 'DESC' },
    });
  }

  async createMembership(userId: string, level: MembershipLevel, days: number): Promise<Membership> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);

    const membership = this.membershipRepo.create({
      userId,
      level,
      expiresAt,
    });

    return this.membershipRepo.save(membership);
  }

  async checkPermission(userId: string, requiredLevel: MembershipLevel): Promise<boolean> {
    const active = await this.getActiveMembership(userId);
    if (!active) return requiredLevel === MembershipLevel.FREE;

    const levels = [MembershipLevel.FREE, MembershipLevel.VIP, MembershipLevel.SVIP];
    return levels.indexOf(active.level) >= levels.indexOf(requiredLevel);
  }
}
