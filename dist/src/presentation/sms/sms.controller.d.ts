import type { UserContext } from '../../common/context/user-context';
import { SmsGatewayService } from '../../application/services/sms-gateway.service';
import { SendSmsDto } from './dto/send-sms.dto';
export declare class SmsController {
    private readonly smsService;
    constructor(smsService: SmsGatewayService);
    sendSms(user: UserContext, dto: SendSmsDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
}
