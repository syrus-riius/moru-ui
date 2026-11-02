'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId, type ReactNode } from 'react'
import { Field as BaseField } from '@base-ui/react/field'
import { cn } from './_lib/cn'
import { FieldContext } from './field-context'

export interface FieldProps {
  label: string
  description?: string
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, description, error, children, className }: FieldProps) {
  const id = useId()
  const controlId = `field-${id}`
  const describedBy = [description && `${id}-description`, error && `${id}-error`]
    .filter(Boolean)
    .join(' ') || undefined

  return (
    <FieldContext.Provider value={{ controlId, labelId: `${id}-label`, describedBy, invalid: Boolean(error) }}>
      <BaseField.Root className={cn('ui-field flex flex-col', className)} invalid={Boolean(error)}>
        <BaseField.Label className="ui-field-label" id={`${id}-label`}>{label}</BaseField.Label>
        {children}
        {description && (
          <BaseField.Description className="ui-field-description" id={`${id}-description`}>
            {description}
          </BaseField.Description>
        )}
        {error && (
          <BaseField.Error className="ui-field-error" id={`${id}-error`} match>
            {error}
          </BaseField.Error>
        )}
      </BaseField.Root>
    </FieldContext.Provider>
  )
}
