"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertStrongPassword = assertStrongPassword;
exports.generateStrongPassword = generateStrongPassword;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const COMMON_PASSWORDS = new Set([
    '12345678',
    '123456789',
    'password',
    'password123',
    'qwerty123',
    'admin123',
    'letmein',
    'iloveyou',
]);
function assertStrongPassword(password, phone) {
    const p = password ?? '';
    if (p.length < 12)
        throw new common_1.BadRequestException('Password must be at least 12 characters');
    if (p.length > 128)
        throw new common_1.BadRequestException('Password must be at most 128 characters');
    const lower = /[a-z]/.test(p);
    const upper = /[A-Z]/.test(p);
    const digit = /[0-9]/.test(p);
    const symbol = /[^A-Za-z0-9]/.test(p);
    if (!(lower && upper && digit && symbol)) {
        throw new common_1.BadRequestException('Password must include uppercase, lowercase, number, and symbol');
    }
    const normalized = p.trim().toLowerCase();
    if (COMMON_PASSWORDS.has(normalized)) {
        throw new common_1.BadRequestException('Password is too common');
    }
    if (phone) {
        const ph = String(phone).trim();
        if (p === ph)
            throw new common_1.BadRequestException('Password must not equal phone number');
        if (ph.length >= 6 && p.includes(ph.slice(-6))) {
            throw new common_1.BadRequestException('Password must not contain last digits of phone number');
        }
    }
}
function generateStrongPassword() {
    const a = (0, crypto_1.randomBytes)(6).toString('base64url');
    const b = (0, crypto_1.randomBytes)(6).toString('base64url');
    return `Ep@${a}${b}9A!`;
}
//# sourceMappingURL=password.js.map