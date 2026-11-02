import type { ReactNode } from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/cn'
import './navigation-completion.css'

export interface CollapsibleProps {
  title: ReactNode
  children: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
export function Collapsible({ title, children, open, defaultOpen, onOpenChange, disabled, size = 'md', className }: CollapsibleProps) {
  return <BaseCollapsible.Root className={cn('ui-collapsible', className)} data-size={size} open={open} defaultOpen={defaultOpen} onOpenChange={(next) => onOpenChange?.(next)} disabled={disabled}>
    <BaseCollapsible.Trigger className="ui-collapsible-trigger"><span>{title}</span><ChevronDown size={16} aria-hidden="true" /></BaseCollapsible.Trigger>
    <BaseCollapsible.Panel className="ui-collapsible-panel"><div className="ui-collapsible-content">{children}</div></BaseCollapsible.Panel>
  </BaseCollapsible.Root>
}
