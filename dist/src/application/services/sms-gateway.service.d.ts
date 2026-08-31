import { HttpService } from '@nestjs/axios';
export declare class SmsGatewayService {
    private readonly http;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly accountId;
    private readonly senderName;
    private readonly maxRetries;
    private readonly retryDelay;
    constructor(http: HttpService);
    sendSms(to: string, message: string): Promise<any>;
    private formatPhoneNumber;
    private sleep;
}
