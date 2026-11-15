import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'

export type SwitchProps = Omit<
  ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  'children' | 'className' | 'checked' | 'defaultChecked' | 'onCheckedChange'
> & {
  label?: ReactNode
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Shows a busy indicator and locks the switch without taking it out of the tab order. */
  loading?: boolean
}

export const Switch = forwardRef<HTMLElement, SwitchProps>(function Switch(
  {
    label,
    description,
    checked,
    defaultChecked,
    onCheckedChange,
    className,
    disabled,
    readOnly,
    id,
    size = 'md',
    loading = false,
    'aria-label': ariaLabel,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-invalid': invalid,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const descriptionId = `${generatedId}-description`
  const labelId = `${generatedId}-label`
  const field = useFieldContext()
  const unavailable = disabled || loading

  return (
    <label
      className={cn('ui-switch-label', className)}
      data-size={size}
      data-disabled={disabled || undefined}
      data-loading={loading || undefined}
    >
      <BaseSwitch.Root
        {...props}
        ref={ref}
        id={id ?? field?.controlId}
        className="ui-switch"
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(nextChecked) => {
          if (!unavailable) onCheckedChange?.(nextChecked)
        }}
        disabled={disabled}
        // Busy uses readOnly so a just-toggled switch keeps keyboard focus while it saves.
        readOnly={readOnly || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy ?? (!ariaLabel && label ? labelId : undefined)}
        aria-invalid={invalid ?? (field?.invalid || undefined)}
        aria-describedby={mergeDescriptionIds(
          describedBy,
          field?.describedBy,
          description ? descriptionId : undefined,
        )}
      >
        <BaseSwitch.Thumb className="ui-switch-thumb">
          {loading && (
            <span className="ui-switch-loading-indicator ui-loading-indicator" aria-hidden="true" />
          )}
        </BaseSwitch.Thumb>
      </BaseSwitch.Root>
      {(label || description) && (
        <span className="ui-switch-copy">
          {label && (
            <span id={labelId} className="ui-switch-text">
              {label}
            </span>
          )}
          {description && (
            <span id={descriptionId} className="ui-switch-description">
              {description}
            </span>
          )}
        </span>
      )}
    </label>
  )
})
