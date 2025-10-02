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
exports.PrismaAssociationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PrismaAssociationRepository = class PrismaAssociationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.association.create({
            data: {
                name: data.name,
                phone_number: data.phone_number ?? null,
                logo: data.logo ?? null,
            },
        });
    }
    async findAll(filter) {
        const where = {
            ...(filter?.id ? { id: filter.id } : {}),
            ...(filter?.name
                ? { name: { contains: filter.name, mode: 'insensitive' } }
                : {}),
        };
        return this.prisma.association.findMany({ where, orderBy: { id: 'asc' } });
    }
    findById(id) {
        return this.prisma.association.findUnique({ where: { id } });
    }
    async update(id, data) {
        try {
            return await this.prisma.association.update({ where: { id }, data });
        }
        catch (e) {
            if (e.code === 'P2025')
                throw new common_1.NotFoundException('Association not found');
            throw e;
        }
    }
    async exists(id) {
        const count = await this.prisma.association.count({ where: { id } });
        return count > 0;
    }
};
exports.PrismaAssociationRepository = PrismaAssociationRepository;
exports.PrismaAssociationRepository = PrismaAssociationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAssociationRepository);
//# sourceMappingURL=prisma-association.repository.js.map