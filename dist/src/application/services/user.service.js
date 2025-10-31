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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("../../domain/repositories/user.repository");
const prisma_service_1 = require("../../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const roles_util_1 = require("../../common/auth/roles.util");
function canManage(acting, target) {
    if (acting === 'Superadmin')
        return ['Superadmin', 'Admin', 'Controller', 'Association'].includes(target);
    if (acting === 'Admin')
        return ['Controller', 'Association'].includes(target);
    return false;
}
const SHARABLE_ROLES = new Set(['Association', 'Driver']);
let UserService = class UserService {
    users;
    prisma;
    constructor(users, prisma) {
        this.users = users;
        this.prisma = prisma;
    }
    async create(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        if (!canManage(ctx.user_type, dto.user_type)) {
            throw new common_1.ForbiddenException(`You cannot create user_type ${dto.user_type}`);
        }
        const siblings = await this.prisma.user.findMany({
            where: { phone_number: dto.phone_number },
            select: { id: true, user_type: true },
        });
        if (siblings.length > 0) {
            const rolesOnPhone = new Set(siblings.map(s => s.user_type));
            const isAllSharable = Array.from(rolesOnPhone).every(r => SHARABLE_ROLES.has(r));
            const creatingSharable = SHARABLE_ROLES.has(dto.user_type);
            if (!(isAllSharable && creatingSharable)) {
                throw new common_1.BadRequestException('Phone number is already in use');
            }
            if (rolesOnPhone.has(dto.user_type)) {
                throw new common_1.BadRequestException('This phone and role already exist');
            }
        }
        let associationId = null;
        if (dto.user_type === 'Association' || dto.user_type === 'Driver') {
            if (dto.association_id == null)
                throw new common_1.BadRequestException('association_id is required');
            const assoc = await this.prisma.association.findUnique({ where: { id: dto.association_id } });
            if (!assoc)
                throw new common_1.BadRequestException('association not found');
            associationId = dto.association_id;
        }
        else {
            associationId = null;
        }
        const password_hash = await bcrypt.hash(dto.phone_number, 10);
        return this.users.create({
            phone_number: dto.phone_number,
            user_type: dto.user_type,
            name: dto.name ?? null,
            association_id: associationId,
            password_hash,
        });
    }
    async findAll(ctx, raw) {
        const filter = { ...raw };
        if (ctx.user_type === 'Admin' && filter.user_type && !canManage('Admin', filter.user_type)) {
            return [];
        }
        const list = await this.users.findAll(filter);
        return ctx.user_type === 'Superadmin'
            ? list
            : list.filter(u => canManage(ctx.user_type, u.user_type));
    }
    async findOne(ctx, id) {
        const user = await this.users.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        if (!canManage(ctx.user_type, user.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        return user;
    }
    async update(ctx, id, dto) {
        const existing = await this.users.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        if (!canManage(ctx.user_type, existing.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        if (id === ctx.userId && dto.is_locked !== undefined) {
            throw new common_1.ForbiddenException('You cannot lock yourself');
        }
        const nextPhone = dto.phone_number ?? existing.phone_number;
        const nextRole = dto.user_type ?? existing.user_type;
        if (nextPhone !== existing.phone_number || nextRole !== existing.user_type) {
            const siblings = await this.prisma.user.findMany({
                where: { phone_number: nextPhone, NOT: { id } },
                select: { id: true, user_type: true },
            });
            if (siblings.length > 0) {
                const rolesOnPhone = new Set(siblings.map(s => s.user_type));
                const isAllSharable = Array.from(rolesOnPhone).every(r => SHARABLE_ROLES.has(r));
                const nextIsSharable = SHARABLE_ROLES.has(nextRole);
                if (!(isAllSharable && nextIsSharable)) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
                if (rolesOnPhone.has(nextRole)) {
                    throw new common_1.BadRequestException('This phone and role already exist');
                }
            }
        }
        let finalAssociationId;
        if (nextRole === 'Association' || nextRole === 'Driver') {
            const candidate = dto.association_id ?? existing.association_id;
            if (candidate == null)
                throw new common_1.BadRequestException('association_id is required');
            const assoc = await this.prisma.association.findUnique({ where: { id: candidate } });
            if (!assoc)
                throw new common_1.BadRequestException('association not found');
            finalAssociationId = candidate;
        }
        else {
            finalAssociationId = null;
        }
        return this.users.update(id, {
            phone_number: nextPhone,
            user_type: nextRole,
            name: dto.name !== undefined ? dto.name : existing.name,
            is_locked: dto.is_locked ?? existing.is_locked,
            association_id: finalAssociationId,
        });
    }
    async remove(ctx, id) {
        const user = await this.users.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        if (!canManage(ctx.user_type, user.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        if (id === ctx.userId)
            throw new common_1.ForbiddenException('You cannot delete yourself');
        return this.users.remove(id);
    }
    async changeOwnPassword(ctx, dto) {
        const me = await this.users.findById(ctx.userId);
        if (!me || !me.password_hash)
            throw new common_1.NotFoundException('User not found');
        const ok = await bcrypt.compare(dto.old_password, me.password_hash);
        if (!ok)
            throw new common_1.BadRequestException('old password is incorrect');
        const new_hash = await bcrypt.hash(dto.new_password, 10);
        await this.users.update(ctx.userId, { password_hash: new_hash });
        return { success: true };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map