'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { Radio as BaseRadio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { cn } from './_lib/cn'
import { mergeDescriptionIds, useFieldContext } from './field-context'

export interface RadioGroupItem {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps extends Omit<BaseRadioGroup.Props<string>,
  'children' | 'className' | 'value' | 'defaultValue' | 'onValueChange'> {
  items: RadioGroupItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function RadioGroup({
  items, value, defaultValue, onValueChange, disabled, readOnly,
  className, id, size = 'md',
  'aria-describedby': describedBy, 'aria-invalid': invalid, ...props
}: RadioGroupProps) {
  const groupId = useId()
  const field = useFieldContext()
  const invalidState = invalid ?? (field?.invalid || undefined)
  const descriptionIds = mergeDescriptionIds(describedBy, field?.describedBy)

  return (
    <BaseRadioGroup
      {...props}
      id={id ?? field?.controlId}
      className={cn('ui-radio-group', className)}
      data-size={size}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => { if (!disabled && !readOnly) onValueChange?.(nextValue) }}
      disabled={disabled}
      readOnly={readOnly}
      aria-invalid={invalidState}
      aria-describedby={descriptionIds}
    >
      {items.map((item, index) => {
        const labelId = `${groupId}-${index}-label`
        const descriptionId = item.description ? `${groupId}-${index}-description` : undefined
        const optionContent = (
          <>
            <BaseRadio.Root
              value={item.value}
              disabled={item.disabled}
              className="ui-radio"
              aria-labelledby={labelId}
              aria-describedby={mergeDescriptionIds(descriptionIds, descriptionId)}
              aria-invalid={invalidState}
            >
              <BaseRadio.Indicator className="ui-radio-indicator" />
            </BaseRadio.Root>
            <span className="ui-radio-copy">
              <span id={labelId} className="ui-radio-text">{item.label}</span>
              {item.description && <span id={descriptionId} className="ui-radio-description">{item.description}</span>}
            </span>
          </>
        )

        // Each grouped control needs its own label context inside a Field.
        // Field.Item requires a Field.Root, so standalone groups keep native labels.
        return field ? (
          <BaseField.Item
            key={item.value}
            render={<label />}
            className="ui-radio-option"
            disabled={disabled || item.disabled}
          >
            {optionContent}
          </BaseField.Item>
        ) : (
          <label
            key={item.value}
            className="ui-radio-option"
            data-disabled={disabled || item.disabled || undefined}
          >
            {optionContent}
          </label>
        )
      })}
    </BaseRadioGroup>
  )
}
