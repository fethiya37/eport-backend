export declare class PayDto {
    driver_id?: number;
    plate_number?: string;
    fee_plan: 'WEEKLY' | 'MONTHLY';
    prepaid_qty: number;
    covered_start_date: string;
    covered_end_date: string;
    amount?: number;
    payment_method?: string;
}
