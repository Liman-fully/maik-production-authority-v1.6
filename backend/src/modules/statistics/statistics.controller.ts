import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  async getOverview() {
    return this.statisticsService.getOverview();
  }

  @Get('funnel')
  async getFunnel() {
    return this.statisticsService.getFunnel();
  }

  @Get('trend')
  async getTrend() {
    return this.statisticsService.getTrend();
  }
}
