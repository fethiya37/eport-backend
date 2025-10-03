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
        payment: {
            plate_number: any;
            fee_plan: "WEEKLY" | "MONTHLY";
            breakdown: {
                interest: number;
                current_fee: number;
                future_fee: number;
                total: number;
            };
            coverage: {
                from: string;
                to: string;
            };
        };
    }>;
    private formatCoverageSmsCompact;
    listPayments(ctx: UserContext, filters: any): Promise<{
        id: any;
        association_id: any;
        driver_id: any;
        plate_number: any;
        fee_plan: any;
        prepaid_qty: any;
        amount: number;
        payment_method: any;
        covered_start_date: string;
        covered_end_date: string;
        paid_at: string;
        driver: {
            full_name: any;
            phone_number: any;
            username: any;
        } | null;
    }[]>;
}
