import type { HTMLAttributes, ReactNode } from 'react'
import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { cn } from '../../lib/cn'
import './overlays.css'

export interface AccordionItem {
  value: string
  title: ReactNode
  content: ReactNode
  disabled?: boolean
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  items: AccordionItem[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  multiple?: boolean
  disabled?: boolean
}

export function Accordion({
  items, value, defaultValue, onValueChange, multiple = false, disabled = false,
  className, ...props
}: AccordionProps) {
  return (
    <BaseAccordion.Root<string>
      {...props}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
      multiple={multiple}
      disabled={disabled}
      className={cn('ui-accordion', className)}
    >
      {items.map((item) => (
        <BaseAccordion.Item key={item.value} value={item.value} disabled={item.disabled} className="ui-accordion-item">
          <BaseAccordion.Header className="ui-accordion-heading">
            <BaseAccordion.Trigger className="ui-accordion-trigger">
              <span className="ui-accordion-label">{item.title}</span>
              <svg className="ui-accordion-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="ui-accordion-panel">
            <div className="ui-accordion-content">{item.content}</div>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  )
}
