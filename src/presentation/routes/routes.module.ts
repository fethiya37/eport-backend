import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from '../../application/services/routes.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PrismaRoutesRepository } from 'src/infrastructure/repositories/prisma-route.repository';
import { ROUTES_REPOSITORY } from 'src/domain/repositories/route.repository';

@Module({
  controllers: [RoutesController],
  providers: [
    RoutesService,
    PrismaService,
    { provide: ROUTES_REPOSITORY, useClass: PrismaRoutesRepository},
  ],
  exports: [RoutesService],
})
export class RoutesModule {}
