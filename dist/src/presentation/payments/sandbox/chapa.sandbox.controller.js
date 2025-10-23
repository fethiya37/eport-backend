"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapaSandboxController = void 0;
const common_1 = require("@nestjs/common");
const chapa_sandbox_service_1 = require("./chapa.sandbox.service");
const crypto = __importStar(require("crypto"));
const public_decorator_1 = require("../../../common/decorators/public.decorator");
const CHAPA_WEBHOOK_SECRET = 'CHASECK_TEST-yWMdP0LQ1ahyC0oi5yEsRmxVGdRbOsbz';
let ChapaSandboxController = class ChapaSandboxController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    async init(body) {
        const safeRand = Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(2, 10);
        const txRef = `test-${Date.now()}-${safeRand}`;
        const data = await this.svc.initializeHostedCheckout({
            amount: body.amount,
            email: body.email.toLowerCase(),
            firstName: body.firstName ?? 'Test',
            lastName: body.lastName ?? 'Driver',
            phone: body.phone ?? '0912345678',
            txRef,
        });
        return { txRef, ...data };
    }
    returnPage(res) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`
      <div style="font-family:sans-serif;max-width:560px;margin:40px auto;text-align:center">
        <h2>Thanks! If your payment succeeded, we’ll confirm shortly.</h2>
        <p>You can close this tab now.</p>
      </div>
    `);
    }
    async callback(txRef) {
        const verify = await this.svc.verify(txRef);
        return { ok: true, verify };
    }
    async webhook(req, body) {
        const raw = JSON.stringify(body || {});
        const header = (req.headers['x-chapa-signature'] ||
            req.headers['X-Chapa-Signature'] ||
            req.headers['chapa-signature'] ||
            req.headers['Chapa-Signature']);
        if (!header)
            return { ok: false, reason: 'missing signature' };
        const expected = crypto
            .createHmac('sha256', CHAPA_WEBHOOK_SECRET)
            .update(raw)
            .digest('hex');
        if (header !== expected)
            return { ok: false, reason: 'bad signature' };
        const event = body?.event;
        const txRef = body?.tx_ref || body?.trx_ref;
        if (txRef) {
            const verify = await this.svc.verify(txRef);
            return { ok: true, event, verify };
        }
        return { ok: true, event };
    }
    async verify(txRef) {
        return this.svc.verify(txRef);
    }
};
exports.ChapaSandboxController = ChapaSandboxController;
__decorate([
    (0, common_1.Post)('init'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChapaSandboxController.prototype, "init", null);
__decorate([
    (0, common_1.Get)('return'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChapaSandboxController.prototype, "returnPage", null);
__decorate([
    (0, common_1.Get)('callback'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('trx_ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChapaSandboxController.prototype, "callback", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChapaSandboxController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('tx_ref')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChapaSandboxController.prototype, "verify", null);
exports.ChapaSandboxController = ChapaSandboxController = __decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('payments/sandbox/chapa'),
    __metadata("design:paramtypes", [chapa_sandbox_service_1.ChapaSandboxService])
], ChapaSandboxController);
//# sourceMappingURL=chapa.sandbox.controller.js.map