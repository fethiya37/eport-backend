"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChapaApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let ChapaApiService = class ChapaApiService {
    base = 'https://api.chapa.co/v1';
    get headers() {
        const key = process.env.CHAPA_SECRET;
        return { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
    }
    async listBanks(country = 'ET') {
        try {
            const { data } = await axios_1.default.get(`${this.base}/banks`, {
                headers: this.headers,
                params: { country },
            });
            return data;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e?.response?.data ?? 'chapa banks failed');
        }
    }
    async createSubaccount(input) {
        try {
            const { data } = await axios_1.default.post(`${this.base}/subaccount`, input, { headers: this.headers });
            return data;
        }
        catch (e) {
            throw new common_1.InternalServerErrorException(e?.response?.data ?? 'chapa subaccount create failed');
        }
    }
};
exports.ChapaApiService = ChapaApiService;
exports.ChapaApiService = ChapaApiService = __decorate([
    (0, common_1.Injectable)()
], ChapaApiService);
//# sourceMappingURL=chapa-api.service.js.map