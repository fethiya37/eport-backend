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
exports.PrismaAssociationPolicyRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PrismaAssociationPolicyRepository = class PrismaAssociationPolicyRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async upsert(data) {
        const row = await this.prisma.associationPolicy.upsert({
            where: { association_id: data.association_id },
            create: {
                association_id: data.association_id,
                weekly_fee: data.weekly_fee,
                monthly_fee: data.monthly_fee,
                daily_fine_percent: data.daily_fine_percent,
            },
            update: {
                weekly_fee: data.weekly_fee,
                monthly_fee: data.monthly_fee,
                daily_fine_percent: data.daily_fine_percent,
            },
        });
        return {
            association_id: row.association_id,
            weekly_fee: Number(row.weekly_fee),
            monthly_fee: Number(row.monthly_fee),
            daily_fine_percent: Number(row.daily_fine_percent),
        };
    }
    async get(association_id) {
        const row = await this.prisma.associationPolicy.findUnique({ where: { association_id } });
        if (!row)
            return null;
        return {
            association_id: row.association_id,
            weekly_fee: Number(row.weekly_fee),
            monthly_fee: Number(row.monthly_fee),
            daily_fine_percent: Number(row.daily_fine_percent),
        };
    }
};
exports.PrismaAssociationPolicyRepository = PrismaAssociationPolicyRepository;
exports.PrismaAssociationPolicyRepository = PrismaAssociationPolicyRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaAssociationPolicyRepository);
//# sourceMappingURL=prisma-association-policy.repository.js.map