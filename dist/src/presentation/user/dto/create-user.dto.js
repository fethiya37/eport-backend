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
exports.CreateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class CreateUserDto {
    phone_number;
    user_type;
    name;
    association_id;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+251912345678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(13),
    (0, no_html_decorator_1.NoHtml)({ message: 'phone_number must not include HTML or script tags' }),
    (0, class_validator_1.Matches)(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: client_1.UserType, example: client_1.UserType.Admin }),
    (0, class_validator_1.IsEnum)(client_1.UserType),
    __metadata("design:type", String)
], CreateUserDto.prototype, "user_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Wingo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    (0, no_html_decorator_1.NoHtml)({ message: 'name must not include HTML or script tags' }),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Required only if user_type = Association' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Object)
], CreateUserDto.prototype, "association_id", void 0);
//# sourceMappingURL=create-user.dto.js.map