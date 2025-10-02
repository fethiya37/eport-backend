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
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateDriverDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+251911223344' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], CreateDriverDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'D-123456' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
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