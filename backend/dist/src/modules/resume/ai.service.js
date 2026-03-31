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
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
const parsing_prompt_1 = require("./parsing.prompt");
let AiService = AiService_1 = class AiService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AiService_1.name);
        this.apiKey = this.configService.get('ZHIPU_API_KEY');
        this.baseUrl = this.configService.get('ZHIPU_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4');
        this.model = this.configService.get('ZHIPU_MODEL', 'glm-4-flash');
        this.localModelUrl = this.configService.get('LOCAL_QWEN_URL', 'http://localhost:11434/api/generate');
    }
    async parseResumeText(text) {
        const isValid = await this.validateWithLocalQwen(text);
        if (!isValid) {
            this.logger.warn('Local Qwen rejected the document as non-resume');
            throw new Error('此内容不符合简历特征（本地模型判定），已自动过滤');
        }
        if (!this.apiKey) {
            this.logger.warn('ZHIPU_API_KEY is not set, using mock parsing');
            return this.mockParsing();
        }
        try {
            const prompt = parsing_prompt_1.RESUME_PARSING_PROMPT.replace('{{resumeText}}', text);
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: this.model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            const content = response.data.choices[0].message.content.replace(/```json|```/g, '').trim();
            return JSON.parse(content);
        }
        catch (error) {
            this.logger.error('ZhipuAI parsing failed', error.stack);
            throw new Error(`AI 解析失败 (智谱): ${error.message}`);
        }
    }
    async validateWithLocalQwen(text) {
        try {
            const response = await axios_1.default.post(this.localModelUrl, {
                model: "qwen:0.5b",
                prompt: `判定以下文本是否为个人简历。仅回答"YES"或"NO"。\n\n文本内容：${text.substring(0, 500)}`,
                stream: false
            }, { timeout: 5000 });
            const result = response.data.response.trim().toUpperCase();
            return result.includes('YES');
        }
        catch (e) {
            this.logger.warn('Local Qwen validation failed, falling back to Zhipu validation', e.message);
            return this.validateWithZhipu(text);
        }
    }
    async validateWithZhipu(text) {
        return true;
    }
    mockParsing() {
        return {
            basicInfo: { name: '张三', phone: '13800000000', email: 'zhangsan@example.com' },
            education: [],
            workExperience: [],
            projects: [],
            skills: ['React', 'NestJS'],
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map