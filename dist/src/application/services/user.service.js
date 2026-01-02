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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const roles_util_1 = require("../../common/auth/roles.util");
const activity_log_service_1 = require("../services/activity-log.service");
const password_1 = require("../../common/security/password");
const SHARABLE_ROLES = new Set(['Association', 'Driver']);
function canCreateOrUpdateRole(acting, target) {
    if (acting === client_1.UserType.Superadmin) {
        return target === client_1.UserType.Admin || target === client_1.UserType.Controller || target === client_1.UserType.Association;
    }
    if (acting === client_1.UserType.Admin) {
        return target === client_1.UserType.Controller || target === client_1.UserType.Association;
    }
    return false;
}
function canReadRole(acting, target) {
    if (acting === client_1.UserType.Superadmin)
        return true;
    if (acting === client_1.UserType.Admin)
        return target === client_1.UserType.Controller || target === client_1.UserType.Association;
    return false;
}
let UserService = class UserService {
    users;
    prisma;
    activityLog;
    constructor(users, prisma, activityLog) {
        this.users = users;
        this.prisma = prisma;
        this.activityLog = activityLog;
    }
    async create(ctx, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        if (dto.user_type === client_1.UserType.Superadmin) {
            throw new common_1.ForbiddenException('Superadmin can only be created by seeding');
        }
        if (!canCreateOrUpdateRole(ctx.user_type, dto.user_type)) {
            throw new common_1.ForbiddenException(`You cannot create user_type ${dto.user_type}`);
        }
        const siblings = await this.prisma.user.findMany({
            where: { phone_number: dto.phone_number },
            select: { id: true, user_type: true },
        });
        if (siblings.length > 0) {
            const rolesOnPhone = new Set(siblings.map((s) => s.user_type));
            const isAllSharable = Array.from(rolesOnPhone).every((r) => SHARABLE_ROLES.has(r));
            const creatingSharable = SHARABLE_ROLES.has(dto.user_type);
            if (!(isAllSharable && creatingSharable)) {
                throw new common_1.BadRequestException('Phone number is already in use');
            }
            if (rolesOnPhone.has(dto.user_type)) {
                throw new common_1.BadRequestException('This phone and role already exist');
            }
        }
        let associationId = null;
        if (dto.user_type === client_1.UserType.Association || dto.user_type === client_1.UserType.Driver) {
            if (dto.association_id == null)
                throw new common_1.BadRequestException('association_id is required');
            const assoc = await this.prisma.association.findUnique({ where: { id: dto.association_id } });
            if (!assoc)
                throw new common_1.BadRequestException('association not found');
            associationId = dto.association_id;
        }
        const temp_password = (0, password_1.generateStrongPassword)();
        (0, password_1.assertStrongPassword)(temp_password, dto.phone_number);
        const password_hash = await bcrypt.hash(temp_password, 12);
        const created = await this.users.create({
            phone_number: dto.phone_number,
            user_type: dto.user_type,
            name: dto.name ?? null,
            association_id: associationId,
            password_hash,
        });
        await this.users.update(created.id, { must_change_password: true });
        await this.activityLog.log(ctx, {
            module: 'User',
            action: 'CREATE',
            entity: 'User',
            entity_id: created.id,
        });
        return { user: created, temp_password };
    }
    async findAll(ctx, raw) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const filter = { ...raw };
        const list = await this.users.findAll(filter);
        if (ctx.user_type === client_1.UserType.Superadmin)
            return list;
        return list.filter((u) => canReadRole(ctx.user_type, u.user_type));
    }
    async findOne(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const user = await this.users.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!canReadRole(ctx.user_type, user.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        return user;
    }
    async update(ctx, id, dto) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const existing = await this.users.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        if (!canReadRole(ctx.user_type, existing.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        if (id === ctx.userId && dto.is_locked !== undefined) {
            throw new common_1.ForbiddenException('You cannot lock yourself');
        }
        if (existing.user_type === client_1.UserType.Superadmin) {
            if (dto.user_type !== undefined && dto.user_type !== client_1.UserType.Superadmin) {
                throw new common_1.ForbiddenException('Superadmin role cannot be changed');
            }
            if (dto.phone_number !== undefined && dto.phone_number !== existing.phone_number) {
                throw new common_1.ForbiddenException('Superadmin phone_number cannot be changed');
            }
        }
        if (dto.user_type === client_1.UserType.Superadmin) {
            throw new common_1.ForbiddenException('Superadmin can only be created by seeding');
        }
        const nextPhone = dto.phone_number ?? existing.phone_number;
        const nextRole = dto.user_type ?? existing.user_type;
        if (nextRole !== existing.user_type) {
            if (!canCreateOrUpdateRole(ctx.user_type, nextRole)) {
                throw new common_1.ForbiddenException(`You cannot set user_type ${nextRole}`);
            }
        }
        if (nextPhone !== existing.phone_number || nextRole !== existing.user_type) {
            const siblings = await this.prisma.user.findMany({
                where: { phone_number: nextPhone, NOT: { id } },
                select: { id: true, user_type: true },
            });
            if (siblings.length > 0) {
                const rolesOnPhone = new Set(siblings.map((s) => s.user_type));
                const isAllSharable = Array.from(rolesOnPhone).every((r) => SHARABLE_ROLES.has(r));
                const nextIsSharable = SHARABLE_ROLES.has(nextRole);
                if (!(isAllSharable && nextIsSharable)) {
                    throw new common_1.BadRequestException('Phone number is already in use');
                }
                if (rolesOnPhone.has(nextRole)) {
                    throw new common_1.BadRequestException('This phone and role already exist');
                }
            }
        }
        let finalAssociationId = existing.association_id ?? null;
        if (nextRole === client_1.UserType.Association || nextRole === client_1.UserType.Driver) {
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
        const updated = await this.users.update(id, {
            phone_number: nextPhone,
            user_type: nextRole,
            name: dto.name !== undefined ? dto.name : existing.name,
            is_locked: dto.is_locked ?? existing.is_locked,
            association_id: finalAssociationId,
        });
        await this.activityLog.log(ctx, {
            module: 'User',
            action: 'UPDATE',
            entity: 'User',
            entity_id: id,
        });
        return updated;
    }
    async remove(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const user = await this.users.findById(id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (id === ctx.userId)
            throw new common_1.ForbiddenException('You cannot delete yourself');
        if (user.user_type === client_1.UserType.Superadmin) {
            throw new common_1.ForbiddenException('Superadmin cannot be deleted');
        }
        if (!canCreateOrUpdateRole(ctx.user_type, user.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        const deleted = await this.users.remove(id);
        await this.activityLog.log(ctx, {
            module: 'User',
            action: 'DELETE',
            entity: 'User',
            entity_id: id,
        });
        return deleted;
    }
    async changeOwnPassword(ctx, dto) {
        const me = await this.users.findById(ctx.userId);
        if (!me || !me.password_hash)
            throw new common_1.NotFoundException('User not found');
        const ok = await bcrypt.compare(dto.old_password, me.password_hash);
        if (!ok)
            throw new common_1.BadRequestException('old password is incorrect');
        (0, password_1.assertStrongPassword)(dto.new_password, me.phone_number);
        const new_hash = await bcrypt.hash(dto.new_password, 12);
        await this.users.update(ctx.userId, {
            password_hash: new_hash,
            must_change_password: false,
            failed_login_attempts: 0,
            locked_until: null,
            is_locked: false,
        });
        await this.activityLog.log(ctx, {
            module: 'User',
            action: 'CHANGE_PASSWORD',
            entity: 'User',
            entity_id: ctx.userId,
        });
        return { success: true };
    }
    async resetPasswordByAdmin(ctx, id) {
        if (!(0, roles_util_1.isAdminLike)(ctx.user_type))
            throw new common_1.ForbiddenException('Only Admin/Superadmin');
        const target = await this.users.findById(id);
        if (!target)
            throw new common_1.NotFoundException('User not found');
        if (target.user_type === client_1.UserType.Superadmin) {
            throw new common_1.ForbiddenException('Superadmin password cannot be reset here');
        }
        if (!canReadRole(ctx.user_type, target.user_type)) {
            throw new common_1.ForbiddenException('Insufficient privileges');
        }
        const temp_password = (0, password_1.generateStrongPassword)();
        (0, password_1.assertStrongPassword)(temp_password, target.phone_number);
        const password_hash = await bcrypt.hash(temp_password, 12);
        await this.users.update(id, {
            password_hash,
            must_change_password: true,
            failed_login_attempts: 0,
            locked_until: null,
            is_locked: false,
        });
        await this.activityLog.log(ctx, {
            module: 'User',
            action: 'RESET_PASSWORD',
            entity: 'User',
            entity_id: id,
        });
        return { temp_password };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(user_repository_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], UserService);
//# sourceMappingURL=user.service.js.map