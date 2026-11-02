'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from './_lib/cn'
import { Input, type InputProps } from './input'
import { useFieldContext } from './field-context'
import './enhanced-inputs.css'

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  visible?: boolean
  defaultVisible?: boolean
  onVisibilityChange?: (visible: boolean) => void
}

/** Native password semantics, including autofill and form submission, with an explicit reveal control. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({
  visible, defaultVisible = false, onVisibilityChange, className, size = 'md',
  id, disabled, loading, previewState, ...props
}, ref) {
  const field = useFieldContext()
  const fallbackId = useId()
  const controlId = id ?? field?.controlId ?? `password-${fallbackId}`
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const revealed = visible ?? internalVisible
  const unavailable = disabled || loading || previewState === 'loading' || previewState === 'disabled'
  return <div className={cn('ui-password-input ui-enhanced-input', className)} data-size={size} data-disabled={unavailable || undefined}>
    <Input {...props} ref={ref} id={controlId} type={revealed ? 'text' : 'password'} autoComplete={props.autoComplete ?? 'current-password'} size={size} disabled={disabled} loading={loading} previewState={previewState} className="ui-password-input-field" />
    <button type="button" className="ui-enhanced-input-action ui-password-input-toggle" disabled={unavailable} aria-label="비밀번호 표시" aria-pressed={revealed} aria-controls={controlId} onMouseDown={(event) => event.preventDefault()} onClick={() => {
      if (unavailable) return
      if (visible === undefined) setInternalVisible(!revealed)
      onVisibilityChange?.(!revealed)
    }}>{revealed ? <EyeOff aria-hidden="true" size={16} /> : <Eye aria-hidden="true" size={16} />}</button>
  </div>
})
