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
exports.UpdateAssociationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class UpdateAssociationDto {
    name;
    phone_number;
    logo;
}
exports.UpdateAssociationDto = UpdateAssociationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'New Association Name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, no_html_decorator_1.NoHtml)({ message: 'name must not include HTML or script tags' }),
    __metadata("design:type", String)
], UpdateAssociationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+251922233344' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, no_html_decorator_1.NoHtml)({ message: 'phone_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^\+?[0-9]{7,20}$/u, {
        message: 'phone_number must be a valid phone number',
    }),
    __metadata("design:type", Object)
], UpdateAssociationDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/new-logo.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'logo must not include HTML or script tags' }),
    (0, class_validator_1.IsUrl)({ require_protocol: true }, { message: 'logo must be a valid URL' }),
    __metadata("design:type", Object)
], UpdateAssociationDto.prototype, "logo", void 0);
//# sourceMappingURL=update-association.dto.js.map