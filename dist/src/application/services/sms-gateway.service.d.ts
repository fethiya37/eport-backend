import { HttpService } from '@nestjs/axios';
export declare class SmsGatewayService {
    private readonly http;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly accountId;
    private readonly senderName;
    constructor(http: HttpService);
    sendSms(to: string, message: string): Promise<any>;
}
