'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, useContext, useEffect, useId, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from 'react'
import { Input as BaseInput } from '@base-ui/react/input'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { Clock3, X } from 'lucide-react'
import { cn } from './_lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import { TimeFieldRegistrationContext } from './time-field-context'
import { formatTime, getAvailableMinutes, getTimeValidationError, normalizeTime, normalizeTimeStep, parseTime, subscribeTimeFormReset, wrapTimeOptionIndex } from './time-utils'
import './overlays.css'
import './time-controls.css'

export interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'size' | 'step' | 'min' | 'max'> {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  label?: string
  min?: string
  max?: string
  /** Interval in minutes, from 1 to 60. The step base is min, or midnight. */
  step?: number
  size?: 'sm' | 'md' | 'lg'
  clearable?: boolean
  error?: string
  loading?: boolean
}

const pad = (value: number) => String(value).padStart(2, '0')

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker({
  value, defaultValue = null, onValueChange, label, min, max, step = 1, size = 'md', clearable = true, error,
  className, id, form, disabled, readOnly, required, loading = false, onChange, onBlur, onInvalid, onKeyDown,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}, forwardedRef) {
  const generatedId = useId()
  const field = useFieldContext()
  const registerWithField = useContext(TimeFieldRegistrationContext)
  const portal = useThemePortalContainer()
  const unavailable = disabled || loading
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [internal, setInternal] = useState<string | null>(() => normalizeTime(defaultValue))
  const [open, setOpen] = useState(false)
  const [validation, setValidation] = useState<string | null>(null)
  const selected = normalizeTime(value === undefined ? internal : value)
  const constraints = { min: normalizeTime(min) ?? undefined, max: normalizeTime(max) ?? undefined, step: normalizeTimeStep(step) }
  const availableHours = Array.from({ length: 24 }, (_, hour) => hour).filter((hour) => getAvailableMinutes(hour, constraints).length > 0)
  const initialMinutes = parseTime(selected)
  const [draftHour, setDraftHour] = useState(() => initialMinutes === null ? availableHours[0] ?? 0 : Math.floor(initialMinutes / 60))
  const [draftMinute, setDraftMinute] = useState(() => initialMinutes === null ? getAvailableMinutes(draftHour, constraints)[0] ?? 0 : initialMinutes % 60)
  const availableMinutes = getAvailableMinutes(draftHour, constraints)
  const controlId = id ?? (registerWithField ? field?.controlId : undefined) ?? `${generatedId}-input`
  const pickerLabel = label ?? ariaLabel ?? '시간'
  const labelId = `${generatedId}-label`
  const inputLabelledBy = labelledBy ?? (ariaLabel ? undefined : mergeDescriptionIds(field?.labelId, label ? labelId : undefined))
  const message = error || validation
  const computedError = !unavailable && !readOnly ? error || getTimeValidationError(selected, constraints) || '' : ''
  const resetState = useRef({ value, defaultValue, selected })
  resetState.current = { value, defaultValue, selected }
  useImperativeHandle(forwardedRef, () => inputRef.current!, [])

  useEffect(() => {
    inputRef.current?.setCustomValidity(computedError)
  }, [computedError, selected])
  useEffect(() => {
    const owner = inputRef.current?.form
    if (!owner) return
    return subscribeTimeFormReset(owner, () => {
      const next = resetState.current.value === undefined ? normalizeTime(resetState.current.defaultValue) : resetState.current.selected
      if (resetState.current.value === undefined) setInternal(next)
      if (inputRef.current) inputRef.current.value = next ?? ''
      setValidation(null); setOpen(false)
    })
  }, [form])
  useEffect(() => { if (unavailable || readOnly) setOpen(false) }, [unavailable, readOnly])
  useEffect(() => { setValidation(null) }, [selected, min, max, step, unavailable, readOnly])
  useEffect(() => { setOpen(false) }, [min, max, step])

  function change(next: string | null) {
    if (unavailable || readOnly) return
    if (value === undefined) setInternal(next)
    setValidation(null)
    onValueChange?.(next)
  }
  function openPicker(next: boolean) {
    if (unavailable || readOnly) return
    if (next) {
      const current = parseTime(selected)
      const hour = current !== null && availableHours.includes(Math.floor(current / 60)) ? Math.floor(current / 60) : availableHours[0] ?? 0
      const minutes = getAvailableMinutes(hour, constraints)
      setDraftHour(hour); setDraftMinute(current !== null && minutes.includes(current % 60) ? current % 60 : minutes[0] ?? 0)
    }
    setOpen(next)
  }
  function gridKey(event: KeyboardEvent<HTMLButtonElement>, choices: number[], current: number, select: (value: number) => void) {
    const grid = event.currentTarget.parentElement
    const columns = grid ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 4 : 4
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowDown' ? columns : event.key === 'ArrowUp' ? -columns : 0
    const index = choices.indexOf(current)
    const next = event.key === 'Home' ? choices[0] : event.key === 'End' ? choices.at(-1) : offset && choices.length ? choices[wrapTimeOptionIndex(Math.max(0, index) + offset, choices.length)] : undefined
    if (next === undefined) return
    event.preventDefault(); select(next)
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`button[data-value="${next}"]`)?.focus()
  }
  function chooseHour(hour: number) {
    setDraftHour(hour)
    const options = getAvailableMinutes(hour, constraints)
    if (!options.includes(draftMinute)) setDraftMinute(options[0] ?? 0)
  }
  const inputProps = {
    ...props, id: controlId, form, disabled: unavailable, readOnly, required, type: 'time', ref: inputRef,
    value: selected ?? '', min: constraints.min, max: constraints.max, step: constraints.step * 60,
    className: 'ui-time-picker-input',
    'aria-label': ariaLabel ?? (!field && !label ? '시간' : undefined),
    'aria-labelledby': inputLabelledBy,
    'aria-describedby': mergeDescriptionIds(describedBy, field?.describedBy, message ? `${generatedId}-error` : undefined),
    'aria-invalid': message ? true : invalid ?? (field?.invalid || undefined),
    'aria-busy': loading || undefined,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => { if (!unavailable && !readOnly) { change(normalizeTime(event.currentTarget.value)); onChange?.(event) } },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || unavailable || readOnly) return
      if (event.altKey && event.key === 'ArrowDown') { event.preventDefault(); openPicker(true) }
    },
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => { if (event.currentTarget.value && !event.currentTarget.validity.valid && !unavailable && !readOnly) setValidation(computedError || '시간을 확인해 주세요.'); onBlur?.(event) },
    onInvalid: (event: React.InvalidEvent<HTMLInputElement>) => {
      onInvalid?.(event)
      if (event.defaultPrevented) return
      event.preventDefault()
      setValidation(error || computedError || (event.currentTarget.validity.valueMissing ? '시간을 선택해 주세요.' : '시간을 확인해 주세요.'))
      const owner = event.currentTarget.form
      const first = owner ? Array.from(owner.elements).find((element) => { const input = element as HTMLInputElement; return input.willValidate && input.validity && !input.validity.valid }) : event.currentTarget
      if (first === event.currentTarget) inputRef.current?.focus()
    },
  }
  return <div className={cn('ui-time-picker', className)} data-size={size} data-disabled={unavailable || undefined} data-loading={loading || undefined} aria-busy={loading || undefined}>
    {label ? <label className="ui-time-picker-label" id={labelId} htmlFor={controlId}>{label}</label> : null}
    <BasePopover.Root open={open && !unavailable && !readOnly} onOpenChange={openPicker}>
      <div className="ui-time-picker-control">
        {registerWithField ? <BaseInput {...inputProps} /> : <input {...inputProps} />}
        {clearable && selected && !readOnly ? <button type="button" className="ui-time-picker-action" aria-label={`${pickerLabel} 지우기`} disabled={unavailable} onClick={() => { change(null); inputRef.current?.focus() }}><X size={14} aria-hidden="true" /></button> : null}
        <BasePopover.Trigger className="ui-time-picker-action" aria-label={`${pickerLabel} 선택 열기`} disabled={unavailable || readOnly}>{loading ? <span className="ui-loading-indicator" aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />}</BasePopover.Trigger>
      </div>
      <OverlayPortal portal={BasePopover.Portal} kind="popover" container={portal}><BasePopover.Positioner className="ui-popover-positioner" side="bottom" align="start" sideOffset={8} collisionPadding={12}><BasePopover.Popup className="ui-popover ui-time-picker-popup" aria-label={`${pickerLabel} 선택`} initialFocus={() => panelRef.current?.querySelector<HTMLButtonElement>('[data-current="true"]') ?? panelRef.current} finalFocus={() => inputRef.current}>
        <div ref={panelRef} tabIndex={-1} className="ui-time-picker-panel">
          <header><strong>시간 선택</strong><span>{pad(draftHour)}:{pad(draftMinute)}</span></header>
          <div className="ui-time-picker-columns">
            <section><h4 id={`${generatedId}-hours`}>시 · 24시간</h4><div className="ui-time-picker-grid" role="group" aria-labelledby={`${generatedId}-hours`}>{Array.from({ length: 24 }, (_, hour) => <button key={hour} type="button" data-value={hour} data-current={draftHour === hour || undefined} aria-label={`${hour}시`} aria-pressed={draftHour === hour} disabled={!availableHours.includes(hour)} tabIndex={draftHour === hour && availableHours.includes(hour) ? 0 : -1} onClick={() => chooseHour(hour)} onKeyDown={(event) => gridKey(event, availableHours, hour, chooseHour)}>{pad(hour)}</button>)}</div></section>
            <section><h4 id={`${generatedId}-minutes`}>분 · {constraints.step}분 간격</h4><div className="ui-time-picker-grid" role="group" aria-labelledby={`${generatedId}-minutes`}>{availableMinutes.length ? availableMinutes.map((minute) => <button key={minute} type="button" data-value={minute} data-current={draftMinute === minute || undefined} aria-label={`${minute}분`} aria-pressed={draftMinute === minute} tabIndex={draftMinute === minute ? 0 : -1} onClick={() => setDraftMinute(minute)} onKeyDown={(event) => gridKey(event, availableMinutes, minute, setDraftMinute)}>{pad(minute)}</button>) : <p>선택 가능한 시간이 없어요.</p>}</div></section>
          </div>
          <footer><BasePopover.Close className="ui-time-picker-text-action">취소</BasePopover.Close><button type="button" className="ui-time-picker-apply" disabled={!availableMinutes.includes(draftMinute)} onClick={() => { change(formatTime(draftHour * 60 + draftMinute)); setOpen(false) }}>시간 적용</button></footer>
        </div>
      </BasePopover.Popup></BasePopover.Positioner></OverlayPortal>
    </BasePopover.Root>
    {message ? <p id={`${generatedId}-error`} className="ui-time-picker-error" role="alert">{message}</p> : null}
  </div>
})
