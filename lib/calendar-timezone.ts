/** YYYY-MM-DD calendar date in IANA time zone for this instant. */
export function getDateKeyInTimeZone(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) {
    throw new Error("Could not format date in time zone");
  }
  return `${y}-${m}-${d}`;
}

const WEEKDAY_TO_OFFSET_FROM_MONDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Monday = 0 … Sunday = 6 in `timeZone` for this instant. */
export function weekdayIndexMondayFirst(instant: Date, timeZone: string): number {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(instant);
  const idx = WEEKDAY_TO_OFFSET_FROM_MONDAY[short];
  if (idx === undefined) {
    throw new Error(`Unexpected weekday: ${short}`);
  }
  return idx;
}

/** Pure Gregorian calendar add (wall date, not UTC midnight). */
export function addCalendarDaysToDateKey(
  dateKey: string,
  deltaDays: number,
): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  const y2 = dt.getUTCFullYear();
  const m2 = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d2 = String(dt.getUTCDate()).padStart(2, "0");
  return `${y2}-${m2}-${d2}`;
}

export function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
