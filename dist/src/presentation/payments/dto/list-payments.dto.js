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
exports.ListPaymentsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class ListPaymentsDto {
    association_id;
    driver_id;
    created_by_user_id;
    fee_plan;
    plate_number;
    payment_method;
    from_date;
    to_date;
}
exports.ListPaymentsDto = ListPaymentsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by association ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "association_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by driver ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "driver_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by user who created payment' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumberString)(),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "created_by_user_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.FeePlan, description: 'Filter by fee plan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FeePlan),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "fee_plan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by plate number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, no_html_decorator_1.NoHtml)({ message: 'plate_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' }),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "plate_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PaymentMethod, description: 'Filter by payment method' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PaymentMethod),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "payment_method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date (inclusive, YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/u, { message: 'from_date must be YYYY-MM-DD' }),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "from_date", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date (inclusive, YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/u, { message: 'to_date must be YYYY-MM-DD' }),
    __metadata("design:type", String)
], ListPaymentsDto.prototype, "to_date", void 0);
//# sourceMappingURL=list-payments.dto.js.map