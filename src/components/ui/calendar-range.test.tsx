import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { Calendar } from './calendar'
import { calendarDateKey, calendarYearHasAvailableDate, createCalendarDate, getCalendarYearPage, normalizeCalendarRange, selectCalendarRangeDate, supportedCalendarBounds } from './calendar-utils'

const date = (year: number, month: number, day: number) => createCalendarDate(year, month - 1, day)
const keys = (range: ReturnType<typeof normalizeCalendarRange>) => [calendarDateKey(range.start) ?? null, calendarDateKey(range.end) ?? null]
afterEach(() => vi.unstubAllEnvs())

describe('date range selection', () => {
  it('starts, finishes and restarts a range without mutating caller dates', () => {
    const original = date(2026, 10, 10)
    const first = selectCalendarRangeDate({ start: null, end: null }, original)
    expect(keys(first)).toEqual(['2026-10-10', null])
    expect(first.start).not.toBe(original)
    const complete = selectCalendarRangeDate(first, date(2026, 10, 14))
    expect(keys(complete)).toEqual(['2026-10-10', '2026-10-14'])
    expect(keys(first)).toEqual(['2026-10-10', null])
    expect(keys(selectCalendarRangeDate(complete, date(2026, 11, 2)))).toEqual(['2026-11-02', null])
  })
  it('sorts a reverse selection, including month and year boundaries', () => {
    expect(keys(selectCalendarRangeDate({ start: date(2027, 1, 4), end: null }, date(2026, 12, 28)))).toEqual(['2026-12-28', '2027-01-04'])
  })
  it('allows an intentional same-day date range', () => {
    expect(keys(selectCalendarRangeDate({ start: date(2026, 10, 10), end: null }, date(2026, 10, 10)))).toEqual(['2026-10-10', '2026-10-10'])
  })
  it('repairs malformed partial values and ignores an invalid click', () => {
    expect(keys(normalizeCalendarRange({ start: null, end: date(2026, 2, 3) }))).toEqual(['2026-02-03', null])
    expect(keys(normalizeCalendarRange({ start: new Date(NaN), end: new Date(NaN) }))).toEqual([null, null])
    expect(keys(selectCalendarRangeDate({ start: date(2026, 10, 10), end: null }, new Date(NaN)))).toEqual(['2026-10-10', null])
  })
  it.each(['Asia/Seoul', 'America/New_York', 'Pacific/Auckland'])('preserves range calendar fields in %s', (zone) => {
    vi.stubEnv('TZ', zone)
    expect(keys(normalizeCalendarRange({ start: new Date(2026, 2, 8, 23, 59), end: new Date(2026, 2, 9, 1) }))).toEqual(['2026-03-08', '2026-03-09'])
  })
})

describe('finite month/year navigation bounds', () => {
  it('limits interactive years while keeping invalid or reversed consumer bounds empty', () => {
    const supported = supportedCalendarBounds(date(-5, 1, 1), date(10003, 1, 1))
    expect(calendarDateKey(supported.minDate)).toBe('0001-01-01')
    expect(calendarDateKey(supported.maxDate)).toBe('9999-12-31')
    expect(calendarYearHasAvailableDate(2026, date(2027, 1, 1), date(2026, 1, 1))).toBe(false)
    expect(calendarYearHasAvailableDate(1, undefined, date(0, 12, 31))).toBe(false)
    expect(calendarYearHasAvailableDate(9999, date(10000, 1, 1))).toBe(false)
  })
  it('returns only short, supported year pages at both extremes', () => {
    expect(getCalendarYearPage(1)).toEqual(Array.from({ length: 12 }, (_, index) => index + 1))
    expect(getCalendarYearPage(9999)).toEqual([9997, 9998, 9999])
    for (const value of [-20, 0, NaN, 100000]) {
      const years = getCalendarYearPage(value)
      expect(years.length).toBeLessThanOrEqual(12)
      expect(years.every((year) => year >= 1 && year <= 9999)).toBe(true)
    }
  })
  it('allows only years intersecting a valid date window', () => {
    const min = date(2026, 10, 10), max = date(2027, 2, 3)
    expect([2025, 2026, 2027, 2028].map((year) => calendarYearHasAvailableDate(year, min, max))).toEqual([false, true, true, false])
    expect(calendarYearHasAvailableDate(0)).toBe(false)
    expect(calendarYearHasAvailableDate(10000)).toBe(false)
  })
})

describe('range calendar semantics', () => {
  it('marks all included cells, exposes edges and retains a single day tab stop', () => {
    const html = renderToStaticMarkup(<Calendar mode="range" defaultValue={{ start: date(2026, 11, 2), end: date(2026, 11, 6) }} />)
    expect(html).toContain('aria-multiselectable="true"')
    expect(html.match(/aria-selected="true"/g)).toHaveLength(5)
    expect(html.match(/data-range-edge="true"/g)).toHaveLength(2)
    expect(html.match(/tabindex="0"/g)).toHaveLength(1)
    expect(html).toContain('2026년 11월 2일 월요일부터 2026년 11월 6일 금요일까지')
  })
  it('keeps a cross-month range anchored at the end while marking its visible portion', () => {
    const html = renderToStaticMarkup(<Calendar mode="range" defaultValue={{ start: date(2026, 10, 30), end: date(2026, 11, 3) }} />)
    expect(html.match(/aria-selected="true"/g)).toHaveLength(3)
    expect(html).toContain('2026년 10월 30일 금요일부터 2026년 11월 3일 화요일까지')
    expect(html).toMatch(/data-date="2026-11-03"[^>]*tabindex="0"/)
  })
  it('announces a pending end date without treating hover preview as submitted selection', () => {
    const html = renderToStaticMarkup(<Calendar mode="range" value={{ start: date(2026, 10, 30), end: null }} />)
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1)
    expect(html).toContain('종료일을 선택하세요.')
    expect(html).not.toContain('data-range-preview="true"')
  })
  it('offers separately named year and month heading controls', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 10, 27)} />)
    expect(html).toContain('aria-label="연도 선택 · 2026년"')
    expect(html).toContain('aria-label="월 선택 · 10월"')
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2)
    expect(html).toContain('상단 년·월로 빠르게 이동')
  })
  it('disables adjacent-year dates outside the supported browser domain', () => {
    const html = renderToStaticMarkup(<Calendar value={date(1, 1, 1)} />)
    expect(html).toMatch(/data-date="0000-12-31"[^>]*disabled=""/)
    expect(html.match(/tabindex="0"/g)).toHaveLength(1)
  })
})
