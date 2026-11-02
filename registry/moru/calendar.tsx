'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from './_lib/cn'
import {
  addCalendarDays, addCalendarMonths, calendarDateKey, calendarMonthHasAvailableDate,
  calendarWeekdayIndex, calendarYearHasAvailableDate, calendarYearPageStart, clampCalendarDate, compareCalendarDates,
  createCalendarDate, endOfCalendarMonth, getCalendarMonthDays, getCalendarYearPage, isCalendarDateInRange,
  normalizeCalendarDate, normalizeCalendarRange, resolveCalendarLocale, selectCalendarRangeDate,
  startOfCalendarMonth, supportedCalendarBounds, type CalendarRange,
} from './calendar-utils'
import './calendar.css'

export type { CalendarRange } from './calendar-utils'

export interface CalendarDayData {
  label: string
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  icon?: ReactNode
  count?: number
  completed?: boolean
}

interface CalendarCommonProps {
  minDate?: Date; maxDate?: Date; disabled?: boolean; locale?: string; className?: string
  variant?: 'default' | 'minimal' | 'schedule' | 'activity'
  size?: 'sm' | 'md' | 'lg'
  dayShape?: 'rounded' | 'square' | 'circle'
  weekStartsOn?: 0 | 1
  showOutsideDays?: boolean
  fixedWeeks?: boolean
  /** Local date keys (YYYY-MM-DD), independent of the displayed locale. */
  dayData?: Record<string, CalendarDayData>
  'aria-label'?: string; 'aria-describedby'?: string
}
export interface CalendarSingleProps extends CalendarCommonProps {
  mode?: 'single'; value?: Date | null; defaultValue?: Date | null; onValueChange?: (value: Date) => void
}
export interface CalendarRangeProps extends CalendarCommonProps {
  mode: 'range'; value?: CalendarRange; defaultValue?: CalendarRange; onValueChange?: (value: CalendarRange) => void
}
export type CalendarProps = CalendarSingleProps | CalendarRangeProps
type CalendarView = 'days' | 'months' | 'years'

/** One roving grid for days, months or years; the host decides how to submit the value. */
export function Calendar(props: CalendarProps) {
  const { disabled = false, locale = 'ko-KR', className, variant = 'default', size = 'sm', dayShape = 'rounded', weekStartsOn = 0, showOutsideDays = true, fixedWeeks = true, dayData, 'aria-label': ariaLabel = props.mode === 'range' ? '날짜 범위 선택' : '날짜 선택', 'aria-describedby': describedBy } = props
  const id = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const pendingFocus = useRef<string | null>(null)
  const focusWithin = useRef(false)
  const [internalValue, setInternalValue] = useState<Date | null>(() => props.mode !== 'range' ? normalizeCalendarDate(props.defaultValue) ?? null : null)
  const [internalRange, setInternalRange] = useState(() => normalizeCalendarRange(props.mode === 'range' ? props.defaultValue : undefined))
  const [view, setView] = useState<CalendarView>('days')
  const [previewDate, setPreviewDate] = useState<Date | null>(null)
  const range = props.mode === 'range' ? normalizeCalendarRange(props.value === undefined ? internalRange : props.value) : { start: null, end: null }
  const selected = props.mode !== 'range' ? normalizeCalendarDate(props.value === undefined ? internalValue : props.value) : undefined
  const selectedKey = props.mode === 'range' ? `${calendarDateKey(range.start) ?? ''}/${calendarDateKey(range.end) ?? ''}` : calendarDateKey(selected)
  const selectionAnchor = props.mode === 'range' ? range.end ?? range.start : selected
  const { minDate, maxDate } = supportedCalendarBounds(props.minDate, props.maxDate)
  const minKey = calendarDateKey(minDate)
  const maxKey = calendarDateKey(maxDate)
  const today = normalizeCalendarDate(new Date())!
  const initial = clampCalendarDate(selectionAnchor ?? today, minDate, maxDate) ?? today
  const [month, setMonth] = useState(() => startOfCalendarMonth(initial))
  const [focusedDate, setFocusedDate] = useState(() => initial)
  const [monthFocus, setMonthFocus] = useState(initial.getMonth())
  const [yearFocus, setYearFocus] = useState(initial.getFullYear())
  const [yearPage, setYearPage] = useState(() => calendarYearPageStart(initial.getFullYear()))
  const previousSelection = useRef(selectedKey)
  const focused = clampCalendarDate(focusedDate, minDate, maxDate)
  const focusedKey = calendarDateKey(focused)
  const monthKey = calendarDateKey(month)
  const monthStart = startOfCalendarMonth(month), monthEnd = endOfCalendarMonth(month)
  const visibleMin = compareCalendarDates(minDate, monthStart) > 0 ? minDate : monthStart
  const visibleMax = compareCalendarDates(maxDate, monthEnd) < 0 ? maxDate : monthEnd
  const visibleFocused = focused && !showOutsideDays ? clampCalendarDate(focused, visibleMin, visibleMax) : focused
  const dayFocusKey = calendarDateKey(visibleFocused)
  const resolvedLocale = resolveCalendarLocale(locale)
  const title = new Intl.DateTimeFormat(resolvedLocale, { year: 'numeric', month: 'long' }).format(month)
  const yearText = new Intl.DateTimeFormat(resolvedLocale, { year: 'numeric' }).format(month)
  const monthText = new Intl.DateTimeFormat(resolvedLocale, { month: 'long' }).format(month)
  const fullDate = new Intl.DateTimeFormat(resolvedLocale, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  const monthFormatter = new Intl.DateTimeFormat(resolvedLocale, { month: 'short' })
  const dayNumber = new Intl.NumberFormat(resolvedLocale)
  const yearNumber = new Intl.NumberFormat(resolvedLocale, { useGrouping: false })
  const shortWeekday = new Intl.DateTimeFormat(resolvedLocale, { weekday: 'narrow' })
  const fullWeekday = new Intl.DateTimeFormat(resolvedLocale, { weekday: 'long' })
  const weekdays = Array.from({ length: 7 }, (_, day) => createCalendarDate(2024, 0, 7 + weekStartsOn + day))
  const years = getCalendarYearPage(yearPage)
  const gridTitle = view === 'years' ? `${yearNumber.format(years[0])}–${yearNumber.format(years.at(-1)!)}년` : view === 'months' ? `${yearText} · 월 선택` : title
  const days = getCalendarMonthDays(month, weekStartsOn, fixedWeeks)
  const partialRange = Boolean(props.mode === 'range' && range.start && !range.end)
  const visualRange = partialRange && previewDate ? normalizeCalendarRange({ start: range.start, end: previewDate }) : range
  const rangeDescription = !range.start ? '시작일을 선택하세요.' : !range.end ? `${fullDate.format(range.start)} 시작. 종료일을 선택하세요.` : `${fullDate.format(range.start)}부터 ${fullDate.format(range.end)}까지 선택했어요.`

  useEffect(() => {
    const selectionChanged = previousSelection.current !== selectedKey
    previousSelection.current = selectedKey
    const next = clampCalendarDate(selectionChanged && selectionAnchor ? selectionAnchor : focusedDate, minDate, maxDate)
    if (!next) return
    if (selectionChanged || compareCalendarDates(next, focusedDate) !== 0 || !calendarMonthHasAvailableDate(month, minDate, maxDate) || (view === 'years' && !calendarYearHasAvailableDate(yearFocus, minDate, maxDate))) {
      setFocusedDate(next); setMonth(startOfCalendarMonth(next)); setMonthFocus(next.getMonth()); setYearFocus(next.getFullYear()); setYearPage(calendarYearPageStart(next.getFullYear()))
      if (rootRef.current?.contains(document.activeElement) && document.activeElement?.matches('.ui-calendar-day,.ui-calendar-period-option')) pendingFocus.current = view === 'years' ? `button[data-year="${next.getFullYear()}"]` : view === 'months' ? `button[data-month="${next.getMonth()}"]` : `button[data-date="${calendarDateKey(next)}"]`
    }
    // Primitive day keys avoid resynchronizing when parents recreate equivalent Date objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, minKey, maxKey])

  useEffect(() => {
    // Hiding a previously focused adjacent-month day must retain one visible tab stop.
    if (showOutsideDays || !visibleFocused || dayFocusKey === focusedKey) return
    if (focusWithin.current) pendingFocus.current = `button[data-date="${dayFocusKey}"]`
    setFocusedDate(visibleFocused)
    // Equivalent date objects are intentionally represented by their local day keys.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOutsideDays, dayFocusKey, focusedKey])

  useEffect(() => {
    const selector = pendingFocus.current
    if (!selector) return
    pendingFocus.current = null
    rootRef.current?.querySelector<HTMLButtonElement>(selector)?.focus()
  }, [focusedKey, monthKey, view, monthFocus, yearFocus, yearPage])

  function focusDay(date: Date, transfer = true) {
    const next = clampCalendarDate(date, minDate, maxDate)
    if (!next || disabled) return
    if (transfer) pendingFocus.current = `button[data-date="${calendarDateKey(next)}"]`
    setFocusedDate(next); setMonth(startOfCalendarMonth(next))
    if (partialRange) setPreviewDate(next)
  }
  function openMonths() {
    if (disabled) return
    if (view === 'months') { pendingFocus.current = '[data-calendar-month-trigger]'; setView('days'); return }
    const available = Array.from({ length: 12 }, (_, index) => index).filter((index) => calendarMonthHasAvailableDate(createCalendarDate(month.getFullYear(), index, 1), minDate, maxDate))
    const next = available.includes(month.getMonth()) ? month.getMonth() : available[0]
    if (next === undefined) return
    setMonthFocus(next); pendingFocus.current = `button[data-month="${next}"]`; setView('months')
  }
  function openYears() {
    if (disabled) return
    if (view === 'years') { pendingFocus.current = '[data-calendar-year-trigger]'; setView('days'); return }
    if (!focused) return
    const year = month.getFullYear()
    setYearPage(calendarYearPageStart(year)); setYearFocus(year); pendingFocus.current = `button[data-year="${year}"]`; setView('years')
  }
  function moveYearFocus(year: number) {
    if (!focused || disabled) return
    const next = Math.max(minDate.getFullYear(), Math.min(maxDate.getFullYear(), Math.max(1, Math.min(9999, year))))
    if (!calendarYearHasAvailableDate(next, minDate, maxDate)) return
    setYearPage(calendarYearPageStart(next)); setYearFocus(next); pendingFocus.current = `button[data-year="${next}"]`
  }
  function changeMonth(direction: -1 | 1) {
    if (view === 'years') { moveYearFocus(yearFocus + direction * 12); return }
    const amount = direction * (view === 'months' ? 12 : 1)
    const visibleFocus = addCalendarMonths(focusedDate, (month.getFullYear() - focusedDate.getFullYear()) * 12 + month.getMonth() - focusedDate.getMonth())
    const next = clampCalendarDate(addCalendarMonths(visibleFocus, amount), minDate, maxDate)
    if (!next || disabled) return
    setMonth(startOfCalendarMonth(next)); setFocusedDate(next); setMonthFocus(next.getMonth())
  }
  function moveMonthFocus(index: number) {
    const next = clampCalendarDate(createCalendarDate(month.getFullYear(), index, 1), minDate, maxDate)
    if (!next || disabled) return
    setMonth(startOfCalendarMonth(next)); setMonthFocus(next.getMonth()); pendingFocus.current = `button[data-month="${next.getMonth()}"]`
  }
  function handlePickerKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return
    const rtl = rootRef.current && getComputedStyle(rootRef.current).direction === 'rtl'
    const delta = event.key === 'ArrowLeft' ? (rtl ? 1 : -1) : event.key === 'ArrowRight' ? (rtl ? -1 : 1) : event.key === 'ArrowUp' ? -3 : event.key === 'ArrowDown' ? 3 : event.key === 'Home' ? -(index % 3) : event.key === 'End' ? 2 - index % 3 : event.key === 'PageUp' ? -12 : event.key === 'PageDown' ? 12 : null
    if (delta === null) return
    event.preventDefault()
    if (view === 'years') moveYearFocus(years[index] + delta)
    else moveMonthFocus(index + delta)
  }
  function selectMonth(index: number) {
    const candidate = addCalendarMonths(focusedDate, (month.getFullYear() - focusedDate.getFullYear()) * 12 + index - focusedDate.getMonth())
    setView('days'); focusDay(candidate)
  }
  function selectYear(year: number) {
    const candidate = clampCalendarDate(addCalendarMonths(focusedDate, (year - focusedDate.getFullYear()) * 12), minDate, maxDate)
    if (!candidate) return
    setMonth(startOfCalendarMonth(candidate)); setFocusedDate(candidate); setMonthFocus(candidate.getMonth()); setView('months'); pendingFocus.current = `button[data-month="${candidate.getMonth()}"]`
  }
  function handleDayKey(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey) return
    const rtl = rootRef.current && getComputedStyle(rootRef.current).direction === 'rtl'
    let next: Date | undefined
    switch (event.key) {
      case 'ArrowLeft': next = addCalendarDays(date, rtl ? 1 : -1); break
      case 'ArrowRight': next = addCalendarDays(date, rtl ? -1 : 1); break
      case 'ArrowUp': next = addCalendarDays(date, -7); break
      case 'ArrowDown': next = addCalendarDays(date, 7); break
      case 'Home': next = addCalendarDays(date, -calendarWeekdayIndex(date, weekStartsOn)); break
      case 'End': next = addCalendarDays(date, 6 - calendarWeekdayIndex(date, weekStartsOn)); break
      case 'PageUp': next = addCalendarMonths(date, event.shiftKey ? -12 : -1); break
      case 'PageDown': next = addCalendarMonths(date, event.shiftKey ? 12 : 1); break
      default: return
    }
    event.preventDefault(); focusDay(next)
  }
  function selectDay(date: Date) {
    if (disabled || !isCalendarDateInRange(date, minDate, maxDate)) return
    const next = normalizeCalendarDate(date)!
    if (props.mode === 'range') {
      const nextRange = selectCalendarRangeDate(range, next)
      previousSelection.current = `${calendarDateKey(nextRange.start) ?? ''}/${calendarDateKey(nextRange.end) ?? ''}`
      if (props.value === undefined) setInternalRange(nextRange)
      props.onValueChange?.(nextRange)
    } else { previousSelection.current = calendarDateKey(next); if (props.value === undefined) setInternalValue(next); props.onValueChange?.(next) }
    setPreviewDate(null); focusDay(next)
  }
  const previousAvailable = view === 'years' ? getCalendarYearPage(yearPage - 12).some((year) => year < yearPage && calendarYearHasAvailableDate(year, minDate, maxDate)) : view === 'months' ? calendarYearHasAvailableDate(month.getFullYear() - 1, minDate, maxDate) : calendarMonthHasAvailableDate(addCalendarMonths(month, -1), minDate, maxDate)
  const nextAvailable = view === 'years' ? yearPage + 12 <= 9999 && getCalendarYearPage(yearPage + 12).some((year) => calendarYearHasAvailableDate(year, minDate, maxDate)) : view === 'months' ? calendarYearHasAvailableDate(month.getFullYear() + 1, minDate, maxDate) : calendarMonthHasAvailableDate(addCalendarMonths(month, 1), minDate, maxDate)
  const navigationUnit = view === 'years' ? '12년' : view === 'months' ? '해' : '달'

  return <div ref={rootRef} className={cn('ui-calendar', className)} role="group" aria-label={ariaLabel} aria-describedby={describedBy} data-disabled={disabled || undefined} data-mode={props.mode ?? 'single'} data-view={view} data-variant={variant} data-size={size} data-day-shape={dayShape} data-week-start={weekStartsOn} onFocusCapture={() => { focusWithin.current = true }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) focusWithin.current = false }} onKeyDown={(event) => {
    if (event.key === 'Escape' && view !== 'days') { event.preventDefault(); event.stopPropagation(); pendingFocus.current = view === 'years' ? '[data-calendar-year-trigger]' : '[data-calendar-month-trigger]'; setView('days') }
  }}>
    <div className="ui-calendar-heading">
      <button type="button" className="ui-calendar-navigation" aria-label={`이전 ${navigationUnit}`} disabled={disabled || !previousAvailable} onClick={() => changeMonth(-1)}><ChevronLeft aria-hidden="true" /></button>
      <div className="ui-calendar-period">
        <button type="button" className="ui-calendar-period-button" data-calendar-year-trigger aria-label={`연도 선택 · ${yearText}`} aria-expanded={view === 'years'} aria-controls={`${id}-grid`} disabled={disabled || !focused} onClick={openYears}>{yearText}<ChevronDown aria-hidden="true" /></button>
        <button type="button" className="ui-calendar-period-button" data-calendar-month-trigger aria-label={`월 선택 · ${monthText}`} aria-expanded={view === 'months'} aria-controls={`${id}-grid`} disabled={disabled || !focused} onClick={openMonths}>{monthText}<ChevronDown aria-hidden="true" /></button>
      </div>
      <button type="button" className="ui-calendar-navigation" aria-label={`다음 ${navigationUnit}`} disabled={disabled || !nextAvailable} onClick={() => changeMonth(1)}><ChevronRight aria-hidden="true" /></button>
    </div>
    <span id={`${id}-month`} className={view === 'days' ? 'ui-calendar-sr-only' : 'ui-calendar-picker-title'} aria-live="polite" aria-atomic="true">{gridTitle}</span>
    {view === 'days' ? <div id={`${id}-grid`} role="grid" className="ui-calendar-grid" aria-labelledby={`${id}-month`} aria-describedby={`${id}-instructions`} aria-multiselectable={props.mode === 'range' || undefined} aria-disabled={disabled || !focused || undefined} onPointerLeave={() => setPreviewDate(null)}>
      <div role="row" className="ui-calendar-week">{weekdays.map((day, index) => <span role="columnheader" className="ui-calendar-weekday" key={index} aria-label={fullWeekday.format(day)}>{shortWeekday.format(day)}</span>)}</div>
      {Array.from({ length: days.length / 7 }, (_, week) => <div role="row" className="ui-calendar-week" key={week}>{days.slice(week * 7, week * 7 + 7).map((date) => {
        const key = calendarDateKey(date)!
        const outside = date.getMonth() !== month.getMonth() || date.getFullYear() !== month.getFullYear()
        if (outside && !showOutsideDays) return <span role="gridcell" key={key} className="ui-calendar-empty-day" aria-disabled="true" />
        const unavailable = disabled || !isCalendarDateInRange(date, minDate, maxDate)
        const isStart = Boolean(range.start && compareCalendarDates(date, range.start) === 0)
        const isEnd = Boolean(range.end && compareCalendarDates(date, range.end) === 0)
        const inRange = Boolean(range.start && range.end && isCalendarDateInRange(date, range.start, range.end))
        const previewing = Boolean(partialRange && previewDate && visualRange.start && visualRange.end && isCalendarDateInRange(date, visualRange.start, visualRange.end))
        const isSelected = props.mode === 'range' ? inRange || isStart : key === selectedKey
        const isToday = compareCalendarDates(date, today) === 0
        const metadata = dayData?.[key]
        const count = metadata?.count === undefined ? undefined : Number.isFinite(metadata.count) ? Math.max(0, Math.floor(metadata.count)) : 0
        const markerCount = count ?? (metadata ? 1 : 0)
        const metadataLabel = metadata ? [metadata.label, count !== undefined && count > 0 ? `${dayNumber.format(count)}${variant === 'activity' ? '회 활동' : '개 일정'}` : null, metadata.completed === true ? '완료' : metadata.completed === false ? '미완료' : null].filter(Boolean).join(' · ') : ''
        const activityComplete = variant === 'activity' && metadata?.completed === true
        return <span role="gridcell" key={key} aria-selected={isSelected} aria-disabled={unavailable || undefined} data-in-range={inRange || undefined} data-range-preview={previewing || undefined} data-range-start={isStart || undefined} data-range-end={isEnd || undefined}>
          <button type="button" className="ui-calendar-day" data-date={key} data-selected={isSelected || undefined} data-range-edge={isStart || isEnd || undefined} data-today={isToday || undefined} data-outside={outside || undefined} data-has-data={Boolean(metadata) || undefined} data-completed={metadata?.completed} data-tone={metadata?.tone ?? 'neutral'} aria-label={`${fullDate.format(date)}${metadataLabel ? ` · ${metadataLabel}` : ''}`} title={metadataLabel || undefined} aria-current={isToday ? 'date' : undefined} disabled={unavailable} tabIndex={!unavailable && key === dayFocusKey ? 0 : -1} onFocus={() => { setFocusedDate(date); if (partialRange) setPreviewDate(date) }} onPointerEnter={() => { if (partialRange && !unavailable) setPreviewDate(date) }} onKeyDown={(event) => handleDayKey(event, date)} onClick={() => selectDay(date)}>
            <span className="ui-calendar-day-content" aria-hidden="true">
              {activityComplete ? <span className="ui-calendar-activity-icon">{metadata.icon ?? <Check />}</span> : <span className="ui-calendar-day-number">{dayNumber.format(date.getDate())}</span>}
              {variant !== 'activity' && (markerCount > 0 || variant === 'schedule') ? <span className="ui-calendar-day-markers">{Array.from({ length: markerCount > 3 ? 1 : markerCount }, (_, index) => <span className="ui-calendar-event-dot" key={index} />)}{markerCount > 3 ? <span className="ui-calendar-event-count">{markerCount > 99 ? '99+' : dayNumber.format(markerCount)}</span> : null}</span> : null}
            </span>
          </button>
        </span>
      })}</div>)}
    </div> : <div id={`${id}-grid`} role="grid" className="ui-calendar-period-grid" aria-labelledby={`${id}-month`} aria-describedby={`${id}-instructions`} aria-disabled={disabled || !focused || undefined}>
      {Array.from({ length: view === 'months' ? 4 : Math.ceil(years.length / 3) }, (_, row) => <div role="row" className="ui-calendar-period-row" key={row}>{Array.from({ length: Math.min(3, (view === 'months' ? 12 : years.length) - row * 3) }, (_, column) => {
        const index = row * 3 + column
        const option = view === 'months' ? index : years[index]
        const available = view === 'months' ? calendarMonthHasAvailableDate(createCalendarDate(month.getFullYear(), option, 1), minDate, maxDate) : calendarYearHasAvailableDate(option, minDate, maxDate)
        const active = view === 'months' ? option === month.getMonth() : option === month.getFullYear()
        const focusedOption = view === 'months' ? option === monthFocus : option === yearFocus
        return <span role="gridcell" key={option} aria-selected={active} aria-disabled={!available || disabled || undefined}><button type="button" className="ui-calendar-period-option" data-month={view === 'months' ? option : undefined} data-year={view === 'years' ? option : undefined} data-selected={active || undefined} disabled={disabled || !available} tabIndex={!disabled && available && focusedOption ? 0 : -1} onFocus={() => view === 'months' ? setMonthFocus(option) : setYearFocus(option)} onKeyDown={(event) => handlePickerKey(event, index)} onClick={() => view === 'months' ? selectMonth(option) : selectYear(option)}>{view === 'months' ? monthFormatter.format(createCalendarDate(month.getFullYear(), option, 1)) : yearNumber.format(option)}</button></span>
      })}</div>)}
    </div>}
    <p id={`${id}-instructions`} className="ui-calendar-instructions">{view === 'days' ? '방향키로 이동 · Enter로 선택 · 상단 년·월로 빠르게 이동' : '방향키로 이동 · Enter로 선택 · Escape로 날짜 보기'}</p>
    {props.mode === 'range' ? <p className="ui-calendar-range-status" role="status" aria-live="polite">{rangeDescription}</p> : null}
  </div>
}
