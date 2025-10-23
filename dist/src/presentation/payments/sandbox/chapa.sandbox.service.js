"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapaSandboxService = void 0;
const common_1 = require("@nestjs/common");
const CHAPA_TEST_SECRET = 'CHASECK_TEST-yWMdP0LQ1ahyC0oi5yEsRmxVGdRbOsbz';
const BASE_URL = 'https://foreseeable-mathilde-hotly.ngrok-free.dev/api';
let ChapaSandboxService = class ChapaSandboxService {
    secret = CHAPA_TEST_SECRET;
    baseUrl = BASE_URL;
    async initializeHostedCheckout(args) {
        const title = 'MembershipFee';
        const description = 'Driver membership payment';
        const payload = {
            amount: String(args.amount),
            currency: args.currency ?? 'ETB',
            email: args.email,
            first_name: args.firstName,
            last_name: args.lastName,
            phone_number: args.phone,
            tx_ref: args.txRef,
            callback_url: `${this.baseUrl}/payments/sandbox/chapa/callback`,
            return_url: `${this.baseUrl}/payments/sandbox/chapa/return`,
            customization: {
                title,
                description,
            },
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
        if (!res.ok)
            throw new common_1.HttpException(data, res.status);
        return data;
    }
    async verify(txRef) {
        const res = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
            headers: { Authorization: `Bearer ${this.secret}` },
        });
        const data = await res.json();
        if (!res.ok)
            throw new common_1.HttpException(data, res.status);
        return data;
    }
};
exports.ChapaSandboxService = ChapaSandboxService;
exports.ChapaSandboxService = ChapaSandboxService = __decorate([
    (0, common_1.Injectable)()
], ChapaSandboxService);
//# sourceMappingURL=chapa.sandbox.service.js.map