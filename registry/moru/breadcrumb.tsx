'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { Fragment, type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from './_lib/cn'
import './navigation-completion.css'

export interface BreadcrumbItem {
  label: ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
}
export interface BreadcrumbProps {
  items: BreadcrumbItem[]
  'aria-label'?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/** The final item is the current page, and is intentionally not an interactive link. */
export function Breadcrumb({ items, disabled = false, size = 'md', className, 'aria-label': label = '현재 위치' }: BreadcrumbProps) {
  return <nav aria-label={label} className={cn('ui-breadcrumb', className)} data-size={size}><ol>
    {items.map((item, index) => {
      const current = index === items.length - 1
      const unavailable = disabled || item.disabled
      return <Fragment key={index}>
        {index > 0 ? <li className="ui-breadcrumb-separator" aria-hidden="true"><ChevronRight size={14} /></li> : null}
        <li>{current ? <span aria-current="page">{item.label}</span> : unavailable ? <span aria-disabled="true">{item.label}</span> : item.href ? <a href={item.href} onClick={item.onClick}>{item.label}</a> : item.onClick ? <button type="button" onClick={item.onClick}>{item.label}</button> : <span>{item.label}</span>}</li>
      </Fragment>
    })}
  </ol></nav>
}
