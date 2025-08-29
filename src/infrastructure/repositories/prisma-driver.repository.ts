import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Driver } from '../../domain/entities/driver.entity';
import type { IDriverRepository } from '../../domain/repositories/driver.repository';

@Injectable()
export class PrismaDriverRepository implements IDriverRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(r: any): Driver {
    return new Driver(
      r.id,
      r.user_id,
      r.association_id,
      r.full_name,
      r.license_no ?? null,
      r.license_expiry ?? null,
      r.phone_number,
      r.status,
      r.created_at,
      r.updated_at,
    );
  }

  async create(data: {
    user_id: number;
    association_id: number;
    full_name: string;
    license_no?: string | null;
    license_expiry?: Date | null;
    phone_number: string;
    status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
  }): Promise<Driver> {
    const row = await this.prisma.driver.create({
      data: {
        user_id: data.user_id,
        association_id: data.association_id,
        full_name: data.full_name,
        license_no: data.license_no ?? null,
        license_expiry: data.license_expiry ?? null,
        phone_number: data.phone_number,
        status: data.status ?? 'AVAILABLE',
      },
    });
    return this.toEntity(row);
  }

  async findById(id: number): Promise<Driver | null> {
    const row = await this.prisma.driver.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async list(params: {
    association_id: number;
    skip?: number;
    take?: number;
    status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
    search?: string;
  }): Promise<Driver[]> {
    const rows = await this.prisma.driver.findMany({
      where: {
        association_id: params.association_id,
        status: params.status,
        OR: params.search
          ? [
              { full_name: { contains: params.search, mode: 'insensitive' } },
              { phone_number: { contains: params.search, mode: 'insensitive' } },
              { license_no: { contains: params.search, mode: 'insensitive' } },
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
      full_name?: string;
      license_no?: string | null;
      license_expiry?: Date | null;
      phone_number?: string;
      status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';
    },
  ): Promise<Driver> {
    const row = await this.prisma.driver.update({
      where: { id },
      data: {
        ...(data.full_name !== undefined ? { full_name: data.full_name } : {}),
        ...(data.license_no !== undefined ? { license_no: data.license_no } : {}),
        ...(data.license_expiry !== undefined ? { license_expiry: data.license_expiry } : {}),
        ...(data.phone_number !== undefined ? { phone_number: data.phone_number } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
    return this.toEntity(row);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.driver.delete({ where: { id } });
  }
}
