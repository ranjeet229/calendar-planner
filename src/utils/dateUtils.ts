import {
  addDays,
  compareAsc,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isWithinInterval,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export const WEEK_STARTS_ON = 1 as const;

export function getCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: WEEK_STARTS_ON });
  const days: Date[] = [];
  let cursor = start;
  while (compareAsc(cursor, end) <= 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function normalizeRange(
  a: Date,
  b: Date,
): { start: Date; end: Date } {
  return compareAsc(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

export function isDateInClosedRange(
  day: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;
  const { start: lo, end: hi } = normalizeRange(start, end);
  return isWithinInterval(day, { start: lo, end: hi });
}

export function isRangeStartOrEnd(
  day: Date,
  start: Date | null,
  end: Date | null,
): { isStart: boolean; isEnd: boolean } {
  if (!start) return { isStart: false, isEnd: false };
  const isStart = isSameDay(day, start);
  if (!end) return { isStart, isEnd: false };
  const isEnd = isSameDay(day, end);
  return { isStart, isEnd };
}

export function monthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function toDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function fromDateKey(s: string): Date {
  return parse(s, "yyyy-MM-dd", new Date());
}

export function rangeStorageKey(start: Date, end: Date): string {
  const { start: lo, end: hi } = normalizeRange(start, end);
  return `${toDateKey(lo)}|${toDateKey(hi)}`;
}

/** Static mock holidays (YYYY-MM-DD → label) for demo */
const HOLIDAYS: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-01-19": "MLK Day",
  "2026-02-16": "Presidents' Day",
  "2026-05-25": "Memorial Day",
  "2026-07-04": "Independence Day",
  "2026-09-07": "Labor Day",
  "2026-11-26": "Thanksgiving",
  "2026-12-25": "Christmas",
};

export function getHolidayLabel(date: Date): string | null {
  return HOLIDAYS[format(date, "yyyy-MM-dd")] ?? null;
}
