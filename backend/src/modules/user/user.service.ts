import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<User> {
    return this.userRepo.findOne({ where: { phone } });
  }

  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepo.update(id, updateData);
    return this.findById(id);
  }

  async countByIdCard(idCard: string): Promise<number> {
    return this.userRepo.count({ where: { idCard } });
  }
}
