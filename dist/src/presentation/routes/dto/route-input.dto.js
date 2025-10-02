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
exports.RouteInputDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class RouteInputDto {
    id;
    departure;
    arrival;
    kilometer;
    tariff;
}
exports.RouteInputDto = RouteInputDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12, description: 'If provided, this route will be updated; otherwise created' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RouteInputDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Addis Ababa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RouteInputDto.prototype, "departure", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Adama' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], RouteInputDto.prototype, "arrival", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '99.50', description: 'numeric(6,2) — string or number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RouteInputDto.prototype, "kilometer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '150.00', description: 'numeric(6,2) — string or number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], RouteInputDto.prototype, "tariff", void 0);
//# sourceMappingURL=route-input.dto.js.map