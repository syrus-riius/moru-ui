'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from './_lib/cn'
import './content-completion.css'

export interface MessageProps extends HTMLAttributes<HTMLElement> { align?: 'start' | 'end' }
export const Message = forwardRef<HTMLElement, MessageProps>(function Message({ align = 'start', className, ...props }, ref) {
  return <article {...props} ref={ref} className={cn('ui-message', className)} data-align={align} />
})
export function MessageAvatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-message-avatar', className)} /> }
export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-message-content', className)} /> }
export function MessageHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-message-header', className)} /> }
export function MessageFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-message-footer', className)} /> }
export function MessageGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div {...props} className={cn('ui-message-group', className)} /> }
