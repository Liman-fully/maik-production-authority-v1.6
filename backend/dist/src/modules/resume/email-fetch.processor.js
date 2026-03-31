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
var EmailFetchProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailFetchProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const email_fetch_service_1 = require("./email-fetch.service");
let EmailFetchProcessor = EmailFetchProcessor_1 = class EmailFetchProcessor {
    constructor(emailFetchService) {
        this.emailFetchService = emailFetchService;
        this.logger = new common_1.Logger(EmailFetchProcessor_1.name);
    }
    async handleFetch(job) {
        this.logger.log('开始执行邮件简历拉取任务...');
        try {
            await this.emailFetchService.fetchResumesFromEmail();
            this.logger.log('邮件简历拉取任务完成');
        }
        catch (error) {
            this.logger.error('邮件简历拉取任务失败', error.stack);
            throw error;
        }
    }
};
exports.EmailFetchProcessor = EmailFetchProcessor;
__decorate([
    (0, bull_1.Process)('fetch'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmailFetchProcessor.prototype, "handleFetch", null);
exports.EmailFetchProcessor = EmailFetchProcessor = EmailFetchProcessor_1 = __decorate([
    (0, bull_1.Processor)('email-fetching'),
    __metadata("design:paramtypes", [email_fetch_service_1.EmailFetchService])
], EmailFetchProcessor);
//# sourceMappingURL=email-fetch.processor.js.map