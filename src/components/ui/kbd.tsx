import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import './controls-completion.css'

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) { return <kbd {...props} className={cn('ui-kbd', className)} /> }
export function KbdGroup({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span {...props} className={cn('ui-kbd-group', className)} /> }
