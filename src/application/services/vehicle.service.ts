import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';
import type { IVehicleAssociationRepository } from '../../domain/repositories/vehicle-association.repository';
import { VEHICLE_REPOSITORY, VehicleFilter } from '../../domain/repositories/vehicle.repository';
import { VEHICLE_ASSOC_REPOSITORY } from '../../domain/repositories/vehicle-association.repository';
import { CreateVehicleDto } from '../../presentation/vehicle/dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../../presentation/vehicle/dto/update-vehicle.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { VehicleAssociationStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class VehicleService {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly vehicles: IVehicleRepository,
    @Inject(VEHICLE_ASSOC_REPOSITORY) private readonly vehAssoc: IVehicleAssociationRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(ctx: UserContext, dto: CreateVehicleDto) {
    // Only Association users may create
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot create vehicles');
    if (!ctx.association_id) throw new BadRequestException('association_id is required');

    // Create Vehicle + initial VehicleAssociation in a txn
    return this.prisma.$transaction(async () => {
      const vehicle = await this.vehicles.create(ctx, {
        plate_number: dto.plate_number,
        libre_no: dto.libre_no ?? null,
        owner_id: dto.owner_id,
        association_id: ctx.association_id!,
        make: dto.make ?? null,
        model: dto.model ?? null,
        color: dto.color ?? null,
        capacity: dto.capacity ?? null,
      });

      // Open first ACTIVE association record
      await this.vehAssoc.create({
        vehicle_id: vehicle.id,
        association_id: vehicle.association_id,
        status: 'ACTIVE',
        started_at: new Date(),
      });

      return vehicle;
    });
  }

  findAll(ctx: UserContext, filter: VehicleFilter) {
    return this.vehicles.findAll(ctx, filter);
  }

  async findOne(ctx: UserContext, id: number) {
    const v = await this.vehicles.findById(ctx, id);
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async update(ctx: UserContext, id: number, dto: UpdateVehicleDto) {
    // Only Association users may update
    if (isAdminLike(ctx.user_type)) throw new ForbiddenException('Admin/Superadmin cannot update vehicles');

    const existing = await this.vehicles.findById(ctx, id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    // 1) Update VEHICLE row fields (vehicle_status is optional)
    const updated = await this.vehicles.update(ctx, id, {
      libre_no: dto.libre_no,
      owner_id: dto.owner_id,
      make: dto.make,
      model: dto.model,
      color: dto.color,
      capacity: dto.capacity,
      status: dto.vehicle_status, // ACTIVE | MAINTENANCE | RETIRED
    });

    // 2) Update ASSOCIATION history if requested (association_status is optional)
    if (dto.association_status) {
      const now = new Date();
      const currentActive = await this.vehAssoc.findCurrentActive(updated.id);

      if (dto.association_status === 'ACTIVE') {
        // If there is no active association row, open a new one
        if (!currentActive) {
          await this.vehAssoc.create({
            association_id: updated.association_id,
            vehicle_id: updated.id,
            status: 'ACTIVE',
            started_at: now,
          });
        }
      } else if (
        dto.association_status === VehicleAssociationStatus.SUSPENDED ||
        dto.association_status === VehicleAssociationStatus.RESIGNED
      ) {
        // If there is an active association row, close it with the final status
        if (currentActive) {
          await this.vehAssoc.closeActiveForVehicle(updated.id, dto.association_status, now);
        }
      }
      // (No-op for anything else)
    }

    return updated;
  }
}
