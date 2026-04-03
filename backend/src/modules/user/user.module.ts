import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MembershipModule } from '../membership/membership.module';
import { PointsModule } from '../points/points.module';
import { CosModule } from '../../common/storage/cos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MembershipModule,
    PointsModule,
    CosModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
