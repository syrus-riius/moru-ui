import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import type { UIState } from './state'

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, size = 'md', id, 'aria-describedby': describedBy, 'aria-invalid': invalid, rows = 3,
    value, defaultValue, disabled, name, loading = false, previewState, onChange, ...props },
  ref,
) {
  const field = useFieldContext()
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  const textarea = (
    <textarea
      {...props}
      ref={ref}
      id={id ?? field?.controlId}
      rows={rows}
      aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)}
      aria-invalid={previewState === 'error' ? true : (invalid ?? (field?.invalid || undefined))}
      aria-busy={busy || undefined}
      className={cn('ui-textarea w-full min-w-0', className)}
      data-size={size}
      data-ui-state={previewState}
      data-loading={busy || undefined}
      value={value}
      defaultValue={defaultValue}
      disabled={unavailable}
      name={name}
      onChange={(event) => { if (!unavailable) onChange?.(event) }}
    />
  )

  const control = !field ? textarea : (
    <BaseField.Control
      id={id ?? field.controlId}
      value={value}
      defaultValue={defaultValue}
      disabled={unavailable}
      name={name}
      render={textarea}
    />
  )
  return (
    <span className="ui-control-loading-wrap ui-textarea-loading-wrap" data-size={size}>
      {control}{busy && <span className="ui-control-loading-indicator ui-loading-indicator" aria-hidden="true" />}
    </span>
  )
})
