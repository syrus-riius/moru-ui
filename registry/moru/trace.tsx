'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react'
import { Check, ChevronDown, Circle, LoaderCircle, X } from 'lucide-react'
import { cn } from './_lib/cn'
import './content-completion.css'

export type TraceStatus = 'pending' | 'running' | 'complete' | 'error'
export interface TraceStep { id: string; title: string; description?: string; status?: TraceStatus; durationMs?: number; details?: ReactNode }
export interface TraceProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
  items: TraceStep[]
  expanded?: string[]
  defaultExpanded?: string[]
  onExpandedChange?: (expanded: string[]) => void
  disabled?: boolean
}
export function formatTraceDuration(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return '시간 알 수 없음'
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`
  if (durationMs < 60000) return `${Math.round(durationMs / 100) / 10}초`
  return `${Math.floor(durationMs / 60000)}분 ${Math.floor((durationMs % 60000) / 1000)}초`
}
const statusLabels: Record<TraceStatus, string> = { pending: '대기', running: '진행 중', complete: '완료', error: '오류' }
const statusIcons = { pending: Circle, running: LoaderCircle, complete: Check, error: X }
export function Trace({ items, expanded, defaultExpanded = [], onExpandedChange, disabled, className, 'aria-label': label = '작업 단계', ...props }: TraceProps) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded)
  const open = expanded ?? localExpanded
  const id = useId()
  function toggle(stepId: string) {
    if (disabled) return
    const next = open.includes(stepId) ? open.filter((item) => item !== stepId) : [...open, stepId]
    if (expanded === undefined) setLocalExpanded(next)
    onExpandedChange?.(next)
  }
  return <ol {...props} aria-label={label} className={cn('ui-trace', className)}>{items.map((item, index) => {
    const status = item.status ?? 'pending'
    const Icon = statusIcons[status]
    const isOpen = open.includes(item.id)
    const copy = <><span className="ui-trace-icon" aria-hidden="true"><Icon size={15} /></span><span className="ui-trace-copy"><span className="ui-trace-title">{item.title}</span>{item.description && <span className="ui-trace-description">{item.description}</span>}</span><span className="ui-trace-meta"><span className="ui-trace-status">{statusLabels[status]}</span>{item.durationMs !== undefined && <span>{formatTraceDuration(item.durationMs)}</span>}</span>{item.details != null && <ChevronDown className="ui-trace-chevron" size={14} aria-hidden="true" />}</>
    return <li key={item.id} className="ui-trace-item" data-status={status} data-expanded={isOpen || undefined}>
      {item.details != null ? <button className="ui-trace-row" type="button" aria-expanded={isOpen} aria-controls={`${id}-${index}-details`} disabled={disabled} onClick={() => toggle(item.id)}>{copy}</button> : <div className="ui-trace-row">{copy}</div>}
      {item.details != null && <div id={`${id}-${index}-details`} className="ui-trace-details" hidden={!isOpen}>{item.details}</div>}
    </li>
  })}</ol>
}
