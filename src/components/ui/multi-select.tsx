import { useI18n } from '../../lib/i18n'
import { useEffect, useId, useRef, useState, type AriaAttributes } from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { Check, ChevronDown, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'
import { useThemePortalContainer } from './theme-scope'
import { OverlayPortal } from './overlay-portal'
import type { ComboboxItem } from './combobox'
import './advanced-controls-shared.css'
import './combobox.css'
import './enhanced-input.css'
import './multi-select.css'

export type MultiSelectItem = ComboboxItem
export interface MultiSelectProps {
  items: MultiSelectItem[]
  value?: readonly string[]
  defaultValue?: readonly string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  emptyMessage?: string
  maxSelected?: number
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  form?: string
  id?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: AriaAttributes['aria-invalid']
}

/** @internal Reset listeners run after every form handler has had a chance to cancel. */
export function subscribeMultiSelectFormReset(form: EventTarget, onReset: () => void) {
  let subscribed = true
  function reset(event: Event) {
    queueMicrotask(() => {
      if (subscribed && !event.defaultPrevented) onReset()
    })
  }
  form.addEventListener('reset', reset)
  return () => {
    subscribed = false
    form.removeEventListener('reset', reset)
  }
}

/** Search, select, remove, and submit stable string values with Base UI chip keyboard navigation. */
export function MultiSelect({
  items,
  value,
  defaultValue = [],
  onValueChange,
  placeholder: placeholderProp,
  emptyMessage: emptyMessageProp,
  maxSelected,
  clearable = true,
  disabled,
  loading = false,
  readOnly,
  required,
  name,
  form,
  id,
  size = 'md',
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: MultiSelectProps) {
  const { t } = useI18n()
  const placeholder = placeholderProp ?? t('검색해서 여러 항목 선택')
  const emptyMessage = emptyMessageProp ?? t('검색 결과가 없습니다.')

  const field = useFieldContext()
  const portalContainer = useThemePortalContainer()
  const unavailable = disabled || loading
  const rootRef = useRef<HTMLDivElement>(null)
  const hintId = `multi-select-${useId()}-hint`
  const [internalValue, setInternalValue] = useState<readonly string[]>(() => [
    ...new Set(defaultValue),
  ])
  const [inputValue, setInputValue] = useState('')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (unavailable || readOnly) setOpen(false)
  }, [unavailable, readOnly])
  const resetState = useRef({ value, defaultValue })
  resetState.current = { value, defaultValue }
  useEffect(() => {
    const form = rootRef.current?.querySelector<HTMLInputElement>('input')?.form
    if (!form) return
    return subscribeMultiSelectFormReset(form, () => {
      if (resetState.current.value !== undefined) return
      setInternalValue([...new Set(resetState.current.defaultValue)])
      setInputValue('')
    })
  }, [form])
  const selectedValues = [...new Set(value ?? internalValue)]
  const selection = selectedValues.map(
    (selected) =>
      items.find((item) => item.value === selected) ?? { value: selected, label: selected },
  )
  const maximum =
    typeof maxSelected === 'number' && Number.isFinite(maxSelected)
      ? Math.max(0, Math.floor(maxSelected))
      : undefined
  const atLimit = maximum !== undefined && selectedValues.length >= maximum
  return (
    <div ref={rootRef} className={cn('ui-multi-select-root', className)} data-size={size}>
      <BaseCombobox.Root<MultiSelectItem, true>
        multiple
        items={items}
        value={selection}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        open={open && !unavailable && !readOnly}
        onOpenChange={(next, details) => {
          if (next && (unavailable || readOnly)) {
            details.cancel()
            return
          }
          setOpen(next)
        }}
        onValueChange={(next, details) => {
          if (
            unavailable ||
            readOnly ||
            (maximum !== undefined && next.length > maximum && next.length > selection.length)
          ) {
            details.cancel()
            return
          }
          const values = [...new Set(next.map((item) => item.value))]
          if (value === undefined) setInternalValue(values)
          onValueChange?.(values)
        }}
        id={id ?? field?.controlId}
        name={name}
        form={form}
        required={required}
        // Busy locks the field with readOnly, not disabled: focus stays in the input
        // while options load and the selected values still submit with the form.
        disabled={disabled}
        readOnly={readOnly || loading}
        itemToStringLabel={(item) => item.label}
        itemToStringValue={(item) => item.value}
        isItemEqualToValue={(item, selected) => item.value === selected.value}
        filter={(item, query) =>
          `${item.label} ${item.description ?? ''}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase())
        }
        autoHighlight
      >
        <BaseCombobox.InputGroup
          className="ui-multi-select ui-enhanced-input"
          data-size={size}
          data-loading={loading || undefined}
        >
          <BaseCombobox.Chips
            className="ui-multi-select-chips"
            aria-label={
              ariaLabel ? t('{v0} 선택 항목과 검색', { v0: ariaLabel }) : t('선택 항목과 검색')
            }
          >
            <BaseCombobox.Value>
              {(selected: MultiSelectItem[]) =>
                selected.map((item) => (
                  <BaseCombobox.Chip className="ui-multi-select-chip" key={item.value}>
                    <span>{item.label}</span>
                    {!readOnly && (
                      <BaseCombobox.ChipRemove
                        disabled={unavailable}
                        className="ui-multi-select-chip-remove"
                        aria-label={t('{v0} 선택 해제', { v0: item.label })}
                      >
                        <X aria-hidden="true" size={12} />
                      </BaseCombobox.ChipRemove>
                    )}
                  </BaseCombobox.Chip>
                ))
              }
            </BaseCombobox.Value>
            <BaseCombobox.Input
              className="ui-multi-select-input"
              placeholder={selectedValues.length ? t('추가 검색') : placeholder}
              aria-label={ariaLabel}
              aria-labelledby={labelledBy}
              aria-describedby={mergeDescriptionIds(
                describedBy,
                field?.describedBy,
                maximum !== undefined ? hintId : undefined,
              )}
              aria-invalid={invalid ?? (field?.invalid || undefined)}
              aria-busy={loading || undefined}
            />
          </BaseCombobox.Chips>
          {clearable && !unavailable && !readOnly && (
            <BaseCombobox.Clear
              className="ui-enhanced-input-action"
              aria-label={t('모든 선택 지우기')}
            >
              <X aria-hidden="true" size={14} />
            </BaseCombobox.Clear>
          )}
          <BaseCombobox.Trigger
            className="ui-enhanced-input-action"
            aria-label={loading ? t('목록 불러오는 중') : t('선택 목록 열기')}
            tabIndex={-1}
            disabled={unavailable || readOnly}
          >
            {loading ? (
              <span className="ui-loading-indicator" aria-hidden="true" />
            ) : (
              <ChevronDown aria-hidden="true" size={14} />
            )}
          </BaseCombobox.Trigger>
        </BaseCombobox.InputGroup>
        <OverlayPortal portal={BaseCombobox.Portal} kind="combobox" container={portalContainer}>
          <BaseCombobox.Positioner className="ui-combobox-positioner" sideOffset={6}>
            <BaseCombobox.Popup className="ui-combobox-popup" data-size={size}>
              <BaseCombobox.Empty className="ui-combobox-empty">{emptyMessage}</BaseCombobox.Empty>
              <BaseCombobox.List className="ui-combobox-list">
                {(item: MultiSelectItem) => (
                  <BaseCombobox.Item
                    key={item.value}
                    value={item}
                    className="ui-combobox-item"
                    disabled={item.disabled || (atLimit && !selectedValues.includes(item.value))}
                  >
                    <span className="ui-combobox-copy">
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="ui-combobox-description">{item.description}</span>
                      )}
                    </span>
                    <BaseCombobox.ItemIndicator className="ui-combobox-check">
                      <Check aria-hidden="true" size={14} />
                    </BaseCombobox.ItemIndicator>
                  </BaseCombobox.Item>
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </OverlayPortal>
      </BaseCombobox.Root>
      {maximum !== undefined && (
        <p id={hintId} className="ui-enhanced-input-hint" role="status">
          {selectedValues.length} / {maximum}
          {t('개 선택')}
          {atLimit ? t(' · 선택을 해제하면 다른 항목을 고를 수 있어요.') : ''}
        </p>
      )}
    </div>
  )
}
