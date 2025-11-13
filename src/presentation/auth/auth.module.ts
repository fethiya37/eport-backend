import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }), PrismaModule, ActivityLogModule
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule { }
