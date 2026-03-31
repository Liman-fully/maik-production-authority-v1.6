"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let SmsService = SmsService_1 = class SmsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(SmsService_1.name);
        try {
            const tencentcloud = require('tencentcloud-sdk-node-sms');
            const SmsClient = tencentcloud.sms.v20210111.Client;
            this.client = new SmsClient({
                credential: {
                    secretId: this.configService.get('TENCENT_SECRET_ID'),
                    secretKey: this.configService.get('TENCENT_SECRET_KEY'),
                },
                region: this.configService.get('TENCENT_SMS_REGION') || 'ap-guangzhou',
                profile: {
                    httpProfile: {
                        endpoint: 'sms.tencentcloudapi.com',
                    },
                },
            });
        }
        catch (e) {
            this.logger.error('Tencent Cloud SMS SDK not found or failed to initialize');
        }
    }
    async sendVerificationCode(phone, code, templateId) {
        if (!this.client) {
            this.logger.warn(`[Mock SMS] To ${phone}: Code ${code} (SDK not initialized)`);
            return true;
        }
        const params = {
            SmsSdkAppId: this.configService.get('TENCENT_SMS_APP_ID'),
            SignName: this.configService.get('TENCENT_SMS_SIGN_NAME'),
            TemplateId: templateId,
            TemplateParamSet: [code],
            PhoneNumberSet: [`+86${phone}`],
        };
        try {
            const result = await this.client.SendSms(params);
            if (result.SendStatusSet[0].Code === 'Ok') {
                this.logger.log(`SMS sent to ${phone} successfully`);
                return true;
            }
            else {
                this.logger.error(`SMS send failed: ${result.SendStatusSet[0].Message}`);
                return false;
            }
        }
        catch (err) {
            this.logger.error('Tencent SMS API Error', err);
            return false;
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SmsService);
//# sourceMappingURL=sms.service.js.map