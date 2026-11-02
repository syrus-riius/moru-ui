import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  addCalendarDays, addCalendarMonths, calendarDateKey, calendarMonthHasAvailableDate,
  clampCalendarDate, compareCalendarDates, createCalendarDate, endOfCalendarMonth,
  getCalendarMonthDays, isCalendarDateInRange, isValidCalendarDate, normalizeCalendarDate,
  resolveCalendarLocale, startOfCalendarMonth,
} from './calendar-utils'
import { Calendar } from './calendar'
import { DatePicker } from './date-picker'
import { Field } from './field'

const date = (year: number, month: number, day: number) => createCalendarDate(year, month - 1, day)
const key = calendarDateKey

function attribute(tag: string | undefined, name: string): string | undefined {
  if (!tag) return undefined
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = tag.match(new RegExp(`(?:^|\\s)${escaped}(?:="([^"]*)")?(?=\\s|/?>|$)`))
  return match ? match[1] ?? '' : undefined
}

function buttons(markup: string) {
  return markup.match(/<button\b[^>]*>/g) ?? []
}

afterEach(() => vi.unstubAllEnvs())

describe('Calendar local date arithmetic', () => {
  it('normalizes local time without changing the calendar day or mutating the original', () => {
    const original = new Date(2026, 9, 24, 23, 59, 43, 123)
    const normalized = normalizeCalendarDate(original)!
    expect(key(normalized)).toBe('2026-10-24')
    expect(normalized.getHours()).toBe(0)
    expect(normalized.getMilliseconds()).toBe(0)
    expect(original.getHours()).toBe(23)
    expect(normalized).not.toBe(original)
  })

  it('keeps years below 100 intact instead of adding 1900', () => {
    expect(key(date(24, 2, 29))).toBe('0024-02-29')
    expect(key(date(0, 1, 1))).toBe('0000-01-01')
  })

  it.each([
    [2024, '2024-02-29'], [2025, '2025-02-28'], [1900, '1900-02-28'], [2000, '2000-02-29'],
  ])('uses the Gregorian leap-year rule for %s', (year, expected) => {
    expect(key(endOfCalendarMonth(date(year as number, 2, 1)))).toBe(expected)
  })

  it('rolls days across month and year boundaries', () => {
    expect(key(addCalendarDays(date(2026, 12, 31), 1))).toBe('2027-01-01')
    expect(key(addCalendarDays(date(2026, 1, 1), -1))).toBe('2025-12-31')
    expect(key(addCalendarDays(date(2024, 2, 28), 1))).toBe('2024-02-29')
  })

  it('clamps month and year movement to the last valid day', () => {
    expect(key(addCalendarMonths(date(2026, 1, 31), 1))).toBe('2026-02-28')
    expect(key(addCalendarMonths(date(2024, 2, 29), 12))).toBe('2025-02-28')
    expect(key(addCalendarMonths(date(2026, 12, 31), 2))).toBe('2027-02-28')
    expect(key(addCalendarMonths(date(2026, 1, 31), -2))).toBe('2025-11-30')
  })

  it('compares calendar fields, ignoring the time of day', () => {
    expect(compareCalendarDates(new Date(2026, 9, 24, 1), new Date(2026, 9, 24, 23))).toBe(0)
    expect(compareCalendarDates(date(2025, 12, 31), date(2026, 1, 1))).toBe(-1)
    expect(compareCalendarDates(date(2026, 2, 1), date(2026, 1, 31))).toBe(1)
  })

  it.each(['Asia/Seoul', 'America/Los_Angeles', 'Pacific/Auckland'])('serializes the local day in %s', (zone) => {
    vi.stubEnv('TZ', zone)
    const local = new Date(2026, 9, 24, 0, 15)
    expect(key(local)).toBe('2026-10-24')
    expect(key(normalizeCalendarDate(local))).toBe('2026-10-24')
  })

  it('moves by calendar day across spring and autumn daylight-saving boundaries', () => {
    vi.stubEnv('TZ', 'America/New_York')
    const spring = date(2026, 3, 8)
    const springNext = addCalendarDays(spring, 1)
    const autumn = date(2026, 11, 1)
    const autumnNext = addCalendarDays(autumn, 1)
    expect(key(springNext)).toBe('2026-03-09')
    expect(key(autumnNext)).toBe('2026-11-02')
    expect(springNext.getHours()).toBe(0)
    expect(autumnNext.getHours()).toBe(0)
    expect(springNext.getTime() - spring.getTime()).toBe(23 * 60 * 60 * 1000)
    expect(autumnNext.getTime() - autumn.getTime()).toBe(25 * 60 * 60 * 1000)
    expect(compareCalendarDates(springNext, spring)).toBe(1)
  })

  it('guards invalid dates and locales without rendering Invalid Date', () => {
    expect(isValidCalendarDate(new Date('invalid'))).toBe(false)
    expect(isValidCalendarDate('2026-10-24')).toBe(false)
    expect(normalizeCalendarDate(new Date('invalid'))).toBeUndefined()
    expect(key(new Date('invalid'))).toBeUndefined()
    expect(clampCalendarDate(new Date('invalid'))).toBeUndefined()
    expect(isCalendarDateInRange(new Date('invalid'))).toBe(false)
    expect(Number.isNaN(compareCalendarDates(new Date('invalid'), date(2026, 1, 1)))).toBe(true)
    expect(getCalendarMonthDays(new Date('invalid'))).toEqual([])
    expect(resolveCalendarLocale('not_a_locale')).toBe('ko-KR')
  })
})

describe('Calendar bounds and month layout', () => {
  const min = date(2026, 10, 10)
  const max = date(2026, 10, 20)

  it('includes both bounds and clamps to their local date', () => {
    expect(isCalendarDateInRange(min, min, max)).toBe(true)
    expect(isCalendarDateInRange(max, min, max)).toBe(true)
    expect(isCalendarDateInRange(date(2026, 10, 9), min, max)).toBe(false)
    expect(isCalendarDateInRange(date(2026, 10, 21), min, max)).toBe(false)
    expect(key(clampCalendarDate(date(2026, 9, 30), min, max))).toBe('2026-10-10')
    expect(key(clampCalendarDate(date(2026, 11, 1), min, max))).toBe('2026-10-20')
  })

  it('treats reversed bounds as an empty selection range', () => {
    expect(clampCalendarDate(date(2026, 10, 15), max, min)).toBeUndefined()
    expect(calendarMonthHasAvailableDate(min, max, min)).toBe(false)
    expect(isCalendarDateInRange(date(2026, 10, 15), max, min)).toBe(false)
  })

  it('ignores invalid optional bounds', () => {
    expect(isCalendarDateInRange(min, new Date('invalid'), new Date('invalid'))).toBe(true)
    expect(key(clampCalendarDate(min, new Date('invalid')))).toBe('2026-10-10')
  })

  it('only enables navigation to a month intersecting the range', () => {
    expect(calendarMonthHasAvailableDate(date(2026, 9, 1), min, max)).toBe(false)
    expect(calendarMonthHasAvailableDate(date(2026, 10, 1), min, max)).toBe(true)
    expect(calendarMonthHasAvailableDate(date(2026, 11, 1), min, max)).toBe(false)
    expect(calendarMonthHasAvailableDate(date(2026, 10, 1), undefined, date(2026, 10, 1))).toBe(true)
  })

  it.each([date(2026, 2, 1), date(2026, 8, 1), date(2024, 2, 1), date(2026, 12, 1)])('produces six complete Sunday-first weeks for %s', (month) => {
    const days = getCalendarMonthDays(month)
    expect(days).toHaveLength(42)
    expect(days[0].getDay()).toBe(0)
    expect(days[41].getDay()).toBe(6)
    expect(new Set(days.map(key)).size).toBe(42)
    expect(days.some((day) => key(day) === key(startOfCalendarMonth(month)))).toBe(true)
    expect(days.some((day) => key(day) === key(endOfCalendarMonth(month)))).toBe(true)
  })
})

describe('Calendar and DatePicker server-rendered accessibility', () => {
  it('renders one grid, 42 date cells, a selected day, and one roving tab stop', () => {
    const markup = renderToStaticMarkup(createElement(Calendar, { defaultValue: date(2026, 10, 24) }))
    expect(markup.match(/role="grid"/g)).toHaveLength(1)
    expect(markup.match(/role="gridcell"/g)).toHaveLength(42)
    expect(markup.match(/role="columnheader"/g)).toHaveLength(7)
    expect(markup.match(/aria-selected="true"/g)).toHaveLength(1)
    expect(buttons(markup).filter((tag) => attribute(tag, 'tabindex') === '0')).toHaveLength(1)
    expect(buttons(markup).find((tag) => attribute(tag, 'data-date') === '2026-10-24')).toContain('data-selected="true"')
    expect(markup).toContain('2026년 10월 24일 토요일')
    expect(markup).toContain('방향키로 이동')
    expect(markup).toMatch(/data-date="2026-10-24"[^>]*>[\s\S]*?class="ui-calendar-day-number">24<\/span>/)
  })

  it('does not expose selectable dates or enabled navigation when disabled', () => {
    const markup = renderToStaticMarkup(createElement(Calendar, { defaultValue: date(2026, 10, 24), disabled: true }))
    expect(buttons(markup)).toHaveLength(46)
    expect(buttons(markup).every((tag) => attribute(tag, 'disabled') !== undefined)).toBe(true)
    expect(buttons(markup).every((tag) => attribute(tag, 'tabindex') !== '0')).toBe(true)
  })

  it('keeps bound dates enabled and previous/next month controls disabled for a one-month range', () => {
    const markup = renderToStaticMarkup(createElement(Calendar, { defaultValue: date(2026, 10, 24), minDate: date(2026, 10, 10), maxDate: date(2026, 10, 20) }))
    const tags = buttons(markup)
    expect(attribute(tags.find((tag) => attribute(tag, 'aria-label') === '이전 달'), 'disabled')).toBeDefined()
    expect(attribute(tags.find((tag) => attribute(tag, 'aria-label') === '다음 달'), 'disabled')).toBeDefined()
    expect(tags.filter((tag) => attribute(tag, 'data-date') && attribute(tag, 'disabled') === undefined)).toHaveLength(11)
    expect(attribute(tags.find((tag) => attribute(tag, 'tabindex') === '0')!, 'data-date')).toBe('2026-10-20')
  })

  it('handles invalid values and locales with a usable fallback', () => {
    const markup = renderToStaticMarkup(createElement(Calendar, { value: new Date('invalid'), minDate: new Date('invalid'), locale: 'bad_locale' }))
    expect(markup).not.toContain('Invalid Date')
    expect(markup.match(/aria-selected="true"/g) ?? []).toHaveLength(0)
    expect(buttons(markup).filter((tag) => attribute(tag, 'tabindex') === '0')).toHaveLength(1)
  })

  it('renders a standalone DatePicker label tied to its trigger', () => {
    const markup = renderToStaticMarkup(createElement(DatePicker, { label: '마감일', defaultValue: date(2026, 10, 24) }))
    const label = markup.match(/<label\b[^>]*>/)![0]
    const trigger = buttons(markup)[0]
    expect(attribute(label, 'for')).toBe(attribute(trigger, 'id'))
    expect(markup).toContain('2026년 10월 24일')
    expect(attribute(trigger, 'aria-haspopup')).toBe('dialog')
    expect(attribute(trigger, 'aria-expanded')).toBe('false')
  })

  it('uses one Field label, merges descriptions/errors, and describes the selected value', () => {
    const markup = renderToStaticMarkup(createElement(Field, {
      label: '출시일', description: '팀의 일정을 선택합니다.', error: '날짜를 확인해주세요.',
      children: createElement(DatePicker, { label: '중복 라벨', defaultValue: date(2026, 10, 24), 'aria-describedby': 'custom-description' }),
    }))
    const labels = markup.match(/<label\b[^>]*>/g) ?? []
    const trigger = buttons(markup)[0]
    const descriptionIds = attribute(trigger, 'aria-describedby')?.split(' ') ?? []
    expect(labels).toHaveLength(1)
    expect(markup).not.toContain('중복 라벨')
    expect(attribute(labels[0], 'for')).toBe(attribute(trigger, 'id'))
    expect(attribute(trigger, 'aria-invalid')).toBe('true')
    expect(descriptionIds).toHaveLength(4)
    expect(descriptionIds[0]).toBe('custom-description')
    expect(markup).toContain(`id="${descriptionIds[3]}"`)
  })
})
