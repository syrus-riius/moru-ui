import { useState } from 'react'
import type { CalendarRange } from './ui/calendar'
import { DateRangePicker } from './ui/date-range-picker'
import { TimePicker } from './ui/time-picker'
import { TimeRangePicker, type TimeRangeValue } from './ui/time-range-picker'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Field } from './ui/field'
import './date-time-demo.css'

export { CalendarPlayground as CalendarVariationsDemo } from './CalendarPlayground'

type DateTimeDemoId = 'date-range-picker' | 'time-picker' | 'time-range-picker'
const emptyDates = (): CalendarRange => ({ start: null, end: null })
const emptyTimes = (): TimeRangeValue => ({ start: null, end: null })

export function DateTimeComponentDemo({ id, disabled, size }: { id: DateTimeDemoId; disabled: boolean; size: 'sm' | 'md' | 'lg' }) {
  const [dates, setDates] = useState<CalendarRange>(emptyDates)
  const [time, setTime] = useState<string | null>('09:30')
  const [times, setTimes] = useState<TimeRangeValue>(() => ({ start: '09:00', end: '10:30' }))
  const [overnight, setOvernight] = useState(false)
  const [submitted, setSubmitted] = useState('')
  return <form className="date-time-demo" aria-label={`${id} 제출 예제`} onSubmit={(event) => {
    event.preventDefault()
    const entries = Array.from(new FormData(event.currentTarget).entries()).map(([key, value]) => `${key}: ${String(value)}`)
    setSubmitted(entries.join(' · '))
  }} onReset={() => { setDates(emptyDates()); setTime(null); setTimes(emptyTimes()); setOvernight(false); setSubmitted('') }}>
    {id === 'date-range-picker' ? <Field label="프로젝트 기간" description="시작일과 종료일을 선택하세요. 같은 날도 선택할 수 있어요."><DateRangePicker name="period" value={dates} onValueChange={(value) => { setDates(value); setSubmitted('') }} size={size} disabled={disabled} required /></Field>
      : id === 'time-picker' ? <Field label="알림 시간" description="15분 간격 · 08:00부터 20:00까지"><TimePicker name="reminder" value={time} onValueChange={(value) => { setTime(value); setSubmitted('') }} min="08:00" max="20:00" step={15} disabled={disabled} size={size} required /></Field>
      : <><Field label="진행 시간" description="시작과 종료를 선택하세요. 같은 날은 종료 시간이 더 늦어야 합니다."><TimeRangePicker name="session" value={times} onValueChange={(value) => { setTimes(value); setSubmitted('') }} step={15} allowOvernight={overnight} disabled={disabled} size={size} required /></Field><Checkbox label="자정을 넘는 일정 허용" checked={overnight} disabled={disabled} onCheckedChange={(value) => { setOvernight(value); setSubmitted('') }} /></>}
    <div className="date-time-demo-actions"><Button type="submit" size="sm" disabled={disabled}>값 제출</Button><Button type="reset" size="sm" variant="secondary" disabled={disabled}>초기화</Button></div>
    {submitted ? <output className="date-time-demo-result" role="status">{submitted}</output> : <p className="date-time-demo-caption">폼 제출값은 날짜 YYYY-MM-DD, 시간 HH:mm 형식입니다. 서버로 전송하지 않습니다.</p>}
  </form>
}
