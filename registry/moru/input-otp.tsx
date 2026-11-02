'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cn } from './_lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { insertOTP, normalizeOTP, normalizeOTPLength, subscribeOTPFormReset } from './input-otp-utils'
import type { UIState } from './state'
import './controls-completion.css'

export type InputOTPProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange' | 'maxLength' | 'type' | 'inputMode' | 'pattern'> & {
  length?: number
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}

/** One real input preserves native selection, keyboard editing and one-time-code autofill. */
export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP({ length = 6, value, defaultValue = '', onValueChange, onComplete, size = 'md', className, id, disabled, loading = false, previewState, readOnly, autoComplete = 'one-time-code', onSelect, onFocus, onBlur, onPaste, style, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props }, forwardedRef) {
  const field = useFieldContext()
  const count = normalizeOTPLength(length)
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  const resolvedInvalid = previewState === 'error' ? true : (invalid ?? (field?.invalid || undefined))
  const visuallyInvalid = resolvedInvalid !== undefined && resolvedInvalid !== false && resolvedInvalid !== 'false'
  const [internalValue, setInternalValue] = useState(() => normalizeOTP(defaultValue, count))
  const [focused, setFocused] = useState(false)
  const [caret, setCaret] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const current = normalizeOTP(value ?? internalValue, count)
  const resetState = useRef({ value, defaultValue, count })
  resetState.current = { value, defaultValue, count }
  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return
    return subscribeOTPFormReset(form, () => {
      setInternalValue(normalizeOTP(resetState.current.defaultValue, resetState.current.count))
      setCaret(0)
    }, () => resetState.current.value !== undefined)
  }, [props.form])
  function change(next: string) {
    if (unavailable || readOnly || next === current) return
    if (value === undefined) setInternalValue(next)
    onValueChange?.(next)
    if (next.length === count) onComplete?.(next)
  }
  const input = <input {...props} ref={(node) => { inputRef.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node }} {...(!field ? { id } : {})} className="ui-input-otp-control" value={current} type="text" inputMode="numeric" autoComplete={autoComplete} pattern={`[0-9]{${count}}`} maxLength={count} disabled={unavailable} readOnly={readOnly} aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)} aria-invalid={resolvedInvalid} aria-busy={busy || undefined} onChange={(event) => { change(normalizeOTP(event.target.value, count)); setCaret(event.target.selectionStart ?? count) }} onSelect={(event) => { setCaret(event.currentTarget.selectionStart ?? 0); onSelect?.(event) }} onFocus={(event) => { setFocused(true); setCaret(event.currentTarget.selectionStart ?? current.length); onFocus?.(event) }} onBlur={(event) => { setFocused(false); onBlur?.(event) }} onPaste={(event) => {
    onPaste?.(event)
    if (event.defaultPrevented || unavailable || readOnly) return
    event.preventDefault()
    const next = insertOTP(current, event.clipboardData.getData('text'), event.currentTarget.selectionStart ?? current.length, event.currentTarget.selectionEnd ?? current.length, count)
    change(next.value); setCaret(next.caret)
    requestAnimationFrame(() => { inputRef.current?.setSelectionRange(next.caret, next.caret) })
  }} />
  return <div className={cn('ui-input-otp', className)} data-size={size} data-disabled={unavailable || undefined} data-invalid={visuallyInvalid || undefined} data-loading={busy || undefined} style={style}>
    {field ? <BaseField.Control render={input} id={id ?? field.controlId} value={current} disabled={unavailable} /> : input}
    {busy && <span className="ui-control-loading-indicator ui-loading-indicator" aria-hidden="true" />}
    <div className="ui-input-otp-slots" aria-hidden="true">{Array.from({ length: count }, (_, index) => <span key={index} className="ui-input-otp-slot" data-active={focused && Math.min(caret, count - 1) === index || undefined}>{current[index] ?? (focused && Math.min(caret, count - 1) === index ? <span className="ui-input-otp-caret" /> : null)}</span>)}</div>
  </div>
})
