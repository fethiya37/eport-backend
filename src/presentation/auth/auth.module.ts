import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';
import { PrismaModule } from 'prisma/prisma.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  const env = (process.env.NODE_ENV || '').toLowerCase();
  if (env === 'production' && (!secret || secret.trim().length < 32)) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  return secret || 'dev-secret';
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: requireJwtSecret(),
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
    PrismaModule,
    ActivityLogModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [JwtModule, PassportModule, AuthService],
})
export class AuthModule {}
