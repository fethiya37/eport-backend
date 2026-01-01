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
exports.PayDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class PayDto {
    driver_id;
    plate_number;
    fee_plan;
    prepaid_qty;
    covered_start_date;
    covered_end_date;
    amount;
    payment_method;
}
exports.PayDto = PayDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Driver ID if paying for a specific driver' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PayDto.prototype, "driver_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vehicle plate number if paying by vehicle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, no_html_decorator_1.NoHtml)({ message: 'plate_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' }),
    __metadata("design:type", String)
], PayDto.prototype, "plate_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Plan type',
        enum: ['WEEKLY', 'MONTHLY'],
        example: 'WEEKLY',
    }),
    (0, class_validator_1.IsIn)(['WEEKLY', 'MONTHLY'], { message: 'fee_plan must be WEEKLY or MONTHLY' }),
    __metadata("design:type", String)
], PayDto.prototype, "fee_plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of periods to prepay (0 = only clear overdue/current)',
        example: 1,
        minimum: 0,
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PayDto.prototype, "prepaid_qty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Coverage start date (ISO 8601, inclusive)',
        example: '2025-09-01',
    }),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PayDto.prototype, "covered_start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Coverage end date (ISO 8601, inclusive)',
        example: '2025-09-07',
    }),
    (0, class_validator_1.IsISO8601)(),
    __metadata("design:type", String)
], PayDto.prototype, "covered_end_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional safeguard to ensure client/server totals match',
        example: 500.0,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ allowNaN: false, allowInfinity: false }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PayDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment method used',
        enum: ['CASH', 'BANK', 'MOBILE', 'OTHER'],
        example: 'CASH',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, no_html_decorator_1.NoHtml)({ message: 'payment_method must not include HTML or script tags' }),
    (0, class_validator_1.IsIn)(['CASH', 'BANK', 'MOBILE', 'OTHER'], {
        message: 'payment_method must be CASH, BANK, MOBILE, or OTHER',
    }),
    __metadata("design:type", String)
], PayDto.prototype, "payment_method", void 0);
//# sourceMappingURL=pay.dto.js.map