import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { RouteInputDto } from '../../presentation/routes/dto/route-input.dto';
import { UpsertGroupWithRoutesDto } from '../../presentation/routes/dto/upsert-group-with-routes.dto';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { RouteFilter, ROUTES_REPOSITORY, UpsertGroupWithRoutesArgs } from 'src/domain/repositories/route.repository';
import type { IRoutesRepository } from 'src/domain/repositories/route.repository';
import { ActivityLogService } from '../services/activity-log.service';

@Injectable()
export class RoutesService {
  constructor(
    @Inject(ROUTES_REPOSITORY) private readonly repo: IRoutesRepository,
    private readonly activityLog: ActivityLogService,
  ) { }

  listRouteGroups(includeRoutes = false) {
    return this.repo.listRouteGroups(includeRoutes);
  }

  listRoutes(filter: RouteFilter) {
    return this.repo.listRoutes(filter);
  }

  async getRoute(id: number) {
    const r = await this.repo.getRoute(id);
    if (!r) throw new NotFoundException('Route not found');
    return r;
  }

  async getRouteGroup(id: number, includeRoutes = true) {
    const g = await this.repo.getRouteGroup(id, includeRoutes);
    if (!g) throw new NotFoundException('Route group not found');
    return g;
  }

  async upsertGroupWithRoutes(ctx: UserContext, dto: UpsertGroupWithRoutesDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin can modify routes');
    const args: UpsertGroupWithRoutesArgs = {
      route_group_id: dto.route_group_id,
      route_group: dto.route_group,
      routes: dto.routes,
    };
    const result = await this.repo.upsertGroupWithRoutes(args);
    await this.activityLog.log(ctx, {
      module: 'Routes',
      action: 'UPSERT_GROUP_WITH_ROUTES',
      entity: 'RouteGroup',
      entity_id: (result as any).id ?? dto.route_group_id ?? null,
    });
    return result;
  }

  async updateSingleRoute(ctx: UserContext, id: number, r: RouteInputDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin can modify routes');
    const updated = await this.repo.updateSingleRoute(id, r);
    await this.activityLog.log(ctx, {
      module: 'Routes',
      action: 'UPDATE_ROUTE',
      entity: 'Route',
      entity_id: id,
    });
    return updated;
  }

  async deleteGroup(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Only Admin/Superadmin can delete route groups');
    }
    const deleted = await this.repo.deleteGroup(id);
    await this.activityLog.log(ctx, {
      module: 'Routes',
      action: 'DELETE_GROUP',
      entity: 'RouteGroup',
      entity_id: id,
    });
    return deleted;
  }
}
