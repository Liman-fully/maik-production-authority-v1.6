import { Controller, Post, Body, HttpCode, UseGuards, Req, Get, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendSmsDto } from './dto/auth.dto';
import { AccountRegisterDto, AccountLoginDto, ForgotPasswordDto, ResetPasswordDto, OnboardingDto } from './dto/account-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sms-code')
  @ApiOperation({ summary: '发送短信验证码' })
  sendSmsCode(@Body() dto: SendSmsDto) {
    return this.authService.sendSmsCode(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '手机号+验证码登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: '注册新账号' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/account')
  @ApiOperation({ summary: '账号密码注册' })
  registerWithAccount(@Body() dto: AccountRegisterDto) {
    return this.authService.registerWithAccount(dto);
  }

  @Post('login/account')
  @HttpCode(200)
  @ApiOperation({ summary: '账号密码登录' })
  loginWithAccount(@Body() dto: AccountLoginDto) {
    return this.authService.loginWithAccount(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Put('onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '完成用户引导流程' })
  updateOnboarding(@Req() req, @Body() dto: OnboardingDto) {
    return this.authService.updateOnboarding(req.user.id, dto);
  }

  @Get('onboarding-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户引导状态' })
  getOnboardingStatus(@Req() req) {
    return this.authService.getOnboardingStatus(req.user.id);
  }
}
