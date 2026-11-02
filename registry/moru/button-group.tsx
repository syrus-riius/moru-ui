'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './_lib/cn'
import './controls-completion.css'

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup({ orientation = 'horizontal', className, role = 'group', ...props }, ref) {
  return <div {...props} ref={ref} role={role} className={cn('ui-button-group', className)} data-orientation={orientation} />
})

export function ButtonGroupText({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cn('ui-button-group-text', className)} />
}
