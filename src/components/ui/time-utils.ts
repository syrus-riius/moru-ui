export interface TimeRangeValue { start: string | null; end: string | null }
export interface TimeConstraints { min?: string; max?: string; step?: number }

/** Wall-clock minutes, deliberately independent of Date, UTC and time zones. */
export function parseTime(value: unknown): number | null {
  if (typeof value !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
  const [hour, minute] = value.split(':').map(Number)
  return hour * 60 + minute
}

export function formatTime(minutes: number): string | null {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 1440) return null
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function normalizeTime(value: unknown): string | null { return parseTime(value) === null ? null : value as string }
export function normalizeTimeStep(step?: number): number { return typeof step === 'number' && Number.isFinite(step) ? Math.max(1, Math.min(60, Math.floor(step))) : 1 }
export function normalizeTimeRange(value?: Partial<TimeRangeValue> | null): TimeRangeValue { return { start: normalizeTime(value?.start), end: normalizeTime(value?.end) } }
export function wrapTimeOptionIndex(index: number, count: number): number { return count > 0 ? ((index % count) + count) % count : 0 }

/** Reversed time bounds describe the native periodic interval across midnight. */
export function isTimeWithinBounds(value: string, { min, max }: TimeConstraints = {}): boolean {
  const minutes = parseTime(value)
  if (minutes === null) return false
  const lower = parseTime(min)
  const upper = parseTime(max)
  if (lower !== null && upper !== null && lower > upper) return minutes >= lower || minutes <= upper
  return (lower === null || minutes >= lower) && (upper === null || minutes <= upper)
}

export function getTimeValidationError(value: string | null, constraints: TimeConstraints = {}): string | null {
  if (value === null || value === '') return null
  const minutes = parseTime(value)
  if (minutes === null) return '시간은 00:00부터 23:59까지 HH:mm 형식으로 입력해 주세요.'
  if (!isTimeWithinBounds(value, constraints)) {
    const lower = normalizeTime(constraints.min)
    const upper = normalizeTime(constraints.max)
    return lower && upper ? `${lower}–${upper} 범위의 시간을 선택해 주세요.${parseTime(lower)! > parseTime(upper)! ? ' 자정을 지나는 범위입니다.' : ''}`
      : lower ? `${lower} 이후 시간을 선택해 주세요.` : `${upper} 이전 시간을 선택해 주세요.`
  }
  const step = normalizeTimeStep(constraints.step)
  const base = parseTime(constraints.min) ?? 0
  if (((minutes - base) % step + step) % step !== 0) return `${step}분 간격의 시간을 선택해 주세요.`
  return null
}

export function getAvailableMinutes(hour: number, constraints: TimeConstraints = {}): number[] {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return []
  return Array.from({ length: 60 }, (_, minute) => minute).filter((minute) => getTimeValidationError(formatTime(hour * 60 + minute), constraints) === null)
}

export function getTimeRangeDuration(value: TimeRangeValue, allowOvernight = false): number | null {
  const start = parseTime(value.start)
  const end = parseTime(value.end)
  if (start === null || end === null || start === end || (!allowOvernight && end < start)) return null
  return end > start ? end - start : 1440 - start + end
}

export function getTimeRangeError(value: TimeRangeValue, allowOvernight = false): string | null {
  if (value.start === null || value.end === null) return null
  const start = parseTime(value.start)
  const end = parseTime(value.end)
  if (start === null || end === null) return '시작과 종료 시간을 확인해 주세요.'
  if (start === end) return '시작과 종료 시간을 다르게 선택해 주세요.'
  return end < start && !allowOvernight ? '종료 시간은 시작 시간보다 늦어야 해요.' : null
}

/** @internal Reset after ancestor handlers, respecting preventDefault and unmount. */
export function subscribeTimeFormReset(form: EventTarget, onReset: () => void) {
  let subscribed = true
  function reset(event: Event) { queueMicrotask(() => { if (subscribed && !event.defaultPrevented) onReset() }) }
  form.addEventListener('reset', reset)
  return () => { subscribed = false; form.removeEventListener('reset', reset) }
}
