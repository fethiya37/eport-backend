"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssociationId = void 0;
const common_1 = require("@nestjs/common");
exports.AssociationId = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return (req.user?.association_id ?? null);
});
//# sourceMappingURL=association-id.decorator.js.map