import {
  Injectable,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserType } from '@prisma/client';
import { ActivityLogService } from './activity-log.service';

type LoginInput = { phone_number: string; password: string; as?: UserType };
type LogoutInput = { user_id: number; jti: string; exp: number; token_hash: string };

const SHARABLE_ROLES = new Set<UserType>(['Association', 'Driver']);
const NON_SHARABLE_ROLES = new Set<UserType>(['Superadmin', 'Admin', 'Controller']);

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly activityLog: ActivityLogService,
  ) {}

  private pickUserByIntent(
    candidates: {
      id: number;
      user_type: UserType;
      association_id: number | null;
      is_locked: boolean;
      password_hash: string | null;
      phone_number: string;
      name: string | null;
      failed_login_attempts: number;
      locked_until: Date | null;
      must_change_password: boolean;
    }[],
    as?: UserType,
  ) {
    if (candidates.length === 1) return candidates[0];

    if (as && SHARABLE_ROLES.has(as)) {
      const m = candidates.find((u) => u.user_type === as);
      if (m) return m;
      const nonSharable = candidates.find((u) => NON_SHARABLE_ROLES.has(u.user_type));
      if (nonSharable) return nonSharable;
    }

    const nonSharable = candidates.find((u) => NON_SHARABLE_ROLES.has(u.user_type));
    if (nonSharable) return nonSharable;

    if (as && SHARABLE_ROLES.has(as)) {
      const m = candidates.find((u) => u.user_type === as);
      if (m) return m;
    }

    throw new ConflictException({
      message: 'Multiple roles exist for this phone; client must specify "as"',
      available_roles: candidates.map((u) => u.user_type),
    });
  }

  async login(input: LoginInput) {
    const candidates = await this.prisma.user.findMany({
      where: { phone_number: input.phone_number },
      select: {
        id: true,
        user_type: true,
        association_id: true,
        is_locked: true,
        password_hash: true,
        phone_number: true,
        name: true,
        failed_login_attempts: true,
        locked_until: true,
        must_change_password: true,
      },
      orderBy: { id: 'asc' },
    });

    if (candidates.length === 0) throw new UnauthorizedException('invalid credentials');

    const user = this.pickUserByIntent(candidates, input.as);
    const now = new Date();

    if (user.is_locked) throw new ForbiddenException('user is locked');

    if (user.locked_until && user.locked_until > now) {
      throw new ForbiddenException('Too many failed login attempts. Please try again later.');
    }

    if (!user.password_hash) throw new UnauthorizedException('invalid credentials');

    const ok = await bcrypt.compare(input.password, user.password_hash);

    if (!ok) {
      const newAttempts = (user.failed_login_attempts ?? 0) + 1;
      let locked_until: Date | null = null;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        locked_until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: newAttempts,
          locked_until,
        },
      });

      if (locked_until) {
        throw new ForbiddenException(
          'Too many failed login attempts. Your account is temporarily locked.',
        );
      }

      throw new UnauthorizedException('invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failed_login_attempts: 0,
        locked_until: null,
      },
    });

    if (
      (user.user_type === UserType.Association || user.user_type === UserType.Driver) &&
      !user.association_id
    ) {
      throw new ForbiddenException(`User type ${user.user_type} must belong to an association`);
    }

    let driver_id: number | null = null;
    if (user.user_type === UserType.Driver) {
      const driver = await this.prisma.driver.findUnique({
        where: { user_id: user.id },
        select: { id: true },
      });
      if (!driver) throw new ForbiddenException('Driver account is not linked to driver record');
      driver_id = driver.id;
    }

    const jti = crypto.randomUUID();
    const payload = {
      sub: user.id,
      user_type: user.user_type,
      association_id: user.association_id ?? null,
      driver_id,
      jti,
    };

    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    const access_token = await this.jwt.signAsync(payload, { expiresIn });

    const decoded = this.jwt.decode(access_token) as { exp?: number } | null;
    const expDate = decoded?.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 24 * 3600 * 1000);

    const token_hash = crypto.createHash('sha256').update(access_token).digest('hex');
    await this.prisma.userToken.create({
      data: { user_id: user.id, token_hash, expires_at: expDate, revoked: false },
    });

    let association_name: string | null = null;
    if (user.association_id) {
      const assoc = await this.prisma.association.findUnique({
        where: { id: user.association_id },
        select: { name: true },
      });
      association_name = assoc?.name ?? null;
    }

    await this.activityLog.log(
      {
        userId: user.id,
        user_type: user.user_type,
        association_id: user.association_id ?? null,
      } as any,
      {
        module: 'Auth',
        action: 'LOGIN_SUCCESS',
        entity: 'User',
        entity_id: user.id,
      },
    );

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
        must_change_password: user.must_change_password,
      },
      exp: Math.floor(expDate.getTime() / 1000),
      jti,
    };
  }

  async logout(input: LogoutInput) {
    await this.prisma.$transaction([
      this.prisma.revokedToken.upsert({
        where: { jti: input.jti },
        create: {
          jti: input.jti,
          user_id: input.user_id,
          expires_at: new Date(input.exp * 1000),
        },
        update: { expires_at: new Date(input.exp * 1000) },
      }),
      this.prisma.userToken.updateMany({
        where: { user_id: input.user_id, token_hash: input.token_hash, revoked: false },
        data: { revoked: true },
      }),
    ]);

    await this.activityLog.log(null, {
      module: 'Auth',
      action: 'LOGOUT',
      entity: 'User',
      entity_id: input.user_id,
    });

    return { status: 'ok' };
  }
}
