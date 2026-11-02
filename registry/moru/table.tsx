'use client'
// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { cn } from './_lib/cn'
import './advanced-controls.css'

export type TableProps = ComponentPropsWithoutRef<'table'> & { scrollLabel?: string; wrapperClassName?: string }

/** The focusable wrapper scrolls; refs and native table attributes stay on the table. */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ className, wrapperClassName, scrollLabel = '가로로 스크롤할 수 있는 데이터 표', ...props }, ref) {
  return <div className={cn('ui-table-scroll', wrapperClassName)} tabIndex={0} role="region" aria-label={scrollLabel}>
    <table {...props} ref={ref} className={cn('ui-table', className)} />
  </div>
})

export const TableHeader = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'thead'>>(function TableHeader({ className, ...props }, ref) {
  return <thead {...props} ref={ref} className={cn('ui-table-header', className)} />
})
export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>(function TableBody({ className, ...props }, ref) {
  return <tbody {...props} ref={ref} className={cn('ui-table-body', className)} />
})
export const TableFooter = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tfoot'>>(function TableFooter({ className, ...props }, ref) {
  return <tfoot {...props} ref={ref} className={cn('ui-table-footer', className)} />
})
export const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>(function TableRow({ className, ...props }, ref) {
  return <tr {...props} ref={ref} className={cn('ui-table-row', className)} />
})
export const TableHead = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'th'>>(function TableHead({ className, scope = 'col', ...props }, ref) {
  return <th {...props} scope={scope} ref={ref} className={cn('ui-table-head', className)} />
})
export const TableCell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'td'>>(function TableCell({ className, ...props }, ref) {
  return <td {...props} ref={ref} className={cn('ui-table-cell', className)} />
})
export const TableCaption = forwardRef<HTMLTableCaptionElement, ComponentPropsWithoutRef<'caption'>>(function TableCaption({ className, ...props }, ref) {
  return <caption {...props} ref={ref} className={cn('ui-table-caption', className)} />
})
