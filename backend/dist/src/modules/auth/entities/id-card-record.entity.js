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
exports.IdCardRecord = exports.AuthRecordType = void 0;
const typeorm_1 = require("typeorm");
var AuthRecordType;
(function (AuthRecordType) {
    AuthRecordType["REGISTER"] = "id_card";
})(AuthRecordType || (exports.AuthRecordType = AuthRecordType = {}));
let IdCardRecord = class IdCardRecord {
};
exports.IdCardRecord = IdCardRecord;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IdCardRecord.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'id_card_hash', length: 64 }),
    __metadata("design:type", String)
], IdCardRecord.prototype, "idCardHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'register_count', default: 1 }),
    __metadata("design:type", Number)
], IdCardRecord.prototype, "registerCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], IdCardRecord.prototype, "createdAt", void 0);
exports.IdCardRecord = IdCardRecord = __decorate([
    (0, typeorm_1.Entity)('id_card_records')
], IdCardRecord);
//# sourceMappingURL=id-card-record.entity.js.map