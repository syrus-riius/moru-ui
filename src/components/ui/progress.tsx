import { useI18n } from '../../lib/i18n'
import { Progress as BaseProgress } from '@base-ui/react/progress'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

export interface ProgressProps extends Omit<
  ComponentPropsWithoutRef<typeof BaseProgress.Root>,
  'className' | 'children' | 'min' | 'max' | 'value'
> {
  value?: number | null
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** Amount prepared or buffered, in the same units as value. This does not change completion. */
  bufferValue?: number
  striped?: boolean
  /** Animate stripes only when striped is enabled. Indeterminate progress moves by default. */
  animated?: boolean
  paused?: boolean
  className?: string
}

/** Pass null for work whose completion percentage is not yet known. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    max = 100,
    label,
    showValue = false,
    size = 'md',
    tone = 'primary',
    bufferValue,
    striped = false,
    animated = false,
    paused = false,
    className,
    ...props
  },
  ref,
) {
  const { t } = useI18n()

  const resolvedMax = Number.isFinite(max) && max > 0 ? max : 100
  const resolvedValue =
    value == null || !Number.isFinite(value) ? null : Math.min(resolvedMax, Math.max(0, value))
  const resolvedBuffer =
    resolvedValue !== null && bufferValue !== undefined && Number.isFinite(bufferValue)
      ? Math.min(resolvedMax, Math.max(resolvedValue, bufferValue))
      : null
  return (
    <BaseProgress.Root
      aria-label={label || props['aria-labelledby'] ? undefined : t('진행률')}
      {...(resolvedValue === null ? { 'aria-valuetext': t('진행 중') } : {})}
      {...props}
      ref={ref}
      value={resolvedValue}
      max={resolvedMax}
      className={cn('ui-progress', className)}
      data-size={size}
      data-tone={tone}
      data-striped={striped || undefined}
      data-animated={(striped && animated) || undefined}
      data-paused={paused || undefined}
    >
      {(label || showValue) && (
        <div className="ui-progress-heading">
          {label && <BaseProgress.Label className="ui-progress-label">{label}</BaseProgress.Label>}
          {showValue && (
            <BaseProgress.Value className="ui-progress-value">
              {(formattedValue) => (resolvedValue === null ? t('진행 중') : formattedValue)}
            </BaseProgress.Value>
          )}
        </div>
      )}
      <BaseProgress.Track className="ui-progress-track">
        {resolvedBuffer !== null && (
          <div
            className="ui-progress-buffer"
            aria-hidden="true"
            style={{ width: `${(resolvedBuffer / resolvedMax) * 100}%` }}
          />
        )}
        <BaseProgress.Indicator className="ui-progress-indicator" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
})
