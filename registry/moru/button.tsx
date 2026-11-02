'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { cn } from './_lib/cn'
import type { UIState } from './state'

export type ButtonProps = Omit<ComponentPropsWithoutRef<typeof BaseButton>, 'className'> & {
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  previewState?: UIState
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, previewState, onClick, ...props },
  ref,
) {
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  return (
    <BaseButton
      {...props}
      ref={ref}
      className={cn('ui-button inline-flex items-center justify-center gap-2 whitespace-nowrap', className)}
      data-variant={previewState === 'error' ? 'danger' : variant}
      data-size={size}
      data-ui-state={previewState}
      data-loading={busy || undefined}
      aria-busy={busy || undefined}
      disabled={unavailable}
      onClick={(event) => { if (!unavailable) onClick?.(event) }}
    >
      {busy && <span className="ui-button-spinner ui-loading-indicator" aria-hidden="true" />}
      {children}
    </BaseButton>
  )
})
