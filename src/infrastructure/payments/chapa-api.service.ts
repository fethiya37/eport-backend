import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ChapaApiService {
  private readonly base = 'https://api.chapa.co/v1';

  private get headers() {
    const key = process.env.CHAPA_SECRET;
    return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  }

  async listBanks(country = 'ET') {
    try {
      const { data } = await axios.get(`${this.base}/banks`, {
        headers: this.headers,
        params: { country },
      });
      return data;
    } catch (e: any) {
      throw new InternalServerErrorException(e?.response?.data ?? 'chapa banks failed');
    }
  }

  async createSubaccount(input: {
    bank_code: number;
    account_number: string;
    account_name: string;
    business_name: string;
    split_type: 'fixed' | 'percentage';
    split_value: number;
  }) {
    try {
      const { data } = await axios.post(`${this.base}/subaccount`, input, { headers: this.headers });
      return data;
    } catch (e: any) {
      throw new InternalServerErrorException(e?.response?.data ?? 'chapa subaccount create failed');
    }
  }
}
