import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

const redisAvailable = process.env.REDIS_HOST && process.env.REDIS_HOST !== 'localhost';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'resume-parsing',
      redis: redisAvailable ? {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT) || 6379,
      } : undefined,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: 10,
        removeOnFail: 10,
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
