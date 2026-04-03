import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScoreService } from './score.service';
import { CalculatePersonalScoreDto, CalculateMatchScoreDto } from './score.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('评分系统')
@ApiBearerAuth()
@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Post('personal')
  @ApiOperation({ summary: '计算个人优秀度评分 (0-100)' })
  async calculatePersonalScore(@Body() dto: CalculatePersonalScoreDto) {
    const record = await this.scoreService.calculatePersonalScore(dto);
    return {
      success: true,
      data: {
        totalScore: Number(record.totalScore),
        breakdown: record.breakdown,
        type: 'personal',
        calculatedAt: record.createdAt,
      },
    };
  }

  @Post('match')
  @ApiOperation({ summary: '计算岗位匹配度评分 (0-100)' })
  async calculateMatchScore(@Body() dto: CalculateMatchScoreDto) {
    const record = await this.scoreService.calculateMatchScore(dto);
    return {
      success: true,
      data: {
        totalScore: Number(record.totalScore),
        breakdown: record.breakdown,
        matchContext: record.matchContext,
        type: 'match',
        calculatedAt: record.createdAt,
      },
    };
  }

  @Get('talent/:talentId')
  @ApiOperation({ summary: '获取人才的所有评分' })
  async getTalentScores(@Param('talentId') talentId: string) {
    const scores = await this.scoreService.getScores(talentId);
    return {
      success: true,
      data: {
        personal: scores.personal
          ? { totalScore: Number(scores.personal.totalScore), breakdown: scores.personal.breakdown }
          : null,
        match: scores.match.map(r => ({
          totalScore: Number(r.totalScore),
          breakdown: r.breakdown,
          matchContext: r.matchContext,
          calculatedAt: r.createdAt,
        })),
      },
    };
  }

  @Get('leaderboard/personal')
  @ApiOperation({ summary: '个人优秀度排行榜' })
  async getPersonalLeaderboard(@Query('limit') limit: number = 50) {
    const records = await this.scoreService.getLeaderboard('personal', limit);
    return {
      success: true,
      data: records.map(r => ({
        talentId: r.talentId,
        totalScore: Number(r.totalScore),
        breakdown: r.breakdown,
      })),
    };
  }

  @Get('leaderboard/match')
  @ApiOperation({ summary: '岗位匹配度排行榜' })
  async getMatchLeaderboard(@Query('limit') limit: number = 50) {
    const records = await this.scoreService.getLeaderboard('match', limit);
    return {
      success: true,
      data: records.map(r => ({
        talentId: r.talentId,
        totalScore: Number(r.totalScore),
        matchContext: r.matchContext,
        calculatedAt: r.createdAt,
      })),
    };
  }
}
