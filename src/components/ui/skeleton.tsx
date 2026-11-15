import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  animation?: 'pulse' | 'shimmer' | 'none'
  paused?: boolean
}

/** A decorative placeholder; label loading on the containing region instead. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { animation = 'pulse', paused = false, className, ...props },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      aria-hidden="true"
      className={cn('ui-skeleton', className)}
      data-animation={animation}
      data-paused={paused || undefined}
    />
  )
})
