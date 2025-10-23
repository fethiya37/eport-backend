type InitArgs = {
    amount: number;
    currency?: 'ETB' | 'USD';
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    txRef: string;
};
export declare class ChapaSandboxService {
    private readonly secret;
    private readonly baseUrl;
    initializeHostedCheckout(args: InitArgs): Promise<any>;
    verify(txRef: string): Promise<any>;
}
export {};
