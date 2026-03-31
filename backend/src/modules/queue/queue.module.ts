import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'resume-parsing',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
