// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
/** Date-only helpers use local calendar fields, never ISO/UTC serialization. */
export function isValidCalendarDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

export function createCalendarDate(year: number, month: number, day: number): Date {
  const date = new Date(0)
  // Noon avoids daylight-saving jumps while changing the calendar fields.
  date.setHours(12, 0, 0, 0)
  date.setFullYear(year, month, day)
  date.setHours(0, 0, 0, 0)
  return date
}

export function normalizeCalendarDate(value: Date | null | undefined): Date | undefined {
  return isValidCalendarDate(value)
    ? createCalendarDate(value.getFullYear(), value.getMonth(), value.getDate())
    : undefined
}

export function compareCalendarDates(left: Date, right: Date): number {
  if (!isValidCalendarDate(left) || !isValidCalendarDate(right)) return Number.NaN
  return Math.sign(left.getFullYear() - right.getFullYear())
    || Math.sign(left.getMonth() - right.getMonth())
    || Math.sign(left.getDate() - right.getDate())
}

export function calendarDateKey(value: Date | null | undefined): string | undefined {
  if (!isValidCalendarDate(value)) return undefined
  const year = value.getFullYear()
  const yearLabel = year < 0 ? `-${String(Math.abs(year)).padStart(4, '0')}` : String(year).padStart(4, '0')
  return `${yearLabel}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

export function startOfCalendarMonth(date: Date): Date {
  return createCalendarDate(date.getFullYear(), date.getMonth(), 1)
}

export function endOfCalendarMonth(date: Date): Date {
  return createCalendarDate(date.getFullYear(), date.getMonth() + 1, 0)
}

export function addCalendarDays(date: Date, amount: number): Date {
  return createCalendarDate(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

export function addCalendarMonths(date: Date, amount: number): Date {
  const month = createCalendarDate(date.getFullYear(), date.getMonth() + amount, 1)
  return createCalendarDate(month.getFullYear(), month.getMonth(), Math.min(date.getDate(), endOfCalendarMonth(month).getDate()))
}

export function isCalendarDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (!isValidCalendarDate(date)) return false
  const min = normalizeCalendarDate(minDate)
  const max = normalizeCalendarDate(maxDate)
  return (!min || compareCalendarDates(date, min) >= 0) && (!max || compareCalendarDates(date, max) <= 0)
}

/** Reversed bounds deliberately produce no selectable date. */
export function clampCalendarDate(date: Date, minDate?: Date, maxDate?: Date): Date | undefined {
  const normalized = normalizeCalendarDate(date)
  if (!normalized) return undefined
  const min = normalizeCalendarDate(minDate)
  const max = normalizeCalendarDate(maxDate)
  if (min && max && compareCalendarDates(min, max) > 0) return undefined
  if (min && compareCalendarDates(normalized, min) < 0) return min
  if (max && compareCalendarDates(normalized, max) > 0) return max
  return normalized
}

export function calendarMonthHasAvailableDate(month: Date, minDate?: Date, maxDate?: Date): boolean {
  const min = normalizeCalendarDate(minDate)
  const max = normalizeCalendarDate(maxDate)
  return isValidCalendarDate(month)
    && !(min && max && compareCalendarDates(min, max) > 0)
    && (!min || compareCalendarDates(endOfCalendarMonth(month), min) >= 0)
    && (!max || compareCalendarDates(startOfCalendarMonth(month), max) <= 0)
}

/** Index within the displayed week; also shared by Home/End keyboard navigation. */
export function calendarWeekdayIndex(date: Date, weekStartsOn: 0 | 1 = 0): number {
  return (date.getDay() - weekStartsOn + 7) % 7
}

/** Complete calendar weeks, optionally trimmed to the four-to-six rows needed by a month. */
export function getCalendarMonthDays(month: Date, weekStartsOn: 0 | 1 = 0, fixedWeeks = true): Date[] {
  if (!isValidCalendarDate(month)) return []
  const first = startOfCalendarMonth(month)
  const leadingDays = calendarWeekdayIndex(first, weekStartsOn)
  const start = addCalendarDays(first, -leadingDays)
  const length = fixedWeeks ? 42 : Math.ceil((leadingDays + endOfCalendarMonth(month).getDate()) / 7) * 7
  return Array.from({ length }, (_, index) => addCalendarDays(start, index))
}

export function resolveCalendarLocale(locale = 'ko-KR'): string {
  try {
    return new Intl.DateTimeFormat(locale).resolvedOptions().locale
  } catch {
    return 'ko-KR'
  }
}

export type CalendarRange = { start: Date | null; end: Date | null }

/** Partial ranges begin at start; completed ranges are sorted and copied. */
export function normalizeCalendarRange(value: CalendarRange | null | undefined): CalendarRange {
  const start = normalizeCalendarDate(value?.start) ?? null
  const end = normalizeCalendarDate(value?.end) ?? null
  if (!start) return { start: end, end: null }
  return end && compareCalendarDates(end, start) < 0 ? { start: end, end: start } : { start, end }
}

export function selectCalendarRangeDate(value: CalendarRange, date: Date): CalendarRange {
  const current = normalizeCalendarRange(value)
  const selected = normalizeCalendarDate(date)
  if (!selected) return current
  return !current.start || current.end ? { start: selected, end: null } : normalizeCalendarRange({ start: current.start, end: selected })
}

/** The interactive calendar has a finite, browser-form-compatible year domain. */
export function supportedCalendarBounds(minDate?: Date, maxDate?: Date) {
  const first = createCalendarDate(1, 0, 1)
  const last = createCalendarDate(9999, 11, 31)
  const min = normalizeCalendarDate(minDate)
  const max = normalizeCalendarDate(maxDate)
  return { minDate: min && compareCalendarDates(min, first) > 0 ? min : first, maxDate: max && compareCalendarDates(max, last) < 0 ? max : last }
}

export function calendarYearHasAvailableDate(year: number, minDate?: Date, maxDate?: Date): boolean {
  if (!Number.isInteger(year) || year < 1 || year > 9999) return false
  const bounds = supportedCalendarBounds(minDate, maxDate)
  return compareCalendarDates(bounds.minDate, bounds.maxDate) <= 0
    && compareCalendarDates(createCalendarDate(year, 11, 31), bounds.minDate) >= 0
    && compareCalendarDates(createCalendarDate(year, 0, 1), bounds.maxDate) <= 0
}

export function calendarYearPageStart(year: number): number {
  const bounded = Number.isFinite(year) ? Math.min(9999, Math.max(1, Math.floor(year))) : 1
  return Math.floor((bounded - 1) / 12) * 12 + 1
}

export function getCalendarYearPage(year: number): number[] {
  const first = calendarYearPageStart(year)
  return Array.from({ length: Math.min(12, 10000 - first) }, (_, index) => first + index)
}
