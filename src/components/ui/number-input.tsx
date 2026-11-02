import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type AriaAttributes, type ComponentPropsWithoutRef } from 'react'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import { Minus, Plus } from 'lucide-react'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import './enhanced-inputs.css'

type RootProps = ComponentPropsWithoutRef<typeof BaseNumberField.Root>
export interface NumberInputProps extends Omit<RootProps, 'children' | 'className' | 'render' | 'defaultValue'> {
  defaultValue?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  placeholder?: string
  /** Maximum fractional digits. Formatting and locale-aware parsing are handled by Base UI. */
  precision?: number
  hideControls?: boolean
  loading?: boolean
  'aria-invalid'?: AriaAttributes['aria-invalid']
  inputProps?: Omit<ComponentPropsWithoutRef<typeof BaseNumberField.Input>, 'value' | 'defaultValue' | 'id' | 'name' | 'type' | 'size' | 'render' | 'className'> & { className?: string }
}

/** @internal Base NumberField owns numeric/formatting state, so reset only uncontrolled roots. */
export function subscribeNumberInputFormReset(form: EventTarget, onReset: () => void, isControlled: () => boolean) {
  let subscribed = true
  function reset(event: Event) {
    queueMicrotask(() => { if (subscribed && !event.defaultPrevented && !isControlled()) onReset() })
  }
  form.addEventListener('reset', reset)
  return () => { subscribed = false; form.removeEventListener('reset', reset) }
}

/** A nullable numeric field. Empty input is `null`, never zero or NaN. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput({
  size = 'md', className, placeholder, precision, hideControls = false, loading = false, id,
  value, defaultValue, format, disabled, readOnly, inputProps, form,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy,
  'aria-invalid': invalid, ...props
}, ref) {
  const field = useFieldContext()
  const unavailable = disabled || loading || inputProps?.disabled
  const resolvedReadOnly = readOnly || inputProps?.readOnly
  const inputRef = useRef<HTMLInputElement>(null)
  const controlled = useRef(value !== undefined)
  controlled.current = value !== undefined
  const [resetVersion, setResetVersion] = useState(0)
  const restoreFocus = useRef(false)
  const resolvedForm = form ?? inputProps?.form
  useImperativeHandle(ref, () => inputRef.current!, [resetVersion])
  useEffect(() => {
    const ownerForm = inputRef.current?.form
    if (!ownerForm) return
    return subscribeNumberInputFormReset(ownerForm, () => {
      restoreFocus.current = inputRef.current?.ownerDocument.activeElement === inputRef.current
      setResetVersion((version) => version + 1)
    }, () => controlled.current)
  }, [resolvedForm, resetVersion])
  useEffect(() => {
    if (restoreFocus.current) { restoreFocus.current = false; inputRef.current?.focus() }
  }, [resetVersion])
  const digits = typeof precision === 'number' && Number.isFinite(precision) ? Math.min(20, Math.max(0, Math.floor(precision))) : undefined
  const resolvedFormat = digits === undefined ? format : { ...format, minimumFractionDigits: Math.min(format?.minimumFractionDigits ?? 0, digits), maximumFractionDigits: digits }
  return <BaseNumberField.Root {...props} key={resetVersion} id={id ?? field?.controlId} value={value} defaultValue={defaultValue ?? undefined} form={resolvedForm} format={resolvedFormat} disabled={unavailable} readOnly={resolvedReadOnly} className={cn('ui-number-input ui-enhanced-input', className)} data-size={size}>
    <BaseNumberField.Group className="ui-number-input-group" data-loading={loading || undefined}>
      {!hideControls && <BaseNumberField.Decrement className="ui-enhanced-input-action" aria-label="값 줄이기" disabled={unavailable || resolvedReadOnly}><Minus aria-hidden="true" size={14} /></BaseNumberField.Decrement>}
      <BaseNumberField.Input {...inputProps} ref={inputRef} form={resolvedForm} disabled={unavailable} readOnly={resolvedReadOnly} className={cn('ui-enhanced-input-field', inputProps?.className)} placeholder={placeholder} aria-label={ariaLabel ?? inputProps?.['aria-label']} aria-labelledby={labelledBy ?? inputProps?.['aria-labelledby']} aria-describedby={mergeDescriptionIds(describedBy, inputProps?.['aria-describedby'], field?.describedBy)} aria-invalid={invalid ?? inputProps?.['aria-invalid'] ?? (field?.invalid || undefined)} aria-busy={loading || inputProps?.['aria-busy']} />
      {loading && <span className="ui-enhanced-input-loading" aria-hidden="true"><span className="ui-loading-indicator" /></span>}
      {!hideControls && <BaseNumberField.Increment className="ui-enhanced-input-action" aria-label="값 늘리기" disabled={unavailable || resolvedReadOnly}><Plus aria-hidden="true" size={14} /></BaseNumberField.Increment>}
    </BaseNumberField.Group>
  </BaseNumberField.Root>
})
