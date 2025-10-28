export declare class ChapaApiService {
    private readonly base;
    private get headers();
    listBanks(country?: string): Promise<any>;
    createSubaccount(input: {
        bank_code: number;
        account_number: string;
        account_name: string;
        business_name: string;
        split_type: 'fixed' | 'percentage';
        split_value: number;
    }): Promise<any>;
}
