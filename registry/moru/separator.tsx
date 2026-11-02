'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { Separator as BaseSeparator } from '@base-ui/react/separator'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from './_lib/cn'

export interface SeparatorProps extends Omit<ComponentPropsWithoutRef<typeof BaseSeparator>, 'className'> {
  decorative?: boolean
  className?: string
}

/** Set decorative=false when the separator conveys a structural boundary. */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = 'horizontal', decorative = true, className, ...props },
  ref,
) {
  return (
    <BaseSeparator
      {...props}
      ref={ref}
      orientation={orientation}
      role={decorative ? 'presentation' : 'separator'}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={cn('ui-separator', className)}
    />
  )
})
