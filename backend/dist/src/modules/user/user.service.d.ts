import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UserService {
    private userRepo;
    private readonly logger;
    constructor(userRepo: Repository<User>);
    findById(id: string): Promise<User>;
    findByPhone(phone: string): Promise<User>;
    updateProfile(id: string, updateData: Partial<User>): Promise<User>;
    countByIdCard(idCard: string): Promise<number>;
}
