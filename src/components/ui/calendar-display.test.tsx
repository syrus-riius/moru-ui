import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Calendar, type CalendarDayData } from './calendar'
import { addCalendarDays, calendarDateKey, calendarWeekdayIndex, createCalendarDate, getCalendarMonthDays } from './calendar-utils'

const date = (year: number, month: number, day: number) => createCalendarDate(year, month - 1, day)
const dayMarkup = (html: string, key: string) => html.match(new RegExp(`<button[^>]*data-date="${key}"[^>]*>[\\s\\S]*?<\\/button>`))?.[0] ?? ''
const count = (html: string, expression: RegExp) => (html.match(expression) ?? []).length

describe('calendar week layout', () => {
  it.each([
    [2026, 2, 0, 28, '2026-02-01', '2026-02-28'],
    [2021, 2, 1, 28, '2021-02-01', '2021-02-28'],
    [2026, 3, 0, 35, '2026-03-01', '2026-04-04'],
    [2026, 3, 1, 42, '2026-02-23', '2026-04-05'],
    [2024, 2, 1, 35, '2024-01-29', '2024-03-03'],
  ] as const)('fits %s-%s into complete weeks starting on %s', (year, month, weekStartsOn, length, first, last) => {
    const days = getCalendarMonthDays(date(year, month, 15), weekStartsOn, false)
    expect(days).toHaveLength(length)
    expect(calendarDateKey(days[0])).toBe(first)
    expect(calendarDateKey(days.at(-1))).toBe(last)
    expect(new Set(days.map(calendarDateKey)).size).toBe(length)
  })

  it('keeps the six-week default and uses the same week index for Home and End', () => {
    expect(getCalendarMonthDays(date(2026, 2, 1))).toHaveLength(42)
    expect(getCalendarMonthDays(date(2026, 2, 1), 1)).toHaveLength(42)
    const sunday = date(2027, 1, 3)
    const index = calendarWeekdayIndex(sunday, 1)
    expect(index).toBe(6)
    expect(calendarDateKey(addCalendarDays(sunday, -index))).toBe('2026-12-28')
    expect(calendarDateKey(addCalendarDays(sunday, 6 - index))).toBe('2027-01-03')
    expect(calendarWeekdayIndex(sunday, 0)).toBe(0)
  })
})

describe('calendar display semantics', () => {
  it('preserves the original defaults and one roving day stop', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 10, 24)} />)
    expect(html).toContain('data-variant="default" data-size="sm" data-day-shape="rounded" data-week-start="0"')
    expect(count(html, /role="gridcell"/g)).toBe(42)
    expect(count(html, /tabindex="0"/g)).toBe(1)
    expect(dayMarkup(html, '2026-10-24')).toContain('aria-label="2026년 10월 24일 토요일"')
  })

  it('orders full weekday names and cells from the configured week start', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 3, 1)} weekStartsOn={1} locale="en-US" fixedWeeks={false} />)
    expect(html.match(/role="columnheader"[^>]*aria-label="([^"]+)"/g)?.map((tag) => tag.match(/aria-label="([^"]+)"/)![1])).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    expect(html.match(/data-date="([^"]+)"/)?.[1]).toBe('2026-02-23')
    expect(count(html, /role="row"/g)).toBe(7)
  })

  it('renders four complete weeks when the month fits exactly', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 2, 14)} fixedWeeks={false} />)
    expect(count(html, /role="gridcell"/g)).toBe(28)
    expect(count(html, /role="row"/g)).toBe(5)
    expect(count(html, /tabindex="0"/g)).toBe(1)
  })

  it('keeps empty outside cells in the grid without exposing hidden dates or metadata', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 10, 1)} showOutsideDays={false} fixedWeeks={false} weekStartsOn={1} dayData={{ '2026-09-30': { label: '외부 일정' } }} />)
    expect(count(html, /role="gridcell"/g)).toBe(35)
    expect(count(html, /class="ui-calendar-empty-day"/g)).toBe(4)
    expect(count(html, /data-date="/g)).toBe(31)
    expect(html).not.toContain('2026-09-30')
    expect(html).not.toContain('외부 일정')
    expect(dayMarkup(html, '2026-10-01')).toContain('tabindex="0"')
  })

  it.each([date(1, 1, 1), date(9999, 12, 31)])('keeps supported boundary years focusable with outside dates hidden: %s', (value) => {
    const html = renderToStaticMarkup(<Calendar value={value} showOutsideDays={false} weekStartsOn={1} fixedWeeks={false} />)
    expect(count(html, /tabindex="0"/g)).toBe(1)
    expect(html).not.toContain('data-date="0000-')
    expect(html).not.toContain('data-date="10000-')
  })

  it('provides event dots, bounded visual counts and the full accessible metadata', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 10, 24)} variant="schedule" dayData={{ '2026-10-24': { label: '팀 일정', tone: 'accent', count: 3 }, '2026-10-25': { label: '신청 일정', tone: 'info', count: 1234 } }} />)
    const three = dayMarkup(html, '2026-10-24'), many = dayMarkup(html, '2026-10-25')
    expect(count(three, /class="ui-calendar-event-dot"/g)).toBe(3)
    expect(three).toContain('aria-label="2026년 10월 24일 토요일 · 팀 일정 · 3개 일정"')
    expect(three).toContain('data-tone="accent"')
    expect(count(many, /class="ui-calendar-event-dot"/g)).toBe(1)
    expect(many).toContain('ui-calendar-event-count">99+</span>')
    expect(many).toContain('1,234개 일정')
  })

  it('uses a fallback check for completed activities, custom icons when supplied and numbers otherwise', () => {
    const dayData: Record<string, CalendarDayData> = {
      '2026-10-23': { label: '운동', completed: true },
      '2026-10-24': { label: '달리기', completed: true, count: 2, icon: <svg data-test-icon="running" />, tone: 'success' },
      '2026-10-25': { label: '휴식', completed: false },
    }
    const html = renderToStaticMarkup(<Calendar value={date(2026, 10, 24)} variant="activity" dayShape="circle" dayData={dayData} />)
    expect(dayMarkup(html, '2026-10-23')).toContain('lucide-check')
    expect(dayMarkup(html, '2026-10-24')).toContain('data-test-icon="running"')
    expect(dayMarkup(html, '2026-10-24')).not.toContain('ui-calendar-day-number')
    expect(dayMarkup(html, '2026-10-24')).toContain('달리기 · 2회 활동 · 완료')
    expect(dayMarkup(html, '2026-10-25')).toContain('ui-calendar-day-number">25</span>')
    expect(dayMarkup(html, '2026-10-25')).toContain('휴식 · 미완료')
  })

  it('omits invalid or empty counts and floors fractional counts without allocating excess markers', () => {
    const html = renderToStaticMarkup(<Calendar value={date(2026, 10, 24)} variant="minimal" dayData={{ '2026-10-21': { label: '일정', count: 2.9 }, '2026-10-22': { label: '비었음', count: 0 }, '2026-10-23': { label: '알 수 없음', count: Infinity }, '2026-10-24': { label: '음수', count: -2 }, '2026-10-25': { label: '기본 점' } }} />)
    expect(count(dayMarkup(html, '2026-10-21'), /class="ui-calendar-event-dot"/g)).toBe(2)
    expect(count(dayMarkup(html, '2026-10-25'), /class="ui-calendar-event-dot"/g)).toBe(1)
    for (const day of [22, 23, 24]) expect(dayMarkup(html, `2026-10-${day}`)).not.toContain('ui-calendar-day-markers')
    expect(html).not.toContain('Infinity개')
    expect(html).not.toContain('-2개')
  })

  it.each(['default', 'minimal', 'schedule', 'activity'] as const)('retains range and disabled semantics in the %s variant', (variant) => {
    const props = { mode: 'range' as const, value: { start: date(2026, 11, 2), end: date(2026, 11, 6) }, variant, dayData: { '2026-11-03': { label: '완료한 일정', completed: true } } }
    const html = renderToStaticMarkup(<Calendar {...props} showOutsideDays={false} fixedWeeks={false} weekStartsOn={1} size="lg" dayShape="square" />)
    expect(count(html, /aria-selected="true"/g)).toBe(5)
    expect(count(html, /data-range-edge="true"/g)).toBe(2)
    expect(count(html, /tabindex="0"/g)).toBe(1)
    expect(html).toContain('aria-multiselectable="true"')
    expect(html).toContain('data-size="lg" data-day-shape="square"')
    const disabled = renderToStaticMarkup(<Calendar {...props} disabled />)
    expect(count(disabled, /tabindex="0"/g)).toBe(0)
    expect((disabled.match(/<button[^>]*>/g) ?? []).every((tag) => tag.includes('disabled=""'))).toBe(true)
  })
})
