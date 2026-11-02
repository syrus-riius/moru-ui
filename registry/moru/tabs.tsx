'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import type { ReactNode } from 'react'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cn } from './_lib/cn'

export interface TabsProps {
  items: Array<{ value: string; label: string; content: ReactNode; disabled?: boolean }>
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  'aria-label'?: string
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  /** Arrow keys move focus; Enter/Space activates by default. */
  activateOnFocus?: boolean
  loopFocus?: boolean
}

export function Tabs({ items, defaultValue, value, onValueChange, className, size = 'md', orientation = 'horizontal', activateOnFocus = false, loopFocus = true, 'aria-label': ariaLabel = '콘텐츠 보기' }: TabsProps) {
  const initialValue = items.find((item) => item.value === defaultValue && !item.disabled)?.value ?? items.find((item) => !item.disabled)?.value ?? null
  return (
    <BaseTabs.Root
      defaultValue={initialValue}
      value={value}
      orientation={orientation}
      onValueChange={(nextValue) => { if (typeof nextValue === 'string') onValueChange?.(nextValue) }}
      className={cn('ui-tabs', className)}
    >
      <BaseTabs.List className="ui-tabs-list inline-flex items-center" aria-label={ariaLabel} activateOnFocus={activateOnFocus} loopFocus={loopFocus}>
        {items.map((item) => <BaseTabs.Tab key={item.value} value={item.value} disabled={item.disabled} className="ui-tabs-tab" data-size={size}>{item.label}</BaseTabs.Tab>)}
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel key={item.value} value={item.value} className="ui-tabs-panel">
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  )
}
