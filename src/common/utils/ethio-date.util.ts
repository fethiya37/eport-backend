import { toEthiopian } from 'ethiopian-date'; 

export function gcToEthiopian(date: Date): string {
  if (!date) return '';
  const [year, month, day] = toEthiopian(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
  return `${year}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;
}
