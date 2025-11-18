import type { UserContext } from 'src/common/context/user-context';
import { PayDto } from './dto/pay.dto';
import { PaymentsService } from 'src/application/services/payments.service';
import { ListPaymentsDto } from './dto/list-payments.dto';
export declare class PaymentsController {
    private readonly service;
    constructor(service: PaymentsService);
    apply(user: UserContext, dto: PayDto): Promise<{
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
    list(user: UserContext, filters: ListPaymentsDto): Promise<{
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
    total(user: UserContext): Promise<{
        total_amount: number;
        total_transactions: number;
    }>;
    onlineInit(user: UserContext, dto: PayDto): Promise<{
        tx_ref: string;
        amount: number;
        checkout_url: any;
        chapa_id: string;
        chapa: any;
        payload: {
            amount: string;
            currency: string;
            first_name: string;
            last_name: string;
            phone_number: string;
            tx_ref: string;
            callback_url: string;
            return_url: string;
            'customization[title]': string;
            'customization[description]': string;
            subaccounts: {
                id: string;
            };
        };
    }>;
    onlineReturn(): string;
    callback(txRef: string): Promise<{
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
    } | {
        recorded: boolean;
        status: string;
        message: any;
    }>;
}
