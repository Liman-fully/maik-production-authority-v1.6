import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../common/redis/redis.service';
import { User, UserRole } from '../user/user.entity';
import { LoginDto, RegisterDto, SendSmsDto } from './dto/auth.dto';
import { AccountRegisterDto, AccountLoginDto, ForgotPasswordDto, ResetPasswordDto, OnboardingDto } from './dto/account-auth.dto';
import { SmsService } from '../../common/sms/sms.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private redisService: RedisService,
    private smsService: SmsService,
    private configService: ConfigService,
  ) {}

  async sendSmsCode(dto: SendSmsDto) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 5 * 60; // 5 minutes

    // 修复: 使用 redisService.set() 而不是直接调用 getClient().setex()，以支持内存缓存降级
    await this.redisService.set(`sms:${dto.phone}`, code, ttl);

    // Get template ID based on type
    const templateId = dto.type === 'register' 
      ? this.configService.get<string>('TENCENT_SMS_TEMPLATE_REGISTER') 
      : this.configService.get<string>('TENCENT_SMS_TEMPLATE_LOGIN');

    // Send via Tencent Cloud
    await this.smsService.sendVerificationCode(dto.phone, code, templateId);

    return { message: '验证码已发送' };
  }

  private async verifySmsCode(phone: string, code: string): Promise<boolean> {
    // 修复: 使用 redisService.get() 支持降级
    const storedCode = await this.redisService.get(`sms:${phone}`);

    if (!storedCode) return false;
    if (storedCode !== code) return false;

    // Delete verification code after successful verification (prevent reuse)
    await this.redisService.del(`sms:${phone}`);
    return true;
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      token: this.jwtService.sign(payload),
      userInfo: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        tier: user.tier,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    };
  }

  async login(dto: LoginDto) {
    const isValid = await this.verifySmsCode(dto.phone, dto.code);
    if (!isValid) throw new UnauthorizedException('验证码错误或已过期');

    let user = await this.userRepo.findOne({ where: { phone: dto.phone } });
    
    // 静默注册逻辑：如果用户不存在，则自动创建
    if (!user) {
      user = this.userRepo.create({
        phone: dto.phone,
        name: `用户_${dto.phone.slice(-4)}`, 
        idCard: 'PENDING', 
        role: UserRole.SEEKER, 
      });
      await this.userRepo.save(user);
    }

    if (!user.isActive) throw new UnauthorizedException('账号已被禁用');

    return this.generateToken(user);
  }

  async register(dto: RegisterDto) {
    // 生产环境必须使用真实短信验证，禁止硬编码万能码
    const isValid = await this.verifySmsCode(dto.phone, dto.code);
    if (!isValid) throw new UnauthorizedException('验证码错误或已过期');

    // Check phone uniqueness
    const existByPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
    if (existByPhone) throw new BadRequestException('该手机号已注册');

    // Check idCard registration count (max 3)
    const idCardCount = await this.userRepo.count({ where: { idCard: dto.idCard } });
    if (idCardCount >= 3)
      throw new BadRequestException('同一身份证最多注册3个账号');

    // Map string role to UserRole enum
    const role = dto.role === 'hr' ? UserRole.HR : UserRole.SEEKER;
    const user = this.userRepo.create({
      phone: dto.phone,
      name: dto.name,
      idCard: dto.idCard,
      role,
    });
    await this.userRepo.save(user);
    return this.generateToken(user);
  }

  async registerWithAccount(dto: AccountRegisterDto) {
    // 验证两次密码是否一致
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('两次输入的密码不一致');
    }

    // 检查邮箱是否已注册
    const existByEmail = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existByEmail) throw new BadRequestException('该邮箱已注册');

    // 检查手机号是否已注册（如果提供了手机号）
    if (dto.phone) {
      const existByPhone = await this.userRepo.findOne({ where: { phone: dto.phone } });
      if (existByPhone) throw new BadRequestException('该手机号已注册');
    }

    // 创建新用户
    const user = this.userRepo.create({
      email: dto.email,
      phone: dto.phone || null,
      name: dto.name,
      hashPassword: dto.password, // 会自动通过 @BeforeInsert 钩子加密
      role: dto.role,
      isOnboardingCompleted: false, // 新用户需要完成引导
    });

    await this.userRepo.save(user);
    return this.generateToken(user);
  }

  async loginWithAccount(dto: AccountLoginDto) {
    // 判断identifier是邮箱还是手机号
    let user: User;
    if (dto.identifier.includes('@')) {
      // 邮箱登录
      user = await this.userRepo.findOne({ 
        where: { email: dto.identifier } 
      });
    } else {
      // 手机号登录
      user = await this.userRepo.findOne({ 
        where: { phone: dto.identifier } 
      });
    }

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 检查用户是否设置了密码
    if (!user.hashPassword) {
      throw new UnauthorizedException('该账号未设置密码，请使用验证码登录');
    }

    // 验证密码
    const isValid = await user.validatePassword(dto.password);
    if (!isValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    // 更新最后登录信息（这里需要IP地址，实际应用中从请求中获取）
    user.lastLoginAt = new Date();
    // user.lastLoginIp = ip; // 实际应用中从请求中获取IP
    await this.userRepo.save(user);

    return this.generateToken(user);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // 查找用户
    let user: User;
    if (dto.identifier.includes('@')) {
      user = await this.userRepo.findOne({ where: { email: dto.identifier } });
    } else {
      user = await this.userRepo.findOne({ where: { phone: dto.identifier } });
    }

    if (!user) {
      // 出于安全考虑，不告诉用户账号不存在
      return { message: '如果账号存在，重置密码的邮件/短信已发送' };
    }

    // 生成重置密码验证码
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const ttl = 15 * 60; // 15分钟

    await this.redisService.set(`reset:${user.id}`, resetCode, ttl);

    // 根据用户联系方式发送验证码
    if (user.email) {
      // 发送邮件（这里需要实现邮件服务）
      // await this.emailService.sendResetCode(user.email, resetCode);
      console.log(`发送重置密码验证码到邮箱 ${user.email}: ${resetCode}`);
    } else if (user.phone) {
      // 发送短信
      const templateId = this.configService.get<string>('TENCENT_SMS_TEMPLATE_RESET');
      await this.smsService.sendVerificationCode(user.phone, resetCode, templateId);
    }

    return { 
      message: '重置密码验证码已发送',
      target: user.email ? 'email' : 'phone'
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // 验证两次密码是否一致
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('两次输入的新密码不一致');
    }

    // 这里需要用户ID来验证验证码，实际应用中需要额外的参数或从token中获取
    // 为了简化，这里假设有一个机制获取用户ID
    
    throw new BadRequestException('重置密码功能需要额外实现用户ID验证机制');
  }

  async updateOnboarding(userId: string, dto: OnboardingDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // 更新用户信息
    if (dto.name) user.name = dto.name;
    if (dto.title) user.company = dto.title;
    if (dto.company) user.company = dto.company;
    if (dto.bio) user.bio = dto.bio;
    if (dto.location) user.location = dto.location;
    if (dto.birthday) user.birthday = new Date(dto.birthday);
    if (dto.gender) user.gender = dto.gender as any;
    if (dto.avatar) user.avatar = dto.avatar;

    // 标记引导完成
    user.isOnboardingCompleted = true;

    await this.userRepo.save(user);

    return {
      success: true,
      isCompleted: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        isOnboardingCompleted: user.isOnboardingCompleted,
      }
    };
  }

  async getOnboardingStatus(userId: string) {
    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      select: ['id', 'name', 'email', 'role', 'isOnboardingCompleted', 'avatar', 'company', 'bio', 'location', 'gender', 'birthday']
    });

    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    // Determine completed and pending steps
    const completedSteps: string[] = [];
    const pendingSteps: string[] = [];

    // 个人信息
    if (user.name) completedSteps.push('profile');
    else pendingSteps.push('profile');

    // 头像
    if (user.avatar) completedSteps.push('avatar');
    else pendingSteps.push('avatar');

    // 个人简介
    if (user.bio) completedSteps.push('bio');
    else pendingSteps.push('bio');

    // 地区
    if (user.location) completedSteps.push('location');
    else pendingSteps.push('location');

    // 性别
    if (user.gender) completedSteps.push('gender');
    else pendingSteps.push('gender');

    // 生日
    if (user.birthday) completedSteps.push('birthday');
    else pendingSteps.push('birthday');

    return {
      isCompleted: user.isOnboardingCompleted,
      completedSteps,
      pendingSteps,
      userInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        company: user.company,
        bio: user.bio,
        location: user.location,
        gender: user.gender,
        birthday: user.birthday,
      }
    };
  }
}
