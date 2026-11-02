import { renderToStaticMarkup } from 'react-dom/server'
import { constructTable, tableFeatures } from '@tanstack/table-core'
import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings'
import { describe, expect, it } from 'vitest'
import { DataTable, dataTableFeatures, type DataTableColumn } from './data-table'
import { Chart } from './chart'
import { ScrollArea } from './scroll-area'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './resizable'

interface ProjectRow { id: string; name: string; team: string; score: number }
const data: ProjectRow[] = [
  { id: 'ari', name: 'Ari', team: 'Alpha', score: 20 },
  { id: 'zed', name: 'Zed', team: 'Alpha', score: 10 },
  { id: 'mina', name: 'Mina', team: 'Beta', score: 50 },
  { id: 'bo', name: 'Bo', team: 'Alpha', score: 40 },
  { id: 'jae', name: 'Jae', team: 'Beta', score: 30 },
  { id: 'lee', name: 'Lee', team: 'Alpha', score: 60 },
]
const columns: DataTableColumn<ProjectRow>[] = [
  { accessorKey: 'name', header: '이름', enableHiding: false },
  { accessorKey: 'team', header: '팀' },
  { accessorKey: 'score', header: '진행도' },
]

// Use the exact feature registry exported by our composition. The extra binding only
// supplies the non-React host that useTable normally creates for the component.
function createProjectTable() {
  return constructTable({
    features: tableFeatures({ ...dataTableFeatures, coreReactivityFeature: storeReactivityBindings() }),
    data, columns, getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
    globalFilterFn: 'includesString', enableRowSelection: true,
    defaultColumn: { sortFn: 'alphanumeric' },
  })
}

describe('Moru DataTable feature integration', () => {
  it('searches before sorting and slicing pages with our registered row models', () => {
    const table = createProjectTable()
    table.setGlobalFilter('ALPHA')
    table.setPageIndex(0)
    table.setSorting([{ id: 'score', desc: false }])
    expect(table.getFilteredRowModel().rows.map((row) => row.id)).toEqual(['ari', 'zed', 'bo', 'lee'])
    expect(table.getSortedRowModel().rows.map((row) => row.id)).toEqual(['zed', 'ari', 'bo', 'lee'])
    expect(table.getRowModel().rows.map((row) => row.id)).toEqual(['zed', 'ari'])
    expect(table.getPageCount()).toBe(2)
    table.setPageIndex(1)
    expect(table.getRowModel().rows.map((row) => row.id)).toEqual(['bo', 'lee'])
  })

  it('keeps a selected identity attached to its source row after sort, search, and page changes', () => {
    const table = createProjectTable()
    table.getRow('bo').toggleSelected(true)
    table.setGlobalFilter('alpha')
    table.setSorting([{ id: 'score', desc: true }])
    table.setPageIndex(1)
    expect(table.getSelectedRowModel().rows.map((row) => row.original.name)).toEqual(['Bo'])
    expect(table.getRow('bo').getIsSelected()).toBe(true)
    expect(table.getRow('ari').getIsSelected()).toBe(false)
    table.setGlobalFilter('beta')
    table.setPageIndex(0)
    expect(table.getRowModel().rows.map((row) => row.id)).toEqual(['mina', 'jae'])
    expect(table.getFilteredSelectedRowModel().rows).toHaveLength(0)
    expect(table.getSelectedRowModel().rows.map((row) => row.id)).toEqual(['bo'])
    table.setGlobalFilter('')
    expect(table.getRow('bo').original.name).toBe('Bo')
    expect(table.getRow('bo').getIsSelected()).toBe(true)
  })

  it('selects the displayed page after hiding a column without changing row identities', () => {
    const table = createProjectTable()
    table.getColumn('team')!.toggleVisibility(false)
    table.setGlobalFilter('alpha')
    table.setSorting([{ id: 'score', desc: false }])
    table.setPageIndex(1)
    expect(table.getVisibleLeafColumns().map((column) => column.id)).toEqual(['name', 'score'])
    expect(table.getRowModel().rows[0].getVisibleCells().map((cell) => cell.column.id)).toEqual(['name', 'score'])
    table.toggleAllPageRowsSelected(true)
    expect(table.getSelectedRowModel().rows.map((row) => row.id)).toEqual(['bo', 'lee'])
    expect(table.getIsAllPageRowsSelected()).toBe(true)
    table.setPageIndex(0)
    expect(table.getIsAllPageRowsSelected()).toBe(false)
    table.toggleAllPageRowsSelected(true)
    expect(new Set(table.getSelectedRowModel().rows.map((row) => row.id))).toEqual(new Set(['ari', 'zed', 'bo', 'lee']))
    table.toggleAllPageRowsSelected(false)
    expect(table.getSelectedRowModel().rows.map((row) => row.id)).toEqual(['bo', 'lee'])
  })

  it('renders a labeled semantic table, selection, and only the initial page during SSR', () => {
    const markup = renderToStaticMarkup(<DataTable data={data} columns={columns} getRowId={(row) => row.id} caption="프로젝트 진행" pageSize={2} />)
    expect(markup).toContain('<table aria-label="프로젝트 진행"')
    expect(markup).toContain('<caption class="ui-table-caption">프로젝트 진행</caption>')
    expect(markup).toContain('scope="col"')
    expect(markup).toContain('aria-label="프로젝트 진행 검색"')
    expect(markup).toContain('aria-label="현재 페이지 전체 선택"')
    expect(markup).toContain('aria-label="프로젝트 진행 페이지"')
    expect(markup).toContain('Ari')
    expect(markup).toContain('Zed')
    expect(markup).not.toContain('Mina')
    expect(markup).toContain('6개 표시 · 0개 선택')
  })

  it('keeps empty tables readable and turns off unavailable pagination and selection', () => {
    const markup = renderToStaticMarkup(<DataTable data={[]} columns={columns} getRowId={(row) => row.id} caption="빈 프로젝트" />)
    expect(markup).toContain('일치하는 항목이 없습니다.')
    expect(markup).toContain('colSpan="4"')
    expect(markup).toContain('0개 표시 · 0개 선택')
    expect(markup).toContain('aria-label="현재 페이지 전체 선택"')
    expect(markup).toContain('disabled=""')
  })

  it('omits selection controls and selection announcements when selection is disabled by the API', () => {
    const markup = renderToStaticMarkup(<DataTable data={data} columns={columns} getRowId={(row) => row.id} caption="읽기 전용 목록" selectable={false} disabled />)
    expect(markup).not.toContain('현재 페이지 전체 선택')
    expect(markup).not.toContain('개 선택')
    expect(markup).not.toContain('aria-selected=')
    expect(markup).toContain('6개 표시')
    expect(markup).toContain('disabled=""')
  })
})

describe('Chart data alternatives', () => {
  const config = { desktop: { label: '데스크톱', color: '#356aaf' }, mobile: { label: '모바일', color: '#56a57b' } }
  it('provides the same named data in a semantic table without depending on SVG rendering', () => {
    const markup = renderToStaticMarkup(<Chart title="주간 방문" xKey="day" config={config} data={[{ day: '월', desktop: 0, mobile: 14 }, { day: '화', desktop: 22 }]} />)
    expect(markup).toContain('<figure')
    expect(markup).toContain('aria-labelledby=')
    expect(markup).toContain('<summary>데이터 표로 보기</summary>')
    expect(markup).toContain('<caption>주간 방문</caption>')
    expect(markup).toContain('<th scope="col">데스크톱</th>')
    expect(markup).toContain('<th scope="row">월</th>')
    expect(markup).toContain('<td>0</td><td>14</td>')
    expect(markup).toContain('<td>22</td><td>—</td>')
    expect(markup).toContain('aria-label="주간 방문 표시할 계열"')
  })

  it.each(['bar', 'line', 'area'] as const)('keeps the data-table alternative across the %s presentation', (type) => {
    const markup = renderToStaticMarkup(<Chart type={type} title="사용량" xKey="day" config={config} data={[{ day: '월', desktop: 12, mobile: 8 }]} />)
    expect(markup).toContain('<caption>사용량</caption>')
    expect(markup).toContain('<td>12</td><td>8</td>')
  })

  it('gives empty datasets a visible message instead of an empty chart or table', () => {
    const markup = renderToStaticMarkup(<Chart title="주간 방문" xKey="day" config={config} data={[]} />)
    expect(markup).toContain('주간 방문')
    expect(markup).toContain('표시할 데이터가 없습니다.')
    expect(markup).not.toContain('<table')
    expect(markup).not.toContain('표시할 계열')
  })

  it('treats missing series configuration as empty and protects the final visible series', () => {
    const empty = renderToStaticMarkup(<Chart title="설정 전" xKey="day" config={{}} data={[{ day: '월', value: 10 }]} />)
    expect(empty).toContain('표시할 데이터가 없습니다.')
    const single = renderToStaticMarkup(<Chart title="데스크톱" xKey="day" config={{ desktop: config.desktop }} data={[{ day: '월', desktop: 10 }]} />)
    expect(single).toContain('aria-pressed="true"')
    expect(single).toContain('disabled=""')
  })
})

describe('Scrollable and resizable regions', () => {
  it('makes scroll content a named keyboard region while keeping root attributes on the host', () => {
    const markup = renderToStaticMarkup(<ScrollArea id="activity-log" aria-label="활동 기록" orientation="both" viewportClassName="activity-viewport" style={{ height: 160 }}><p>최근 변경 사항</p></ScrollArea>)
    expect(markup).toContain('id="activity-log"')
    expect(markup).toContain('height:160px')
    expect(markup).toContain('ui-scroll-viewport activity-viewport')
    expect(markup).toContain('role="region"')
    expect(markup).toContain('aria-label="활동 기록"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('최근 변경 사항')
  })

  it('supplies a default scroll-region name and a custom name for the resize separator', () => {
    const scroll = renderToStaticMarkup(<ScrollArea>기록</ScrollArea>)
    expect(scroll).toContain('aria-label="스크롤 영역"')
    const markup = renderToStaticMarkup(<ResizablePanelGroup orientation="horizontal"><ResizablePanel id="outline" defaultSize="40%" minSize="20%">목차</ResizablePanel><ResizableHandle aria-label="목차와 본문 너비 조절" /><ResizablePanel id="document" defaultSize="60%">본문</ResizablePanel></ResizablePanelGroup>)
    expect(markup).toContain('role="separator"')
    expect(markup).toContain('aria-label="목차와 본문 너비 조절"')
    expect(markup).toContain('tabindex="0"')
    expect(markup).toContain('aria-orientation="vertical"')
    expect(markup).toContain('목차')
    expect(markup).toContain('본문')
  })
})
