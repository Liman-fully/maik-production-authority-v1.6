import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { RedisService } from '../redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async check() {
    const healthcheck = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: await this.checkDatabase(),
        redis: await this.checkRedis(),
      },
    };

    const isHealthy = Object.values(healthcheck.services).every(
      (service: any) => service.status === 'up',
    );

    return {
      ...healthcheck,
      status: isHealthy ? 'ok' : 'error',
    };
  }

  private async checkDatabase() {
    try {
      await this.connection.query('SELECT 1');
      return { status: 'up' };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }

  private async checkRedis() {
    try {
      await this.redisService.ping();
      return { status: 'up' };
    } catch (error) {
      return { status: 'down', error: error.message };
    }
  }
}
