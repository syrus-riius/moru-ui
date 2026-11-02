import { useState } from 'react'
import { CalendarDays, Check, Clock3, Plus, Trash2 } from 'lucide-react'
import { addCalendarDays, calendarDateKey, normalizeCalendarDate } from '../ui/calendar-utils'
import type { CalendarDayData, CalendarRange } from '../ui/calendar'
import { DateRangePicker } from '../ui/date-range-picker'
import { TimePicker } from '../ui/time-picker'
import { TimeRangePicker, type TimeRangeValue } from '../ui/time-range-picker'
import { Button } from '../ui/button'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import './schedule-planner.css'

interface PlannedSession { id: string; title: string; start: string; end: string; startTime: string; endTime: string; reminder: string }
function initialPeriod(): CalendarRange { const tomorrow = addCalendarDays(normalizeCalendarDate(new Date())!, 1); return { start: tomorrow, end: addCalendarDays(tomorrow, 2) } }

export function SchedulePlanner() {
  const [title, setTitle] = useState('제품 디자인 리뷰')
  const [period, setPeriod] = useState<CalendarRange>(initialPeriod)
  const [hours, setHours] = useState<TimeRangeValue>({ start: '09:00', end: '10:30' })
  const [reminder, setReminder] = useState<string | null>('08:45')
  const [sessions, setSessions] = useState<PlannedSession[]>([])
  const [notice, setNotice] = useState('')
  const calendarDays: Record<string, CalendarDayData> = {}
  for (const session of sessions) {
    const previous = calendarDays[session.start]
    calendarDays[session.start] = {
      label: previous ? `${previous.label} · ${session.title}` : `일정 시작 · ${session.title}`,
      count: (previous?.count ?? 0) + 1,
      tone: 'accent',
    }
  }
  return <section className="schedule-planner" aria-labelledby="schedule-planner-title">
    <header className="schedule-planner-header"><span>PLAN / DATE & TIME</span><h2 id="schedule-planner-title">함께할 시간을 정해 보세요.</h2><p>기간과 진행 시간, 알림 시간을 한 흐름으로 정합니다. 선택한 기간에 매일 같은 시간으로 진행하는 예제입니다.</p></header>
    <div className="schedule-planner-layout"><form className="schedule-planner-form" aria-label="일정 계획" onSubmit={(event) => {
      event.preventDefault()
      if (!period.start || !period.end || !hours.start || !hours.end || !reminder) return
      const item: PlannedSession = { id: crypto.randomUUID(), title: title.trim(), start: calendarDateKey(period.start)!, end: calendarDateKey(period.end)!, startTime: hours.start, endTime: hours.end, reminder }
      if (!item.title) return
      setSessions((previous) => [item, ...previous].slice(0, 20))
      setNotice(`${item.title} 일정을 추가했어요.`)
    }}>
      <div className="schedule-planner-section-title"><span><CalendarDays size={17} aria-hidden="true" /></span><div><h3>새 일정</h3><p>먼 날짜는 달력 상단의 년·월로 빠르게 이동하세요.</p></div></div>
      <Field label="일정 이름"><Input value={title} onChange={(event) => { setTitle(event.target.value); setNotice('') }} required maxLength={100} /></Field>
      <Field label="진행 기간" description="하루 일정도 가능합니다. 등록한 일정의 시작일에는 점이 표시됩니다."><DateRangePicker name="period" value={period} onValueChange={(value) => { setPeriod(value); setNotice('') }} calendarOptions={{ variant: 'schedule', weekStartsOn: 1, fixedWeeks: false, dayData: calendarDays }} required /></Field>
      <Field label="매일 진행 시간" description="15분 간격 · 같은 날의 시간 범위"><TimeRangePicker name="session" value={hours} onValueChange={(value) => { setHours(value); setNotice('') }} step={15} required /></Field>
      <Field label="알림 시간" description="15분 간격 · 현지 시각 기준"><TimePicker name="reminder" value={reminder} onValueChange={(value) => { setReminder(value); setNotice('') }} step={15} required /></Field>
      <div className="schedule-planner-actions"><Button type="submit"><Plus size={15} aria-hidden="true" />일정 추가</Button><span>브라우저 안의 예제 목록에 저장됩니다.</span></div>
      <p className="schedule-planner-notice" role="status">{notice}</p>
    </form><aside className="schedule-planner-overview" aria-label="준비한 일정">
      <div className="schedule-planner-section-title"><span><Clock3 size={17} aria-hidden="true" /></span><div><h3>준비한 일정</h3><p>{sessions.length}개 · 새로고침하면 초기화됩니다.</p></div></div>
      {sessions.length ? <ul className="schedule-planner-list">{sessions.map((item) => <li key={item.id}>
        <div className="schedule-planner-item-heading"><Badge variant="outline">매일</Badge><button type="button" aria-label={`${item.title} 일정 삭제`} onClick={() => { setSessions((previous) => previous.filter((session) => session.id !== item.id)); setNotice(`${item.title} 일정을 삭제했어요.`) }}><Trash2 size={14} aria-hidden="true" /></button></div>
        <h4>{item.title}</h4><dl><div><dt>기간</dt><dd>{item.start}<br />{item.end}</dd></div><div><dt>진행</dt><dd>{item.startTime}–{item.endTime}</dd></div><div><dt>알림</dt><dd>{item.reminder}</dd></div></dl>
      </li>)}</ul> : <div className="schedule-planner-empty"><Check size={24} aria-hidden="true" /><h4>함께할 시간을 기다리고 있어요.</h4><p>왼쪽에서 기간과 시간을 정하면<br />여기에 일정이 추가됩니다.</p></div>}
    </aside></div>
  </section>
}
