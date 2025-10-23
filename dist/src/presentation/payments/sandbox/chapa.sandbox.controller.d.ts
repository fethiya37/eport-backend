import { ChapaSandboxService } from './chapa.sandbox.service';
export declare class ChapaSandboxController {
    private readonly svc;
    constructor(svc: ChapaSandboxService);
    init(body: {
        amount: number;
        email: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    }): Promise<any>;
    returnPage(res: any): void;
    callback(txRef: string): Promise<{
        ok: boolean;
        verify: any;
    }>;
    webhook(req: any, body: any): Promise<{
        ok: boolean;
        reason: string;
        event?: undefined;
        verify?: undefined;
    } | {
        ok: boolean;
        event: any;
        verify: any;
        reason?: undefined;
    } | {
        ok: boolean;
        event: any;
        reason?: undefined;
        verify?: undefined;
    }>;
    verify(txRef: string): Promise<any>;
}
