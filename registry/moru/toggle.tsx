'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Toggle as BaseToggle } from '@base-ui/react/toggle'
import { cn } from './_lib/cn'
import './controls-completion.css'

export type ToggleProps = Omit<ComponentPropsWithoutRef<typeof BaseToggle>, 'className' | 'onPressedChange'> & { className?: string; size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'outline'; onPressedChange?: (pressed: boolean) => void }
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle({ className, size = 'md', variant = 'default', disabled, onPressedChange, ...props }, ref) {
  return <BaseToggle {...props} ref={ref} disabled={disabled} className={cn('ui-toggle', className)} data-size={size} data-variant={variant} onPressedChange={(pressed) => { if (!disabled) onPressedChange?.(pressed) }} />
})
