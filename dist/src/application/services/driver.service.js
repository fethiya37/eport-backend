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
exports.DriverService = void 0;
const common_1 = require("@nestjs/common");
const driver_repository_1 = require("../../domain/repositories/driver.repository");
const association_policy_repository_1 = require("../../domain/repositories/association-policy.repository");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const roles_util_1 = require("../../common/auth/roles.util");
const bcrypt = __importStar(require("bcrypt"));
const library_1 = require("@prisma/client/runtime/library");
const activity_log_service_1 = require("../services/activity-log.service");
const password_1 = require("../../common/security/password");
let DriverService = class DriverService {
    drivers;
    policyRepo;
    prisma;
    activityLog;
    constructor(drivers, policyRepo, prisma, activityLog) {
        this.drivers = drivers;
        this.policyRepo = policyRepo;
        this.prisma = prisma;
        this.activityLog = activityLog;
    }
    async create(ctx, dto) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot create drivers');
        }
        if (!ctx.association_id) {
            throw new common_1.BadRequestException('association_id is required');
        }
        const fullName = dto.full_name.trim();
        const phone = dto.phone_number.trim();
        const licenseNo = dto.license_no === undefined ? undefined : (dto.license_no ?? null);
        const licenseNoTrimmed = typeof licenseNo === 'string' ? licenseNo.trim() : licenseNo;
        const driverUserExists = await this.prisma.user.findUnique({
            where: {
                phone_number_user_type: {
                    phone_number: phone,
                    user_type: client_1.UserType.Driver,
                },
            },
            select: { id: true },
        });
        if (driverUserExists) {
            throw new common_1.BadRequestException('Driver with this phone number already exists');
        }
        const driver = await this.prisma.$transaction(async (tx) => {
            const password_hash = await bcrypt.hash(phone, 10);
            const user = await tx.user.create({
                data: {
                    phone_number: phone,
                    user_type: client_1.UserType.Driver,
                    name: fullName,
                    password_hash,
                    is_locked: false,
                    association_id: ctx.association_id,
                },
            });
            const createdDriver = await this.drivers.create(ctx, {
                user_id: user.id,
                association_id: ctx.association_id,
                full_name: fullName,
                phone_number: phone,
                license_no: licenseNoTrimmed,
                license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : null,
                has_smartphone: dto.has_smartphone,
            }, tx);
            return createdDriver;
        });
        await this.activityLog.log(ctx, {
            module: 'Driver',
            action: 'CREATE',
            entity: 'Driver',
            entity_id: driver.id,
        });
        return driver;
    }
    async findAll(ctx, filter) {
        return this.drivers.findAll(ctx, filter);
    }
    async findOneWithActive(ctx, id) {
        const driver = await this.drivers.findById(ctx, id);
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { driver_id: id },
            select: { plate_number: true },
        });
        return { ...driver, active_plate_number: vehicle?.plate_number ?? null };
    }
    async update(ctx, id, dto) {
        const existing = await this.drivers.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Driver not found');
        const fullName = dto.full_name?.trim();
        const phone = dto.phone_number?.trim();
        const licenseNo = dto.license_no === undefined ? undefined : (dto.license_no ?? null);
        const licenseNoTrimmed = typeof licenseNo === 'string' ? licenseNo.trim() : licenseNo;
        try {
            if (phone && phone !== existing.phone_number) {
                const dup = await this.prisma.user.findFirst({
                    where: {
                        phone_number: phone,
                        user_type: client_1.UserType.Driver,
                        NOT: { id: existing.user_id },
                    },
                    select: { id: true },
                });
                if (dup)
                    throw new common_1.BadRequestException('Driver with this phone number already exists');
            }
            const updated = await this.drivers.update(ctx, id, {
                full_name: fullName,
                phone_number: phone,
                status: dto.status,
                license_no: licenseNoTrimmed ?? undefined,
                license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
                has_smartphone: dto.has_smartphone,
                active_until_date: dto.active_until_date === undefined
                    ? undefined
                    : dto.active_until_date
                        ? new Date(dto.active_until_date)
                        : null,
                interest_accrued: dto.interest_accrued,
            });
            if (fullName !== undefined || phone !== undefined) {
                await this.prisma.user.update({
                    where: { id: updated.user_id },
                    data: {
                        ...(fullName !== undefined ? { name: fullName } : {}),
                        ...(phone !== undefined ? { phone_number: phone } : {}),
                    },
                });
            }
            await this.activityLog.log(ctx, {
                module: 'Driver',
                action: 'UPDATE',
                entity: 'Driver',
                entity_id: updated.id,
            });
            return updated;
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException)
                throw err;
            if (err instanceof library_1.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new common_1.BadRequestException('Driver with this phone number already exists');
            }
            throw err;
        }
    }
    async remove(ctx, id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot delete drivers');
        }
        const driver = await this.drivers.findById(ctx, id);
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const removed = await this.prisma.$transaction(async (tx) => {
            await tx.vehicle.updateMany({
                where: { driver_id: id },
                data: { driver_id: null },
            });
            await this.drivers.remove(ctx, id, tx);
            await tx.user.delete({ where: { id: driver.user_id } });
            return driver;
        });
        await this.activityLog.log(ctx, {
            module: 'Driver',
            action: 'DELETE',
            entity: 'Driver',
            entity_id: removed.id,
        });
        return removed;
    }
    async findDriversWithoutVehicle(ctx) {
        return this.drivers.findWithoutVehicle(ctx);
    }
    async resetPassword(ctx, id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot reset driver password here');
        }
        if (!ctx.association_id) {
            throw new common_1.BadRequestException('association_id is required');
        }
        const driver = await this.prisma.driver.findFirst({
            where: { id, association_id: ctx.association_id },
            select: { id: true, user_id: true, phone_number: true },
        });
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const temp_password = (0, password_1.generateStrongPassword)();
        (0, password_1.assertStrongPassword)(temp_password, driver.phone_number);
        const password_hash = await bcrypt.hash(temp_password, 12);
        await this.prisma.user.update({
            where: { id: driver.user_id },
            data: {
                password_hash,
                must_change_password: true,
                failed_login_attempts: 0,
                locked_until: null,
                is_locked: false,
            },
        });
        await this.activityLog.log(ctx, {
            module: 'Driver',
            action: 'RESET_PASSWORD',
            entity: 'Driver',
            entity_id: driver.id,
        });
        return { temp_password };
    }
};
exports.DriverService = DriverService;
exports.DriverService = DriverService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(driver_repository_1.DRIVER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, prisma_service_1.PrismaService,
        activity_log_service_1.ActivityLogService])
], DriverService);
//# sourceMappingURL=driver.service.js.map