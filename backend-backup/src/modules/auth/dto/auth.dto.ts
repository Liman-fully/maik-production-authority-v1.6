import { IsString, IsEnum, IsMobilePhone, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '13800138000' })
  @IsMobilePhone('zh-CN')
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class RegisterDto {
  @ApiProperty({ example: '13800138000' })
  @IsMobilePhone('zh-CN')
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: '张三' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '110101199001011234' })
  @IsString()
  @Length(18, 18)
  idCard: string;

  @ApiProperty({ enum: ['hr', 'seeker'] })
  @IsEnum(['hr', 'seeker'])
  role: 'hr' | 'seeker';
}

export class SendSmsDto {
  @ApiProperty({ example: '13800138000' })
  @IsMobilePhone('zh-CN')
  phone: string;

  @ApiProperty({ enum: ['login', 'register'] })
  @IsEnum(['login', 'register'])
  type: 'login' | 'register';
}
