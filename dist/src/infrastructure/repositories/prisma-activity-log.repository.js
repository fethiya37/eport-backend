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
exports.PrismaActivityLogRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PrismaActivityLogRepository = class PrismaActivityLogRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.activityLog.create({
            data: {
                user_id: data.user_id ?? null,
                association_id: data.association_id ?? null,
                action: data.action,
                entity_type: data.entity_type ?? null,
                entity_id: data.entity_id ?? null,
                description: data.description ?? null,
                ip_address: data.ip_address ?? null,
            },
        });
    }
    async findById(id) {
        return this.prisma.activityLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone_number: true,
                        user_type: true,
                    },
                },
                association: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    async findMany(filter, options) {
        const where = {
            ...(filter.user_id ? { user_id: filter.user_id } : {}),
            ...(filter.association_id ? { association_id: filter.association_id } : {}),
            ...(filter.action ? { action: filter.action } : {}),
            ...(filter.entity_type ? { entity_type: filter.entity_type } : {}),
            ...(filter.entity_id ? { entity_id: filter.entity_id } : {}),
            ...(filter.date_from || filter.date_to
                ? {
                    created_at: {
                        ...(filter.date_from ? { gte: filter.date_from } : {}),
                        ...(filter.date_to ? { lte: filter.date_to } : {}),
                    },
                }
                : {}),
        };
        return this.prisma.activityLog.findMany({
            where,
            orderBy: { id: 'desc' },
            skip: options?.skip,
            take: options?.take ?? 100,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone_number: true,
                        user_type: true,
                    },
                },
                association: {
                    select: { id: true, name: true },
                },
            },
        });
    }
};
exports.PrismaActivityLogRepository = PrismaActivityLogRepository;
exports.PrismaActivityLogRepository = PrismaActivityLogRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaActivityLogRepository);
//# sourceMappingURL=prisma-activity-log.repository.js.map