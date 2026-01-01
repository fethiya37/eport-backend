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
exports.CreateRouteQuotaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class CreateRouteQuotaDto {
    association_id;
    route_id;
    start_date;
    end_date;
    no_vehicles;
}
exports.CreateRouteQuotaDto = CreateRouteQuotaDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRouteQuotaDto.prototype, "association_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRouteQuotaDto.prototype, "route_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2017-01-01' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    (0, no_html_decorator_1.NoHtml)({ message: 'start_date must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/u, { message: 'start_date must be YYYY-MM-DD' }),
    __metadata("design:type", String)
], CreateRouteQuotaDto.prototype, "start_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2017-01-07' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(10),
    (0, no_html_decorator_1.NoHtml)({ message: 'end_date must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/u, { message: 'end_date must be YYYY-MM-DD' }),
    __metadata("design:type", String)
], CreateRouteQuotaDto.prototype, "end_date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateRouteQuotaDto.prototype, "no_vehicles", void 0);
//# sourceMappingURL=create-route-quota.dto.js.map