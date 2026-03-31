export declare class LoginDto {
    phone: string;
    code: string;
}
export declare class RegisterDto {
    phone: string;
    code: string;
    name: string;
    idCard: string;
    role: 'hr' | 'seeker';
}
export declare class SendSmsDto {
    phone: string;
    type: 'login' | 'register';
}
