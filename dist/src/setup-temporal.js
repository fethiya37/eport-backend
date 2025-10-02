"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const polyfill_1 = require("@js-temporal/polyfill");
if (!globalThis.Temporal) {
    globalThis.Temporal = polyfill_1.Temporal;
}
//# sourceMappingURL=setup-temporal.js.map