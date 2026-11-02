import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import './content-completion.css'

export interface BubbleProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline'
  align?: 'start' | 'end'
}
export const Bubble = forwardRef<HTMLDivElement, BubbleProps>(function Bubble({ variant = 'default', align = 'start', className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn('ui-bubble', className)} data-variant={variant} data-align={align} />
})
export function BubbleContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-bubble-content', className)} /> }
export function BubbleFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-bubble-footer', className)} /> }
export function BubbleReactions({ className, 'aria-label': label = '메시지 반응', ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} role="group" aria-label={label} className={cn('ui-bubble-reactions', className)} /> }
export function BubbleGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-bubble-group', className)} /> }
