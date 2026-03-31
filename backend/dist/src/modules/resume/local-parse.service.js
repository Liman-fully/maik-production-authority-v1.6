"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LocalParseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalParseService = void 0;
const common_1 = require("@nestjs/common");
let LocalParseService = LocalParseService_1 = class LocalParseService {
    constructor() {
        this.logger = new common_1.Logger(LocalParseService_1.name);
    }
    async extractBasicInfo(text) {
        this.logger.log('执行本地规则提取...');
        const phoneMatch = text.match(/1[3-9]\d{9}/);
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        let name = null;
        const namePatterns = [/姓名[:：\s]*([\u4e00-\u9fa5]{2,4})/, /^([\u4e00-\u9fa5]{2,4})\s+/m];
        for (const pattern of namePatterns) {
            const m = text.match(pattern);
            if (m) {
                name = m[1];
                break;
            }
        }
        return {
            name,
            phone: phoneMatch ? phoneMatch[0] : null,
            email: emailMatch ? emailMatch[0] : null,
            isLocalSuccess: !!(name && (phoneMatch || emailMatch))
        };
    }
    shouldUseAi(localInfo) {
        if (!localInfo.name || !localInfo.phone)
            return true;
        return false;
    }
};
exports.LocalParseService = LocalParseService;
exports.LocalParseService = LocalParseService = LocalParseService_1 = __decorate([
    (0, common_1.Injectable)()
], LocalParseService);
//# sourceMappingURL=local-parse.service.js.map