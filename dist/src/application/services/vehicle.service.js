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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const vehicle_repository_1 = require("../../domain/repositories/vehicle.repository");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const roles_util_1 = require("../../common/auth/roles.util");
const association_policy_repository_1 = require("../../domain/repositories/association-policy.repository");
let VehicleService = class VehicleService {
    vehicles;
    policyRepo;
    prisma;
    constructor(vehicles, policyRepo, prisma) {
        this.vehicles = vehicles;
        this.policyRepo = policyRepo;
        this.prisma = prisma;
    }
    pad2(n) {
        return n < 10 ? `0${n}` : `${n}`;
    }
    ymdUTC(d) {
        return d.toISOString().slice(0, 10);
    }
    todayEatYmd() {
        const now = new Date();
        const eatMs = now.getTime() + 3 * 3600_000;
        const eat = new Date(eatMs);
        return `${eat.getUTCFullYear()}-${this.pad2(eat.getUTCMonth() + 1)}-${this.pad2(eat.getUTCDate())}`;
    }
    dbDateEqualsTodayEAT(dbDate) {
        if (!dbDate)
            return false;
        return this.ymdUTC(dbDate) === this.todayEatYmd();
    }
    isOverdueEAT(activeUntil) {
        if (!activeUntil)
            return true;
        const au = this.ymdUTC(activeUntil);
        return au < this.todayEatYmd();
    }
    async computeTodaysInterest(input) {
        const p = await this.policyRepo.get(input.association_id);
        if (!p)
            return 0;
        const base = input.is_weekly ? p.weekly_fee : p.monthly_fee;
        const delta = base * p.daily_fine_percent;
        return Math.round((delta + Number.EPSILON) * 100) / 100;
    }
    async subtractTodaysInterestForOverdueDriver(driverId) {
        if (!driverId)
            return;
        const d = await this.prisma.driver.findUnique({
            where: { id: driverId },
            select: {
                id: true,
                association_id: true,
                active_until_date: true,
                interest_accrued: true,
                last_accrual_date: true,
                last_accrual_amount: true,
                vehicle: { select: { is_weekly: true } },
            },
        });
        if (!d)
            return;
        const overdue = this.isOverdueEAT(d.active_until_date ?? null);
        if (!overdue)
            return;
        const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
        if (!sameLocalDay)
            return;
        const lastAmt = Number(d.last_accrual_amount ?? 0);
        if (!(lastAmt > 0))
            return;
        const curr = Number(d.interest_accrued ?? 0);
        const newInterest = Math.max(0, curr - lastAmt);
        await this.prisma.driver.update({
            where: { id: d.id },
            data: {
                interest_accrued: newInterest,
                last_accrual_amount: 0,
            },
        });
    }
    async reAddTodaysInterestForOverdueDriver(driverId) {
        if (!driverId)
            return;
        const d = await this.prisma.driver.findUnique({
            where: { id: driverId },
            select: {
                id: true,
                association_id: true,
                active_until_date: true,
                interest_accrued: true,
                last_accrual_date: true,
                last_accrual_amount: true,
                vehicle: { select: { is_weekly: true } },
            },
        });
        if (!d)
            return;
        const overdue = this.isOverdueEAT(d.active_until_date ?? null);
        if (!overdue)
            return;
        const sameLocalDay = this.dbDateEqualsTodayEAT(d.last_accrual_date ?? null);
        if (!sameLocalDay)
            return;
        const lastAmt = Number(d.last_accrual_amount ?? 0);
        if (lastAmt !== 0)
            return;
        const delta = await this.computeTodaysInterest({
            association_id: d.association_id,
            is_weekly: Boolean(d.vehicle?.is_weekly),
        });
        if (delta <= 0)
            return;
        const curr = Number(d.interest_accrued ?? 0);
        await this.prisma.driver.update({
            where: { id: d.id },
            data: {
                interest_accrued: curr + delta,
                last_accrual_amount: delta,
            },
        });
    }
    async create(ctx, dto) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot create vehicles');
        }
        if (!ctx.association_id) {
            throw new common_1.BadRequestException('association_id is required');
        }
        return this.vehicles.create(ctx, {
            plate_number: dto.plate_number,
            libre_no: dto.libre_no ?? null,
            owner_id: dto.owner_id,
            association_id: ctx.association_id,
            driver_id: dto.driver_id ?? null,
            make: dto.make ?? null,
            model: dto.model ?? null,
            color: dto.color ?? null,
            capacity: dto.capacity ?? null,
            is_weekly: dto.is_weekly ?? false,
        });
    }
    findAll(ctx, filter) {
        return this.vehicles.findAll(ctx, filter);
    }
    async findOne(ctx, id) {
        const v = await this.vehicles.findById(ctx, id);
        if (!v)
            throw new common_1.NotFoundException('Vehicle not found');
        return v;
    }
    async findActiveWithoutDriver(ctx) {
        return this.vehicles.findActiveWithoutDriver(ctx);
    }
    async update(ctx, id, dto) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot update vehicles');
        }
        const existing = await this.vehicles.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Vehicle not found');
        const updated = await this.vehicles.update(ctx, id, {
            plate_number: dto.plate_number,
            libre_no: dto.libre_no,
            owner_id: dto.owner_id,
            driver_id: dto.driver_id ?? existing.driver_id,
            make: dto.make,
            model: dto.model,
            color: dto.color,
            capacity: dto.capacity,
            status: dto.vehicle_status,
            is_weekly: dto.is_weekly ?? existing.is_weekly,
        });
        if (dto.vehicle_status && existing.status !== dto.vehicle_status) {
            const driverId = updated.driver_id ?? null;
            if (dto.vehicle_status === client_1.VehicleStatus.MAINTENANCE ||
                dto.vehicle_status === client_1.VehicleStatus.INACTIVE) {
                await this.subtractTodaysInterestForOverdueDriver(driverId);
            }
            else if (dto.vehicle_status === client_1.VehicleStatus.ACTIVE) {
                await this.reAddTodaysInterestForOverdueDriver(driverId);
            }
        }
        return updated;
    }
    async remove(ctx, id) {
        if ((0, roles_util_1.isAdminLike)(ctx.user_type)) {
            throw new common_1.ForbiddenException('Admin/Superadmin cannot delete vehicles');
        }
        const existing = await this.vehicles.findById(ctx, id);
        if (!existing)
            throw new common_1.NotFoundException('Vehicle not found');
        return this.vehicles.remove(ctx, id);
    }
    async resolveForPayment(ctx, q) {
        let vehicle = null;
        let driver = null;
        if (q.plate) {
            vehicle = await this.prisma.vehicle.findUnique({
                where: { plate_number: q.plate },
                select: {
                    driver_id: true,
                    association_id: true,
                    is_weekly: true,
                    plate_number: true,
                },
            });
            if (!vehicle)
                throw new common_1.NotFoundException('Vehicle not found');
            if (!vehicle.driver_id)
                throw new common_1.BadRequestException('No driver assigned to this plate');
            const d = await this.prisma.driver.findUnique({
                where: { id: vehicle.driver_id },
                select: {
                    id: true,
                    full_name: true,
                    active_until_date: true,
                    interest_accrued: true,
                    association_id: true,
                },
            });
            if (!d)
                throw new common_1.NotFoundException('Driver not found');
            driver = {
                ...d,
                interest_accrued: d.interest_accrued ? Number(d.interest_accrued) : 0,
            };
        }
        else if (q.driver_id) {
            const d = await this.prisma.driver.findUnique({
                where: { id: q.driver_id },
                select: {
                    id: true,
                    full_name: true,
                    active_until_date: true,
                    interest_accrued: true,
                    association_id: true,
                    vehicle: { select: { is_weekly: true, plate_number: true } },
                },
            });
            if (!d)
                throw new common_1.NotFoundException('Driver not found');
            if (!d.vehicle) {
                throw new common_1.BadRequestException('This driver does not have a vehicle assigned');
            }
            driver = {
                ...d,
                interest_accrued: d.interest_accrued ? Number(d.interest_accrued) : 0,
            };
            vehicle = {
                driver_id: d.id,
                association_id: d.association_id,
                is_weekly: Boolean(d.vehicle.is_weekly),
                plate_number: d.vehicle.plate_number ?? undefined,
            };
        }
        else {
            throw new common_1.BadRequestException('Either plate or driver_id is required');
        }
        if (!driver)
            throw new common_1.NotFoundException('Driver not found');
        const policy = await this.policyRepo.get(driver.association_id);
        if (!policy)
            throw new common_1.NotFoundException('Association policy not found');
        const association = await this.prisma.association.findUnique({
            where: { id: driver.association_id },
            select: { name: true },
        });
        return {
            association_name: association?.name ?? '',
            driver_name: driver.full_name,
            plate_number: vehicle?.plate_number ?? null,
            is_weekly: Boolean(vehicle?.is_weekly),
            active_until_date: driver.active_until_date
                ? new Date(driver.active_until_date).toISOString().slice(0, 10)
                : null,
            interest_accrued: driver.interest_accrued ?? 0,
            policy: {
                plan_fee: Boolean(vehicle?.is_weekly) ? policy.weekly_fee : policy.monthly_fee,
                daily_fine_percent: policy.daily_fine_percent,
            },
        };
    }
    async findAvailableForQuotaOrDirect(ctx, input) {
        return this.vehicles.findAvailableForQuotaOrDirect(ctx, input);
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(vehicle_repository_1.VEHICLE_REPOSITORY)),
    __param(1, (0, common_1.Inject)(association_policy_repository_1.ASSOCIATION_POLICY_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, prisma_service_1.PrismaService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map