import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talent } from './talent.entity';
import { TalentService } from './talent.service';
import { TalentController } from './talent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Talent])],
  controllers: [TalentController],
  providers: [TalentService],
  exports: [TalentService],
})
export class TalentModule {}
