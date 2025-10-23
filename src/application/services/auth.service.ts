import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserType } from '@prisma/client';

type LoginInput  = { phone_number: string; password: string };
type LogoutInput = { user_id: number; jti: string; exp: number; token_hash: string }; // ✅ NEW field

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { phone_number: input.phone_number },
    });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('invalid credentials');
    }
    if (user.is_locked) {
      throw new ForbiddenException('user is locked');
    }

    const ok = await bcrypt.compare(input.password, user.password_hash);
    if (!ok) throw new UnauthorizedException('invalid credentials');

    if (
      (user.user_type === UserType.Association || user.user_type === UserType.Driver) &&
      !user.association_id
    ) {
      throw new ForbiddenException(
        `User type ${user.user_type} must belong to an association`,
      );
    }

    let driver_id: number | null = null;
    if (user.user_type === UserType.Driver) {
      const driver = await this.prisma.driver.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      });
      driver_id = driver?.id ?? null;
      if (!driver_id) {
        throw new ForbiddenException('Driver account is not linked to driver record');
      }
    }

    const jti = crypto.randomUUID();
    const payload = {
      sub: user.id,
      user_type: user.user_type,
      association_id: user.association_id ?? null,
      driver_id: driver_id ?? null,
      jti,
    };

    const expiresIn   = process.env.JWT_EXPIRES_IN || '1d';
    const access_token = await this.jwt.signAsync(payload, { expiresIn });

    const decoded = this.jwt.decode(access_token) as { exp?: number } | null;
    const exp = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 3600 * 1000);

    // Store fingerprint (no raw token)
    const token_hash = crypto.createHash('sha256').update(access_token).digest('hex');
    await this.prisma.userToken.create({
      data: {
        user_id: user.id,
        token_hash,
        expires_at: exp,
        revoked: false,
        // (optional) If you added a jti column in UserToken, you could also persist it here.
        // jti,
      },
    });

    let association_name: string | null = null;
    if (user.association_id) {
      const assoc = await this.prisma.association.findUnique({
        where: { id: user.association_id },
        select: { name: true },
      });
      association_name = assoc?.name ?? null;
    }

    return {
      access_token,
      user: {
        id: user.id,
        phone_number: user.phone_number,
        user_type: user.user_type,
        association_id: user.association_id ?? null,
        association_name,
        driver_id,
        name: user.name ?? null,
      },
      exp: Math.floor(exp.getTime() / 1000),
      jti,
    };
  }

  async logout(input: LogoutInput) {
    await this.prisma.$transaction([
      // 1) Blacklist by jti
      this.prisma.revokedToken.upsert({
        where: { jti: input.jti },
        create: {
          jti: input.jti,
          user_id: input.user_id,
          expires_at: new Date(input.exp * 1000),
        },
        update: { expires_at: new Date(input.exp * 1000) },
      }),

      // 2) Mark this exact stored token as revoked (by fingerprint)
      this.prisma.userToken.updateMany({
        where: {
          user_id: input.user_id,
          token_hash: input.token_hash,
          revoked: false,
        },
        data: { revoked: true },
      }),
    ]);

    return { status: 'ok' };
  }
}
