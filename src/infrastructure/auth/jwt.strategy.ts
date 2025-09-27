import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

// Keep payload minimal and explicit. exp is injected by passport-jwt after verification.
type JwtPayload = {
  sub: number;  // user id
  user_type:
    | 'Superadmin'
    | 'Admin'
    | 'Association'
    | 'Driver'
    | 'Controller'
  association_id: number | null;
  jti: string;
  exp: number;  // seconds since epoch (auto present)
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload) {
    // 1) reject revoked tokens (jti blacklist)
    const revoked = await this.prisma.revokedToken.findUnique({ where: { jti: payload.jti } });
    if (revoked) throw new ForbiddenException('token revoked');

    // 2) user must exist and be unlocked
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.is_locked) throw new ForbiddenException('user is locked');

    // 3) attach shaped object to req.user
    return {
      userId: user.id,
      user_type: user.user_type,
      association_id: user.association_id ?? null,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
