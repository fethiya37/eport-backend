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
import { DriverStatus, UserType } from '@prisma/client';
import { isAdminLike } from '../../common/auth/roles.util';
import * as bcrypt from 'bcrypt';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ActivityLogService } from '../services/activity-log.service';

@Injectable()
export class DriverService {
  constructor(
    @Inject(DRIVER_REPOSITORY) private readonly drivers: IDriverRepository,
    @Inject(ASSOCIATION_POLICY_REPOSITORY)
    private readonly policyRepo: IAssociationPolicyRepository,
    private readonly prisma: PrismaService,
    private readonly activityLog: ActivityLogService,
  ) {}

  async create(ctx: UserContext, dto: CreateDriverDto) {
    if (isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Admin/Superadmin cannot create drivers');
    }
    if (!ctx.association_id) {
      throw new BadRequestException('association_id is required');
    }

    const driverUserExists = await this.prisma.user.findUnique({
      where: {
        phone_number_user_type: {
          phone_number: dto.phone_number,
          user_type: UserType.Driver,
        },
      },
      select: { id: true },
    });
    if (driverUserExists) {
      throw new BadRequestException('Driver with this phone number already exists');
    }

    const driver = await this.prisma.$transaction(async (tx) => {
      const password_hash = await bcrypt.hash(dto.phone_number, 10);

      const user = await tx.user.create({
        data: {
          phone_number: dto.phone_number,
          user_type: UserType.Driver,
          name: dto.full_name,
          password_hash,
          is_locked: false,
          association_id: ctx.association_id!,
        },
      });

      const createdDriver = await this.drivers.create(
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
    const existing = await this.drivers.findById(ctx, id);
    if (!existing) throw new NotFoundException('Driver not found');

    try {
      if (dto.phone_number && dto.phone_number !== (existing as any).phone_number) {
        const dup = await this.prisma.user.findFirst({
          where: {
            phone_number: dto.phone_number,
            user_type: UserType.Driver,
            NOT: { id: (existing as any).user_id },
          },
          select: { id: true },
        });
        if (dup) throw new BadRequestException('Driver with this phone number already exists');
      }

      const updated = await this.drivers.update(ctx, id, {
        full_name: dto.full_name,
        phone_number: dto.phone_number,
        status: dto.status as DriverStatus | undefined,
        license_no: dto.license_no ?? undefined,
        license_expiry: dto.license_expiry ? new Date(dto.license_expiry) : undefined,
        has_smartphone: dto.has_smartphone,
        active_until_date:
          dto.active_until_date === undefined
            ? undefined
            : dto.active_until_date
            ? new Date(dto.active_until_date)
            : null,
        interest_accrued: dto.interest_accrued,
      });

      if (dto.full_name !== undefined || dto.phone_number !== undefined) {
        await this.prisma.user.update({
          where: { id: (updated as any).user_id },
          data: {
            ...(dto.full_name !== undefined ? { name: dto.full_name } : {}),
            ...(dto.phone_number !== undefined ? { phone_number: dto.phone_number } : {}),
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
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
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

    const removed = await this.prisma.$transaction(async (tx) => {
      await this.drivers.remove(ctx, id, tx);

      await tx.vehicle.updateMany({
        where: { driver_id: id },
        data: { driver_id: null },
      });

      await tx.user.delete({ where: { id: (driver as any).user_id } });

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

  async findDriversWithoutVehicle(ctx: UserContext) {
    return this.drivers.findWithoutVehicle(ctx);
  }
}
