import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { cn } from '../../lib/cn'
import type { UIState } from './state'

export type ButtonProps = Omit<ComponentPropsWithoutRef<typeof BaseButton>, 'className'> & {
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  /**
   * A label wraps on its own when the container is too narrow. `wrap` marks a label that is
   * expected to wrap and tightens its vertical padding; `nowrap` keeps it on one line.
   */
  textWrap?: 'nowrap' | 'wrap'
  loading?: boolean
  previewState?: UIState
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    textWrap,
    loading = false,
    disabled,
    focusableWhenDisabled,
    children,
    previewState,
    onClick,
    ...props
  },
  ref,
) {
  const busy = loading || previewState === 'loading'
  const unavailable = disabled || busy || previewState === 'disabled'
  return (
    <BaseButton
      {...props}
      ref={ref}
      className={cn('ui-button inline-flex items-center justify-center gap-2', className)}
      data-variant={previewState === 'error' ? 'danger' : variant}
      data-size={size}
      data-text-wrap={textWrap}
      data-ui-state={previewState}
      data-loading={busy || undefined}
      aria-busy={busy || undefined}
      disabled={unavailable}
      // A busy button stays in the tab order (aria-disabled instead of the native attribute),
      // so keyboard focus is not dropped to <body> the moment an action starts.
      focusableWhenDisabled={focusableWhenDisabled ?? busy}
      onClick={(event) => {
        if (!unavailable) onClick?.(event)
      }}
    >
      {busy && <span className="ui-button-spinner ui-loading-indicator" aria-hidden="true" />}
      {children}
    </BaseButton>
  )
})
