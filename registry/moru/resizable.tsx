'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { Group, Panel, Separator, type GroupProps, type PanelProps, type SeparatorProps } from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'
import { cn } from './_lib/cn'
import './data-completion.css'

export function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return <Group {...props} className={cn('ui-resizable-group', className)} />
}
export function ResizablePanel({ className, ...props }: PanelProps) {
  return <Panel {...props} className={cn('ui-resizable-panel', className)} />
}
export function ResizableHandle({ className, withHandle = true, 'aria-label': label = '패널 크기 조절', ...props }: SeparatorProps & { withHandle?: boolean }) {
  return <Separator {...props} aria-label={label} className={cn('ui-resizable-handle', className)}>{withHandle && <span><GripVertical size={14} aria-hidden="true" /></span>}</Separator>
}
export type { GroupProps as ResizablePanelGroupProps, PanelProps as ResizablePanelProps }
