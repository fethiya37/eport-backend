"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    prisma;
    jwt;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async login(input) {
        const user = await this.prisma.user.findUnique({
            where: { phone_number: input.phone_number },
        });
        if (!user || !user.password_hash) {
            throw new common_1.UnauthorizedException('invalid credentials');
        }
        if (user.is_locked) {
            throw new common_1.ForbiddenException('user is locked');
        }
        const ok = await bcrypt.compare(input.password, user.password_hash);
        if (!ok)
            throw new common_1.UnauthorizedException('invalid credentials');
        if ((user.user_type === client_1.UserType.Association || user.user_type === client_1.UserType.Driver) &&
            !user.association_id) {
            throw new common_1.ForbiddenException(`User type ${user.user_type} must belong to an association`);
        }
        let driver_id = null;
        if (user.user_type === client_1.UserType.Driver) {
            const driver = await this.prisma.driver.findUnique({
                where: { user_id: user.id },
                select: { id: true },
            });
            driver_id = driver?.id ?? null;
            if (!driver_id) {
                throw new common_1.ForbiddenException('Driver account is not linked to driver record');
            }
        }
        const jti = crypto.randomUUID();
        const payload = {
            sub: user.id,
            user_type: user.user_type,
            association_id: user.association_id ?? null,
            driver_id: driver_id ?? null,
            jti,
        };
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
        const access_token = await this.jwt.signAsync(payload, { expiresIn });
        const decoded = this.jwt.decode(access_token);
        const exp = decoded?.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 24 * 3600 * 1000);
        const token_hash = crypto.createHash('sha256').update(access_token).digest('hex');
        await this.prisma.userToken.create({
            data: {
                user_id: user.id,
                token_hash,
                expires_at: exp,
                revoked: false,
            },
        });
        let association_name = null;
        if (user.association_id) {
            const assoc = await this.prisma.association.findUnique({
                where: { id: user.association_id },
                select: { name: true },
            });
            association_name = assoc?.name ?? null;
        }
        return {
            access_token,
            user: {
                id: user.id,
                phone_number: user.phone_number,
                user_type: user.user_type,
                association_id: user.association_id ?? null,
                association_name,
                driver_id,
                name: user.name ?? null,
            },
            exp: Math.floor(exp.getTime() / 1000),
            jti,
        };
    }
    async logout(input) {
        await this.prisma.revokedToken.upsert({
            where: { jti: input.jti },
            create: {
                jti: input.jti,
                user_id: input.user_id,
                expires_at: new Date(input.exp * 1000),
            },
            update: { expires_at: new Date(input.exp * 1000) },
        });
        return { status: 'ok' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map