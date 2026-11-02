import { useEffect, useId, useRef, useState, type AriaAttributes, type InvalidEvent } from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Field as BaseField } from '@base-ui/react/field'
import { CalendarDays } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Calendar, type CalendarRange } from './calendar'
import type { CalendarDisplayOptions } from './calendar-options'
import { calendarDateKey, resolveCalendarLocale } from './calendar-utils'
import { parseDatePickerFormValue, subscribeDatePickerFormReset } from './date-picker-form-utils'
import { dateRangeFieldNames, getDateRangeFormValues, getDateRangeIssue, getDateRangeNativeBounds, normalizeDateRange } from './date-range-picker-utils'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './overlays.css'
import './calendar.css'
import './date-picker-form.css'
import './date-range-picker.css'

export interface DateRangePickerProps {
  value?: CalendarRange | null
  defaultValue?: CalendarRange | null
  onValueChange?: (value: CalendarRange) => void
  /** Submits two values: `${name}.start` and `${name}.end`. */
  name?: string
  startName?: string
  endName?: string
  form?: string
  label?: string
  placeholder?: string
  required?: boolean
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  locale?: string
  clearable?: boolean
  /** Display options for the shared calendar; range value and validation remain owned by this picker. */
  calendarOptions?: CalendarDisplayOptions
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

/** A date-only range picker. A partial range remains open until its end is selected. */
export function DateRangePicker({
  value, defaultValue, onValueChange, name, startName, endName, form,
  label, placeholder = '기간을 선택해 주세요', required = false, minDate, maxDate,
  disabled = false, loading = false, readOnly = false, locale = 'ko-KR', clearable = true, calendarOptions, size = 'md', className, id,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, 'aria-invalid': invalid,
}: DateRangePickerProps) {
  const generatedId = useId()
  const unavailable = disabled || loading
  const field = useFieldContext()
  const portalContainer = useThemePortalContainer()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const startRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<CalendarRange>(() => normalizeDateRange(defaultValue))
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const resetState = useRef({ value, defaultValue })
  resetState.current = { value, defaultValue }
  const raw = value === undefined ? internalValue : value
  const selected = normalizeDateRange(raw)
  const keys = getDateRangeFormValues(selected)
  const minKey = calendarDateKey(minDate)
  const maxKey = calendarDateKey(maxDate)
  const names = dateRangeFieldNames(name, startName, endName)
  const bounds = getDateRangeNativeBounds(selected, minDate, maxDate)
  const issue = getDateRangeIssue(raw, { required, minDate, maxDate })
  const structuralMessage = issue && issue.kind !== 'missing' ? issue.message : null
  const message = validationMessage ?? structuralMessage
  const controlId = id ?? field?.controlId ?? `${generatedId}-trigger`
  const visibleLabel = field ? undefined : label
  const formatter = new Intl.DateTimeFormat(resolveCalendarLocale(locale), { year: 'numeric', month: 'long', day: 'numeric' })
  const selectedText = selected.start || selected.end
    ? `${selected.start ? formatter.format(selected.start) : '시작일 선택'} — ${selected.end ? formatter.format(selected.end) : '종료일 선택'}`
    : placeholder
  const completeRequired = required || Boolean(selected.start || selected.end)

  useEffect(() => { if (unavailable || readOnly) setOpen(false) }, [unavailable, readOnly])
  useEffect(() => {
    const ownerForm = startRef.current?.form
    if (!ownerForm) return
    return subscribeDatePickerFormReset(ownerForm, () => {
      if (resetState.current.value === undefined) setInternalValue(normalizeDateRange(resetState.current.defaultValue))
      setValidationMessage(null)
      setOpen(false)
    })
  }, [form])
  useEffect(() => { setValidationMessage(null) }, [keys.start, keys.end, minKey, maxKey, required, unavailable, readOnly])
  useEffect(() => {
    const validityMessage = unavailable || readOnly ? '' : issue?.message ?? ''
    startRef.current?.setCustomValidity(validityMessage)
    endRef.current?.setCustomValidity(validityMessage)
  }, [issue?.message, unavailable, readOnly])

  function changeValue(next: CalendarRange) {
    if (unavailable || readOnly) return
    const normalized = normalizeDateRange(next)
    if (value === undefined) setInternalValue(normalized)
    onValueChange?.(normalized)
    setValidationMessage(null)
    if (normalized.start && normalized.end) setOpen(false)
  }
  function onInvalid(event: InvalidEvent<HTMLInputElement>) {
    event.preventDefault()
    setValidationMessage(issue?.message ?? '시작일과 종료일을 확인해 주세요.')
    const ownerForm = event.currentTarget.form
    const firstInvalid = ownerForm ? Array.from(ownerForm.elements).find((element) => {
      const control = element as HTMLInputElement
      return control.willValidate && control.validity && !control.validity.valid
    }) : event.currentTarget
    if (firstInvalid === event.currentTarget) triggerRef.current?.focus()
  }
  const trigger = <BasePopover.Trigger ref={triggerRef} {...(!field ? { id: controlId } : {})} className="ui-date-picker-trigger ui-date-range-picker-trigger" data-size={size} disabled={unavailable} aria-disabled={readOnly || undefined} aria-busy={loading || undefined}
    aria-label={ariaLabel ?? (!field && !visibleLabel && !labelledBy ? '날짜 범위 선택' : undefined)} {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
    aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, `${generatedId}-value`, `${generatedId}-requirements`, message ? `${generatedId}-validation` : undefined)}
    aria-invalid={message ? true : (invalid ?? (field?.invalid || undefined))} data-placeholder={!selected.start && !selected.end || undefined}>
    {loading ? <span className="ui-loading-indicator" aria-hidden="true" /> : <CalendarDays aria-hidden="true" />}<span id={`${generatedId}-value`}>{selectedText}</span>
  </BasePopover.Trigger>

  return <div className={cn('ui-date-picker ui-date-range-picker', className)}>
    {visibleLabel && <label className="ui-date-picker-label" htmlFor={controlId}>{visibleLabel}</label>}
    <input ref={startRef} className="ui-date-picker-native-input" type="date" name={names.start} form={form} value={keys.start} min={bounds.startMin} max={bounds.startMax} disabled={unavailable} readOnly={readOnly} required={completeRequired} aria-hidden="true" tabIndex={-1} onChange={(event) => changeValue({ ...selected, start: parseDatePickerFormValue(event.currentTarget.value) })} onInvalid={onInvalid} />
    <input ref={endRef} className="ui-date-picker-native-input" type="date" name={names.end} form={form} value={keys.end} min={bounds.endMin} max={bounds.endMax} disabled={unavailable} readOnly={readOnly} required={completeRequired} aria-hidden="true" tabIndex={-1} onChange={(event) => changeValue({ ...selected, end: parseDatePickerFormValue(event.currentTarget.value) })} onInvalid={onInvalid} />
    <span id={`${generatedId}-requirements`} className="ui-date-picker-requirements">시작일과 종료일을 함께 선택합니다. {required ? '필수 항목. ' : ''}{readOnly ? '읽기 전용.' : ''}</span>
    <BasePopover.Root open={open && !unavailable && !readOnly} onOpenChange={(next) => { if (!unavailable && !readOnly) setOpen(next) }}>
      {field ? <BaseField.Control render={trigger} value={`${keys.start}/${keys.end}`} id={controlId} disabled={unavailable} aria-labelledby={labelledBy ?? (ariaLabel ? undefined : field.labelId)} /> : trigger}
      <OverlayPortal portal={BasePopover.Portal} kind="popover" container={portalContainer}>
        <BasePopover.Positioner className="ui-popover-positioner" side="bottom" align="start" sideOffset={8} collisionPadding={12} collisionAvoidance={{ side: 'flip', align: 'shift', fallbackAxisSide: 'end' }}>
          <BasePopover.Popup className="ui-popover ui-date-range-picker-popup" data-calendar-size={calendarOptions?.size ?? size} aria-label={label ?? ariaLabel ?? '날짜 범위 선택'} initialFocus={() => calendarRef.current?.querySelector<HTMLButtonElement>('.ui-calendar-day[tabindex="0"]') ?? calendarRef.current} finalFocus={triggerRef}>
            <div ref={calendarRef} tabIndex={-1} className="ui-date-picker-calendar"><Calendar {...calendarOptions} size={calendarOptions?.size ?? size} mode="range" value={selected} onValueChange={changeValue} minDate={minDate} maxDate={maxDate} disabled={unavailable || readOnly} locale={locale} /></div>
            <div className="ui-date-range-picker-summary" aria-live="polite">{selected.start && selected.end ? '기간 선택 완료' : selected.start ? '종료일을 선택해 주세요.' : '시작일을 선택해 주세요.'}</div>
            <div className="ui-date-picker-actions">
              {clearable && <button type="button" className="ui-date-picker-action" disabled={!selected.start && !selected.end} onClick={() => { changeValue({ start: null, end: null }); setOpen(false) }}>선택 지우기</button>}
              <BasePopover.Close className="ui-date-picker-action">닫기</BasePopover.Close>
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </OverlayPortal>
    </BasePopover.Root>
    {message ? <p id={`${generatedId}-validation`} className="ui-date-picker-validation" role="alert">{message}</p> : null}
  </div>
}
