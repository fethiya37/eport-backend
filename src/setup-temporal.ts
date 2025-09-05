// src/setup-temporal.ts
import { Temporal as TemporalPolyfill } from '@js-temporal/polyfill';

// If runtime doesn't have Temporal, set the polyfill on global
if (!(globalThis as any).Temporal) {
  (globalThis as any).Temporal = TemporalPolyfill;
}
