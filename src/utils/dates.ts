import { startOfWeek, addDays, format } from "date-fns";
import { enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

export function getStartOfWeek(date: Date, startOfWeekNum: number, locale: Locale = enUS) {
  return startOfWeek(date, {
    weekStartsOn: startOfWeekNum as 0 | 1 | 2 | 3 | 4 | 5 | 6, // ✅ type cast fixes TS2322
    locale
  });
}

export function getWeekDates(date: Date, startOfWeekNum: number) {
  const start = getStartOfWeek(date, startOfWeekNum);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDate(date: Date, fmt: string) {
  return format(date, fmt);
}
