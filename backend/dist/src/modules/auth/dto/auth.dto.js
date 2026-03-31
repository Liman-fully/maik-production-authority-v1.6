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
exports.SendSmsDto = exports.RegisterDto = exports.LoginDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN'),
    __metadata("design:type", String)
], LoginDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], LoginDto.prototype, "code", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN'),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(6, 6),
    __metadata("design:type", String)
], RegisterDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '张三' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '110101199001011234' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(18, 18),
    __metadata("design:type", String)
], RegisterDto.prototype, "idCard", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['hr', 'seeker'] }),
    (0, class_validator_1.IsEnum)(['hr', 'seeker']),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
class SendSmsDto {
}
exports.SendSmsDto = SendSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '13800138000' }),
    (0, class_validator_1.IsMobilePhone)('zh-CN'),
    __metadata("design:type", String)
], SendSmsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['login', 'register'] }),
    (0, class_validator_1.IsEnum)(['login', 'register']),
    __metadata("design:type", String)
], SendSmsDto.prototype, "type", void 0);
//# sourceMappingURL=auth.dto.js.map