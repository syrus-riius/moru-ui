import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import './status-indicator.css'

export interface StatusIndicatorProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Always include readable text; a colored dot alone does not explain a status. */
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  paused?: boolean
  /** Opt in for changing status text; static indicators do not need a live region. */
  live?: 'off' | 'polite'
}

export const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  function StatusIndicator(
    {
      label,
      tone = 'neutral',
      size = 'md',
      pulse = false,
      paused = false,
      live = 'off',
      className,
      ...props
    },
    ref,
  ) {
    return (
      <span
        {...props}
        ref={ref}
        role={live === 'polite' ? 'status' : undefined}
        aria-live={live === 'polite' ? 'polite' : undefined}
        aria-atomic={live === 'polite' ? true : undefined}
        className={cn('ui-status-indicator', className)}
        data-tone={tone}
        data-size={size}
        data-pulse={pulse || undefined}
        data-paused={paused || undefined}
      >
        <span className="ui-status-indicator-dot" aria-hidden="true" />
        <span>{label}</span>
      </span>
    )
  },
)
