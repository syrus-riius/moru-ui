'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './_lib/cn'
import type { SemanticTone } from './state'
import './content-completion.css'

export interface MarkerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'border' | 'separator'
  tone?: SemanticTone
}
/** A conversation note or boundary. Add role="status" for live updates. */
export const Marker = forwardRef<HTMLDivElement, MarkerProps>(function Marker({ variant = 'default', tone, className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn('ui-marker', className)} data-variant={variant} data-tone={tone} />
})
export function MarkerIcon({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span {...props} aria-hidden="true" className={cn('ui-marker-icon', className)} /> }
export function MarkerContent({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span {...props} className={cn('ui-marker-content', className)} /> }
