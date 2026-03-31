"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const redis_service_1 = require("../../common/redis/redis.service");
const user_entity_1 = require("../user/user.entity");
const sms_service_1 = require("../../common/sms/sms.service");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(userRepo, jwtService, redisService, smsService, configService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.smsService = smsService;
        this.configService = configService;
    }
    async sendSmsCode(dto) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const ttl = 5 * 60;
        const redis = this.redisService.getClient();
        await redis.setex(`sms:${dto.phone}`, ttl, code);
        const templateId = dto.type === 'register'
            ? this.configService.get('TENCENT_SMS_TEMPLATE_REGISTER')
            : this.configService.get('TENCENT_SMS_TEMPLATE_LOGIN');
        await this.smsService.sendVerificationCode(dto.phone, code, templateId);
        return { message: '验证码已发送' };
    }
    async verifySmsCode(phone, code) {
        const redis = this.redisService.getClient();
        const storedCode = await redis.get(`sms:${phone}`);
        if (!storedCode)
            return false;
        if (storedCode !== code)
            return false;
        await redis.del(`sms:${phone}`);
        return true;
    }
    generateToken(user) {
        const payload = { sub: user.id, phone: user.phone, role: user.role };
        return {
            token: this.jwtService.sign(payload),
            userInfo: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
        };
    }
    async login(dto) {
        const isValid = await this.verifySmsCode(dto.phone, dto.code);
        if (!isValid)
            throw new common_1.UnauthorizedException('验证码错误或已过期');
        let user = await this.userRepo.findOne({ where: { phone: dto.phone } });
        if (!user) {
            user = this.userRepo.create({
                phone: dto.phone,
                name: `用户_${dto.phone.slice(-4)}`,
                idCard: 'PENDING',
                role: user_entity_1.UserRole.SEEKER,
            });
            await this.userRepo.save(user);
        }
        if (!user.isActive)
            throw new common_1.UnauthorizedException('账号已被禁用');
        return this.generateToken(user);
    }
    async register(dto) {
        const isValid = await this.verifySmsCode(dto.phone, dto.code);
        if (!isValid)
            throw new common_1.UnauthorizedException('验证码错误或已过期');
        const existByPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
        if (existByPhone)
            throw new common_1.BadRequestException('该手机号已注册');
        const idCardCount = await this.userRepo.count({ where: { idCard: dto.idCard } });
        if (idCardCount >= 3)
            throw new common_1.BadRequestException('同一身份证最多注册3个账号');
        const role = dto.role === 'hr' ? user_entity_1.UserRole.HR : user_entity_1.UserRole.SEEKER;
        const user = this.userRepo.create({
            phone: dto.phone,
            name: dto.name,
            idCard: dto.idCard,
            role,
        });
        await this.userRepo.save(user);
        return this.generateToken(user);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        redis_service_1.RedisService,
        sms_service_1.SmsService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map