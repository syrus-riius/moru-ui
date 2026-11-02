import { Progress as BaseProgress } from '@base-ui/react/progress'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

export interface ProgressProps extends Omit<ComponentPropsWithoutRef<typeof BaseProgress.Root>, 'className' | 'children' | 'min' | 'max' | 'value'> {
  value?: number | null
  max?: number
  label?: string
  showValue?: boolean
  className?: string
}

/** Pass null for work whose completion percentage is not yet known. */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, max = 100, label, showValue = false, className, ...props },
  ref,
) {
  const resolvedMax = Number.isFinite(max) && max > 0 ? max : 100
  const resolvedValue = value == null || !Number.isFinite(value) ? null : Math.min(resolvedMax, Math.max(0, value))
  return (
    <BaseProgress.Root
      aria-label={label || props['aria-labelledby'] ? undefined : '진행률'}
      {...(resolvedValue === null ? { 'aria-valuetext': '진행 중' } : {})}
      {...props}
      ref={ref}
      value={resolvedValue}
      max={resolvedMax}
      className={cn('ui-progress', className)}
    >
      {(label || showValue) && (
        <div className="ui-progress-heading">
          {label && <BaseProgress.Label className="ui-progress-label">{label}</BaseProgress.Label>}
          {showValue && (
            <BaseProgress.Value className="ui-progress-value">
              {(formattedValue) => resolvedValue === null ? '진행 중' : formattedValue}
            </BaseProgress.Value>
          )}
        </div>
      )}
      <BaseProgress.Track className="ui-progress-track">
        <BaseProgress.Indicator className="ui-progress-indicator" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
})
