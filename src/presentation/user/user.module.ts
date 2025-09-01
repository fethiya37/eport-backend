import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../../application/services/user.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
