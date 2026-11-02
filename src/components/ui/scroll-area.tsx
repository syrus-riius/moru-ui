import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import { cn } from '../../lib/cn'
import './data-completion.css'

export interface ScrollAreaProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: 'vertical' | 'horizontal' | 'both'
  viewportClassName?: string
}

/** Give the root a height (or max-height) to constrain its viewport. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea({ children, className, viewportClassName, orientation = 'vertical', onScroll, 'aria-label': label = '스크롤 영역', ...props }, ref) {
  return <BaseScrollArea.Root {...props} className={cn('ui-scroll-area', className)}>
    <BaseScrollArea.Viewport ref={ref} className={cn('ui-scroll-viewport', viewportClassName)} role="region" aria-label={label} tabIndex={0} onScroll={onScroll}>
      <BaseScrollArea.Content className="ui-scroll-content">{children}</BaseScrollArea.Content>
    </BaseScrollArea.Viewport>
    {orientation !== 'horizontal' && <ScrollBar orientation="vertical" />}
    {orientation !== 'vertical' && <ScrollBar orientation="horizontal" />}
    {orientation === 'both' && <BaseScrollArea.Corner className="ui-scroll-corner" />}
  </BaseScrollArea.Root>
})

export function ScrollBar({ className, ...props }: Omit<ComponentPropsWithoutRef<typeof BaseScrollArea.Scrollbar>, 'className'> & { className?: string }) {
  return <BaseScrollArea.Scrollbar {...props} className={cn('ui-scroll-bar', className)}><BaseScrollArea.Thumb className="ui-scroll-thumb" /></BaseScrollArea.Scrollbar>
}
