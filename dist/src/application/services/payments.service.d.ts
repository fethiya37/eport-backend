import { type IDriverRepository } from '../../domain/repositories/driver.repository';
import { type IDriverPaymentRepository } from '../../domain/repositories/driver-payment.repository';
import { type IAssociationPolicyRepository } from '../../domain/repositories/association-policy.repository';
import type { UserContext } from 'src/common/context/user-context';
import { PrismaService } from '../../../prisma/prisma.service';
import { PayDto } from '../../presentation/payments/dto/pay.dto';
import { RouteAssignmentService } from './route-assignment.service';
import { SmsGatewayService } from './sms-gateway.service';
import { ActivityLogService } from './activity-log.service';
export declare class PaymentsService {
    private readonly drivers;
    private readonly payments;
    private readonly policy;
    private readonly prisma;
    private readonly routeService;
    private readonly smsGateway;
    private readonly activityLog;
    constructor(drivers: IDriverRepository, payments: IDriverPaymentRepository, policy: IAssociationPolicyRepository, prisma: PrismaService, routeService: RouteAssignmentService, smsGateway: SmsGatewayService, activityLog: ActivityLogService);
    private pad2;
    private ymdEAT;
    private todayEatYmd;
    private isOverdueEAT;
    private startOfDay;
    private toLocalEtMobile;
    private getFees;
    private parsePaymentMethod;
    private coercePaymentMethodLiteral;
    private resolveDriver;
    private assertPlanMatches;
    private assertWeeklyWindow;
    private parseAndValidateWindow;
    private computeTotal;
    private splitName;
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
    totalPayments(ctx: UserContext): Promise<{
        total_amount: number;
        total_transactions: number;
    }>;
    private buildTxRefOnline;
    private parseTxRefOnline;
    initOnlineFromPayDto(ctx: UserContext, dto: PayDto): Promise<{
        tx_ref: string;
        amount: number;
        checkout_url: any;
        chapa_id: string;
        chapa: any;
    }>;
    recordAfterChapaSuccess(txRef: string): Promise<{
        recorded: boolean;
        status: any;
        expected?: undefined;
        paid?: undefined;
        tx_ref?: undefined;
        ref_id?: undefined;
    } | {
        recorded: boolean;
        status: string;
        expected: number;
        paid: number;
        tx_ref: string;
        ref_id?: undefined;
    } | {
        recorded: boolean;
        status: string;
        ref_id: any;
        tx_ref: string;
        expected?: undefined;
        paid?: undefined;
    }>;
    verify(txRef: string): Promise<any>;
}
