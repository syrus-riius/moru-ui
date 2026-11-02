import { useState, type ReactNode } from 'react'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cn } from '../../lib/cn'
import './advanced-controls.css'

export interface ToggleGroupItem {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

export interface ToggleGroupProps {
  items: ToggleGroupItem[]
  type?: 'single' | 'multiple'
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  preventEmpty?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

export function ToggleGroup({ items, type = 'single', value, defaultValue = [], onValueChange, preventEmpty = false, disabled, size = 'md', 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, className }: ToggleGroupProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const unique = [...new Set(value ?? internalValue)]
  const selected = type === 'multiple' ? unique : unique.slice(0, 1)
  return <BaseToggleGroup
    className={cn('ui-toggle-group', className)} data-size={size}
    value={selected} multiple={type === 'multiple'} disabled={disabled}
    aria-label={ariaLabel} aria-labelledby={labelledBy}
    onValueChange={(nextValue, details) => {
      if (disabled || (preventEmpty && nextValue.length === 0)) { details.cancel(); return }
      if (value === undefined) setInternalValue(nextValue)
      onValueChange?.(nextValue)
    }}
  >
    {items.map((item) => <BaseToggle key={item.value} value={item.value} disabled={item.disabled} className="ui-toggle-group-item" aria-label={item.label}>
      {item.icon && <span className="ui-toggle-group-icon" aria-hidden="true">{item.icon}</span>}<span>{item.label}</span>
    </BaseToggle>)}
  </BaseToggleGroup>
}
