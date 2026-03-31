import { Controller, Get, Query, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PositionClassifier } from '../../common/classifiers/position-classifier';
import { JobService } from './job.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateJobDto } from './dto/job.dto';

@ApiTags('职位管理')
@Controller('jobs')
export class JobController {
  private classifier = new PositionClassifier();

  constructor(private readonly jobService: JobService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的职位列表' })
  async getMyJobs(@Query() params: any) {
    return this.jobService.findAll(params || {}); 
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布新职位' })
  async createJob(@Body() dto: CreateJobDto, @Req() req) {
    const userId = req.user.id;
    return this.jobService.create(dto, userId);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取职位分类列表' })
  getCategories() {
    return {
      success: true,
      data: {
        industries: this.classifier.getIndustries(),
        functions: this.classifier.getFunctions(),
      },
    };
  }

  @Get('classify')
  @ApiOperation({ summary: '智能分类职位名称' })
  classifyPosition(@Query('text') text: string) {
    const result = this.classifier.classify(text);
    return {
      success: true,
      data: result,
    };
  }

  @Post('classify/batch')
  @ApiOperation({ summary: '批量分类职位名称' })
  batchClassify(@Body() body: { texts: string[] }) {
    const results = this.classifier.batchClassify(body.texts);
    return {
      success: true,
      data: results,
      stats: {
        total: results.length,
        exact: results.filter(r => r.matchType === 'exact').length,
        partial: results.filter(r => r.matchType === 'partial').length,
        keyword: results.filter(r => r.matchType === 'keyword').length,
        failed: results.filter(r => r.confidence === 0).length,
      },
    };
  }

  @Get('positions')
  @ApiOperation({ summary: '获取职能下的职位列表' })
  getPositions(@Query('functionCode') functionCode: string) {
    const positions = this.classifier.getPositionsByFunction(functionCode);
    return {
      success: true,
      data: positions,
      count: positions.length,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '获取分类规则统计' })
  getStats() {
    const industries = this.classifier.getIndustries();
    const functions = this.classifier.getFunctions();
    
    const totalPositions = functions.reduce((sum, f) => sum + (f.positions?.length || 0), 0);
    const totalKeywords = functions.reduce((sum, f) => sum + (f.keywords?.length || 0), 0);

    return {
      success: true,
      data: {
        industries: industries.length,
        functions: functions.length,
        positions: totalPositions,
        keywords: totalKeywords,
        avgKeywordsPerFunction: (totalKeywords / functions.length).toFixed(1),
      },
    };
  }
}
      },
    };
  }
}
