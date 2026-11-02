'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Input as BaseInput } from '@base-ui/react/input'
import { cn } from './_lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import type { UIState } from './state'

export type InputProps = Omit<ComponentPropsWithoutRef<typeof BaseInput>, 'className' | 'size'> & {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size = 'md', id, loading = false, previewState, disabled, onValueChange, onChange,
    'aria-describedby': describedBy, 'aria-invalid': invalid, ...props },
  ref,
) {
  const field = useFieldContext()
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  const input = (
    <BaseInput
      {...props}
      ref={ref}
      id={id ?? field?.controlId}
      aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)}
      aria-invalid={previewState === 'error' ? true : (invalid ?? (field?.invalid || undefined))}
      aria-busy={busy || undefined}
      className={cn('ui-input w-full min-w-0', className)}
      data-size={size}
      data-ui-state={previewState}
      data-loading={busy || undefined}
      disabled={unavailable}
      onValueChange={(value, details) => { if (!unavailable) onValueChange?.(value, details) }}
      onChange={(event) => { if (!unavailable) onChange?.(event) }}
    />
  )
  return (
    <span className="ui-control-loading-wrap" data-size={size}>
      {input}{busy && <span className="ui-control-loading-indicator ui-loading-indicator" aria-hidden="true" />}
    </span>
  )
})
