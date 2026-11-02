import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import './controls-completion.css'

export type SpinnerProps = HTMLAttributes<HTMLSpanElement> & { size?: 'sm' | 'md' | 'lg'; label?: string }
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner({ size = 'md', label = '불러오는 중', className, ...props }, ref) {
  return <span {...props} ref={ref} className={cn('ui-spinner', className)} data-size={size} role="status" aria-label={label}><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity=".2" /><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span>
})
