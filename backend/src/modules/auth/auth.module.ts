import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../user/user.entity';
import { IdCardRecord } from './entities/id-card-record.entity';
import { SmsModule } from '../../common/sms/sms.module';

@Module({
  imports: [
    PassportModule,
    SmsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        const secret = process.env.JWT_SECRET || 'huntlink-jwt-secret-key-2026-change-in-production';
        return {
          secret,
          signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
        };
      },
    }),
    TypeOrmModule.forFeature([User, IdCardRecord]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
