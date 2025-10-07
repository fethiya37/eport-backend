import { DriverPayment, FeePlan, PaymentMethod, Prisma } from '@prisma/client';
export declare const DRIVER_PAYMENT_REPOSITORY: unique symbol;
export type DriverPaymentCreate = {
    association_id: number;
    driver_id: number;
    fee_plan: FeePlan | 'WEEKLY' | 'MONTHLY';
    prepaid_qty: number;
    amount: number;
    covered_start_date: Date;
    covered_end_date: Date;
    paid_at: Date;
    created_by_user_id: number;
    payment_method?: PaymentMethod | null;
    plate_number?: string | null;
};
export interface IDriverPaymentRepository {
    create(data: DriverPaymentCreate, tx?: Prisma.TransactionClient): Promise<DriverPayment>;
    findMany(filters: any): Promise<any[]>;
    getTotalByAssociation(association_id: number): Promise<{
        total_amount: number;
        count: number;
    }>;
}
