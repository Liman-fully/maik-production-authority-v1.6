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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const COS = require('cos-nodejs-sdk-v5');
let CosService = class CosService {
    constructor(configService) {
        this.configService = configService;
        this.bucket = this.configService.get('COS_BUCKET') || 'huntlink-1306109984';
        this.region = this.configService.get('COS_REGION') || 'ap-guangzhou';
        this.cos = new COS({
            SecretId: this.configService.get('COS_SECRET_ID') || '',
            SecretKey: this.configService.get('COS_SECRET_KEY') || '',
        });
    }
    async uploadResume(userId, buffer, fileName) {
        try {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const key = `resumes/${userId}/${timestamp}_${randomStr}_${fileName}`;
            await new Promise((resolve, reject) => {
                this.cos.putObject({
                    Bucket: this.bucket,
                    Region: this.region,
                    Key: key,
                    Body: buffer,
                }, (err, data) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`;
            console.log(`[COS] Upload success: ${url}`);
            return { url, key };
        }
        catch (error) {
            console.error('[COS] Upload failed:', error);
            throw error;
        }
    }
    async downloadFile(url) {
        const key = url.replace(`https://${this.bucket}.cos.${this.region}.myqcloud.com/`, '');
        return new Promise((resolve, reject) => {
            this.cos.getObject({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
            }, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data.Body);
            });
        });
    }
    async deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.cos.deleteObject({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
            }, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    async getSignedUrl(key, expires = 3600) {
        return new Promise((resolve, reject) => {
            this.cos.getObjectUrl({
                Bucket: this.bucket,
                Region: this.region,
                Key: key,
                Expires: expires,
                Sign: true,
            }, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data.Url);
            });
        });
    }
    async testConnection() {
        return new Promise((resolve) => {
            this.cos.headBucket({
                Bucket: this.bucket,
                Region: this.region,
            }, (err) => {
                if (err) {
                    console.error('[COS] Connection test failed:', err);
                    resolve(false);
                }
                else {
                    console.log('[COS] Connection test success');
                    resolve(true);
                }
            });
        });
    }
};
exports.CosService = CosService;
exports.CosService = CosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CosService);
//# sourceMappingURL=cos.service.js.map