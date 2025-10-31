import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IUserRepository, UserFilter } from '../../domain/repositories/user.repository';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    phone_number: string;
    user_type: User['user_type'];
    name?: string | null;
    association_id: number | null;
    password_hash: string;
  }): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          phone_number: data.phone_number,
          user_type: data.user_type,
          name: data.name ?? null,
          association_id: data.association_id,
          password_hash: data.password_hash,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        const target = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target || '');
        if (target.includes('phone_number_user_type') || target.includes('phone_number,user_type') || target.includes('phone_number')) {
          throw new BadRequestException('This phone and role already exist');
        }
      }
      throw e;
    }
  }

  async findAll(filter?: UserFilter): Promise<User[]> {
    const where: Prisma.UserWhereInput = {
      ...(filter?.id ? { id: filter.id } : {}),
      ...(filter?.phone_number ? { phone_number: filter.phone_number } : {}),
      ...(filter?.user_type ? { user_type: filter.user_type } : {}),
      ...(filter?.name ? { name: { contains: filter.name, mode: 'insensitive' } } : {}),
      ...(filter?.association_id !== undefined ? { association_id: filter.association_id } : {}),
      ...(filter?.is_locked !== undefined ? { is_locked: filter.is_locked } : {}),
    };

    return this.prisma.user.findMany({
      where,
      orderBy: { id: 'asc' },
      include: { association: true },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (e: any) {
      if (e.code === 'P2002') {
        const target = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target || '');
        if (target.includes('phone_number_user_type') || target.includes('phone_number,user_type') || target.includes('phone_number')) {
          throw new BadRequestException('This phone and role already exist');
        }
      }
      if (e.code === 'P2025') throw new NotFoundException('User not found');
      throw e;
    }
  }

  async remove(id: number): Promise<User> {
    try {
      return await this.prisma.user.delete({ where: { id } });
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('User not found');
      throw e;
    }
  }
}
