import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import './controls-completion.css'

export type ItemProps = HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'outline' | 'muted'; size?: 'sm' | 'md' | 'lg' }
export const Item = forwardRef<HTMLDivElement, ItemProps>(function Item({ variant = 'default', size = 'md', className, ...props }, ref) {
  return <div {...props} ref={ref} className={cn('ui-item', className)} data-variant={variant} data-size={size} />
})
export function ItemGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-item-group', className)} /> }
export function ItemMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-item-media', className)} /> }
export function ItemContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-item-content', className)} /> }
export function ItemTitle({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-item-title', className)} /> }
export function ItemDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p {...props} className={cn('ui-item-description', className)} /> }
export function ItemActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-item-actions', className)} /> }
export function ItemSeparator({ className, ...props }: HTMLAttributes<HTMLHRElement>) { return <hr {...props} className={cn('ui-item-separator', className)} /> }
