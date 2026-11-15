import { koreanTranslator, type Translator } from '../../lib/locale'
import type { CalendarRange } from './calendar'
import {
  calendarDateKey,
  compareCalendarDates,
  isCalendarDateInRange,
  isValidCalendarDate,
  normalizeCalendarDate,
} from './calendar-utils'

export interface DateRangeIssue {
  kind: 'missing' | 'invalid' | 'order' | 'bounds'
  message: string
}

/** External reversed ranges stay reversed, so callers can see and correct invalid data. */
export function normalizeDateRange(value?: CalendarRange | null): CalendarRange {
  return {
    start: normalizeCalendarDate(value?.start) ?? null,
    end: normalizeCalendarDate(value?.end) ?? null,
  }
}

export function getDateRangeIssue(
  value: CalendarRange | null | undefined,
  options: { required?: boolean; minDate?: Date; maxDate?: Date } = {},
  t: Translator = koreanTranslator,
): DateRangeIssue | null {
  if (
    value &&
    ((value.start !== null && !isValidCalendarDate(value.start)) ||
      (value.end !== null && !isValidCalendarDate(value.end)))
  )
    return { kind: 'invalid', message: t('유효한 시작일과 종료일을 선택해 주세요.') }
  const { start, end } = normalizeDateRange(value)
  if (!start && !end)
    return options.required
      ? { kind: 'missing', message: t('시작일과 종료일을 선택해 주세요.') }
      : null
  const min = normalizeCalendarDate(options.minDate)
  const max = normalizeCalendarDate(options.maxDate)
  if (min && max && compareCalendarDates(min, max) > 0)
    return { kind: 'bounds', message: t('선택할 수 있는 날짜 범위가 없어요.') }
  if (
    (start && !isCalendarDateInRange(start, min, max)) ||
    (end && !isCalendarDateInRange(end, min, max))
  )
    return {
      kind: 'bounds',
      message: t('선택 가능한 날짜{start}{end} 안에서 선택해 주세요.', {
        start: min ? t(' · {date}부터', { date: calendarDateKey(min) ?? '' }) : '',
        end: max ? t(' · {date}까지', { date: calendarDateKey(max) ?? '' }) : '',
      }),
    }
  if (!start) return { kind: 'missing', message: t('시작일을 선택해 주세요.') }
  if (!end) return { kind: 'missing', message: t('종료일을 선택해 주세요.') }
  if (compareCalendarDates(start, end) > 0)
    return { kind: 'order', message: t('종료일은 시작일과 같거나 이후여야 합니다.') }
  return null
}

/** HTML date controls share the same date-only serialization as Calendar. */
export function getDateRangeFormValues(value?: CalendarRange | null) {
  const normalized = normalizeDateRange(value)
  return {
    start: calendarDateKey(normalized.start) ?? '',
    end: calendarDateKey(normalized.end) ?? '',
  }
}

export function dateRangeFieldNames(name?: string, startName?: string, endName?: string) {
  return {
    start: startName ?? (name ? `${name}.start` : undefined),
    end: endName ?? (name ? `${name}.end` : undefined),
  }
}

/** Encode ordering as native endpoint bounds too, before client effects run. */
export function getDateRangeNativeBounds(value: CalendarRange, minDate?: Date, maxDate?: Date) {
  const min = normalizeCalendarDate(minDate)
  const max = normalizeCalendarDate(maxDate)
  const { start, end } = normalizeDateRange(value)
  const startMax = end && (!max || compareCalendarDates(end, max) < 0) ? end : max
  const endMin = start && (!min || compareCalendarDates(start, min) > 0) ? start : min
  return {
    startMin: calendarDateKey(min),
    startMax: calendarDateKey(startMax),
    endMin: calendarDateKey(endMin),
    endMax: calendarDateKey(max),
  }
}
