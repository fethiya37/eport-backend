import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActivityLog, Prisma } from '@prisma/client';
import {
  IActivityLogRepository,
  ActivityLogCreate,
  ActivityLogFilter,
  ActivityLogWithRelations,
} from '../../domain/repositories/activity-log.repository';

@Injectable()
export class PrismaActivityLogRepository implements IActivityLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ActivityLogCreate): Promise<ActivityLog> {
    return this.prisma.activityLog.create({
      data: {
        user_id: data.user_id ?? null,
        association_id: data.association_id ?? null,
        action: data.action,
        entity_type: data.entity_type ?? null,
        entity_id: data.entity_id ?? null,
        description: data.description ?? null,
        ip_address: data.ip_address ?? null,
      },
    });
  }

  async findById(id: number): Promise<ActivityLogWithRelations | null> {
    return this.prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone_number: true,
            user_type: true,
          },
        },
        association: {
          select: { id: true, name: true },
        },
      },
    }) as any;
  }

  async findMany(
    filter: ActivityLogFilter,
    options?: { skip?: number; take?: number },
  ): Promise<ActivityLogWithRelations[]> {
    const where: Prisma.ActivityLogWhereInput = {
      ...(filter.user_id ? { user_id: filter.user_id } : {}),
      ...(filter.association_id ? { association_id: filter.association_id } : {}),
      ...(filter.action ? { action: filter.action } : {}),
      ...(filter.entity_type ? { entity_type: filter.entity_type } : {}),
      ...(filter.entity_id ? { entity_id: filter.entity_id } : {}),
      ...(filter.date_from || filter.date_to
        ? {
            created_at: {
              ...(filter.date_from ? { gte: filter.date_from } : {}),
              ...(filter.date_to ? { lte: filter.date_to } : {}),
            },
          }
        : {}),
    };

    return this.prisma.activityLog.findMany({
      where,
      orderBy: { id: 'desc' },
      skip: options?.skip,
      take: options?.take ?? 100,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone_number: true,
            user_type: true,
          },
        },
        association: {
          select: { id: true, name: true },
        },
      },
    }) as any;
  }
}
