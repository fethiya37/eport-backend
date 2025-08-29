import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DRIVER_REPOSITORY } from '../../domain/repositories/driver.repository';
import type { IDriverRepository } from '../../domain/repositories/driver.repository';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { Driver } from '../../domain/entities/driver.entity';

type CreateDriverInput = {
    association_id: number;          // from URL / guard
    full_name: string;
    phone_number: string;            // will be used as password (hashed)
    license_no?: string | null;
    license_expiry?: Date | null;
    vehicle_id?: number;             // optional initial assignment
};

type UpdateDriverInput = {
    id: number;
    association_id: number;          // scope
    full_name?: string;
    phone_number?: string;
    license_no?: string | null;
    license_expiry?: Date | null;
    status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
    vehicle_id?: number | null;      // null to end assignment; omit to keep
};

@Injectable()
export class DriverService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
        @Inject(USER_REPOSITORY) private readonly users: IUserRepository,
    ) { }

    // ---------- CREATE ----------
    async createDriver(input: CreateDriverInput): Promise<Driver> {
        // association exists?
        const assoc = await this.prisma.association.findUnique({ where: { id: input.association_id } });
        if (!assoc) throw new BadRequestException('association not found');

        // unique phone (users)
        const uByPhone = await this.users.findByPhone(input.phone_number);
        if (uByPhone) throw new ConflictException('phone_number already used by another user');

        // unique phone within drivers/association (schema has @@unique)
        const dDup = await this.prisma.driver.findFirst({
            where: { association_id: input.association_id, phone_number: input.phone_number },
        });
        if (dDup) throw new ConflictException('phone_number already used in this association');

        // create user (Driver) — is_locked stays TRUE (default). Unlock elsewhere when appropriate.
        const hash = await bcrypt.hash(input.phone_number, 10);
        const user = await this.users.createWithPassword(
            input.phone_number,
            'Driver',
            hash,
            input.full_name,
            input.association_id,
        );

        // create driver
        const driver = await this.drivers.create({
            user_id: user.id,
            association_id: input.association_id,
            full_name: input.full_name,
            license_no: input.license_no ?? null,
            license_expiry: input.license_expiry ?? null,
            phone_number: input.phone_number,
            status: 'AVAILABLE',
        });

        // optional first assignment
        if (input.vehicle_id) {
            await this.assignDriver({
                association_id: input.association_id,
                driver_id: driver.id,
                vehicle_id: input.vehicle_id,
                endExisting: true,
            });
        }

        return driver;
    }

    // ---------- READ ----------
    async getByIdScoped(id: number, association_id: number): Promise<Driver> {
        const d = await this.drivers.findById(id);
        if (!d || d.association_id !== association_id) throw new NotFoundException('driver not found');
        return d;
    }

    async list(params: {
        association_id: number;
        skip?: number;
        take?: number;
        status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
        search?: string;
    }): Promise<Driver[]> {
        return this.drivers.list(params);
    }

    // ---------- UPDATE ----------
    async updateDriver(input: UpdateDriverInput): Promise<Driver> {
        const current = await this.drivers.findById(input.id);
        if (!current || current.association_id !== input.association_id) {
            throw new NotFoundException('driver not found');
        }

        // phone changes — global & per-association uniqueness
        if (input.phone_number && input.phone_number !== current.phone_number) {
            const u = await this.users.findByPhone(input.phone_number);
            if (u) throw new ConflictException('phone_number already used by another user');

            const dup = await this.prisma.driver.findFirst({
                where: { association_id: input.association_id, phone_number: input.phone_number },
            });
            if (dup) throw new ConflictException('phone_number already used in this association');

            // also update linked user's phone (and password? we keep password unchanged; change only if you decide)
            await this.users.updateUser(current.user_id, { phone_number: input.phone_number });
        }

        // update linked user's name if provided
        if (input.full_name) {
            await this.users.updateUser(current.user_id, { name: input.full_name });
        }

        // if suspended => lock user
        if (input.status === 'SUSPENDED') {
            await this.users.updateUser(current.user_id, { is_locked: true });
        }

        // vehicle assignment changes
        if (input.vehicle_id !== undefined) {
            if (input.vehicle_id === null) {
                await this.endActiveAssignment(current.id, input.association_id);
            } else {
                await this.assignDriver({
                    association_id: input.association_id,
                    driver_id: current.id,
                    vehicle_id: input.vehicle_id,
                    endExisting: true,
                });
            }
        }

        // driver row update
        const updated = await this.drivers.update(input.id, {
            full_name: input.full_name,
            license_no: input.license_no,
            license_expiry: input.license_expiry ?? undefined,
            phone_number: input.phone_number,
            status: input.status,
        });

        return updated;
    }

    // ---------- DELETE ----------
    async deleteDriver(id: number, association_id: number): Promise<void> {
        const current = await this.drivers.findById(id);
        if (!current || current.association_id !== association_id) {
            throw new NotFoundException('driver not found');
        }
        await this.users.updateUser(current.user_id, { is_locked: true });
        await this.endActiveAssignment(current.id, association_id);
        await this.drivers.delete(id);
    }

    // ---------- helpers: assignments ----------
    private async endActiveAssignment(driver_id: number, association_id: number) {
        await this.prisma.vehicleAssignment.updateMany({
            where: { driver_id, association_id, active: true },
            data: { active: false, ended_at: new Date() },
        });
    }

    private async assignDriver(opts: {
        association_id: number;
        driver_id: number;
        vehicle_id: number;
        endExisting: boolean;
    }) {
        const { association_id, driver_id, vehicle_id, endExisting } = opts;

        // vehicle must be in this association (per vehicles table)
        const v = await this.prisma.vehicle.findUnique({ where: { id: vehicle_id } });
        if (!v || v.association_id !== association_id) {
            throw new BadRequestException('vehicle not found in this association');
        }

        await this.prisma.$transaction(async (tx) => {
            if (endExisting) {
                await tx.vehicleAssignment.updateMany({
                    where: { association_id, active: true, OR: [{ driver_id }, { vehicle_id }] },
                    data: { active: false, ended_at: new Date() },
                });
            }
            await tx.vehicleAssignment.create({
                data: {
                    driver_id,
                    vehicle_id,
                    association_id,
                    active: true,
                    started_at: new Date(),
                },
            });
        });
    }
}
