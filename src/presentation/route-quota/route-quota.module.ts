import { Module } from '@nestjs/common';
import { RouteQuotaController } from './route-quota.controller';
import { RouteQuotaService } from '../../application/services/route-quota.service';
import { PrismaModule } from '../../../prisma/prisma.module';

import { ROUTE_QUOTA_REPOSITORY } from '../../domain/repositories/route-quota.repository';
import { PrismaRouteQuotaRepository } from '../../infrastructure/repositories/prisma-route-quota.repository';

import { ASSOCIATION_REPOSITORY } from '../../domain/repositories/association.repository';
import { PrismaAssociationRepository } from '../../infrastructure/repositories/prisma-association.repository';

import { ROUTES_REPOSITORY } from '../../domain/repositories/route.repository';
import { PrismaRoutesRepository } from 'src/infrastructure/repositories/prisma-route.repository';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [PrismaModule, ActivityLogModule],
  controllers: [RouteQuotaController],
  providers: [
    RouteQuotaService,
    { provide: ROUTE_QUOTA_REPOSITORY, useClass: PrismaRouteQuotaRepository },
    { provide: ASSOCIATION_REPOSITORY, useClass: PrismaAssociationRepository },
    { provide: ROUTES_REPOSITORY, useClass: PrismaRoutesRepository },
  ],
  exports: [RouteQuotaService],
})
export class RouteQuotaModule {}
