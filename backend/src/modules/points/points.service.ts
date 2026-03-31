import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Points } from './points.entity';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(Points)
    private pointsRepo: Repository<Points>,
  ) {}

  async getUserPoints(userId: string): Promise<number> {
    const record = await this.pointsRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return record?.points || 0;
  }

  async earnPoints(
    userId: string,
    points: number,
    reason: string,
    relatedType?: string,
    relatedId?: string,
  ): Promise<Points> {
    const currentPoints = await this.getUserPoints(userId);
    const record = this.pointsRepo.create({
      userId,
      points: currentPoints + points,
      totalEarned: points,
      reason,
      relatedType,
      relatedId,
    });
    return this.pointsRepo.save(record);
  }

  async spendPoints(
    userId: string,
    points: number,
    reason: string,
    relatedType?: string,
    relatedId?: string,
  ): Promise<Points> {
    const currentPoints = await this.getUserPoints(userId);
    if (currentPoints < points) {
      throw new Error('积分不足');
    }
    const record = this.pointsRepo.create({
      userId,
      points: currentPoints - points,
      totalSpent: points,
      reason,
      relatedType,
      relatedId,
    });
    return this.pointsRepo.save(record);
  }
}
