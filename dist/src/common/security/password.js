"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertStrongPassword = assertStrongPassword;
exports.generateStrongPassword = generateStrongPassword;
const common_1 = require("@nestjs/common");
const COMMON_PASSWORDS = new Set([
    '12345678',
    '123456789',
    'password',
    'password123',
    'qwerty123',
    'admin123',
    'letmein',
    'iloveyou',
    'welcome123',
    'passw0rd',
]);
function assertStrongPassword(password, phone) {
    const p = password ?? '';
    if (p.length < 8)
        throw new common_1.BadRequestException('Password must be at least 8 characters');
    if (p.length > 64)
        throw new common_1.BadRequestException('Password must be at most 64 characters');
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSymbol = /[^A-Za-z0-9]/.test(p);
    if (!hasLower)
        throw new common_1.BadRequestException('Password must include lowercase letter');
    if (!hasUpper)
        throw new common_1.BadRequestException('Password must include uppercase letter');
    if (!hasNumber)
        throw new common_1.BadRequestException('Password must include number');
    if (!hasSymbol)
        throw new common_1.BadRequestException('Password must include symbol');
    const normalized = p.toLowerCase();
    if (COMMON_PASSWORDS.has(normalized)) {
        throw new common_1.BadRequestException('Password is too common');
    }
}
function generateStrongPassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '23456789';
    const symbols = '!@#$';
    let password = '';
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    const all = lowercase + uppercase + numbers + symbols;
    for (let i = password.length; i < 10; i++) {
        password += all.charAt(Math.floor(Math.random() * all.length));
    }
    password = password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    return password;
}
//# sourceMappingURL=password.js.map