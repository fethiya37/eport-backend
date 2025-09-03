import { Inject, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  ROUTE_ASSIGNMENT_REPOSITORY,
  type IRouteAssignmentRepository,
} from '../../domain/repositories/route-assignment.repository';
import {
  VEHICLE_ASSIGNMENT_REPOSITORY,
  type IVehicleAssignmentRepository,
} from '../../domain/repositories/vehicle-assignment.repository';

import { BulkUpsertAssignmentsDto } from '../../presentation/route-assignment/dto/bulk-upsert.dto';
import { ApproveAssignmentsDto } from '../../presentation/route-assignment/dto/approve.dto';
import { UpdateAssignmentDto } from '../../presentation/route-assignment/dto/update-assignment.dto';
import { RouteAssignmentFilterDto } from '../../presentation/route-assignment/dto/find-filter.dto';

import { etDateToGregorian } from '../../common/utils/ethio-date.util';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { RouteAssignmentStatus, RouteQuota } from '@prisma/client';

@Injectable()
export class RouteAssignmentService {
  constructor(
    @Inject(ROUTE_ASSIGNMENT_REPOSITORY) private readonly repo: IRouteAssignmentRepository,
    @Inject(VEHICLE_ASSIGNMENT_REPOSITORY) private readonly vehAssign: IVehicleAssignmentRepository,
  ) {}

  // -------- CREATE/UPDATE many --------
  async bulkUpsert(ctx: UserContext, dto: BulkUpsertAssignmentsDto) {
    const association_id = isAdminLike(ctx.user_type)
      ? (dto.association_id ?? ctx.association_id ?? null)
      : (ctx.association_id ?? null);
    if (!association_id) throw new BadRequestException('association_id is required');

    const now = new Date();
    const rows: Parameters<IRouteAssignmentRepository['upsertMany']>[0] = [];

    for (const item of dto.items) {
      const start_date = etDateToGregorian(item.start_date);
      const end_date = etDateToGregorian(item.end_date);
      if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

      // validate foreigns
      if (!(await this.repo.existsRoute(item.route_id))) {
        throw new BadRequestException(`Route ${item.route_id} not found`);
      }
      if (!(await this.repo.existsDriverInAssociation(item.driver_id, association_id))) {
        throw new BadRequestException(`Driver ${item.driver_id} not in association`);
      }
      if (!(await this.repo.existsVehicleInAssociation(item.vehicle_id, association_id))) {
        throw new BadRequestException(`Vehicle ${item.vehicle_id} not in association`);
      }

      // active driver-vehicle pair
      const activePair = await this.vehAssign.isActivePair(association_id, item.driver_id, item.vehicle_id);
      if (!activePair) {
        throw new BadRequestException(`Driver ${item.driver_id} is not actively assigned to Vehicle ${item.vehicle_id}`);
      }

      // no driver overlap
      const overlap = await this.repo.existsDriverOverlap(association_id, item.driver_id, start_date, end_date, item.id);
      if (overlap) {
        throw new BadRequestException(`Driver ${item.driver_id} already has an assignment overlapping that period`);
      }

      // status + quota rules
      let status: RouteAssignmentStatus;
      let route_quota_id: number | null | undefined = item.route_quota_id ?? null;
      let approved_by_user_id: number | null | undefined = null;
      let approved_at: Date | null | undefined = null;

      if (isAdminLike(ctx.user_type)) {
        // Admin path: default Approved; if quota_id provided, validate association/route/window (optional).
        status = RouteAssignmentStatus.Approved;
        approved_by_user_id = ctx.userId;
        approved_at = now;

        if (route_quota_id) {
          const quota = await this.repo.getQuotaById(route_quota_id);
          if (!quota) throw new BadRequestException('route_quota_id not found');
          if (quota.association_id !== association_id) throw new ForbiddenException('route_quota_id not in target association');
          if (quota.route_id !== item.route_id) throw new BadRequestException('route_quota_id does not match route_id');
          if (!(quota.start_date <= start_date && quota.end_date >= end_date)) {
            throw new BadRequestException('Assignment window not covered by the provided quota');
          }
          // capacity is not enforced for admins; linking is allowed.
        }
      } else {
        // Association path: must have covering quota & respect capacity; can pass explicit quota id
        let quota: RouteQuota | null = null;
        if (route_quota_id) {
          quota = await this.repo.getQuotaById(route_quota_id);
          if (!quota) throw new BadRequestException('route_quota_id not found');
          if (quota.association_id !== association_id) throw new ForbiddenException('route_quota_id not in your association');
          if (quota.route_id !== item.route_id) throw new BadRequestException('route_quota_id does not match route_id');
          if (!(quota.start_date <= start_date && quota.end_date >= end_date)) {
            throw new BadRequestException('Assignment window not covered by the provided quota');
          }
        } else {
          quota = await this.repo.findCoveringQuota(association_id, item.route_id, start_date, end_date);
          if (!quota) throw new BadRequestException('No quota assigned for this route and period');
          route_quota_id = quota.id;
        }

        // capacity check (Pending + Approved linked to this quota overlapping window)
        const used = await this.repo.countAssignmentsOverlappingForQuota(
          quota!.id, association_id, item.route_id, start_date, end_date, item.id,
        );
        if (used >= quota!.no_vehicles) {
          throw new BadRequestException('Quota capacity exceeded for this route and period');
        }

        status = RouteAssignmentStatus.Pending;
      }

      rows.push({
        id: item.id,
        route_id: item.route_id,
        driver_id: item.driver_id,
        vehicle_id: item.vehicle_id,
        association_id,
        start_date,
        end_date,
        is_weekly: item.is_weekly,
        status,
        assigned_by_user_id: ctx.userId,
        approved_by_user_id,
        approved_at,
        route_quota_id,
      });
    }

    return this.repo.upsertMany(rows);
  }

  // -------- APPROVE (admin only) --------
  async approve(ctx: UserContext, dto: ApproveAssignmentsDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
    const count = await this.repo.approveMany(dto.ids, ctx.userId);
    return { approved: count };
  }

  // -------- UPDATE single (keep your previous rules here) --------
  async update(_ctx: UserContext, _id: number, _dto: UpdateAssignmentDto) {
    // Implement later per your rules; left unimplemented intentionally.
    throw new BadRequestException('Not implemented');
  }

  // -------- FIND --------
  find(_ctx: UserContext, filter: RouteAssignmentFilterDto) {
    return this.repo.find({
      association_id: filter.association_id,
      route_id: filter.route_id,
      status: filter.status,
      is_weekly: filter.is_weekly,
      date_from: filter.date_from ? new Date(filter.date_from) : undefined,
      date_to: filter.date_to ? new Date(filter.date_to) : undefined,
      driver_id: filter.driver_id,
      vehicle_id: filter.vehicle_id,
    });
  }
}
