"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
        }
        catch (e) {
            if (e.code === 'P2002') {
                const target = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target || '');
                if (target.includes('phone_number_user_type') || target.includes('phone_number,user_type') || target.includes('phone_number')) {
                    throw new common_1.BadRequestException('This phone and role already exist');
                }
            }
            throw e;
        }
    }
    async findAll(filter) {
        const where = {
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
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async update(id, data) {
        try {
            return await this.prisma.user.update({ where: { id }, data });
        }
        catch (e) {
            if (e.code === 'P2002') {
                const target = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target || '');
                if (target.includes('phone_number_user_type') || target.includes('phone_number,user_type') || target.includes('phone_number')) {
                    throw new common_1.BadRequestException('This phone and role already exist');
                }
            }
            if (e.code === 'P2025')
                throw new common_1.NotFoundException('User not found');
            throw e;
        }
    }
    async remove(id) {
        try {
            return await this.prisma.user.delete({ where: { id } });
        }
        catch (e) {
            if (e.code === 'P2025')
                throw new common_1.NotFoundException('User not found');
            throw e;
        }
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map