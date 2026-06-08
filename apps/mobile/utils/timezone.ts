/** Europe/Zurich display and UTC storage helpers — single source for booking times. */

export const ZURICH_TZ = 'Europe/Zurich';

type ZurichParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getZurichParts(isoUtc: string): ZurichParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZURICH_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date(isoUtc));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
  };
}

export function formatZurichTimeFromUtc(isoUtc: string): string {
  const { hour, minute } = getZurichParts(isoUtc);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatZurichDateIsoFromUtc(isoUtc: string): string {
  const { year, month, day } = getZurichParts(isoUtc);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatZurichSwissDateFromUtc(isoUtc: string): string {
  const iso = formatZurichDateIsoFromUtc(isoUtc);
  const [, y, m, d] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) ?? [];
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

/** Convert a Zurich-local calendar date + HH:mm to UTC ISO string (DST-aware). */
export function zurichLocalDateTimeToUtc(isoDate: string, timeHHmm: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hour, minute] = timeHHmm.split(':').map(Number);

  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let i = 0; i < 4; i++) {
    const z = getZurichParts(new Date(utcMs).toISOString());
    const targetMin = hour * 60 + minute;
    const actualMin = z.hour * 60 + z.minute;
    const dayDelta = day - z.day;
    const diffMin = targetMin - actualMin + dayDelta * 24 * 60;
    if (diffMin === 0) break;
    utcMs -= diffMin * 60 * 1000;
  }

  return new Date(utcMs).toISOString();
}

export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function todayZurichIso(): string {
  return formatZurichDateIsoFromUtc(new Date().toISOString());
}
