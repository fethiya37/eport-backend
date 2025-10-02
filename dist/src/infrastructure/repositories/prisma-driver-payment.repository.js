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
exports.PrismaDriverPaymentRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let PrismaDriverPaymentRepository = class PrismaDriverPaymentRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(row, tx) {
        const data = {
            association_id: row.association_id,
            driver_id: row.driver_id,
            fee_plan: row.fee_plan,
            prepaid_qty: row.prepaid_qty,
            amount: new client_1.Prisma.Decimal(row.amount),
            covered_start_date: row.covered_start_date,
            covered_end_date: row.covered_end_date,
            paid_at: row.paid_at,
            created_by_user_id: row.created_by_user_id,
            payment_method: (row.payment_method ?? null),
            plate_number: row.plate_number ?? null,
        };
        if (tx) {
            return tx.driverPayment.create({ data });
        }
        return this.prisma.driverPayment.create({ data });
    }
};
exports.PrismaDriverPaymentRepository = PrismaDriverPaymentRepository;
exports.PrismaDriverPaymentRepository = PrismaDriverPaymentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaDriverPaymentRepository);
//# sourceMappingURL=prisma-driver-payment.repository.js.map