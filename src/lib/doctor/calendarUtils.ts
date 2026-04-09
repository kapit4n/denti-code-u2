/** Monday-start week (common for clinic scheduling). */
export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function weekDaysFrom(startMonday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startMonday, i));
}

export function formatWeekRangeLabel(startMonday: Date, endSunday: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const sameYear = startMonday.getFullYear() === endSunday.getFullYear();
  const startStr = startMonday.toLocaleDateString('en-US', sameYear ? opts : yOpts);
  const endStr = endSunday.toLocaleDateString('en-US', yOpts);
  return `${startStr} – ${endStr}`;
}

export function startOfMonth(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

export function formatMonthYearLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Monday-start weeks covering the full month (typically 5–6 rows × 7 days). */
export function monthCalendarGrid(anchorInMonth: Date): Date[] {
  const monthStart = startOfMonth(anchorInMonth);
  const year = monthStart.getFullYear();
  const monthIndex = monthStart.getMonth();
  const gridStart = startOfWeekMonday(monthStart);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  lastDayOfMonth.setHours(0, 0, 0, 0);
  const weekStartOfLast = startOfWeekMonday(lastDayOfMonth);
  const gridEndSunday = addDays(weekStartOfLast, 6);
  gridEndSunday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  let cur = new Date(gridStart);
  cur.setHours(0, 0, 0, 0);
  while (cur.getTime() <= gridEndSunday.getTime()) {
    days.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return days;
}
