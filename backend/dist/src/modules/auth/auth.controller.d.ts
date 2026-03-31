import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendSmsDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendSmsCode(dto: SendSmsDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        userInfo: {
            id: string;
            phone: string;
            name: string;
            role: import("../user/user.entity").UserRole;
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
            role: import("../user/user.entity").UserRole;
            avatar: string;
            createdAt: Date;
        };
    }>;
}
