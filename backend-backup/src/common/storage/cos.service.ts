import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const COS = require('cos-nodejs-sdk-v5');

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

@Injectable()
export class CosService {
  private cos: any;
  private bucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('COS_BUCKET') || 'huntlink-1306109984';
    this.region = this.configService.get<string>('COS_REGION') || 'ap-guangzhou';

    this.cos = new COS({
      SecretId: this.configService.get<string>('COS_SECRET_ID') || '',
      SecretKey: this.configService.get<string>('COS_SECRET_KEY') || '',
    });
  }

  async uploadResume(
    userId: string,
    buffer: Buffer,
    fileName: string,
  ): Promise<{ url: string; key: string }> {
    try {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const key = `resumes/${userId}/${timestamp}_${randomStr}_${fileName}`;

      await new Promise<void>((resolve, reject) => {
        this.cos.putObject({
          Bucket: this.bucket,
          Region: this.region,
          Key: key,
          Body: buffer,
        }, (err, data) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
      console.log(`[COS] Upload success: ${url}`);
      return { url, key };
    } catch (error) {
      console.error('[COS] Upload failed:', error);
      throw error;
    }
  }

  async downloadFile(url: string): Promise<Buffer> {
    const key = url.replace(`https://${this.bucket}.cos.${this.region}.myqcloud.com/`, '');
    return new Promise((resolve, reject) => {
      this.cos.getObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data.Body as Buffer);
      });
    });
  }

  async deleteFile(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getSignedUrl(key: string, expires: number = 3600): Promise<string> {
    return new Promise((resolve, reject) => {
      this.cos.getObjectUrl({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Expires: expires,
        Sign: true,
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data.Url);
      });
    });
  }

  async testConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      this.cos.headBucket({
        Bucket: this.bucket,
        Region: this.region,
      }, (err) => {
        if (err) {
          console.error('[COS] Connection test failed:', err);
          resolve(false);
        } else {
          console.log('[COS] Connection test success');
          resolve(true);
        }
      });
    });
  }
}
