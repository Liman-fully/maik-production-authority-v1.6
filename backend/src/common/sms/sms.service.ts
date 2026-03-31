import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: any;

  constructor(private configService: ConfigService) {
    // 动态加载 SDK 以避免安装失败导致的启动问题
    try {
      const tencentcloud = require('tencentcloud-sdk-node-sms');
      const SmsClient = tencentcloud.sms.v20210111.Client;
      
      this.client = new SmsClient({
        credential: {
          secretId: this.configService.get<string>('TENCENT_SECRET_ID'),
          secretKey: this.configService.get<string>('TENCENT_SECRET_KEY'),
        },
        region: this.configService.get<string>('TENCENT_SMS_REGION') || 'ap-guangzhou',
        profile: {
          httpProfile: {
            endpoint: 'sms.tencentcloudapi.com',
          },
        },
      });
    } catch (e) {
      this.logger.error('Tencent Cloud SMS SDK not found or failed to initialize');
    }
  }

  async sendVerificationCode(phone: string, code: string, templateId: string) {
    if (!this.client) {
      this.logger.warn(`[Mock SMS] To ${phone}: Code ${code} (SDK not initialized)`);
      return true;
    }

    const params = {
      SmsSdkAppId: this.configService.get<string>('TENCENT_SMS_APP_ID'),
      SignName: this.configService.get<string>('TENCENT_SMS_SIGN_NAME'),
      TemplateId: templateId,
      TemplateParamSet: [code],
      PhoneNumberSet: [`+86${phone}`],
    };

    try {
      const result = await this.client.SendSms(params);
      if (result.SendStatusSet[0].Code === 'Ok') {
        this.logger.log(`SMS sent to ${phone} successfully`);
        return true;
      } else {
        this.logger.error(`SMS send failed: ${result.SendStatusSet[0].Message}`);
        return false;
      }
    } catch (err) {
      this.logger.error('Tencent SMS API Error', err);
      return false;
    }
  }
}
