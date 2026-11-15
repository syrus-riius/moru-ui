import { useI18n } from '../../lib/i18n'
import { useEffect, useId, useRef, useState, type AriaAttributes } from 'react'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { TimeFieldRegistrationContext } from './time-field-context'
import { TimePicker } from './time-picker'
import {
  getTimeRangeDuration,
  getTimeRangeError,
  normalizeTimeRange,
  parseTime,
  subscribeTimeFormReset,
  type TimeRangeValue,
} from './time-utils'
import './time-shared.css'
import './time-range-picker.css'

export type { TimeRangeValue } from './time-utils'
export interface TimeRangePickerProps {
  value?: TimeRangeValue
  defaultValue?: TimeRangeValue
  onValueChange?: (value: TimeRangeValue) => void
  label?: string
  startLabel?: string
  endLabel?: string
  /** A name produces `${name}.start` and `${name}.end` native form entries. */
  name?: string
  startName?: string
  endName?: string
  form?: string
  required?: boolean
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  min?: string
  max?: string
  step?: number
  allowOvernight?: boolean
  size?: 'sm' | 'md' | 'lg'
  clearable?: boolean
  error?: string
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

/** A paired wall-clock range. Cross-midnight schedules require explicit opt-in. */
export function TimeRangePicker({
  value,
  defaultValue,
  onValueChange,
  label,
  startLabel: startLabelProp,
  endLabel: endLabelProp,
  name,
  startName,
  endName,
  form,
  required,
  disabled,
  loading = false,
  readOnly,
  min,
  max,
  step = 1,
  allowOvernight = false,
  size = 'md',
  clearable = true,
  error,
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: TimeRangePickerProps) {
  const { t } = useI18n()
  const startLabel = startLabelProp ?? t('시작 시간')
  const endLabel = endLabelProp ?? t('종료 시간')

  const generatedId = useId()
  const unavailable = disabled || loading
  const field = useFieldContext()
  const [internal, setInternal] = useState<TimeRangeValue>(() => normalizeTimeRange(defaultValue))
  const current = normalizeTimeRange(value === undefined ? internal : value)
  const startRef = useRef<HTMLInputElement>(null)
  const resetState = useRef({ value, defaultValue })
  resetState.current = { value, defaultValue }
  const rangeError =
    !unavailable && !readOnly
      ? error || t(getTimeRangeError(current, allowOvernight) ?? '') || undefined
      : undefined
  const duration = getTimeRangeDuration(current, allowOvernight)
  const overnight = duration !== null && parseTime(current.end)! < parseTime(current.start)!
  const summaryId = `${generatedId}-summary`
  const startId = id ?? field?.controlId ?? `${generatedId}-start`
  const endId = `${generatedId}-end`
  const groupLabelledBy =
    labelledBy ??
    (ariaLabel ? undefined : (field?.labelId ?? (label ? `${generatedId}-label` : undefined)))

  useEffect(() => {
    const owner = startRef.current?.form
    if (!owner) return
    return subscribeTimeFormReset(owner, () => {
      if (resetState.current.value === undefined)
        setInternal(normalizeTimeRange(resetState.current.defaultValue))
    })
  }, [form])

  function change(part: 'start' | 'end', next: string | null) {
    if (unavailable || readOnly) return
    const updated = { ...current, [part]: next }
    if (value === undefined) setInternal(updated)
    onValueChange?.(updated)
  }
  return (
    <div
      className={cn('ui-time-range-picker', className)}
      role="group"
      data-size={size}
      data-disabled={unavailable || undefined}
      aria-busy={loading || undefined}
      aria-label={ariaLabel ?? (!groupLabelledBy ? (label ?? t('시간 범위')) : undefined)}
      aria-labelledby={groupLabelledBy}
      aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, summaryId)}
      aria-invalid={rangeError ? true : (invalid ?? (field?.invalid || undefined))}
    >
      {label ? (
        <span className="ui-time-range-label" id={`${generatedId}-label`}>
          {label}
        </span>
      ) : null}
      <div className="ui-time-range-inputs">
        <TimeFieldRegistrationContext value={true}>
          <TimePicker
            ref={startRef}
            id={startId}
            label={startLabel}
            name={startName ?? (name ? `${name}.start` : undefined)}
            form={form}
            value={current.start}
            onValueChange={(next) => change('start', next)}
            min={min}
            max={max}
            step={step}
            required={required || current.end !== null}
            disabled={disabled}
            loading={loading}
            readOnly={readOnly}
            size={size}
            clearable={clearable}
            aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, summaryId)}
            aria-invalid={invalid}
          />
        </TimeFieldRegistrationContext>
        <span className="ui-time-range-divider" aria-hidden="true">
          –
        </span>
        <TimeFieldRegistrationContext value={false}>
          <TimePicker
            id={endId}
            label={overnight ? t('{v0} · 다음 날', { v0: endLabel }) : endLabel}
            name={endName ?? (name ? `${name}.end` : undefined)}
            form={form}
            value={current.end}
            onValueChange={(next) => change('end', next)}
            min={min}
            max={max}
            step={step}
            required={required || current.start !== null}
            disabled={disabled}
            loading={loading}
            readOnly={readOnly}
            size={size}
            clearable={clearable}
            error={rangeError}
            aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, summaryId)}
            aria-invalid={invalid}
          />
        </TimeFieldRegistrationContext>
      </div>
      <p id={summaryId} className="ui-time-range-summary" role="status">
        {duration === null
          ? allowOvernight
            ? t('시작과 종료를 선택하세요. 자정을 지나면 다음 날 종료로 계산합니다.')
            : t('같은 날 안에서 시작과 종료를 선택하세요.')
          : t('총 {v0}{v1} · {v2}', {
              v0: Math.floor(duration / 60) ? t('{v0}시간', { v0: Math.floor(duration / 60) }) : '',
              v1:
                duration % 60
                  ? t('{v0}{v1}분', { v0: Math.floor(duration / 60) ? ' ' : '', v1: duration % 60 })
                  : '',
              v2: overnight ? t('다음 날 종료') : t('같은 날'),
            })}
      </p>
    </div>
  )
}
