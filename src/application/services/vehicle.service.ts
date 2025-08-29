import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import { Vehicle } from '../../domain/entities/vehicle.entity';

type CreateVehicleInput = {
    association_id: number; // from URL/JWT via guard
    plate_number: string;
    libre_no?: string | null;
    owner_id: number;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
};

type UpdateVehicleInput = {
    id: number;
    association_id: number; // scope
    plate_number?: string;
    libre_no?: string | null;
    owner_id?: number;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
    status?: Vehicle['status']; // ACTIVE | MAINTENANCE | RETIRED | SUSPENDED | RESIGNED
};

@Injectable()
export class VehicleService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(VEHICLE_REPOSITORY) private readonly vehicles: IVehicleRepository,
    ) { }

    async createVehicle(input: CreateVehicleInput) {
        // 0) association exists
        const assoc = await this.prisma.association.findUnique({ where: { id: input.association_id } });
        if (!assoc) throw new BadRequestException('association not found');

        // 1) plate unique (global)
        const dupPlate = await this.vehicles.findByPlate(input.plate_number);
        if (dupPlate) throw new ConflictException('plate_number already exists');

        // 2) owner exists & belongs to same association
        const owner = await this.prisma.owner.findUnique({ where: { id: input.owner_id } });
        if (!owner || owner.association_id !== input.association_id) {
            throw new BadRequestException('owner not found in this association');
        }

        // 3) create (status ACTIVE, started_at now)
        return this.vehicles.create({
            plate_number: input.plate_number,
            libre_no: input.libre_no ?? null,
            owner_id: input.owner_id,
            association_id: input.association_id,
            make: input.make ?? null,
            model: input.model ?? null,
            color: input.color ?? null,
            capacity: input.capacity ?? null,
            status: 'ACTIVE',
            started_at: new Date(),
        });
    }

    async getByIdScoped(id: number, association_id: number) {
        const v = await this.vehicles.findById(id);
        if (!v || v.association_id !== association_id || v.deleted_at) {
            throw new NotFoundException('vehicle not found');
        }
        return v;
    }

    async list(params: {
        association_id: number;
        skip?: number;
        take?: number;
        status?: Vehicle['status'];
        search?: string;
        include_deleted?: boolean;
    }) {
        return this.vehicles.list({
            association_id: params.association_id,
            skip: params.skip,
            take: params.take,
            status: params.status,
            search: params.search,
            include_deleted: params.include_deleted,
        });
    }

    async updateVehicle(input: UpdateVehicleInput) {
        const current = await this.vehicles.findById(input.id);
        if (!current || current.association_id !== input.association_id || current.deleted_at) {
            throw new NotFoundException('vehicle not found');
        }

        // plate uniqueness
        if (input.plate_number && input.plate_number !== current.plate_number) {
            const dup = await this.vehicles.findByPlate(input.plate_number);
            if (dup) throw new ConflictException('plate_number already exists');
        }

        // owner must stay in same association
        if (input.owner_id && input.owner_id !== current.owner_id) {
            const owner = await this.prisma.owner.findUnique({ where: { id: input.owner_id } });
            if (!owner || owner.association_id !== input.association_id) {
                throw new BadRequestException('owner not found in this association');
            }
        }

        // status transitions control started_at / ended_at
        let started_at: Date | undefined;
        let ended_at: Date | undefined;

        if (input.status && input.status !== current.status) {
            const now = new Date();
            const to = input.status;

            // If becoming INACTIVE-like (SUSPENDED/RESIGNED/RETIRED) and not already ended
            if ((to === 'SUSPENDED' || to === 'RESIGNED' || to === 'RETIRED') && !current.ended_at) {
                ended_at = now;
            }

            // If re-activating (ACTIVE or MAINTENANCE from ended state) — reset the association link window
            if ((to === 'ACTIVE' || to === 'MAINTENANCE') && current.ended_at) {
                started_at = now;
                ended_at = null as any; // clear
            }
        }

        return this.vehicles.update(input.id, {
            plate_number: input.plate_number,
            libre_no: input.libre_no,
            owner_id: input.owner_id,
            make: input.make,
            model: input.model,
            color: input.color,
            capacity: input.capacity,
            status: input.status,
            ...(started_at !== undefined ? { started_at } : {}),
            ...(ended_at !== undefined ? { ended_at } : {}),
        });
    }

    async deleteVehicle(id: number, association_id: number) {
        const v = await this.vehicles.findById(id);
        if (!v || v.association_id !== association_id || v.deleted_at) {
            throw new NotFoundException('vehicle not found');
        }
        // retire vehicle & close association window
        await this.vehicles.softDelete(id);
    }
}
