import { Select as BaseSelect } from '@base-ui/react/select'
import { cn } from '../../lib/cn'
import { useEffect, useState, type AriaAttributes } from 'react'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import type { UIState } from './state'

export interface SelectProps {
  items: Array<{ value: string; label: string; disabled?: boolean }>
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
  disabled?: boolean
  readOnly?: boolean
  name?: string
  form?: string
  required?: boolean
  id?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}

export function Select({
  items, value, defaultValue, onValueChange, placeholder = '선택해주세요',
  'aria-label': ariaLabel, 'aria-describedby': describedBy, 'aria-invalid': invalid,
  disabled, readOnly, name, form, required, id, className, size = 'md', loading = false, previewState,
}: SelectProps) {
  const field = useFieldContext()
  const portalContainer = useThemePortalContainer()
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  const [open, setOpen] = useState(false)
  useEffect(() => { if (unavailable || readOnly) setOpen(false) }, [unavailable, readOnly])
  return (
    <BaseSelect.Root
      open={open && !unavailable && !readOnly}
      onOpenChange={(next, details) => {
        if (next && (unavailable || readOnly)) { details.cancel(); return }
        setOpen(next)
      }}
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue, details) => {
        if (unavailable || readOnly) { details.cancel(); return }
        if (nextValue !== null) onValueChange?.(nextValue)
      }}
      disabled={unavailable}
      readOnly={readOnly}
      name={name}
      form={form}
      required={required}
    >
      <BaseSelect.Trigger
        id={id ?? field?.controlId}
        aria-label={ariaLabel}
        aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)}
        aria-invalid={previewState === 'error' ? true : (invalid ?? (field?.invalid || undefined))}
        aria-busy={busy || undefined}
        className={cn('ui-select flex w-full min-w-0 items-center justify-between gap-2', className)}
        data-size={size}
        data-ui-state={previewState}
        data-loading={busy || undefined}
      >
        <BaseSelect.Value className="ui-select-value" placeholder={placeholder} />
        {busy ? <span className="ui-select-loading-indicator ui-loading-indicator" aria-hidden="true" /> : <BaseSelect.Icon className="ui-select-icon shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m5 6.5 3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </BaseSelect.Icon>}
      </BaseSelect.Trigger>
      <OverlayPortal portal={BaseSelect.Portal} kind="menu" container={portalContainer}>
        <BaseSelect.Positioner className="ui-select-positioner" sideOffset={6} alignItemWithTrigger={false}>
          <BaseSelect.Popup className="ui-select-popup" data-size={size}>
            <BaseSelect.List>
              {items.map((item) => (
                <BaseSelect.Item key={item.value} value={item.value} disabled={item.disabled} className="ui-select-item flex items-center gap-2">
                  <BaseSelect.ItemText className="ui-select-item-text">{item.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator className="ui-select-item-indicator ml-auto">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="m3 8 3.2 3.2L13 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </OverlayPortal>
    </BaseSelect.Root>
  )
}
