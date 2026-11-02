import { forwardRef, type SelectHTMLAttributes } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import type { UIState } from './state'
import './controls-completion.css'

export interface NativeSelectOption { value: string; label: string; disabled?: boolean }
export type NativeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple'> & {
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
  items?: NativeSelectOption[]
  onValueChange?: (value: string) => void
}
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect({ size = 'md', items, children, className, id, disabled, loading = false, previewState, onChange, onValueChange, 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props }, ref) {
  const field = useFieldContext()
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  const select = <select {...props} disabled={unavailable} aria-busy={busy || undefined} data-loading={busy || undefined} ref={ref} {...(!field ? { id } : {})} className={cn('ui-native-select', className)} data-size={size} aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)} aria-invalid={previewState === 'error' ? true : (invalid ?? (field?.invalid || undefined))} onChange={(event) => { if (unavailable) return; onChange?.(event); if (!event.defaultPrevented) onValueChange?.(event.target.value) }}>
    {items ? items.map((item) => <option key={item.value} value={item.value} disabled={item.disabled}>{item.label}</option>) : children}
  </select>
  return <span className="ui-native-select-wrap ui-control-loading-wrap" data-size={size}>{field ? <BaseField.Control render={select} id={id ?? field.controlId} disabled={unavailable} value={props.value} defaultValue={props.defaultValue} /> : select}{busy ? <span className="ui-control-loading-indicator ui-loading-indicator" aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}</span>
})
