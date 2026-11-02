import { describe, expect, it } from 'vitest'
import { buildCalendarPlaygroundDays, summarizeCalendarActivities, type CalendarPlaygroundDays } from './calendar-playground-data'
import { addCalendarDays, calendarDateKey, createCalendarDate } from './ui/calendar-utils'

describe('calendar playground data', () => {
  it('keeps an anchored sample stable across month and year boundaries', () => {
    const anchor = createCalendarDate(2026, 0, 3)
    const first = buildCalendarPlaygroundDays(anchor)
    expect(first).toEqual(buildCalendarPlaygroundDays(new Date(anchor)))
    expect(Object.keys(first)).toHaveLength(91)
    expect(first['2025-12-31']).toBeDefined()
    expect(first['2026-01-01']).toBeDefined()
    expect(Object.entries(first).filter(([key]) => key > '2026-01-03').every(([, day]) => !day.activity?.completed)).toBe(true)
    expect(buildCalendarPlaygroundDays(new Date('invalid'))).toEqual({})
  })

  it('derives streak, count and duration from the same completion records', () => {
    const anchor = createCalendarDate(2026, 10, 2)
    const days: CalendarPlaygroundDays = {}
    for (const offset of [0, 1, 2, 5, 28]) {
      days[calendarDateKey(addCalendarDays(anchor, -offset))!] = { events: [], activity: { kind: 'run', label: '러닝', minutes: 30, completed: true } }
    }
    expect(summarizeCalendarActivities(days, anchor)).toEqual({ completed: 4, minutes: 120, streak: 3 })
    days[calendarDateKey(anchor)!].activity!.completed = false
    expect(summarizeCalendarActivities(days, anchor)).toEqual({ completed: 3, minutes: 90, streak: 0 })
    expect(summarizeCalendarActivities({}, anchor)).toEqual({ completed: 0, minutes: 0, streak: 0 })
  })
})
