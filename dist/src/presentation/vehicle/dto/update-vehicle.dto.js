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
exports.UpdateVehicleDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class UpdateVehicleDto {
    plate_number;
    libre_no;
    owner_id;
    driver_id;
    make;
    model;
    color;
    capacity;
    vehicle_status;
    is_weekly;
}
exports.UpdateVehicleDto = UpdateVehicleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ABC-54321' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, no_html_decorator_1.NoHtml)({ message: 'plate_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' }),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "plate_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'LIBRE-1122' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    (0, no_html_decorator_1.NoHtml)({ message: 'libre_no must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^[A-Za-z0-9-]+$/u, { message: 'libre_no contains invalid characters' }),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "libre_no", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 11 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateVehicleDto.prototype, "owner_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 22, description: 'Driver ID assigned to this vehicle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "driver_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Hyundai' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'make must not include HTML or script tags' }),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "make", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'i10' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'model must not include HTML or script tags' }),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Black' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'color must not include HTML or script tags' }),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], UpdateVehicleDto.prototype, "capacity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.VehicleStatus, example: 'MAINTENANCE' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.VehicleStatus),
    __metadata("design:type", String)
], UpdateVehicleDto.prototype, "vehicle_status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Whether the vehicle is on a weekly plan' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVehicleDto.prototype, "is_weekly", void 0);
//# sourceMappingURL=update-vehicle.dto.js.map