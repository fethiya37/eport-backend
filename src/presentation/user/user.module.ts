import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { UserController } from './user.controller';
import { UserService } from '../../application/services/user.service';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
  ],
  exports: [UserService],
})
export class UserModule {}
