import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type SkeletonProps = HTMLAttributes<HTMLDivElement>

/** A decorative placeholder; label loading on the containing region instead. */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton({ className, ...props }, ref) {
  return <div {...props} ref={ref} aria-hidden="true" className={cn('ui-skeleton', className)} />
})
