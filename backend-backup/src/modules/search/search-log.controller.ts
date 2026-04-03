import { Controller, Get, Query, UseGuards, Request, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchLogService } from './search-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('搜索日志')
@Controller('search-logs')
@UseGuards(JwtAuthGuard)
export class SearchLogController {
  constructor(private readonly searchLogService: SearchLogService) {}

  @Get('hot-terms')
  @ApiOperation({ summary: '获取热门搜索词' })
  @ApiQuery({ name: 'days', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getHotSearchTerms(@Query('days') days: number = 7, @Query('limit') limit: number = 100) {
    const terms = await this.searchLogService.getHotSearchTerms(days, limit);
    return {
      success: true,
      data: terms,
    };
  }

  @Get('zero-results')
  @ApiOperation({ summary: '获取零结果搜索词' })
  @ApiQuery({ name: 'days', required: false })
  async getZeroResultTerms(@Query('days') days: number = 7) {
    const terms = await this.searchLogService.getZeroResultTerms(days);
    return {
      success: true,
      data: terms,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取搜索统计' })
  @ApiQuery({ name: 'days', required: false })
  async getSearchStats(@Query('days') days: number = 7) {
    const stats = await this.searchLogService.getSearchStats(days);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('history')
  @ApiOperation({ summary: '获取用户搜索历史' })
  @ApiQuery({ name: 'limit', required: false })
  async getUserSearchHistory(@Request() req, @Query('limit') limit: number = 20) {
    const history = await this.searchLogService.getUserSearchHistory(req.user.id, limit);
    return {
      success: true,
      data: history,
    };
  }

  @Post('log')
  @ApiOperation({ summary: '记录搜索日志' })
  async logSearch(@Request() req, @Body() body: {
    query: string;
    filters?: any;
    resultCount: number;
    responseTimeMs?: number;
    cacheHit?: boolean;
  }) {
    const log = await this.searchLogService.logSearch({
      userId: req.user.id,
      ...body,
    });
    return {
      success: true,
      data: log,
    };
  }

  @Post('click')
  @ApiOperation({ summary: '记录点击日志' })
  async logClick(@Body() body: { logId: number; candidateId: number }) {
    await this.searchLogService.logClick(body.logId, body.candidateId);
    return {
      success: true,
    };
  }

  @Post('contact')
  @ApiOperation({ summary: '记录联系日志' })
  async logContact(@Body() body: { logId: number; candidateId: number }) {
    await this.searchLogService.logContact(body.logId, body.candidateId);
    return {
      success: true,
    };
  }
}
