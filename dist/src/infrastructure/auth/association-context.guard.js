"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationContextGuard = void 0;
const common_1 = require("@nestjs/common");
const roles_util_1 = require("../../common/auth/roles.util");
const client_1 = require("@prisma/client");
let AssociationContextGuard = class AssociationContextGuard {
    canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;
        if (!user)
            throw new common_1.ForbiddenException('Unauthorized');
        if (user.user_type &&
            ((0, roles_util_1.isAdminLike)(user.user_type) || user.user_type === client_1.UserType.Controller)) {
            return true;
        }
        if (user.association_id == null) {
            throw new common_1.ForbiddenException('Association context required');
        }
        return true;
    }
};
exports.AssociationContextGuard = AssociationContextGuard;
exports.AssociationContextGuard = AssociationContextGuard = __decorate([
    (0, common_1.Injectable)()
], AssociationContextGuard);
//# sourceMappingURL=association-context.guard.js.map