import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type LoginInput = { phone_number: string; password: string };
type LogoutInput = { user_id: number; jti: string; exp: number };

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { phone_number: input.phone_number } });
    if (!user || !user.password_hash) throw new UnauthorizedException('invalid credentials');

    if (user.is_locked) throw new ForbiddenException('user is locked');

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    // jti for this token
    const jti = crypto.randomUUID();

    const payload = {
      sub: user.id,
      user_type: user.user_type,
      association_id: user.association_id ?? null,
      jti,
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    const access_token = await this.jwt.signAsync(payload, { expiresIn });

    // decode exp to store
    const decoded = this.jwt.decode(access_token) as { exp: number } | null;
    const exp = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 24 * 3600 * 1000);

    // Persist in user_tokens (audit/visibility)
    const token_hash = crypto.createHash('sha256').update(access_token).digest('hex');
    await this.prisma.userToken.create({
      data: {
        user_id: user.id,
        token_hash,
        expires_at: exp,
        revoked: false,
      },
    });

    return {
      access_token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        user_type: user.user_type,
        association_id: user.association_id ?? null,
        name: user.name ?? null,
      },
    };
  }

  async logout(input: LogoutInput) {
    // add to revoked_tokens by jti; exp is seconds since epoch from JWT
    await this.prisma.revokedToken.upsert({
      where: { jti: input.jti },
      create: { jti: input.jti, user_id: input.user_id, expires_at: new Date(input.exp * 1000) },
      update: { expires_at: new Date(input.exp * 1000) },
    });
    return { status: 'ok' };
  }
}
