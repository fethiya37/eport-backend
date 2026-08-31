import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

@Injectable()
export class SmsGatewayService {
  private readonly apiUrl = 'https://api.afromessage.com/api/send';
  private readonly apiKey = process.env.AFROMSG_API_KEY;
  private readonly accountId = process.env.AFROMSG_ACCOUNT_ID;
  private readonly senderName = process.env.AFROMSG_SENDER_NAME;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(private readonly http: HttpService) {}

  async sendSms(to: string, message: string) {
    if (!to || !message) {
      throw new Error('Phone number and message are required');
    }

    const formattedPhone = this.formatPhoneNumber(to);
    const payload = {
      from: this.accountId,
      sender: this.senderName,
      to: formattedPhone,
      message,
    };

    let lastError: AxiosError | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res: AxiosResponse<any> = await firstValueFrom(
          this.http.post(this.apiUrl, payload, {
            headers: { Authorization: `Bearer ${this.apiKey}` },
            timeout: 10000,
          }),
        );
        return res.data;
      } catch (err: unknown) {
        const error = err as AxiosError;

        lastError = error;

        if (error.response?.status === 429) {
          const waitTime = this.retryDelay * attempt * 2;
          await this.sleep(waitTime);
          continue;
        }

        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
          continue;
        }
      }
    }

    const errorMessage =
      (lastError?.response?.data as any)?.message ||
      (lastError?.response?.data as any)?.error ||
      lastError?.message ||
      'Failed to send SMS';

    throw new Error(errorMessage);
  }

  private formatPhoneNumber(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('251')) {
      return digits.slice(3);
    }
    if (digits.startsWith('0')) {
      return digits.slice(1);
    }
    return digits;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
