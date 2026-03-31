import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('points')
@UseGuards(JwtAuthGuard)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    const points = await this.pointsService.getUserPoints(req.user.id);
    return { success: true, data: { points } };
  }

  @Post('earn')
  async earnPoints(
    @Request() req,
    @Body() body: { points: number; reason: string },
  ) {
    const record = await this.pointsService.earnPoints(
      req.user.id,
      body.points,
      body.reason,
    );
    return { success: true, data: record };
  }
}
