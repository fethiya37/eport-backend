// src/application/services/driver.service.ts
import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  DRIVER_REPOSITORY,
  DriverFilter,
  type IDriverRepository,
} from '../../domain/repositories/driver.repository';
import {
  ASSOCIATION_POLICY_REPOSITORY,
  type IAssociationPolicyRepository,
} from '../../domain/repositories/association-policy.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDriverDto } from '../../presentation/driver/dto/create-driver.dto';
import { UpdateDriverDto } from '../../presentation/driver/dto/update-driver.dto';
import { DriverStatus } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import * as bcrypt from 'bcrypt';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class DriverService {
  constructor(
    @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY) private readonly policyRepo: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
  ) { }

  async create(ctx: UserContext, dto: CreateDriverDto) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    }
    if (!ctx.association_id) {
      throw new BadRequestException('association_id is required');
    }

    // ✅ Pre-check phone number uniqueness in users table
    const exists = await this.prisma.user.findUnique({
      where: { phone_number: dto.phone_number },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException('Driver with this phone number already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const password_hash = await bcrypt.hash(dto.phone_number, 10);

      const user = await tx.user.create({
        data: {
          phone_number: dto.phone_number,
          user_type: 'Driver',
          name: dto.full_name,
          password_hash,
          is_locked: false,
          association_id: ctx.association_id!,
        },
      });

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

      return driver;
    });
  }

  // ===== List Drivers =====
  async findAll(ctx: UserContext, filter: DriverFilter) {
    return this.drivers.findAll(ctx, filter);
  }

  async findOneWithActive(ctx: UserContext, id: number) {
    const driver = await this.drivers.findById(ctx, id);
    if (!driver) throw new NotFoundException('Driver not found');

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { driver_id: id },
      select: { plate_number: true },
    });

    return { ...driver, active_plate_number: vehicle?.plate_number ?? null };
  }

  async update(ctx: UserContext, id: number, dto: UpdateDriverDto) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot update drivers');
    }

    const existing = await this.drivers.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');

    try {
      const updated = await this.drivers.update(ctx, id, {
        full_name: dto.full_name,
        phone_number: dto.phone_number,
        status: dto.status as DriverStatus | undefined,
        license_no: dto.license_no ?? undefined,
        license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
      });

      // sync with user
      if (dto.full_name !== undefined || dto.phone_number !== undefined) {
        await this.prisma.user.update({
          where: { id: (updated as any).user_id },
          data: {
            ...(dto.full_name !== undefined ? { name: dto.full_name } : {}),
            ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number } : {}),
          },
        });
      }

      return updated;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestException('Driver with this phone number already exists');
      }
      throw err;
    }
  }

  async remove(ctx: UserContext, id: number) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot delete drivers');
    }

    const driver = await this.drivers.findById(ctx, id);
    if (!driver) throw new NotFoundException('Driver not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id: (driver as any).user_id } });
      return this.drivers.remove(ctx, id, tx);
    });
  }

  async findDriversWithoutVehicle(ctx: UserContext) {
    return this.drivers.findWithoutVehicle(ctx);
  }
}
