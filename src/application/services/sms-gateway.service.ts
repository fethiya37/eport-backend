import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class SmsGatewayService {
  private readonly apiUrl = 'https://api.afromessage.com/api/send';
  private readonly apiKey = process.env.AFROMSG_API_KEY;
  private readonly accountId = process.env.AFROMSG_ACCOUNT_ID;
  private readonly senderName = process.env.AFROMSG_SENDER_NAME;

  constructor(private readonly http: HttpService) {}

  async sendSms(to: string, message: string) {
    const payload = {
      from: this.accountId,
      sender: this.senderName,
      to,
      message,
    };

    try {
      const res: AxiosResponse<any> = await firstValueFrom(
        this.http.post(this.apiUrl, payload, {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        }),
      );
      console.log('✅ SMS API response:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('❌ SMS send failed:', err.response?.data || err.message);
      throw err;
    }
  }
}
