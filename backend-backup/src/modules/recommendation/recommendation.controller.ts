import { Controller, Get, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RecommendationService, GetRecommendationsDto, UserBehavior } from './recommendation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 生成推荐请求 DTO
 */
interface GenerateRecommendationsDto {
  behavior: UserBehavior;
  limit?: number;
}

/**
 * 更新推荐状态请求 DTO
 */
interface UpdateStatusDto {
  status: 'shown' | 'clicked' | 'ignored';
}

@ApiTags('人才推荐')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('generate')
  @ApiOperation({ summary: '为用户生成推荐列表' })
  @ApiQuery({ name: 'limit', required: false, description: '推荐数量，默认 20' })
  async generateRecommendations(
    @Request() req: any,
    @Body() body: GenerateRecommendationsDto,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        message: '未找到用户 ID',
      };
    }

    const recommendations = await this.recommendationService.generateRecommendations(
      userId,
      body.behavior,
      limit || 20,
    );

    return {
      success: true,
      data: recommendations,
      count: recommendations.length,
    };
  }

  @Get()
  @ApiOperation({ summary: '获取用户的推荐列表' })
  @ApiQuery({ name: 'limit', required: false, description: '数量，默认 20' })
  async getUserRecommendations(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        message: '未找到用户 ID',
      };
    }

    const recommendations = await this.recommendationService.getUserRecommendations(
      userId,
      limit || 20,
    );

    return {
      success: true,
      data: recommendations,
      count: recommendations.length,
    };
  }

  @Post(':id/status')
  @ApiOperation({ summary: '更新推荐状态（用户交互后调用）' })
  async updateRecommendationStatus(
    @Param('id') id: string,
    @Body() body: UpdateStatusDto,
  ) {
    await this.recommendationService.updateRecommendationStatus(id, body.status);

    return {
      success: true,
      message: `推荐状态已更新为 ${body.status}`,
    };
  }

  @Post('bulk-status')
  @ApiOperation({ summary: '批量更新推荐状态' })
  @ApiQuery({ name: 'ids', required: true, description: '推荐 ID 列表，逗号分隔' })
  async bulkUpdateStatus(
    @Query('ids') idsQuery: string,
    @Body() body: UpdateStatusDto,
  ) {
    const ids = idsQuery.split(',').filter(Boolean);
    
    if (ids.length === 0) {
      return {
        success: false,
        message: '未提供推荐 ID 列表',
      };
    }

    await this.recommendationService.bulkUpdateStatus(ids, body.status);

    return {
      success: true,
      message: `已更新 ${ids.length} 条推荐状态为 ${body.status}`,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取推荐统计信息' })
  @ApiQuery({ name: 'userId', required: false, description: '用户 ID，不传则统计全部' })
  async getRecommendationStats(@Query('userId') userId?: string) {
    const stats = await this.recommendationService.getRecommendationStats(userId);

    return {
      success: true,
      data: stats,
    };
  }

  @Post('cache/clear')
  @ApiOperation({ summary: '清除用户推荐缓存' })
  async clearUserCache(@Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      return {
        success: false,
        message: '未找到用户 ID',
      };
    }

    await this.recommendationService.clearUserCache(userId);

    return {
      success: true,
      message: '推荐缓存已清除',
    };
  }
}
