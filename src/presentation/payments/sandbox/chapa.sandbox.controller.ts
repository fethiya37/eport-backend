import {
  Body, Controller, Get, HttpCode, Post, Query, Req, Res
} from '@nestjs/common';
import { ChapaSandboxService } from './chapa.sandbox.service';
import * as crypto from 'crypto';
import { Public } from 'src/common/decorators/public.decorator';

/**
 * For webhook signature validation in TEST MODE,
 * reuse your TEST secret for simplicity.
 */
const CHAPA_WEBHOOK_SECRET = 'CHASECK_TEST-yWMdP0LQ1ahyC0oi5yEsRmxVGdRbOsbz';

@Public() 
@Controller('payments/sandbox/chapa')
export class ChapaSandboxController {
  constructor(private readonly svc: ChapaSandboxService) {}

  /**
   * 1) INIT — returns txRef + checkout_url
   * Body:
   * {
   *   "amount": 150,
   *   "email": "driver@example.com",
   *   "firstName": "Abebe",
   *   "lastName": "Kebede",
   *   "phone": "0912345678"
   * }
   */
  @Post('init')
  @Public()
  async init(@Body() body: {
    amount: number;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    // tx_ref may only contain letters, numbers, hyphens, underscores, and dots.
    const safeRand = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 10);
    const txRef = `test-${Date.now()}-${safeRand}`; // only [a-z0-9-]

    const data = await this.svc.initializeHostedCheckout({
      amount: body.amount,
      email: body.email.toLowerCase(),
      firstName: body.firstName ?? 'Test',
      lastName: body.lastName ?? 'Driver',
      phone: body.phone ?? '0912345678',
      txRef,
    });

    return { txRef, ...data }; // includes data.checkout_url
  }

  /**
   * 2) RETURN — human-facing redirect page (UX only)
   */
  @Get('return')
  @Public()
  @HttpCode(200)
  returnPage(@Res() res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <div style="font-family:sans-serif;max-width:560px;margin:40px auto;text-align:center">
        <h2>Thanks! If your payment succeeded, we’ll confirm shortly.</h2>
        <p>You can close this tab now.</p>
      </div>
    `);
  }

  /**
   * 3) CALLBACK — server endpoint hit by Chapa after checkout
   *    Always call VERIFY before granting value.
   *    Chapa adds ?tx_ref=... to the callback URL.
   */
  @Get('callback')
  @Public()
  async callback(@Query('trx_ref') txRef: string) {
    const verify = await this.svc.verify(txRef);
    return { ok: true, verify };
  }

  /**
   * 4) WEBHOOK — signed event. Validate signature, then VERIFY.
   *    Preferred header: x-chapa-signature = HMAC-SHA256(payload, secret)
   */
  @Post('webhook')
  @Public()
  @HttpCode(200)
  async webhook(@Req() req, @Body() body: any) {
    const raw = JSON.stringify(body || {});
    const header = (req.headers['x-chapa-signature'] ||
                    req.headers['X-Chapa-Signature'] ||
                    req.headers['chapa-signature'] ||
                    req.headers['Chapa-Signature']) as string | undefined;

    if (!header) return { ok: false, reason: 'missing signature' };

    const expected = crypto
      .createHmac('sha256', CHAPA_WEBHOOK_SECRET)
      .update(raw)
      .digest('hex');

    if (header !== expected) return { ok: false, reason: 'bad signature' };

    const event = body?.event; // e.g., "charge.success"
    const txRef = body?.tx_ref || body?.trx_ref;

    if (txRef) {
      const verify = await this.svc.verify(txRef);
      return { ok: true, event, verify };
    }
    return { ok: true, event };
  }

  /**
   * 5) Manual VERIFY — handy for Postman/PowerShell
   */
  @Get('verify')
  @Public()
  async verify(@Query('tx_ref') txRef: string) {
    return this.svc.verify(txRef);
  }

  
}
