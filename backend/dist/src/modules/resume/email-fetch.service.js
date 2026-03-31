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
var EmailFetchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailFetchService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resume_service_1 = require("./resume.service");
const fs = require("fs");
const path = require("path");
let EmailFetchService = EmailFetchService_1 = class EmailFetchService {
    constructor(configService, resumeService) {
        this.configService = configService;
        this.resumeService = resumeService;
        this.logger = new common_1.Logger(EmailFetchService_1.name);
        this.accountsPath = path.join(__dirname, 'accounts_config.json');
    }
    async fetchResumesFromEmail(agentEmail) {
        const accounts = this.loadAccounts();
        const targetAccounts = agentEmail
            ? accounts.filter(a => a.email === agentEmail)
            : accounts;
        this.logger.log(`开始执行测试拉取：目标 ${targetAccounts.length} 个邮箱账号`);
        for (const account of targetAccounts) {
            try {
                this.logger.log(`[Agent: ${account.name}] 正在登录 ${account.email}...`);
                const mockFileName = `Resume_Test_${account.name}.pdf`;
                this.logger.log(`[Agent: ${account.name}] 发现 1 份新简历: ${mockFileName}`);
                const mockFile = {
                    originalname: mockFileName,
                    buffer: Buffer.from('%PDF-1.4 mock content'),
                    size: 1024,
                };
                await this.resumeService.uploadResume('system-test-user-id', mockFile, null);
                this.logger.log(`[Agent: ${account.name}] 测试简历拉取并入库成功`);
            }
            catch (e) {
                this.logger.error(`[Agent: ${account.name}] 拉取失败: ${e.message}`);
            }
        }
    }
    loadAccounts() {
        try {
            const data = fs.readFileSync(this.accountsPath, 'utf8');
            return JSON.parse(data);
        }
        catch (e) {
            this.logger.error('无法加载邮箱账号配置文件');
            return [];
        }
    }
};
exports.EmailFetchService = EmailFetchService;
exports.EmailFetchService = EmailFetchService = EmailFetchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        resume_service_1.ResumeService])
], EmailFetchService);
//# sourceMappingURL=email-fetch.service.js.map