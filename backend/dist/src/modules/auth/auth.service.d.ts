import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/redis/redis.service';
import { User, UserRole } from '../user/user.entity';
import { LoginDto, RegisterDto, SendSmsDto } from './dto/auth.dto';
import { SmsService } from '../../common/sms/sms.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private userRepo;
    private jwtService;
    private redisService;
    private smsService;
    private configService;
    constructor(userRepo: Repository<User>, jwtService: JwtService, redisService: RedisService, smsService: SmsService, configService: ConfigService);
    sendSmsCode(dto: SendSmsDto): Promise<{
        message: string;
    }>;
    private verifySmsCode;
    private generateToken;
    login(dto: LoginDto): Promise<{
        token: string;
        userInfo: {
            id: string;
            phone: string;
            name: string;
            role: UserRole;
            avatar: string;
            createdAt: Date;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        token: string;
        userInfo: {
            id: string;
            phone: string;
            name: string;
            role: UserRole;
            avatar: string;
            createdAt: Date;
        };
    }>;
}
