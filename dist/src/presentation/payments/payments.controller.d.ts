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
}
