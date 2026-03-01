/**
 * Returns the current local date as a YYYY-MM-DD string.
 * Uses the device's local timezone to determine "today".
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses a YYYY-MM-DD string into a local Date at midnight. */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns a YYYY-MM-DD string N days before the given date string. */
export function subtractDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() - n);
  return getLocalDateString(d);
}

/** Returns a YYYY-MM-DD string N days after the given date string. */
export function addDays(dateStr: string, n: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return getLocalDateString(d);
}

/** Returns 0 (Mon) through 6 (Sun) — ISO weekday. */
export function getDayOfWeek(dateStr: string): number {
  const jsDay = parseDate(dateStr).getDay(); // 0=Sun … 6=Sat
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Returns an array of YYYY-MM-DD strings from startDate to endDate inclusive. */
export function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const end = parseDate(endDate);
  const cur = parseDate(startDate);
  while (cur <= end) {
    dates.push(getLocalDateString(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}
