import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DownloadRecord } from './download-record.entity';

/**
 * 下载记录服务
 * 负责记录和管理简历下载行为
 */
@Injectable()
export class DownloadRecordService {
  constructor(
    @InjectRepository(DownloadRecord)
    private recordRepo: Repository<DownloadRecord>,
  ) {}

  /**
   * 创建下载记录
   */
  async createRecord(data: {
    userId: string;
    resumeId: string;
    originalFileName: string;
    standardFileName: string;
    filePath: string;
    fileSize: number;
    downloadType: string;
    candidateName?: string;
    candidatePhone?: string;
    expectedPosition?: string;
    ipAddress?: string;
    userAgent?: string;
    exportFormat?: string;
  }): Promise<DownloadRecord> {
    const record = this.recordRepo.create({
      userId: data.userId,
      resumeId: data.resumeId,
      originalFileName: data.originalFileName,
      standardFileName: data.standardFileName,
      filePath: data.filePath,
      fileSize: data.fileSize,
      downloadType: data.downloadType,
      candidateName: data.candidateName,
      candidatePhone: data.candidatePhone,
      expectedPosition: data.expectedPosition,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      exportFormat: data.exportFormat || 'pdf',
      isAnonymized: true,
    });

    return await this.recordRepo.save(record);
  }

  /**
   * 查询用户的下载记录
   */
  async getUserRecords(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ records: DownloadRecord[]; total: number }> {
    const [records, total] = await this.recordRepo.findAndCount({
      where: { userId },
      order: { downloadedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { records, total };
  }

  /**
   * 查询特定简历的下载记录
   */
  async getResumeDownloadHistory(resumeId: string): Promise<DownloadRecord[]> {
    return await this.recordRepo.find({
      where: { resumeId },
      order: { downloadedAt: 'DESC' },
    });
  }

  /**
   * 统计下载量
   */
  async getDownloadStats(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalCount: number;
    pdfCount: number;
    excelCount: number;
  }> {
    const query = this.recordRepo
      .createQueryBuilder('record')
      .where('record.userId = :userId', { userId });

    if (startDate) {
      query.andWhere('record.downloadedAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('record.downloadedAt <= :endDate', { endDate });
    }

    const totalCount = await query.getCount();

    const pdfCount = await query
      .clone()
      .andWhere('record.exportFormat = :format', { format: 'pdf' })
      .getCount();

    const excelCount = await query
      .clone()
      .andWhere('record.exportFormat = :format', { format: 'excel' })
      .getCount();

    return { totalCount, pdfCount, excelCount };
  }
}
