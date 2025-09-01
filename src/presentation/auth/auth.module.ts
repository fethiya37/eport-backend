import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    // Lets @UseGuards(AuthGuard('jwt')) work, and makes req.user available
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // ⬇️ This is “registering” JwtModule with your secret & expiry.
    // JwtService.signAsync() will use these defaults.
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [JwtModule, PassportModule, AuthService], // so other modules can reuse JwtService if needed
})
export class AuthModule {}
