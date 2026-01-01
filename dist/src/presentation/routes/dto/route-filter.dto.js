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
exports.RouteFilterDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class RouteFilterDto {
    route_group_id;
    departure_contains;
    arrival_contains;
}
exports.RouteFilterDto = RouteFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RouteFilterDto.prototype, "route_group_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Addis' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'departure_contains must not include HTML or script tags' }),
    __metadata("design:type", String)
], RouteFilterDto.prototype, "departure_contains", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Adama' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'arrival_contains must not include HTML or script tags' }),
    __metadata("design:type", String)
], RouteFilterDto.prototype, "arrival_contains", void 0);
//# sourceMappingURL=route-filter.dto.js.map