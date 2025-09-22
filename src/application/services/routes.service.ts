import { Injectable, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { RouteInputDto } from '../../presentation/routes/dto/route-input.dto';
import { UpsertGroupWithRoutesDto } from '../../presentation/routes/dto/upsert-group-with-routes.dto';
import { isAdminLike } from '../../common/auth/roles.util';
import type { UserContext } from 'src/common/context/user-context';
import { RouteFilter, ROUTES_REPOSITORY, UpsertGroupWithRoutesArgs } from 'src/domain/repositories/route.repository';
import type { IRoutesRepository } from 'src/domain/repositories/route.repository';

@Injectable()
export class RoutesService {
  constructor(
    @Inject(ROUTES_REPOSITORY) private readonly repo: IRoutesRepository,
  ) {}

  // READS (any authenticated user)
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

  // WRITES (Admin/Superadmin only)
  upsertGroupWithRoutes(ctx: UserContext, dto: UpsertGroupWithRoutesDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin can modify routes');
    const args: UpsertGroupWithRoutesArgs = {
      route_group_id: dto.route_group_id,
      route_group: dto.route_group,
      routes: dto.routes,
    };
    return this.repo.upsertGroupWithRoutes(args);
  }

  updateSingleRoute(ctx: UserContext, id: number, r: RouteInputDto) {
    if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin can modify routes');
    return this.repo.updateSingleRoute(id, r);
  }

  async deleteGroup(ctx: UserContext, id: number) {
    if (!isAdminLike(ctx.user_type)) {
      throw new ForbiddenException('Only Admin/Superadmin can delete route groups');
    }
    return this.repo.deleteGroup(id);
  }
}
