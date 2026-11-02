'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { cn } from './_lib/cn'
import { clampPage, getPaginationItems, normalizePageCount } from './pagination-utils'
import './advanced-controls.css'

export interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  siblingCount?: number
  disabled?: boolean
  'aria-label'?: string
  className?: string
}

export function Pagination({ page, pageCount, onPageChange, siblingCount = 1, disabled, 'aria-label': ariaLabel = '페이지 탐색', className }: PaginationProps) {
  const count = normalizePageCount(pageCount)
  const current = clampPage(page, count)
  const changePage = (next: number) => {
    if (!disabled && count > 0 && next !== current) onPageChange(clampPage(next, count))
  }
  return <nav className={cn('ui-pagination', className)} aria-label={ariaLabel}>
    <ul className="ui-pagination-list">
      <li><button type="button" className="ui-pagination-button" aria-label="이전 페이지" disabled={disabled || current <= 1} onClick={() => changePage(current - 1)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m10 4-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></li>
      {getPaginationItems(current, count, siblingCount).map((item) => <li key={item}>{typeof item === 'number'
        ? <button type="button" className="ui-pagination-button" aria-label={`${item}페이지`} aria-current={item === current ? 'page' : undefined} disabled={disabled} onClick={() => changePage(item)}>{item}</button>
        : <span className="ui-pagination-ellipsis" aria-hidden="true">…</span>}</li>)}
      <li><button type="button" className="ui-pagination-button" aria-label="다음 페이지" disabled={disabled || count === 0 || current >= count} onClick={() => changePage(current + 1)}><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></li>
    </ul>
    <span className="ui-advanced-sr-only" role="status" aria-live="polite" aria-atomic="true">{count === 0 ? '페이지가 없습니다.' : `전체 ${count}페이지 중 ${current}페이지`}</span>
  </nav>
}
