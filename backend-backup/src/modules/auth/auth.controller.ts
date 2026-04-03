import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, SendSmsDto } from './dto/auth.dto';

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
}
