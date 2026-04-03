import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { ExportTask, TaskStatus } from './export-task.entity';
import { Resume } from '../resume/resume.entity';
import { PdfExporter } from './pdf-exporter';
import { ExcelExporter } from './excel-exporter';
import { DownloadRecordService } from '../download/download-record.service';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(ExportTask)
    private taskRepo: Repository<ExportTask>,
    @InjectRepository(Resume)
    private resumeRepo: Repository<Resume>,
    @InjectQueue('export')
    private exportQueue: Queue,
    private pdfExporter: PdfExporter,
    private excelExporter: ExcelExporter,
    private downloadRecordService: DownloadRecordService,
  ) {}

  /**
   * 创建导出任务
   */
  async createExportTask(
    userId: string,
    resumeIds: string[],
    format: string,
  ): Promise<ExportTask> {
    const task = this.taskRepo.create({
      userId,
      format,
      status: TaskStatus.PENDING,
      totalCount: resumeIds.length,
      processedCount: 0,
    });
    await this.taskRepo.save(task);

    // 添加到队列
    await this.exportQueue.add({
      taskId: task.id,
      userId,
      resumeIds,
      format,
    });

    return task;
  }

  /**
   * 查询任务状态
   */
  async getTaskStatus(taskId: string, userId: string): Promise<ExportTask> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, userId },
    });
    if (!task) throw new Error('任务不存在');
    return task;
  }

  /**
   * 处理导出（队列 worker）
   */
  async processExport(data: any) {
    const { taskId, userId, resumeIds, format } = data;

    try {
      // 更新状态为处理中
      await this.taskRepo.update(taskId, { status: TaskStatus.PROCESSING });

      // 获取所有简历数据
      const resumes = await this.getResumes(resumeIds, userId);

      // 根据格式导出
      let filePath: string;
      let standardFileName: string;
      
      if (format === 'pdf') {
        filePath = await this.pdfExporter.export(resumes, userId);
        
        // 使用第一份简历生成标准化文件名（单文件导出）
        if (resumes.length === 1) {
          standardFileName = this.generateStandardFileName(resumes[0]);
        }
      } else {
        filePath = await this.excelExporter.export(resumes, userId);
        standardFileName = `批量导出_${resumes.length}份_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
      }

      // 记录下载记录
      for (const resume of resumes) {
        await this.downloadRecordService.createRecord({
          userId,
          resumeId: resume.id,
          originalFileName: resume.fileName,
          standardFileName: standardFileName || this.generateStandardFileName(resume),
          filePath,
          fileSize: resume.fileSize,
          downloadType: resumes.length === 1 ? 'single' : 'batch',
          candidateName: resume.basicInfo?.name,
          candidatePhone: resume.basicInfo?.phone,
          expectedPosition: resume.jobIntention?.expectedPosition,
          exportFormat: format,
        });
      }

      // 更新状态为完成
      await this.taskRepo.update(taskId, {
        status: TaskStatus.COMPLETED,
        filePath,
        processedCount: resumes.length,
        completedAt: new Date(),
      });

      return { success: true, filePath, standardFileName };
    } catch (error) {
      // 更新状态为失败
      await this.taskRepo.update(taskId, {
        status: TaskStatus.FAILED,
        errorMessage: error.message,
      });
      throw error;
    }
  }

  /**
   * 获取简历数据
   */
  private async getResumes(resumeIds: string[], userId: string) {
    const resumes = await this.resumeRepo.findByIds(resumeIds);
    // 过滤确保属于当前用户
    return resumes.filter(r => r.userId === userId);
  }

  /**
   * 上传文件到 COS（待实现）
   */
  private async uploadToCos(filePath: string): Promise<string> {
    // TODO: 实现 COS 上传逻辑
    // const cos = require('cos-nodejs-sdk-v5');
    // const cosInstance = new Cos({ ... });
    // return cosInstance.putObject({ ... });
    return filePath;
  }

  /**
   * 生成标准化文件名
   * 格式：姓名_手机号_期望职位_下载日期.pdf
   * 示例：张三_138****8000_Java 开发工程师_20260329.pdf
   */
  generateStandardFileName(resume: Resume): string {
    // 1. 姓名（2-10 字）
    const name = resume.basicInfo?.name || '未知姓名';
    const sanitizedName = name.trim().slice(0, 10);

    // 2. 手机号（11 位数字，中间 4 位用*隐藏）
    let maskedPhone = '000****0000';
    if (resume.basicInfo?.phone) {
      const phone = resume.basicInfo.phone.replace(/\D/g, '');
      if (phone.length === 11) {
        maskedPhone = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      }
    }

    // 3. 期望职位（10 字内）
    const position = resume.jobIntention?.expectedPosition || '未填写职位';
    const sanitizedPosition = position.trim().slice(0, 10);

    // 4. 下载日期（YYYYMMDD 格式）
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // 5. 特殊字符清理
    const cleanName = this.cleanFileName(sanitizedName);
    const cleanPosition = this.cleanFileName(sanitizedPosition);

    return `${cleanName}_${maskedPhone}_${cleanPosition}_${dateStr}.pdf`;
  }

  /**
   * 清理文件名中的特殊字符
   */
  private cleanFileName(str: string): string {
    return str
      .replace(/[<>:"/\\|？*]/g, '') // 移除非法字符
      .replace(/\s+/g, '_') // 空格转下划线
      .trim();
  }
}
