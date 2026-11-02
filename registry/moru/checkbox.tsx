'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { cn } from './_lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import type { UIState } from './state'

export type CheckboxProps = Omit<ComponentPropsWithoutRef<typeof BaseCheckbox.Root>,
  'children' | 'className' | 'checked' | 'defaultChecked' | 'onCheckedChange'> & {
  label?: ReactNode
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}

export function Checkbox({
  label, description, checked, defaultChecked, onCheckedChange, className,
  disabled, id, size = 'md', loading = false, previewState,
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy,
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}: CheckboxProps) {
  const generatedId = useId()
  const descriptionId = `${generatedId}-description`
  const labelId = `${generatedId}-label`
  const field = useFieldContext()
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  return (
    <label className={cn('ui-checkbox-label inline-flex items-start', className)} data-size={size} data-disabled={unavailable || undefined} data-loading={busy || undefined}>
      <BaseCheckbox.Root
        {...props}
        id={id ?? field?.controlId}
        className="ui-checkbox inline-flex shrink-0 items-center justify-center"
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => { if (!unavailable) onCheckedChange?.(value) }}
        disabled={unavailable}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy ?? (!ariaLabel && label ? labelId : undefined)}
        aria-invalid={previewState === 'error' ? true : (invalid ?? (field?.invalid || undefined))}
        aria-busy={busy || undefined}
        data-ui-state={previewState}
        data-loading={busy || undefined}
        aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy, description ? descriptionId : undefined)}
      >
        {busy ? <span className="ui-checkbox-loading-indicator ui-loading-indicator" aria-hidden="true" /> : <BaseCheckbox.Indicator className="ui-checkbox-indicator">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m3 8 3.2 3.2L13 4.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </BaseCheckbox.Indicator>}
      </BaseCheckbox.Root>
      {(label || description) && (
        <span className="ui-checkbox-copy flex min-w-0 flex-col">
          {label && <span id={labelId} className="ui-checkbox-text">{label}</span>}
          {description && <span id={descriptionId} className="ui-checkbox-description">{description}</span>}
        </span>
      )}
    </label>
  )
}
