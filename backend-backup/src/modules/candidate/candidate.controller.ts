import { Controller, Get, Post, Put, Delete, Patch, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CandidateService, SearchCandidateDto } from './candidate.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('候选人搜索')
@Controller('candidates')
@UseGuards(JwtAuthGuard)
export class CandidateController {
  constructor(private readonly candidateService: CandidateService) {}

  @Get('search')
  @ApiOperation({ summary: '搜索候选人' })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词（职位/技能）' })
  @ApiQuery({ name: 'city', required: false, description: '城市' })
  @ApiQuery({ name: 'educationLevel', required: false, description: '学历（1:本科，2:硕士，3:博士）' })
  @ApiQuery({ name: 'workYearsMin', required: false, description: '最小工作年限' })
  @ApiQuery({ name: 'workYearsMax', required: false, description: '最大工作年限' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方式' })
  async searchCandidates(@Query() query: SearchCandidateDto) {
    const results = await this.candidateService.searchCandidates(query);
    return {
      success: true,
      data: results,
    };
  }

  @Get('search/suggestions')
  @ApiOperation({ summary: '搜索建议（自动补全）' })
  @ApiQuery({ name: 'q', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'limit', required: false, description: '建议数量' })
  async getSearchSuggestions(@Query('q') query: string, @Query('limit') limit: number = 5) {
    const suggestions = await this.candidateService.getSearchSuggestions(query, limit);
    return {
      success: true,
      data: suggestions,
    };
  }

  @Get('search/stats')
  @ApiOperation({ summary: '搜索结果统计' })
  @ApiQuery({ name: 'keyword', required: false, description: '关键词' })
  @ApiQuery({ name: 'city', required: false, description: '城市' })
  async getSearchStats(@Query() query: SearchCandidateDto) {
    const stats = await this.candidateService.getSearchStats(query);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('cache-stats')
  @ApiOperation({ summary: '缓存统计（命中率监控）' })
  async getCacheStats() {
    const stats = this.candidateService.getCacheStats();
    return {
      success: true,
      data: stats,
    };
  }

  @Post('cache/invalidate')
  @ApiOperation({ summary: '手动失效缓存（管理功能）' })
  async invalidateCache() {
    await this.candidateService.invalidateSearchCache();
    return {
      success: true,
      message: '缓存已失效',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取候选人详情' })
  async getCandidate(@Param('id') id: number) {
    const candidate = await this.candidateService.findOne(id);
    return {
      success: true,
      data: candidate,
    };
  }

  @Post()
  @ApiOperation({ summary: '创建候选人' })
  async createCandidate(@Body() data: any) {
    return this.candidateService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新候选人' })
  async updateCandidate(@Param('id') id: number, @Body() data: any) {
    return this.candidateService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除候选人' })
  async deleteCandidate(@Param('id') id: number) {
    await this.candidateService.delete(id);
    return { success: true };
  }

  @Patch(':id/tags')
  @ApiOperation({ summary: '更新标签' })
  async updateTags(@Param('id') id: number, @Body('tags') tags: string[]) {
    return this.candidateService.update(id, { tags });
  }

  @Patch(':id/group')
  @ApiOperation({ summary: '更新分组' })
  async updateGroup(
    @Param('id') id: number,
    @Body('groupId') groupId: number,
    @Body('groupName') groupName: string,
  ) {
    return this.candidateService.update(id, { groupId, groupName });
  }

  @Get(':id/highlight')
  @ApiOperation({ summary: '高亮显示搜索结果' })
  @ApiQuery({ name: 'keyword', required: true, description: '关键词' })
  async highlightResult(@Query('keyword') keyword: string, @Param('id') id: number) {
    const candidate = await this.candidateService.findOne(id);
    const result = this.candidateService.highlightResult(candidate, keyword);
    return {
      success: true,
      data: result,
    };
  }
}
