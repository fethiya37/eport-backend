"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUser = void 0;
const common_1 = require("@nestjs/common");
exports.AuthUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user)
        return null;
    return data ? user[data] : user;
});
//# sourceMappingURL=auth-user.decorator.js.map