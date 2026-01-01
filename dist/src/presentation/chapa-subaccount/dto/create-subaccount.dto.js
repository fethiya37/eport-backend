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
exports.CreateSubaccountDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class CreateSubaccountDto {
    bank_code;
    account_number;
    account_name;
    business_name;
    split_type = 'percentage';
    split_value = 1;
}
exports.CreateSubaccountDto = CreateSubaccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Chapa bank code as a number' }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSubaccountDto.prototype, "bank_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0123456789' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(30),
    (0, no_html_decorator_1.NoHtml)({ message: 'account_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^[0-9]+$/u, { message: 'account_number must contain digits only' }),
    __metadata("design:type", String)
], CreateSubaccountDto.prototype, "account_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abebe Kebede' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, no_html_decorator_1.NoHtml)({ message: 'account_name must not include HTML or script tags' }),
    __metadata("design:type", String)
], CreateSubaccountDto.prototype, "account_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Addis Taxi Association' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(150),
    (0, no_html_decorator_1.NoHtml)({ message: 'business_name must not include HTML or script tags' }),
    __metadata("design:type", String)
], CreateSubaccountDto.prototype, "business_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['fixed', 'percentage'], default: 'percentage', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['fixed', 'percentage']),
    __metadata("design:type", String)
], CreateSubaccountDto.prototype, "split_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Use 1 to send 100% to association', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ allowNaN: false, allowInfinity: false }),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(1),
    __metadata("design:type", Number)
], CreateSubaccountDto.prototype, "split_value", void 0);
//# sourceMappingURL=create-subaccount.dto.js.map