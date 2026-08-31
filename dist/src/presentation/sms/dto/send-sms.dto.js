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
exports.SendSmsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SendSmsDto {
    to;
    message;
}
exports.SendSmsDto = SendSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+251912345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^\+251[79]\d{8}$/, {
        message: 'Invalid Ethiopian phone number format',
    }),
    __metadata("design:type", String)
], SendSmsDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Your password is: TempPass123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(160, { message: 'Message must not exceed 160 characters' }),
    __metadata("design:type", String)
], SendSmsDto.prototype, "message", void 0);
//# sourceMappingURL=send-sms.dto.js.map