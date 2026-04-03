import { Controller, Post, Body, UseGuards, Req, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DownloadRecordService } from './download-record.service';

interface DownloadResumeDto {
  resumeId: string;
  format?: 'pdf' | 'docx' | 'xlsx';
  anonymize?: boolean;
}

interface DownloadHistoryQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  downloadType?: string;
}

@ApiTags('简历下载')
@Controller('download')
export class DownloadController {
  constructor(private downloadService: DownloadRecordService) {}

  @Post('resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '下载简历文件' })
  async downloadResume(
    @Req() req,
    @Body() dto: DownloadResumeDto,
  ) {
    // 获取用户信息
    const userId = req.user.id;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // TODO: 这里应该调用简历服务获取简历信息
    // 为了简化，我们先创建下载记录
    const downloadRecord = await this.downloadService.createRecord({
      userId,
      resumeId: dto.resumeId,
      originalFileName: `resume-${dto.resumeId}.${dto.format || 'pdf'}`,
      standardFileName: `resume_${userId}_${Date.now()}.${dto.format || 'pdf'}`,
      filePath: `/resumes/${dto.resumeId}.${dto.format || 'pdf'}`,
      fileSize: 1024 * 1024, // 假设1MB
      downloadType: 'single',
      candidateName: '候选人姓名', // 从简历获取
      candidatePhone: '13800138000', // 从简历获取
      expectedPosition: '前端开发工程师', // 从简历获取
      ipAddress,
      userAgent,
      exportFormat: dto.format || 'pdf',
    });

    // TODO: 这里应该返回实际的文件下载流
    // 目前先返回下载记录信息
    return {
      success: true,
      message: '简历下载请求已记录',
      data: {
        downloadId: downloadRecord.id,
        fileUrl: `/api/download/file/${downloadRecord.id}`, // 实际下载URL
        record: downloadRecord,
      },
    };
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取下载历史记录' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'downloadType', required: false, type: String })
  async getDownloadHistory(
    @Req() req,
    @Query() query: DownloadHistoryQuery,
  ) {
    const userId = req.user.id;
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = { userId };
    if (query.startDate && query.endDate) {
      where.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate),
      };
    }
    if (query.downloadType) {
      where.downloadType = query.downloadType;
    }

    // TODO: 调用服务获取下载记录
    // 这里先返回模拟数据
    return {
      success: true,
      data: {
        records: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      },
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取下载统计信息' })
  async getDownloadStats(@Req() req) {
    const userId = req.user.id;

    // TODO: 调用服务获取统计信息
    return {
      success: true,
      data: {
        totalDownloads: 0,
        todayDownloads: 0,
        thisMonthDownloads: 0,
        favoriteFormats: {},
        downloadTimes: {},
      },
    };
  }

  @Get('file/:downloadId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '下载文件（需要验证权限）' })
  async downloadFile(
    @Req() req,
    @Param('downloadId') downloadId: string,
  ) {
    const userId = req.user.id;

    // TODO: 验证用户是否有权限下载此文件
    // 检查downloadId对应的记录是否属于当前用户
    
    // TODO: 返回实际的文件流
    // 这里返回模拟响应
    return {
      success: true,
      message: '文件下载开始',
      downloadId,
    };
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '管理员：获取全平台下载统计' })
  async getAdminStats(@Req() req) {
    // 检查用户是否是管理员
    // TODO: 添加管理员权限检查
    
    // TODO: 获取全平台统计
    return {
      success: true,
      data: {
        totalDownloads: 0,
        activeUsers: 0,
        popularResumes: [],
        revenueStats: {},
      },
    };
  }
}