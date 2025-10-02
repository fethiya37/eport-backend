import type { UserContext } from 'src/common/context/user-context';
import { PayDto } from './dto/pay.dto';
import { PaymentsService } from 'src/application/services/payments.service';
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
}
