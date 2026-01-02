"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("../../application/services/auth.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const jwt_strategy_1 = require("../../infrastructure/auth/jwt.strategy");
const prisma_module_1 = require("../../../prisma/prisma.module");
const activity_log_module_1 = require("../activity-log/activity-log.module");
function requireJwtSecret() {
    const secret = process.env.JWT_SECRET;
    const env = (process.env.NODE_ENV || '').toLowerCase();
    if (env === 'production' && (!secret || secret.trim().length < 32)) {
        throw new Error('JWT_SECRET must be set and at least 32 characters in production');
    }
    return secret || 'dev-secret';
}
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({
                secret: requireJwtSecret(),
                signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
            }),
            prisma_module_1.PrismaModule,
            activity_log_module_1.ActivityLogModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, prisma_service_1.PrismaService, jwt_strategy_1.JwtStrategy],
        exports: [jwt_1.JwtModule, passport_1.PassportModule, auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map