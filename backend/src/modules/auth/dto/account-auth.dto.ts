import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, IsEnum, IsMobilePhone, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../user/user.entity';

export class AccountRegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '13800138000', required: false })
  @IsMobilePhone('zh-CN')
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '张三' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SEEKER })
  @IsEnum(UserRole)
  role: UserRole;
}

export class AccountLoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  identifier: string; // 可以是email或phone

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  @IsNotEmpty()
  identifier: string; // 可以是email或phone
}

export class ResetPasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: 'NewStrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  newPassword: string;

  @ApiProperty({ example: 'NewStrongPassword123!' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class OnboardingDto {
  @ApiProperty({ example: '张三' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiProperty({ example: '高级前端工程师' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ example: '字节跳动' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  company?: string;

  @ApiProperty({ example: '热爱技术，追求卓越' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({ example: '北京' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsString()
  @IsOptional()
  birthday?: string;

  @ApiProperty({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar?: string;
}
