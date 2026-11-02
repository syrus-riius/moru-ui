'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useEffect, useId, useState, type AriaAttributes } from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { cn } from './_lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import './advanced-controls.css'

export interface ComboboxItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface ComboboxProps {
  items: ComboboxItem[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  required?: boolean
  clearable?: boolean
  name?: string
  form?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** Searchable single selection. Public values remain stable strings, including in forms. */
export function Combobox({
  items, value, defaultValue, onValueChange, placeholder = '검색해서 선택하세요',
  'aria-label': ariaLabel, 'aria-labelledby': labelledBy, 'aria-describedby': describedBy,
  'aria-invalid': invalid, disabled, loading = false, readOnly, required, clearable = true, name, form, id, size = 'md', className,
}: ComboboxProps) {
  const field = useFieldContext()
  const portalContainer = useThemePortalContainer()
  const triggerId = useId()
  const unavailable = disabled || loading
  const [open, setOpen] = useState(false)
  useEffect(() => { if (unavailable || readOnly) setOpen(false) }, [unavailable, readOnly])
  const resolveItem = (selected: string | null | undefined) => selected == null ? null : items.find((item) => item.value === selected) ?? { value: selected, label: selected }
  return (
    <BaseCombobox.Root<ComboboxItem>
      open={open && !unavailable && !readOnly}
      onOpenChange={(next, details) => {
        if (next && (unavailable || readOnly)) { details.cancel(); return }
        setOpen(next)
      }}
      id={id ?? field?.controlId}
      items={items}
      value={value === undefined ? undefined : resolveItem(value)}
      defaultValue={resolveItem(defaultValue)}
      onValueChange={(item, details) => {
        if (unavailable || readOnly) { details.cancel(); return }
        onValueChange?.(item?.value ?? null)
      }}
      isItemEqualToValue={(item, selected) => item.value === selected.value}
      itemToStringLabel={(item) => items.find((option) => option.value === item.value)?.label ?? item.label}
      itemToStringValue={(item) => item.value}
      filter={(item, query) => `${item.label} ${item.description ?? ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())}
      autoHighlight
      disabled={unavailable}
      readOnly={readOnly}
      name={name}
      form={form}
      required={required}
    >
      <BaseCombobox.InputGroup className={cn('ui-combobox', className)} data-size={size} data-loading={loading || undefined}>
        <BaseCombobox.Input
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={mergeDescriptionIds(describedBy, field?.describedBy)}
          aria-invalid={invalid ?? (field?.invalid || undefined)}
          aria-busy={loading || undefined}
          placeholder={placeholder}
          className="ui-combobox-input"
        />
        {clearable && !unavailable && !readOnly && <BaseCombobox.Clear className="ui-combobox-clear" aria-label="선택 지우기">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </BaseCombobox.Clear>}
        <BaseCombobox.Trigger render={<button id={`${triggerId}-trigger`} role="button" tabIndex={-1} aria-haspopup="listbox" />} className="ui-combobox-trigger" aria-label={loading ? '목록 불러오는 중' : '선택 목록 열기'} disabled={unavailable || readOnly}>
          {loading ? <span className="ui-loading-indicator" aria-hidden="true" /> : <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </BaseCombobox.Trigger>
      </BaseCombobox.InputGroup>
      <OverlayPortal portal={BaseCombobox.Portal} kind="combobox" container={portalContainer}>
        <BaseCombobox.Positioner className="ui-combobox-positioner" sideOffset={6}>
          <BaseCombobox.Popup className="ui-combobox-popup" data-size={size}>
            <BaseCombobox.Empty className="ui-combobox-empty">검색 결과가 없습니다.</BaseCombobox.Empty>
            <BaseCombobox.List className="ui-combobox-list">
              {(item: ComboboxItem) => <BaseCombobox.Item key={item.value} value={item} disabled={item.disabled} className="ui-combobox-item">
                <span className="ui-combobox-copy"><span>{item.label}</span>{item.description && <span className="ui-combobox-description">{item.description}</span>}</span>
                <BaseCombobox.ItemIndicator className="ui-combobox-check"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></BaseCombobox.ItemIndicator>
              </BaseCombobox.Item>}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </OverlayPortal>
    </BaseCombobox.Root>
  )
}
