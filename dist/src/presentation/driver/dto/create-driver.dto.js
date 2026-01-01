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
exports.CreateDriverDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class CreateDriverDto {
    full_name;
    phone_number;
    license_no;
    license_expiry;
    has_smartphone;
}
exports.CreateDriverDto = CreateDriverDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Abebe Kebede' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    (0, no_html_decorator_1.NoHtml)({ message: 'full_name must not include HTML or script tags' }),
    __metadata("design:type", String)
], CreateDriverDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+251912345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(13),
    (0, no_html_decorator_1.NoHtml)({ message: 'phone_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' }),
    __metadata("design:type", String)
], CreateDriverDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'D-123456' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    (0, no_html_decorator_1.NoHtml)({ message: 'license_no must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9-]+$/u, { message: 'license_no contains invalid characters' }),
    __metadata("design:type", Object)
], CreateDriverDto.prototype, "license_no", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2030-12-31' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Object)
], CreateDriverDto.prototype, "license_expiry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDriverDto.prototype, "has_smartphone", void 0);
//# sourceMappingURL=create-driver.dto.js.map