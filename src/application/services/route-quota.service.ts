import { Inject, Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ROUTE_QUOTA_REPOSITORY } from '../../domain/repositories/route-quota.repository';
import type { IRouteQuotaRepository } from '../../domain/repositories/route-quota.repository';
import { CreateRouteQuotaDto } from '../../presentation/route-quota/dto/create-route-quota.dto';
import { UpdateRouteQuotaDto } from '../../presentation/route-quota/dto/update-route-quota.dto';
import { RouteQuotaFilterDto } from '../../presentation/route-quota/dto/route-quota-filter.dto';
import { etDateToGregorian } from '../../common/utils/ethio-date.util';
import { isAdminLike } from '../../common/auth/roles.util';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserContext } from 'src/common/context/user-context';

@Injectable()
export class RouteQuotaService {
    constructor(
        @Inject(ROUTE_QUOTA_REPOSITORY) private readonly repo: IRouteQuotaRepository,
        private readonly prisma: PrismaService,
    ) { }

    async create(ctx: UserContext, dto: CreateRouteQuotaDto) {
        if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
        // Validate association & route exist
        const [assoc, route] = await Promise.all([
            this.prisma.association.findUnique({ where: { id: dto.association_id } }),
            this.prisma.route.findUnique({ where: { id: dto.route_id } }),
        ]);
        if (!assoc) throw new BadRequestException('Association not found');
        if (!route) throw new BadRequestException('Route not found');

        // Optional: ensure quota <= active pairs
        const activePairs = await this.prisma.vehicleAssignment.count({
            where: { association_id: dto.association_id, active: true },
        });
        if (dto.no_vehicles > activePairs) {
            throw new BadRequestException('no_vehicles cannot exceed active driver-vehicle pairs');
        }

        const start_date = etDateToGregorian(dto.start_date);
        const end_date = etDateToGregorian(dto.end_date);
        if (start_date > end_date) throw new BadRequestException('start_date must be <= end_date');

        return this.repo.create({
            association_id: dto.association_id,
            route_id: dto.route_id,
            start_date,
            end_date,
            no_vehicles: dto.no_vehicles,
        });
    }

    find(ctx: UserContext, filter: RouteQuotaFilterDto) {
        // Admin/Superadmin can see all; Association users see only their association's quotas
        if (!isAdminLike(ctx.user_type) && ctx.association_id) {
            filter.association_id = ctx.association_id;
        }
        return this.repo.find(filter);
    }

    async update(ctx: UserContext, id: number, dto: UpdateRouteQuotaDto) {
        if (!isAdminLike(ctx.user_type)) throw new ForbiddenException('Only Admin/Superadmin');
        const existing = await this.repo.findById(id);
        if (!existing) throw new NotFoundException('Route quota not found');

        const patch: any = {};
        if (dto.start_date) patch.start_date = etDateToGregorian(dto.start_date);
        if (dto.end_date) patch.end_date = etDateToGregorian(dto.end_date);
        if (dto.no_vehicles !== undefined) {
            // Optional: re-check capacity vs active pairs
            const activePairs = await this.prisma.vehicleAssignment.count({
                where: { association_id: existing.association_id, active: true },
            });
            if (dto.no_vehicles > activePairs) {
                throw new BadRequestException('no_vehicles cannot exceed active driver-vehicle pairs');
            }
            patch.no_vehicles = dto.no_vehicles;
        }
        if (patch.start_date && patch.end_date && patch.start_date > patch.end_date) {
            throw new BadRequestException('start_date must be <= end_date');
        }

        return this.repo.update(id, patch);
    }
}
