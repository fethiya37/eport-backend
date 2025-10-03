import { FeePlan, PaymentMethod } from '@prisma/client';
export declare class ListPaymentsDto {
    association_id?: string;
    driver_id?: string;
    created_by_user_id?: string;
    fee_plan?: FeePlan;
    plate_number?: string;
    payment_method?: PaymentMethod;
    from_date?: string;
    to_date?: string;
}
