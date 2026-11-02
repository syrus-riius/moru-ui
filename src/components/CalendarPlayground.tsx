import { useId, useMemo, useState } from 'react'
import { Bike, CalendarDays, Check, ChevronDown, Clock3, Dumbbell, Flame, Footprints, SlidersHorizontal } from 'lucide-react'
import { Calendar, type CalendarDayData, type CalendarRange } from './ui/calendar'
import { addCalendarDays, calendarDateKey, compareCalendarDates, normalizeCalendarDate } from './ui/calendar-utils'
import { Button } from './ui/button'
import { CodeBlock } from './ui/code-block'
import { Collapsible } from './ui/collapsible'
import { Field } from './ui/field'
import { Select } from './ui/select'
import { Switch } from './ui/switch'
import { Tabs } from './ui/tabs'
import { ToggleGroup } from './ui/toggle-group'
import { buildCalendarPlaygroundDays, summarizeCalendarActivities, type CalendarActivityKind } from './calendar-playground-data'
import './calendar-playground.css'

type CalendarVariant = 'default' | 'minimal' | 'schedule' | 'activity'
type DayShape = 'rounded' | 'square' | 'circle'
type ControlSize = 'sm' | 'md' | 'lg'
const presets: Array<{ value: CalendarVariant; label: string; hint: string }> = [
  { value: 'default', label: '기본', hint: '입력 폼과 날짜 선택에 어울리는 단단한 기본형.' },
  { value: 'minimal', label: '미니멀', hint: '경계와 장식을 덜어 콘텐츠 안에 자연스럽게 배치합니다.' },
  { value: 'schedule', label: '일정', hint: '날짜별 일정 수를 확인하고 선택한 날의 일정을 살펴봅니다.' },
  { value: 'activity', label: '활동', hint: '아이콘과 완료 기록으로 운동·습관의 흐름을 확인합니다.' },
]
const activityIcons = { run: Footprints, strength: Dumbbell, cycle: Bike }
const activityIconNames: Record<CalendarActivityKind, string> = { run: 'Footprints', strength: 'Dumbbell', cycle: 'Bike' }
const activityNames: Record<CalendarActivityKind, string> = { run: '러닝', strength: '근력', cycle: '자전거' }
const sizeItems = [{ value: 'sm', label: 'S · 작게' }, { value: 'md', label: 'M · 기본' }, { value: 'lg', label: 'L · 크게' }]
const shapeItems = [{ value: 'rounded', label: '둥근 사각형' }, { value: 'square', label: '사각형' }, { value: 'circle', label: '원형' }]
const weekdayItems = [{ value: '0', label: '일요일' }, { value: '1', label: '월요일' }]
const dateLabel = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })

function dateCode(date: Date | null) {
  return date ? `new Date(${date.getFullYear()}, ${date.getMonth()}, ${date.getDate()})` : 'null'
}

export function CalendarPlayground({ disabled = false }: { disabled?: boolean }) {
  const settingsId = useId()
  const [today] = useState(() => normalizeCalendarDate(new Date())!)
  const [variant, setVariant] = useState<CalendarVariant>('default')
  const [mode, setMode] = useState<'single' | 'range'>('single')
  const [size, setSize] = useState<ControlSize>('md')
  const [dayShape, setDayShape] = useState<DayShape>('rounded')
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(0)
  const [showOutsideDays, setShowOutsideDays] = useState(true)
  const [fixedWeeks, setFixedWeeks] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(today)
  const [range, setRange] = useState<CalendarRange>(() => ({ start: addCalendarDays(today, 2), end: addCalendarDays(today, 6) }))
  const [days, setDays] = useState(() => buildCalendarPlaygroundDays(today))
  const selected = mode === 'range' ? range.end ?? range.start ?? today : date ?? today
  const selectedKey = calendarDateKey(selected)!
  const detail = days[selectedKey]
  const summary = summarizeCalendarActivities(days, today)
  const currentPreset = presets.find((preset) => preset.value === variant)!

  const dayData = useMemo(() => {
    const data: Record<string, CalendarDayData> = {}
    for (const [key, day] of Object.entries(days)) {
      if (variant === 'schedule' && day.events.length) data[key] = { label: day.events.map((event) => `${event.time} ${event.title}`).join(' · '), tone: day.events[0].tone, count: day.events.length }
      else if (variant === 'activity' && day.activity) {
        const Icon = activityIcons[day.activity.kind]
        data[key] = { label: `${day.activity.label} · ${day.activity.minutes}분`, tone: 'neutral', icon: <Icon size={18} aria-hidden="true" />, completed: day.activity.completed }
      }
    }
    return data
  }, [days, variant])

  function changePreset(value: string) {
    const next = presets.find((preset) => preset.value === value)?.value
    if (!next) return
    setVariant(next)
    setDayShape(next === 'activity' ? 'circle' : 'rounded')
    setShowOutsideDays(next !== 'activity')
    setFixedWeeks(next === 'default')
  }

  function selectToday() {
    if (mode === 'range') setRange({ start: today, end: null })
    else setDate(today)
  }

  const calendarProps = { variant, size, dayShape, weekStartsOn, showOutsideDays, fixedWeeks, dayData, disabled }
  const codeData = Object.entries(dayData).filter(([key]) => key === selectedKey || key === calendarDateKey(today)).slice(0, 2)
  const fallbackData = codeData.length ? codeData : Object.entries(dayData).slice(0, 2)
  const codeIconNames = [...new Set(variant === 'activity' ? fallbackData.flatMap(([key]) => days[key]?.activity ? [activityIconNames[days[key].activity!.kind]] : []) : [])]
  const metadataCode = fallbackData.map(([key, value]) => `  "${key}": { label: ${JSON.stringify(value.label)}, ${variant === 'activity' ? `${days[key]?.activity ? `icon: <${activityIconNames[days[key].activity!.kind]} size={18} aria-hidden="true" />, ` : ''}completed: ${Boolean(value.completed)}` : `tone: "${value.tone}", count: ${value.count}`} },`).join('\n')
  const code = [
    "import { useState } from 'react'",
    ...(codeIconNames.length ? [`import { ${codeIconNames.join(', ')} } from 'lucide-react'`] : []),
    `import { Calendar${mode === 'range' ? ', type CalendarRange' : ''}${fallbackData.length ? ', type CalendarDayData' : ''} } from './components/ui/calendar'`,
    '', 'export function CalendarExample() {',
    mode === 'range' ? `  const [range, setRange] = useState<CalendarRange>({ start: ${dateCode(range.start)}, end: ${dateCode(range.end)} })` : `  const [date, setDate] = useState<Date | null>(${dateCode(date)})`,
    ...(fallbackData.length ? ['', '  // 최대 두 날짜의 예시입니다. 나머지 날짜는 앱 데이터로 채우세요.', '  const dayData = {', metadataCode.split('\n').map((line) => `  ${line}`).join('\n'), '  } satisfies Record<string, CalendarDayData>'] : []),
    '', '  return (', '    <Calendar', `      variant="${variant}"`, `      size="${size}"`, `      dayShape="${dayShape}"`, `      weekStartsOn={${weekStartsOn}}`, `      showOutsideDays={${showOutsideDays}}`, `      fixedWeeks={${fixedWeeks}}`,
    ...(mode === 'range' ? ['      mode="range"', '      value={range}', '      onValueChange={setRange}'] : ['      value={date}', '      onValueChange={setDate}']),
    ...(fallbackData.length ? ['      dayData={dayData}'] : []), '    />', '  )', '}',
  ].join('\n')

  const preview = <div className="calendar-playground-content">
    <div className="calendar-playground-toolbar">
      <ToggleGroup size="sm" aria-label="달력 선택 방식" value={[mode]} preventEmpty items={[{ value: 'single', label: '날짜' }, { value: 'range', label: '날짜 범위' }]} onValueChange={(values) => setMode(values[0] === 'range' ? 'range' : 'single')} />
      <Button size="sm" variant="ghost" aria-expanded={settingsOpen} aria-controls={settingsId} onClick={() => setSettingsOpen((open) => !open)}><SlidersHorizontal size={14} aria-hidden="true" />세부 설정<ChevronDown size={13} aria-hidden="true" className="calendar-playground-chevron" data-open={settingsOpen} /></Button>
    </div>
    {settingsOpen ? <div id={settingsId} className="calendar-playground-settings">
      <Field label="크기"><Select size="sm" items={sizeItems} value={size} onValueChange={(value) => setSize(value as ControlSize)} /></Field>
      <Field label="날짜 모양"><Select size="sm" items={shapeItems} value={dayShape} onValueChange={(value) => setDayShape(value as DayShape)} /></Field>
      <Field label="주 시작"><Select size="sm" items={weekdayItems} value={String(weekStartsOn)} onValueChange={(value) => setWeekStartsOn(value === '1' ? 1 : 0)} /></Field>
      <Switch size="sm" label="이전·다음 달 날짜" checked={showOutsideDays} onCheckedChange={setShowOutsideDays} />
      <Switch size="sm" label="항상 6주 표시" checked={fixedWeeks} onCheckedChange={setFixedWeeks} />
    </div> : null}
    <p className="calendar-playground-hint">{currentPreset.hint}</p>
    <div className="calendar-playground-stage" data-variant={variant}>
      <div className="calendar-playground-calendar">
        {mode === 'range' ? <Calendar {...calendarProps} mode="range" value={range} onValueChange={setRange} aria-label={`${currentPreset.label} 날짜 범위 선택`} /> : <Calendar {...calendarProps} value={date} onValueChange={setDate} aria-label={`${currentPreset.label} 날짜 선택`} />}
        {variant === 'activity' ? <div className="calendar-playground-legend" aria-label="활동 범례">{Object.entries(activityNames).map(([kind, label]) => { const Icon = activityIcons[kind as CalendarActivityKind]; return <span key={kind}><Icon size={13} aria-hidden="true" />{label}</span> })}<span><Check size={13} aria-hidden="true" />완료</span></div> : variant === 'schedule' ? <div className="calendar-playground-legend" aria-label="일정 범례"><span><i data-tone="accent" />점의 수 = 일정 수</span><span>선택한 날짜에서 상세 확인</span></div> : null}
      </div>
      <aside className="calendar-playground-detail" aria-label="선택한 날짜 상세">
        <div className="calendar-playground-detail-heading"><span>{variant === 'activity' ? 'ACTIVITY LOG' : variant === 'schedule' ? 'DAILY AGENDA' : 'SELECTED DATE'}</span><Button size="sm" variant="ghost" disabled={disabled} onClick={selectToday}>오늘</Button></div>
        <h3>{dateLabel.format(selected)}</h3>
        {variant === 'activity' ? <>
          <dl className="calendar-playground-stats"><div><dt><Flame size={13} aria-hidden="true" />오늘까지 연속</dt><dd>{summary.streak}<small>일</small></dd></div><div><dt>최근 28일 완료</dt><dd>{summary.completed}<small>/ 28</small></dd></div></dl>
          {detail?.activity ? <div className="calendar-playground-activity"><span className="calendar-playground-activity-icon">{(() => { const Icon = activityIcons[detail.activity.kind]; return <Icon size={22} aria-hidden="true" /> })()}</span><div><strong>{detail.activity.label}</strong><p>{detail.activity.minutes}분 · {detail.activity.completed ? '완료했어요' : compareCalendarDates(selected, today) > 0 ? '예정된 활동' : '아직 완료하지 않았어요'}</p></div><Button variant="secondary" size="sm" disabled={disabled || compareCalendarDates(selected, today) > 0} onClick={() => setDays((previous) => { const day = previous[selectedKey]; if (!day?.activity) return previous; return { ...previous, [selectedKey]: { ...day, activity: { ...day.activity, completed: !day.activity.completed } } } })}>{detail.activity.completed ? '완료 취소' : '완료로 표시'}</Button></div> : <p className="calendar-playground-empty">이 날짜의 활동 기록이 없어요.</p>}
          <p className="calendar-playground-note">최근 28일 활동 {summary.minutes}분. 완료 표시를 바꾸면 달력과 요약도 함께 바뀝니다.</p>
        </> : variant === 'schedule' ? <>
          {detail?.events.length ? <ul className="calendar-playground-agenda">{detail.events.map((event) => <li key={`${event.time}-${event.title}`}><span className="calendar-playground-agenda-dot" data-tone={event.tone} /><div><strong>{event.title}</strong><p><Clock3 size={12} aria-hidden="true" />{event.time} · {event.duration}분</p></div></li>)}</ul> : <div className="calendar-playground-empty"><CalendarDays size={22} aria-hidden="true" /><p>등록된 일정이 없어요.<br />다른 날짜를 선택해 보세요.</p></div>}
          <p className="calendar-playground-note">오늘을 기준으로 앞뒤 45일의 예제 일정입니다.</p>
        </> : <>
          <p className="calendar-playground-description">{mode === 'range' ? '시작일과 종료일을 선택해 기간을 만드세요. 같은 날도 선택할 수 있어요.' : '날짜를 선택하고 상단 년·월로 먼 날짜까지 빠르게 이동하세요.'}</p>
          <p className="calendar-playground-note">날짜 선택은 유지한 채 프리셋과 세부 설정을 비교할 수 있습니다.</p>
        </>}
      </aside>
    </div>
    <output className="calendar-playground-selection" aria-live="polite">{mode === 'single' ? calendarDateKey(date) ?? '선택한 날짜 없음' : `${calendarDateKey(range.start) ?? '시작일'} → ${calendarDateKey(range.end) ?? '종료일을 선택하세요'}`}</output>
    <Collapsible title="설정 + 데이터 예시" size="sm" className="calendar-playground-code"><CodeBlock value={code} language="tsx" filename="CalendarExample.tsx" size="sm" defaultWrap /></Collapsible>
  </div>

  return <div className="calendar-playground"><Tabs size="sm" value={variant} onValueChange={changePreset} aria-label="달력 디자인 프리셋" items={presets.map((preset) => ({ value: preset.value, label: preset.label, content: preset.value === variant ? preview : null }))} /></div>
}
