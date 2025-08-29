import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Vehicle as VehicleEntity } from '../../domain/entities/vehicle.entity';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import { Prisma, VehicleStatus as PVehicleStatus } from '@prisma/client'; // ✅ no $Enums

@Injectable()
export class PrismaVehicleRepository implements IVehicleRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): VehicleEntity {
    return new VehicleEntity(
      r.id,
      r.plate_number,
      r.libre_no ?? null,
      r.owner_id,
      r.association_id,
      r.make ?? null,
      r.model ?? null,
      r.color ?? null,
      r.capacity ?? null,
      r.status as any,
      r.started_at,
      r.ended_at ?? null,
      r.created_at,
      r.updated_at,
      r.deleted_at ?? null,
    );
  }

  async create(data: {
    plate_number: string;
    libre_no?: string | null;
    owner_id: number;
    association_id: number;
    make?: string | null;
    model?: string | null;
    color?: string | null;
    capacity?: number | null;
    status?: VehicleEntity['status'];
    started_at?: Date;
  }): Promise<VehicleEntity> {
    const row = await this.prisma.vehicle.create({
      data: {
        plate_number: data.plate_number,
        libre_no: data.libre_no ?? null,
        // for create you can use scalar FKs safely
        owner_id: data.owner_id,
        association_id: data.association_id,
        make: data.make ?? null,
        model: data.model ?? null,
        color: data.color ?? null,
        capacity: data.capacity ?? null,
        status: (data.status ?? 'ACTIVE') as PVehicleStatus, // ✅ cast to Prisma enum
        started_at: data.started_at ?? new Date(),
        ended_at: null,
      },
    });
    return this.toEntity(row);
  }

  async findById(id: number): Promise<VehicleEntity | null> {
    const row = await this.prisma.vehicle.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async findByPlate(plate_number: string): Promise<VehicleEntity | null> {
    const row = await this.prisma.vehicle.findUnique({ where: { plate_number } });
    return row ? this.toEntity(row) : null;
  }

  async list(params: {
    association_id: number;
    skip?: number;
    take?: number;
    status?: VehicleEntity['status'];
    search?: string;
    include_deleted?: boolean;
  }): Promise<VehicleEntity[]> {
    const rows = await this.prisma.vehicle.findMany({
      where: {
        association_id: params.association_id,
        status: (params.status as PVehicleStatus | undefined), // ✅ enum cast
        deleted_at: params.include_deleted ? undefined : null,
        OR: params.search
          ? [
              { plate_number: { contains: params.search, mode: 'insensitive' } },
              { libre_no: { contains: params.search, mode: 'insensitive' } },
              { make: { contains: params.search, mode: 'insensitive' } },
              { model: { contains: params.search, mode: 'insensitive' } },
              { color: { contains: params.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip: params.skip,
      take: params.take,
      orderBy: { id: 'asc' },
    });
    return rows.map(this.toEntity.bind(this));
  }

  async update(
    id: number,
    data: {
      plate_number?: string;
      libre_no?: string | null;
      owner_id?: number;
      make?: string | null;
      model?: string | null;
      color?: string | null;
      capacity?: number | null;
      status?: VehicleEntity['status'];
      started_at?: Date | null;
      ended_at?: Date | null;
    },
  ): Promise<VehicleEntity> {
    // Build a checked update object (no raw owner_id)
    const updateData: Prisma.VehicleUpdateInput = {
      ...(data.plate_number !== undefined ? { plate_number: data.plate_number } : {}),
      ...(data.libre_no !== undefined ? { libre_no: data.libre_no } : {}),
      ...(data.make !== undefined ? { make: data.make } : {}),
      ...(data.model !== undefined ? { model: data.model } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.capacity !== undefined ? { capacity: data.capacity } : {}),
      ...(data.status !== undefined ? { status: data.status as PVehicleStatus } : {}),
      ...(data.started_at !== undefined ? { started_at: data.started_at as any } : {}),
      ...(data.ended_at !== undefined ? { ended_at: data.ended_at as any } : {}),
      ...(data.owner_id !== undefined
        ? { owner: { connect: { id: data.owner_id } } } // ✅ relation update
        : {}),
    };

    const row = await this.prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
    return this.toEntity(row);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.vehicle.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        status: 'RETIRED' as PVehicleStatus, // ✅ enum cast
        ended_at: new Date(),
      },
    });
  }
}
