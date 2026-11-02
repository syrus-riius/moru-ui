import { useEffect, useId, useRef, useState, type AriaAttributes } from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Field as BaseField } from '@base-ui/react/field'
import { CalendarDays } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Calendar } from './calendar'
import type { CalendarDisplayOptions } from './calendar-options'
import { calendarDateKey, normalizeCalendarDate, resolveCalendarLocale } from './calendar-utils'
import { parseDatePickerFormValue, subscribeDatePickerFormReset } from './date-picker-form-utils'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './overlays.css'
import './calendar.css'
import './date-picker-form.css'

export interface DatePickerProps {
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (value: Date | null) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  form?: string
  minDate?: Date
  maxDate?: Date
  locale?: string
  clearable?: boolean
  /** Customize the popup calendar without replacing value, constraints, or selection behavior. */
  calendarOptions?: CalendarDisplayOptions
  className?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

export function DatePicker({
  value, defaultValue, onValueChange, label, placeholder = '날짜를 선택해주세요', disabled = false, loading = false,
  readOnly = false, required = false, name, form,
  minDate, maxDate, locale = 'ko-KR', clearable = true, calendarOptions, className, id,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, 'aria-invalid': invalid,
}: DatePickerProps) {
  const generatedId = useId()
  const unavailable = disabled || loading
  const field = useFieldContext()
  const portalContainer = useThemePortalContainer()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<Date | null>(() => normalizeCalendarDate(defaultValue) ?? null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)
  const resetState = useRef({ value, defaultValue })
  resetState.current = { value, defaultValue }
  const selected = normalizeCalendarDate(value === undefined ? internalValue : value) ?? null
  const selectedKey = calendarDateKey(selected) ?? ''
  const minKey = calendarDateKey(minDate)
  const maxKey = calendarDateKey(maxDate)
  const controlId = id ?? field?.controlId ?? `${generatedId}-trigger`
  const visibleLabel = field ? undefined : label
  const selectedText = selected
    ? new Intl.DateTimeFormat(resolveCalendarLocale(locale), { year: 'numeric', month: 'long', day: 'numeric' }).format(selected)
    : placeholder

  useEffect(() => {
    if (unavailable || readOnly) setOpen(false)
  }, [unavailable, readOnly])

  useEffect(() => {
    const ownerForm = inputRef.current?.form
    if (!ownerForm) return
    return subscribeDatePickerFormReset(ownerForm, () => {
      if (resetState.current.value === undefined) setInternalValue(normalizeCalendarDate(resetState.current.defaultValue) ?? null)
      setValidationMessage(null)
      setOpen(false)
    })
  }, [form])

  useEffect(() => { setValidationMessage(null) }, [selectedKey, minKey, maxKey, required, unavailable, readOnly])

  function changeValue(next: Date | null) {
    if (unavailable || readOnly) return
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
    setValidationMessage(null)
    setOpen(false)
  }

  const trigger = (
    <BasePopover.Trigger
      ref={triggerRef}
      {...(!field ? { id: controlId } : {})}
      className="ui-date-picker-trigger"
      disabled={unavailable}
      aria-disabled={readOnly || undefined} aria-busy={loading || undefined}
      aria-label={ariaLabel ?? (!field && !visibleLabel && !labelledBy ? '날짜 선택' : undefined)}
      {...(labelledBy ? { 'aria-labelledby': labelledBy } : {})}
      aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, `${generatedId}-value`, required || readOnly ? `${generatedId}-requirements` : undefined, validationMessage ? `${generatedId}-validation` : undefined)}
      aria-invalid={validationMessage ? true : (invalid ?? (field?.invalid || undefined))}
      data-placeholder={!selected || undefined}
    >
      {loading ? <span className="ui-loading-indicator" aria-hidden="true" /> : <CalendarDays aria-hidden="true" />}
      <span id={`${generatedId}-value`}>{selectedText}</span>
    </BasePopover.Trigger>
  )

  return (
    <div className={cn('ui-date-picker', className)}>
      {visibleLabel && <label className="ui-date-picker-label" htmlFor={controlId}>{visibleLabel}</label>}
      <input ref={inputRef} className="ui-date-picker-native-input" type="date" name={name} form={form} value={selectedKey} min={minKey} max={maxKey} disabled={unavailable} readOnly={readOnly} required={required} aria-hidden="true" tabIndex={-1}
        onChange={(event) => changeValue(parseDatePickerFormValue(event.currentTarget.value))}
        onInvalid={(event) => {
          // Keep native required/range validation, but surface the error at the visible button.
          event.preventDefault()
          const validity = event.currentTarget.validity
          setValidationMessage(validity.valueMissing ? '날짜를 선택해 주세요.' : validity.rangeUnderflow ? `${minKey} 이후의 날짜를 선택해 주세요.` : validity.rangeOverflow ? `${maxKey} 이전의 날짜를 선택해 주세요.` : '날짜를 확인해 주세요.')
          const ownerForm = event.currentTarget.form
          const firstInvalid = ownerForm ? Array.from(ownerForm.elements).find((element) => {
            const control = element as HTMLInputElement
            return control.willValidate && control.validity && !control.validity.valid
          }) : event.currentTarget
          if (firstInvalid === event.currentTarget) triggerRef.current?.focus()
        }} />
      {required || readOnly ? <span id={`${generatedId}-requirements`} className="ui-date-picker-requirements">{required ? '필수 항목. ' : ''}{readOnly ? '읽기 전용.' : ''}</span> : null}
      <BasePopover.Root open={open && !unavailable && !readOnly} onOpenChange={(next) => { if (!unavailable && !readOnly) setOpen(next) }}>
        {field ? <BaseField.Control render={trigger} value={selectedKey} id={controlId} disabled={unavailable} aria-labelledby={labelledBy ?? (ariaLabel ? undefined : field.labelId)} /> : trigger}
        <OverlayPortal portal={BasePopover.Portal} kind="popover" container={portalContainer}>
          <BasePopover.Positioner className="ui-popover-positioner" side="bottom" align="start" sideOffset={8} collisionPadding={12} collisionAvoidance={{ side: 'flip', align: 'shift', fallbackAxisSide: 'end' }}>
            <BasePopover.Popup
              className="ui-popover ui-date-picker-popup"
              data-calendar-size={calendarOptions?.size}
              aria-label={label ?? ariaLabel ?? '날짜 선택'}
              initialFocus={() => calendarRef.current?.querySelector<HTMLButtonElement>('.ui-calendar-day[tabindex="0"]') ?? calendarRef.current}
              finalFocus={triggerRef}
            >
              <div ref={calendarRef} tabIndex={-1} className="ui-date-picker-calendar">
                <Calendar {...calendarOptions} mode="single" value={selected} onValueChange={changeValue} minDate={minDate} maxDate={maxDate} locale={locale} />
              </div>
              <div className="ui-date-picker-actions">
                {clearable && <button type="button" className="ui-date-picker-action" disabled={!selected} onClick={() => changeValue(null)}>선택 지우기</button>}
                <BasePopover.Close className="ui-date-picker-action">닫기</BasePopover.Close>
              </div>
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </OverlayPortal>
      </BasePopover.Root>
      {validationMessage ? <p id={`${generatedId}-validation`} className="ui-date-picker-validation" role="alert">{validationMessage}</p> : null}
    </div>
  )
}
