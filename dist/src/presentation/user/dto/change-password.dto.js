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
exports.ChangePasswordDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const no_html_decorator_1 = require("../../../common/decorators/no-html.decorator");
class ChangePasswordDto {
    old_password;
    new_password;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ writeOnly: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(64),
    (0, no_html_decorator_1.NoHtml)({ message: 'old_password must not include HTML or script tags' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "old_password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ writeOnly: true }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.MaxLength)(64),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,64}$/, {
        message: 'new_password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 symbol',
    }),
    (0, no_html_decorator_1.NoHtml)({ message: 'new_password must not include HTML or script tags' }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "new_password", void 0);
//# sourceMappingURL=change-password.dto.js.map