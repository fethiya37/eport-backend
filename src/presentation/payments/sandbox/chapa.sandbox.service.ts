import { Injectable, HttpException } from '@nestjs/common';

/**
 * ======= TEST CONFIG (edit these 2 lines) =======
 * Put your Chapa TEST secret key and your ngrok/local HTTPS URL here.
 * (No .env, per your request.)
 */
const CHAPA_TEST_SECRET = 'CHASECK_TEST-yWMdP0LQ1ahyC0oi5yEsRmxVGdRbOsbz';  // your TEST secret key
const BASE_URL = 'https://foreseeable-mathilde-hotly.ngrok-free.dev/api';     // e.g. "https://abcd-1234.ngrok-free.app/api"
/**
 * ===============================================
 */

type InitArgs = {
  amount: number;
  currency?: 'ETB' | 'USD';
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  txRef: string;
  // NOTE: subaccount omitted in TEST MODE
};

@Injectable()
export class ChapaSandboxService {
  private readonly secret = CHAPA_TEST_SECRET;
  private readonly baseUrl = BASE_URL;

  /**
   * Initialize Hosted Checkout (TEST MODE)
   * Returns Chapa response (includes data.checkout_url)
   */
  async initializeHostedCheckout(args: InitArgs) {
    // Chapa field rules: title <= 16 chars; allowed chars for title/description: letters, numbers, spaces, -, _, .
    const title = 'MembershipFee'; // 13 chars, safe
    const description = 'Driver membership payment'; // safe characters

    const payload = {
      amount: String(args.amount),
      currency: args.currency ?? 'ETB',
      email: args.email,
      first_name: args.firstName,
      last_name: args.lastName,
      phone_number: args.phone,
      tx_ref: args.txRef, // must only contain letters, numbers, -, _, .
      callback_url: `${this.baseUrl}/payments/sandbox/chapa/callback`,
      return_url: `${this.baseUrl}/payments/sandbox/chapa/return`,
      customization: {
        title,
        description,
      },
      // In TEST MODE we do NOT send "subaccounts"
    };

    const res = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new HttpException(data, res.status);
    return data; // contains data.checkout_url
  }

  /**
   * Verify by tx_ref (ALWAYS do this before granting value)
   */
  async verify(txRef: string) {
    const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: { Authorization: `Bearer ${this.secret}` },
    });
    const data = await res.json();
    if (!res.ok) throw new HttpException(data, res.status);
    return data;
  }
}
