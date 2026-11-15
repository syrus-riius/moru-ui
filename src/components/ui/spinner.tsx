import { useI18n } from '../../lib/i18n'
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import './controls-completion.css'

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ring' | 'dots' | 'bars'
  label?: string
  paused?: boolean
  /** Use inside an already labelled loading button or status to avoid duplicate announcements. */
  decorative?: boolean
}
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  {
    size = 'md',
    variant = 'ring',
    label: labelProp,
    paused = false,
    decorative = false,
    className,
    ...props
  },
  ref,
) {
  const { t } = useI18n()
  const label = labelProp ?? t('불러오는 중')

  return (
    <span
      {...props}
      ref={ref}
      className={cn('ui-spinner', className)}
      data-size={size}
      data-variant={variant}
      data-paused={paused || undefined}
      role={decorative ? undefined : 'status'}
      aria-hidden={decorative ? true : props['aria-hidden']}
      aria-label={
        decorative || props['aria-labelledby'] ? undefined : (props['aria-label'] ?? label)
      }
      aria-labelledby={decorative ? undefined : props['aria-labelledby']}
      aria-live={decorative ? undefined : props['aria-live']}
    >
      {variant === 'ring' ? (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity=".2" />
          <path
            d="M12 3a9 9 0 0 1 9 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <span className="ui-spinner-segments" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      )}
    </span>
  )
})
