import { BadRequestException } from '@nestjs/common';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Parse 'YYYY-MM-DD' or ISO. Expands to whole-day bounds, inclusive. */
export function parseDateParam(input: string | undefined, bound: 'from' | 'to'): Date | undefined {
  if (!input) return undefined;

  if (DATE_ONLY.test(input)) {
    // Interpret as local Addis day (+03:00), inclusive
    const suffix = bound === 'from' ? 'T00:00:00.000+03:00' : 'T23:59:59.999+03:00';
    const d = new Date(`${input}${suffix}`);
    if (isNaN(d.getTime())) throw new BadRequestException(`Invalid ${bound} date: ${input}`);
    return d;
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) throw new BadRequestException(`Invalid date: ${input}`);
  return d;
}
