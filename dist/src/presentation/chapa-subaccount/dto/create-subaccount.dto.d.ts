export declare class CreateSubaccountDto {
    bank_code: number;
    account_number: string;
    account_name: string;
    business_name: string;
    split_type?: 'fixed' | 'percentage';
    split_value?: number;
}
