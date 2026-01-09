import { Injectable, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';

type JwtPayload = {
  sub: number;
  user_type: 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller';
  association_id: number | null;
  jti: string;
  exp: number;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!rawToken) throw new ForbiddenException('missing token');

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const revoked = await this.prisma.revokedToken.findUnique({
      where: { jti: payload.jti },
    });
    if (revoked) throw new ForbiddenException('token revoked');

    const userToken = await this.prisma.userToken.findFirst({
      where: { user_id: payload.sub, token_hash: tokenHash },
      select: { revoked: true },
    });
    if (userToken?.revoked) throw new ForbiddenException('token revoked');

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.is_locked) throw new ForbiddenException('user is locked');

    return {
      userId: user.id,
      user_type: user.user_type,
      must_change_password: user.must_change_password,
      association_id: user.association_id ?? null,
      jti: payload.jti,
      exp: payload.exp,
      tokenHash,
    };
  }
}
