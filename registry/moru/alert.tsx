'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './_lib/cn'
import type { SemanticTone } from './state'

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  title: string
  children?: ReactNode
  tone?: SemanticTone
  icon?: ReactNode
}

const toneIcons = { success: CircleCheck, warning: TriangleAlert, info: Info, danger: CircleAlert }

/** A message with a visible title and icon, so meaning does not rely on color. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { title, children, tone = 'info', icon, className, role, ...props },
  ref,
) {
  const titleId = useId()
  const Icon = toneIcons[tone]
  return (
    <div
      aria-labelledby={props['aria-label'] ? undefined : titleId}
      aria-atomic="true"
      {...props}
      ref={ref}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cn('ui-alert', className)}
      data-tone={tone}
    >
      {icon !== null && (
        <span className="ui-alert-icon" aria-hidden="true">
          {icon === undefined ? <Icon size={18} strokeWidth={1.8} /> : icon}
        </span>
      )}
      <div className="ui-alert-copy">
        <p id={titleId} className="ui-alert-title">{title}</p>
        {children != null && <div className="ui-alert-description">{children}</div>}
      </div>
    </div>
  )
})
