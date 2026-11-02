import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type CardProps = HTMLAttributes<HTMLDivElement>

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ className, children, ...props }, ref) {
  return <div ref={ref} className={cn('ui-card', className)} {...props}>{children}</div>
})
