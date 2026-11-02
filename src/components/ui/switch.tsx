import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Switch as BaseSwitch } from '@base-ui/react/switch'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'

export type SwitchProps = Omit<ComponentPropsWithoutRef<typeof BaseSwitch.Root>,
  'children' | 'className' | 'checked' | 'defaultChecked' | 'onCheckedChange'> & {
  label?: ReactNode
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Switch({
  label, description, checked, defaultChecked, onCheckedChange,
  className, disabled, id, size = 'md',
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}: SwitchProps) {
  const generatedId = useId()
  const descriptionId = `${generatedId}-description`
  const labelId = `${generatedId}-label`
  const field = useFieldContext()

  return (
    <label
      className={cn('ui-switch-label', className)}
      data-size={size}
      data-disabled={disabled || undefined}
    >
      <BaseSwitch.Root
        {...props}
        id={id ?? field?.controlId}
        className="ui-switch"
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(nextChecked) => { if (!disabled) onCheckedChange?.(nextChecked) }}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy ?? (!ariaLabel && label ? labelId : undefined)}
        aria-invalid={invalid ?? (field?.invalid || undefined)}
        aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, description ? descriptionId : undefined)}
      >
        <BaseSwitch.Thumb className="ui-switch-thumb" />
      </BaseSwitch.Root>
      {(label || description) && (
        <span className="ui-switch-copy">
          {label && <span id={labelId} className="ui-switch-text">{label}</span>}
          {description && <span id={descriptionId} className="ui-switch-description">{description}</span>}
        </span>
      )}
    </label>
  )
}
