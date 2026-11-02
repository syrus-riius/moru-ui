import { useEffect, useEffectEvent } from 'react'
import {
  columnFilteringFeature, columnVisibilityFeature, globalFilteringFeature, rowPaginationFeature,
  rowSelectionFeature, rowSortingFeature, createFilteredRowModel, createPaginatedRowModel,
  createSortedRowModel, filterFn_includesString, sortFn_alphanumeric, sortFn_text, sortFn_basic,
  tableFeatures, useTable, type ColumnDef, type RowData,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, Columns3 } from 'lucide-react'
import { Button } from './button'
import { Checkbox } from './checkbox'
import { Input } from './input'
import { Pagination } from './pagination'
import { Popover } from './popover'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './table'
import { cn } from '../../lib/cn'
import './data-completion.css'

export const dataTableFeatures = tableFeatures({
  columnFilteringFeature, globalFilteringFeature, columnVisibilityFeature,
  rowPaginationFeature, rowSelectionFeature, rowSortingFeature,
  filteredRowModel: createFilteredRowModel(), paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(), filterFns: { includesString: filterFn_includesString },
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, basic: sortFn_basic },
})
export type DataTableFeatures = typeof dataTableFeatures
export type DataTableColumn<T extends RowData> = ColumnDef<DataTableFeatures, T>
export interface DataTableProps<T extends RowData> {
  data: T[]
  columns: DataTableColumn<T>[]
  getRowId: (row: T) => string
  caption: string
  pageSize?: number
  selectable?: boolean
  disabled?: boolean
  searchPlaceholder?: string
  onSelectionChange?: (ids: string[]) => void
  className?: string
}

/** Client-side table composition. Stable row IDs keep selection attached after sorting. */
export function DataTable<T extends RowData>({ data, columns, getRowId, caption, pageSize = 5, selectable = true, disabled = false, searchPlaceholder = '목록 검색', onSelectionChange, className }: DataTableProps<T>) {
  const table = useTable({ features: dataTableFeatures, data, columns, getRowId,
    initialState: { pagination: { pageIndex: 0, pageSize: Math.max(1, Math.floor(pageSize) || 5) } },
    globalFilterFn: 'includesString', enableRowSelection: selectable,
    defaultColumn: { sortFn: 'alphanumeric' },
  })
  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id)
  const selectionKey = JSON.stringify(selectedIds)
  const notifySelection = useEffectEvent(() => onSelectionChange?.(selectedIds))
  useEffect(() => { notifySelection() }, [selectionKey])
  const rowCount = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const visibleCount = table.getVisibleLeafColumns().length
  const page = Math.min(table.state.pagination.pageIndex, Math.max(0, pageCount - 1))
  // A parent may replace data while the last page is visible.
  useEffect(() => { if (table.state.pagination.pageIndex !== page) table.setPageIndex(page) }, [table, page])
  return <div className={cn('ui-data-table', className)}>
    <div className="ui-data-table-toolbar"><Input type="search" aria-label={`${caption} 검색`} placeholder={searchPlaceholder} value={String(table.state.globalFilter ?? '')} disabled={disabled} onValueChange={(value) => { table.setGlobalFilter(value); table.setPageIndex(0) }} />
      <Popover title="표시할 열" trigger={<Button variant="secondary" size="sm" disabled={disabled}><Columns3 size={14} />열 선택</Button>}><div className="ui-data-table-columns">{table.getAllLeafColumns().filter((column) => column.getCanHide()).map((column) => <Checkbox key={column.id} label={typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id} checked={column.getIsVisible()} disabled={disabled || (column.getIsVisible() && visibleCount === 1)} onCheckedChange={(checked) => column.toggleVisibility(checked)} />)}</div></Popover>
    </div>
    <Table aria-label={caption}><TableCaption>{caption}</TableCaption><TableHeader>{table.getHeaderGroups().map((group) => <TableRow key={group.id}>
      {selectable && <TableHead><Checkbox aria-label="현재 페이지 전체 선택" checked={table.getIsAllPageRowsSelected()} indeterminate={table.getIsSomePageRowsSelected()} disabled={disabled || !table.getRowModel().rows.length} onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)} /></TableHead>}
      {group.headers.map((header) => <TableHead key={header.id} colSpan={header.colSpan} aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined}>{header.isPlaceholder ? null : header.column.getCanSort() ? <button type="button" className="ui-data-table-sort" disabled={disabled} onClick={() => { header.column.toggleSorting(); table.setPageIndex(0) }}><table.FlexRender header={header} />{header.column.getIsSorted() === 'asc' ? <ArrowUp size={13} aria-hidden="true" /> : header.column.getIsSorted() === 'desc' ? <ArrowDown size={13} aria-hidden="true" /> : <ArrowUpDown size={13} aria-hidden="true" />}</button> : <table.FlexRender header={header} />}</TableHead>)}
    </TableRow>)}</TableHeader><TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <TableRow key={row.id} aria-selected={selectable ? row.getIsSelected() : undefined}>
      {selectable && <TableCell><Checkbox aria-label={`행 ${row.index + 1} 선택`} checked={row.getIsSelected()} disabled={disabled} onCheckedChange={(checked) => row.toggleSelected(checked)} /></TableCell>}
      {row.getVisibleCells().map((cell) => <TableCell key={cell.id}><table.FlexRender cell={cell} /></TableCell>)}
    </TableRow>) : <TableRow><TableCell colSpan={visibleCount + (selectable ? 1 : 0)} className="ui-data-table-empty">일치하는 항목이 없습니다.</TableCell></TableRow>}</TableBody></Table>
    <footer className="ui-data-table-footer"><p className="ui-data-table-summary" role="status">{rowCount}개 표시{selectable ? ` · ${selectedIds.length}개 선택` : ''}</p><Pagination page={page + 1} pageCount={pageCount} disabled={disabled} aria-label={`${caption} 페이지`} onPageChange={(next) => table.setPageIndex(next - 1)} /></footer>
  </div>
}
