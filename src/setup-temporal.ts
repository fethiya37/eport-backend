import { Temporal as TemporalPolyfill } from '@js-temporal/polyfill';

if (!(globalThis as any).Temporal) {
  (globalThis as any).Temporal = TemporalPolyfill;
}
