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
exports.CreateAssociationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class CreateAssociationDto {
    name;
    phone_number;
    logo;
}
exports.CreateAssociationDto = CreateAssociationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Addis Ababa Drivers Coop' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, no_html_decorator_1.NoHtml)({ message: 'name must not include HTML/JS tags' }),
    __metadata("design:type", String)
], CreateAssociationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+251911223344' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(20),
    (0, no_html_decorator_1.NoHtml)({ message: 'phone_number must not include HTML/JS tags' }),
    (0, class_validator_1.Matches)(/^\+?[0-9]{7,20}$/u, { message: 'phone_number must be a valid phone number' }),
    __metadata("design:type", Object)
], CreateAssociationDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.example.com/logo.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    (0, no_html_decorator_1.NoHtml)({ message: 'logo must not include HTML/JS tags' }),
    (0, class_validator_1.IsUrl)({ require_protocol: true }, { message: 'logo must be a valid URL' }),
    __metadata("design:type", Object)
], CreateAssociationDto.prototype, "logo", void 0);
//# sourceMappingURL=create-association.dto.js.map