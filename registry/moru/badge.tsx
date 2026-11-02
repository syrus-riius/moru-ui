'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './_lib/cn'
import type { SemanticTone } from './state'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  tone?: SemanticTone
}

/** A compact, non-interactive label for counts, categories, and status. */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'primary', tone, children, ...props },
  ref,
) {
  return (
    <span {...props} ref={ref} className={cn('ui-badge', className)} data-variant={variant} data-tone={tone}>
      {children}
    </span>
  )
})
