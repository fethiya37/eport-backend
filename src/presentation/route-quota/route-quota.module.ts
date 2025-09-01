import { Module } from '@nestjs/common';
import { RouteQuotaController } from './route-quota.controller';
import { RouteQuotaService } from '../../application/services/route-quota.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { ROUTE_QUOTA_REPOSITORY } from '../../domain/repositories/route-quota.repository';
import { PrismaRouteQuotaRepository } from '../../infrastructure/repositories/prisma-route-quota.repository';

@Module({
  controllers: [RouteQuotaController],
  providers: [
    RouteQuotaService,
    PrismaService,
    { provide: ROUTE_QUOTA_REPOSITORY, useClass: PrismaRouteQuotaRepository },
  ],
  exports: [RouteQuotaService],
})
export class RouteQuotaModule {}
