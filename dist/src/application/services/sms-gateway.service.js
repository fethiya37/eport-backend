"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsGatewayService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let SmsGatewayService = class SmsGatewayService {
    http;
    apiUrl = 'https://api.afromessage.com/api/send';
    apiKey = process.env.AFROMSG_API_KEY;
    accountId = process.env.AFROMSG_ACCOUNT_ID;
    senderName = process.env.AFROMSG_SENDER_NAME;
    maxRetries = 3;
    retryDelay = 1000;
    constructor(http) {
        this.http = http;
    }
    async sendSms(to, message) {
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
        let lastError = null;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const res = await (0, rxjs_1.firstValueFrom)(this.http.post(this.apiUrl, payload, {
                    headers: { Authorization: `Bearer ${this.apiKey}` },
                    timeout: 10000,
                }));
                return res.data;
            }
            catch (err) {
                const error = err;
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
        const errorMessage = lastError?.response?.data?.message ||
            lastError?.response?.data?.error ||
            lastError?.message ||
            'Failed to send SMS';
        throw new Error(errorMessage);
    }
    formatPhoneNumber(phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.startsWith('251')) {
            return digits.slice(3);
        }
        if (digits.startsWith('0')) {
            return digits.slice(1);
        }
        return digits;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.SmsGatewayService = SmsGatewayService;
exports.SmsGatewayService = SmsGatewayService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], SmsGatewayService);
//# sourceMappingURL=sms-gateway.service.js.map