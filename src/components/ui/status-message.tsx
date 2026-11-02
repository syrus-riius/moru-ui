import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { semanticToneOptions, type SemanticTone } from './state'

export interface StatusMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  tone?: SemanticTone
  title?: string
  children?: ReactNode
  variant?: 'soft' | 'outline'
}

const toneIcons = { success: CircleCheck, warning: TriangleAlert, info: Info, danger: CircleAlert }

/** A textual message with an icon, so its meaning does not depend on color. */
export function StatusMessage({ tone = 'info', title, children, variant = 'soft', className, role = 'status', ...props }: StatusMessageProps) {
  const Icon = toneIcons[tone]
  const label = semanticToneOptions.find((option) => option.value === tone)?.label
  return (
    <div {...props} role={role} className={cn('ui-status-message', className)} data-tone={tone} data-variant={variant}>
      <Icon className="ui-status-icon" size={18} strokeWidth={1.8} aria-hidden="true" />
      <div className="ui-status-copy">
        <p className="ui-status-title">{title ?? label}</p>
        {children && <div className="ui-status-description">{children}</div>}
      </div>
    </div>
  )
}
