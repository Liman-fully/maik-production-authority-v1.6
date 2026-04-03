import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Request,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { CosService } from '../../common/storage/cos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Multer } from 'multer';

@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(
    private readonly resumeService: ResumeService,
    private readonly cosService: CosService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('不支持的文件类型'), false);
      }
    },
  }))
  async uploadResume(
    @Request() req,
    @UploadedFile() file: any,
    @Body('folderId') folderId?: string,
  ) {
    if (!file) {
      return { success: false, message: '请上传文件' };
    }

    const resume = await this.resumeService.uploadResume(
      req.user.id,
      file,
      folderId,
    );

    return {
      success: true,
      data: resume,
      message: '简历上传成功，正在解析中',
    };
  }

  @Post('batch-upload')
  @UseInterceptors(FileInterceptor('files'))
  async batchUpload(
    @Request() req,
    @UploadedFile() files: any[],
    @Body('folderId') folderId?: string,
  ) {
    // TODO: 批量上传实现
    return { success: true, message: '批量上传功能开发中' };
  }

  @Get('list')
  async getResumes(
    @Request() req,
    @Query('folderId') folderId?: string,
    @Query('keyword') keyword?: string,
    @Query('tier') tier?: string,
    @Query('minScore') minScore?: number,
    @Query('maxScore') maxScore?: number,
  ) {
    const resumes = await this.resumeService.getResumes(req.user.id, folderId, {
      keyword,
      tier,
      minScore: minScore ? Number(minScore) : undefined,
      maxScore: maxScore ? Number(maxScore) : undefined,
    });
    return { success: true, data: resumes };
  }

  @Get(':id')
  async getResume(@Request() req, @Param('id') id: string) {
    const resume = await this.resumeService.getResumeById(id, req.user.id);
    return { success: true, data: resume };
  }

  @Get(':id/status')
  async getResumeStatus(@Request() req, @Param('id') id: string) {
    const resume = await this.resumeService.getResumeById(id, req.user.id);
    if (!resume) {
      return { success: false, message: '简历不存在' };
    }
    return {
      success: true,
      data: {
        id: resume.id,
        parseStatus: resume.parseStatus,
        parseError: resume.parseError,
      },
    };
  }

  @Get(':id/download')
  async downloadResume(
    @Request() req,
    @Param('id') id: string,
    @Response() res,
  ) {
    const resume = await this.resumeService.getResumeById(id, req.user.id);
    if (!resume) {
      return res.status(404).json({ success: false, message: '简历不存在' });
    }

    if (!resume.cosUrl) {
      return res.status(400).json({ success: false, message: '简历文件不存在' });
    }

    try {
      // 获取签名 URL（有效期 1 小时）
      const signedUrl = await this.cosService.getSignedUrl(resume.cosKey, 3600);
      
      return res.json({
        success: true,
        data: {
          url: signedUrl,
          fileName: resume.fileName,
          fileSize: resume.fileSize,
        },
        message: '获取下载链接成功',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `获取下载链接失败: ${error.message}`,
      });
    }
  }

  @Delete(':id')
  async deleteResume(@Request() req, @Param('id') id: string) {
    await this.resumeService.deleteResume(id, req.user.id);
    return { success: true, message: '删除成功' };
  }

  @Post('folder')
  async createFolder(
    @Request() req,
    @Body('name') name: string,
    @Body('parentId') parentId?: string,
  ) {
    const folder = await this.resumeService.createFolder(req.user.id, name, parentId);
    return { success: true, data: folder };
  }

  @Post('fetch-from-email')
  async fetchFromEmail(@Request() req) {
    // 触发邮箱简历拉取异步任务
    await this.resumeService.triggerEmailFetch(req.user.id);
    return { success: true, message: '邮件拉取任务已加入队列，后台处理中' };
  }

  @Get('folders')
  async getFolders(@Request() req) {
    const folders = await this.resumeService.getFolders(req.user.id);
    return { success: true, data: folders };
  }
}
