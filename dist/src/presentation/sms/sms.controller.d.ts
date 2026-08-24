import { SmsGatewayService } from '../../application/services/sms-gateway.service';
export declare class SmsController {
    private readonly smsGateway;
    constructor(smsGateway: SmsGatewayService);
    sendTestSms(to: string, message: string): Promise<{
        success: boolean;
        result: any;
    }>;
}
