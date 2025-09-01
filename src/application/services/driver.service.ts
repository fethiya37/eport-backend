import { Inject, Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DRIVER_REPOSITORY, DriverFilter } from '../../domain/repositories/driver.repository';
import type { IDriverRepository } from '../../domain/repositories/driver.repository';

import { VEHICLE_ASSIGNMENT_REPOSITORY } from '../../domain/repositories/vehicle-assignment.repository';
import type { IVehicleAssignmentRepository } from '../../domain/repositories/vehicle-assignment.repository';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateDriverDto } from '../../presentation/driver/dto/create-driver.dto';
import { UpdateDriverDto } from '../../presentation/driver/dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import * as bcrypt from 'bcrypt';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class DriverService {
    constructor(
        @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
        @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly assignments: IVehicleAssignmentRepository,
        private readonly prisma: PrismaService,
    ) { }

    // CREATE: create User(Driver) + Driver + Active Assignment(vehicle_id)
    async create(ctx: UserContext, dto: CreateDriverDto) {
        if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create drivers');
        if (!ctx.association_id) throw new BadRequestException('association_id is required');

        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicle_id } });
        if (!vehicle || vehicle.association_id !== ctx.association_id) {
            throw new BadRequestException('Vehicle not found in your association');
        }

        return this.prisma.$transaction(async (tx) => {
            // 1) user
            const password_hash = await bcrypt.hash(dto.phone_number, 10);
            const user = await tx.user.create({
                data: {
                    phone_number: dto.phone_number,
                    user_type: 'Driver',
                    name: dto.full_name,
                    password_hash,
                    is_locked: false,
                    association_id: null,
                },
            });

            // 2) driver (use tx)
            const driver = await this.drivers.create(
                ctx,
                {
                    user_id: user.id,
                    association_id: ctx.association_id!,
                    full_name: dto.full_name,
                    phone_number: dto.phone_number,
                    license_no: dto.license_no ?? null,
                    license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : null,
                },
                tx,
            );

            // 3) active assignment (use tx)
            await this.assignments.createActive(
                ctx,
                {
                    driver_id: driver.id,
                    vehicle_id: vehicle.id,
                    association_id: ctx.association_id!,
                    started_at: new Date(),
                },
                tx,
            );

            return driver;
        });
    }

    async findAll(ctx: UserContext, filter: DriverFilter) {
        // Admin/Superadmin/Association can read
        return this.drivers.findAll(ctx, filter);
    }

    // include current active vehicle assignment id for edit screen
    async findOneWithActive(ctx: UserContext, id: number) {
        const driver = await this.drivers.findById(ctx, id);
        if (!driver) throw new NotFoundException('Driver not found');

        const active = await this.assignments.findActiveByDriver(ctx, driver.id);
        return {
            ...driver,
            active_vehicle_id: active?.vehicle_id ?? null,
        };
    }

    async update(ctx: UserContext, id: number, dto: UpdateDriverDto) {
        if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update drivers');

        const existing = await this.drivers.findById(ctx, id);
        if (!existing) throw new NotFoundException('Driver not found');

        // If vehicle_id is provided and differs from the active one → reassign
        if (dto.vehicle_id) {
            const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicle_id } });
            if (!vehicle || vehicle.association_id !== existing.association_id) {
                throw new BadRequestException('Vehicle must belong to your association');
            }
            const active = await this.assignments.findActiveByDriver(ctx, id);
            if (!active || active.vehicle_id !== dto.vehicle_id) {
                // close old active if any
                if (active) await this.assignments.closeActiveForDriver(ctx, id, new Date());
                // open new active assignment
                await this.assignments.createActive(ctx, {
                    driver_id: id,
                    vehicle_id: dto.vehicle_id,
                    association_id: existing.association_id,
                    started_at: new Date(),
                });
            }
        }

        // If status becomes SUSPENDED → close active assignment(s)
        if (dto.status === DriverStatus.SUSPENDED) {
            await this.assignments.closeActiveForDriver(ctx, id, new Date());
        }

        // Update driver
        const updated = await this.drivers.update(ctx, id, {
            full_name: dto.full_name,
            phone_number: dto.phone_number,
            status: dto.status,
            license_no: dto.license_no ?? undefined,
            license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
        });

        // Sync linked user name & phone (like Owner flow)
        if (dto.full_name !== undefined || dto.phone_number !== undefined) {
            await this.prisma.user.update({
                where: { id: updated.user_id },
                data: {
                    ...(dto.full_name !== undefined ? { name: dto.full_name } : {}),
                    ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number } : {}),
                },
            });
        }

        return updated;
    }

    async listActiveDriverVehiclePairs(ctx: UserContext, associationIdOverride?: number) {
        // Admin/Superadmin may pass an association_id; Association users are scoped to their own
        const association_id = isAdminLike(ctx.user_type)
            ? (associationIdOverride ?? null)
            : (ctx.association_id ?? null);

        if (!association_id) throw new BadRequestException('association_id is required');

        // active vehicle assignments with joined driver & vehicle
        const rows = await this.prisma.vehicleAssignment.findMany({
            where: { association_id, active: true },
            include: {
                driver: true,
                vehicle: true,
            },
            orderBy: { started_at: 'desc' },
        });

        return rows.map(r => ({
            driver_id: r.driver_id,
            driver_name: r.driver.full_name,
            driver_status: r.driver.status,
            vehicle_id: r.vehicle_id,
            plate_number: r.vehicle.plate_number,
            vehicle_status: r.vehicle.status,
            started_at: r.started_at,
        }));
    }

}
