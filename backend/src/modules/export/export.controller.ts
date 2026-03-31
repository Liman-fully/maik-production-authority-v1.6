import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  Res,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExportService } from './export.service';
import { TaskStatus } from './export-task.entity';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { DownloadLimitGuard } from '../../common/guards/download-limit.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DownloadLog } from './download-log.entity';

@ApiTags('导出')
@Controller('export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    @InjectRepository(DownloadLog)
    private readonly downloadLogRepository: Repository<DownloadLog>,
  ) {}

  @Get('status/:taskId')
  @ApiOperation({ summary: '查询导出进度' })
  async getExportStatus(
    @Request() req,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.exportService.getTaskStatus(taskId, req.user.id);
    return {
      success: true,
      data: {
        taskId: task.id,
        status: task.status,
        totalCount: task.totalCount,
        processedCount: task.processedCount,
        filePath: task.filePath,
        errorMessage: task.errorMessage,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        progress: task.totalCount > 0 
          ? Math.round((task.processedCount / task.totalCount) * 100) 
          : 0,
      },
    };
  }

  @Get('download/:taskId')
  @ApiOperation({ summary: '下载导出文件' })
  @UseGuards(DownloadLimitGuard)
  async downloadExport(
    @Request() req,
    @Param('taskId') taskId: string,
    @Res() res: Response,
  ) {
    const task = await this.exportService.getTaskStatus(taskId, req.user.id);
    
    if (task.status !== TaskStatus.COMPLETED || !task.filePath) {
      await this.logDownload(req, taskId, null, 'failed', '文件未生成或已过期');
      throw new NotFoundException('文件未生成或已过期');
    }

    const fullPath = path.join(process.cwd(), task.filePath);
    
    if (!fs.existsSync(fullPath)) {
      await this.logDownload(req, taskId, null, 'failed', '文件不存在');
      throw new NotFoundException('文件不存在');
    }

    try {
      const fileName = path.basename(task.filePath);
      const stats = fs.statSync(fullPath);
      
      // 记录下载日志
      await this.logDownload(req, taskId, null, 'success', null, fileName, stats.size);

      res.download(fullPath, fileName);
    } catch (error) {
      await this.logDownload(req, taskId, null, 'failed', error.message);
      throw error;
    }
  }

  /**
   * 记录下载审计日志
   */
  private async logDownload(
    req: any,
    taskId: string,
    resumeId: number | null,
    status: 'success' | 'failed' | 'blocked',
    errorMessage: string | null,
    fileName?: string,
    fileSize?: number,
  ) {
    const log = this.downloadLogRepository.create({
      userId: req.user?.id,
      taskId,
      resumeId,
      downloadType: 'single',
      fileFormat: fileName ? path.extname(fileName).slice(1) : null,
      fileSizeBytes: fileSize || null,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent'],
      status,
      errorMessage,
    });

    await this.downloadLogRepository.save(log);
  }
}
