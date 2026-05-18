const SWISS_DATE_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function parseSwissDateToIso(value: string): string | null {
  const match = SWISS_DATE_RE.exec(value.trim());
  if (!match) return null;

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);

  if (!isRealDate(year, month, day)) return null;

  return `${yearText}-${monthText}-${dayText}`;
}

export function isSwissDate(value: string): boolean {
  return parseSwissDateToIso(value) !== null;
}

export function formatSwissDate(isoDate: string): string {
  const match = ISO_DATE_RE.exec(isoDate.trim());
  if (!match) return isoDate;

  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}
