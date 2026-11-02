import { addCalendarDays, calendarDateKey, normalizeCalendarDate } from './ui/calendar-utils'

export type CalendarActivityKind = 'run' | 'strength' | 'cycle'
export type CalendarAgendaTone = 'accent' | 'info' | 'warning'
export interface CalendarAgendaItem { title: string; time: string; duration: number; tone: CalendarAgendaTone }
export interface CalendarActivity { kind: CalendarActivityKind; label: string; minutes: number; completed: boolean }
export interface CalendarPlaygroundDay { events: CalendarAgendaItem[]; activity: CalendarActivity | null }
export type CalendarPlaygroundDays = Record<string, CalendarPlaygroundDay>

const activities: Array<Omit<CalendarActivity, 'completed'>> = [
  { kind: 'run', label: '가볍게 러닝', minutes: 35 },
  { kind: 'strength', label: '근력 운동', minutes: 40 },
  { kind: 'cycle', label: '자전거 타기', minutes: 50 },
]

/** An anchored sample stays stable while the user navigates and changes presentation. */
export function buildCalendarPlaygroundDays(anchor: Date): CalendarPlaygroundDays {
  const today = normalizeCalendarDate(anchor)
  if (!today) return {}
  return Object.fromEntries(Array.from({ length: 91 }, (_, index) => {
    const offset = index - 45
    const date = addCalendarDays(today, offset)
    const workingDay = date.getDay() > 0 && date.getDay() < 6
    const events: CalendarAgendaItem[] = workingDay ? [
      { title: '제품 디자인 리뷰', time: '10:30', duration: 45, tone: 'accent' },
      ...(date.getDate() % 2 ? [] : [{ title: '팀 싱크업', time: '14:00', duration: 30, tone: 'info' } as const]),
    ] : date.getDay() === 6 ? [{ title: '개인 프로젝트', time: '11:00', duration: 60, tone: 'warning' }] : []
    const activity = offset >= -27 && offset <= 7 ? {
      ...activities[date.getDate() % activities.length],
      completed: offset <= 0 && ![2, 5].includes((-offset) % 7),
    } : null
    return [calendarDateKey(date)!, { events, activity }]
  }))
}

/** Calendar days, rather than elapsed milliseconds, keep summaries stable across DST. */
export function summarizeCalendarActivities(days: CalendarPlaygroundDays, anchor: Date) {
  let completed = 0
  let minutes = 0
  let streak = 0
  let streakOpen = true
  for (let offset = 0; offset < 28; offset++) {
    const activity = days[calendarDateKey(addCalendarDays(anchor, -offset))!]?.activity
    if (activity?.completed) {
      completed++
      minutes += activity.minutes
      if (streakOpen) streak++
    } else streakOpen = false
  }
  return { completed, minutes, streak }
}
