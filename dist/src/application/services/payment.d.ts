import { type IDriverRepository } from '../../domain/repositories/driver.repository';
import { type IDriverPaymentRepository } from '../../domain/repositories/driver-payment.repository';
import { type IAssociationPolicyRepository } from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaService } from '../../../prisma/prisma.service';
import { PayDto } from '../../presentation/payments/dto/pay.dto';
import { RouteAssignmentService } from './route-assignment.service';
import { SmsGatewayService } from './sms-gateway.service';
export declare class PaymentsService {
    private readonly drivers;
    private readonly payments;
    private readonly policy;
    private readonly prisma;
    private readonly routeService;
    private readonly smsGateway;
    constructor(drivers: IDriverRepository, payments: IDriverPaymentRepository, policy: IAssociationPolicyRepository, prisma: PrismaService, routeService: RouteAssignmentService, smsGateway: SmsGatewayService);
    private pad2;
    private ymdEAT;
    private todayEatYmd;
    private isOverdueEAT;
    private startOfDay;
    private getFees;
    private parsePaymentMethod;
    private resolveDriver;
    applyPayment(ctx: UserContext, dto: PayDto): Promise<{
        message: string;
    }>;
    initiateChapaPayment(ctx: UserContext, dto: PayDto): Promise<{
        message: string;
        tx_ref: string;
        checkout_url: any;
    }>;
    handleChapaCallback(payload: any): Promise<{
        ok: boolean;
        message: string;
        tx_ref?: undefined;
        record?: undefined;
    } | {
        ok: boolean;
        message: string;
        tx_ref: any;
        record: {
            id: number;
            association_id: number;
            plate_number: string | null;
            driver_id: number | null;
            fee_plan: import("@prisma/client").$Enums.FeePlan;
            prepaid_qty: number;
            covered_start_date: Date;
            covered_end_date: Date;
            amount: import("@prisma/client/runtime/library").Decimal;
            payment_method: import("@prisma/client").$Enums.PaymentMethod | null;
            created_by_user_id: number | null;
            paid_at: Date;
        };
    }>;
    verifyChapaPayment(tx_ref: string): Promise<any>;
    listPayments(ctx: UserContext, filters: any): Promise<{
        id: any;
        plate_number: any;
        fee_plan: any;
        prepaid_qty: any;
        amount: number;
        payment_method: any;
        covered_start_date: string;
        covered_end_date: string;
        paid_at: string;
    }[]>;
    totalPayments(ctx: UserContext): Promise<{
        total_amount: number;
        total_transactions: number;
    }>;
}
