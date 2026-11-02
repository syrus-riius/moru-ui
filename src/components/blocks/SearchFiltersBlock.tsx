import { useId, useRef, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Select } from '../ui/select'

export interface SearchFilterItem {
  id: string
  name: string
  summary: string
  status: string
  owner: string
}

export interface SearchFiltersValue {
  query: string
  status: string
  mineOnly: boolean
}

export interface SearchFiltersBlockProps {
  items?: readonly SearchFilterItem[]
  filters?: SearchFiltersValue
  defaultFilters?: Partial<SearchFiltersValue>
  onFiltersChange?: (filters: SearchFiltersValue) => void
  onSelect?: (id: string) => void
  currentOwner?: string
  statusOptions?: readonly { value: string; label: string }[]
  title?: string
  description?: string
  searchLabel?: string
  mineLabel?: string
  resultsLabel?: string
  selectLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
}

const projects: readonly SearchFilterItem[] = [
  { id: 'brand', name: '브랜드 가이드', summary: '브랜드의 공통 언어를 정리해요.', status: 'active', owner: 'me' },
  { id: 'website', name: '제품 소개 웹사이트', summary: '새로운 제품을 소개하는 첫 화면.', status: 'active', owner: 'team' },
  { id: 'onboarding', name: '팀 온보딩', summary: '함께 시작하기 위한 체크리스트.', status: 'planned', owner: 'me' },
  { id: 'mobile', name: '모바일 앱 리서치', summary: '작은 화면에서 더 나은 경험을 찾아요.', status: 'done', owner: 'team' },
]
const initialFilters: SearchFiltersValue = { query: '', status: 'all', mineOnly: false }
const defaultStatusOptions = [{ value: 'all', label: '모든 상태' }, { value: 'active', label: '진행 중' }, { value: 'planned', label: '예정' }, { value: 'done', label: '완료' }]

export function filterBlockItems(query: string, status: string, mineOnly: boolean, items: readonly SearchFilterItem[] = projects, currentOwner = 'me') {
  const search = query.trim().toLocaleLowerCase()
  return items.filter((project) => (!search || `${project.name} ${project.summary}`.toLocaleLowerCase().includes(search))
    && (status === 'all' || project.status === status) && (!mineOnly || project.owner === currentOwner))
}

/** Omit props for the gallery demo, or provide application records and selection/filter handlers. */
export function SearchFiltersBlock({
  items = projects, filters, defaultFilters, onFiltersChange, onSelect, currentOwner = 'me', statusOptions = defaultStatusOptions,
  title = '프로젝트를 찾아보세요', description = '검색과 필터를 조합해 필요한 작업만 모으세요.',
  searchLabel = '프로젝트 검색', mineLabel = '내가 담당한 프로젝트만', resultsLabel = '프로젝트 검색 결과',
  selectLabel = '선택', emptyTitle = '검색 결과가 없어요', emptyDescription = '다른 검색어를 입력하거나 필터를 초기화해 보세요.', emptyActionLabel = '전체 프로젝트 보기',
}: SearchFiltersBlockProps = {}) {
  const id = useId()
  const [internalFilters, setInternalFilters] = useState<SearchFiltersValue>(() => ({ ...initialFilters, ...defaultFilters }))
  const [selectedId, setSelectedId] = useState('')
  const queryRef = useRef<HTMLInputElement>(null)
  const currentFilters = filters ?? internalFilters
  const options = statusOptions.some((option) => option.value === 'all') ? [...statusOptions] : [defaultStatusOptions[0], ...statusOptions]
  const statusLabels = Object.fromEntries(options.map((option) => [option.value, option.label]))
  const results = filterBlockItems(currentFilters.query, currentFilters.status, currentFilters.mineOnly, items, currentOwner)
  const selected = results.find((item) => item.id === selectedId)?.name
  function change(patch: Partial<SearchFiltersValue>) {
    const next = { ...currentFilters, ...patch }
    if (filters === undefined) setInternalFilters(next)
    onFiltersChange?.(next)
    setSelectedId('')
  }
  function reset() { change(initialFilters); queryRef.current?.focus() }

  return <Card style={{ width: '100%', maxWidth: 760, margin: '0 auto', padding: 'var(--ui-card-padding, 24px)', boxSizing: 'border-box' }}>
    <div style={{ display: 'grid', gap: 'var(--ui-form-gap, 20px)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--ui-control-gap, 8px)', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 'var(--ui-field-gap, 8px)' }}>
          <h3 id={`${id}-title`} style={{ margin: 0, fontSize: 'var(--ui-type-heading-size, 24px)', fontWeight: 'var(--ui-type-heading-weight, 600)', lineHeight: 'var(--ui-type-heading-line-height, 1.35)', letterSpacing: 'var(--ui-type-heading-letter-spacing, -.025em)' }}>{title}</h3>
          <p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-body-size, 14px)', lineHeight: 'var(--ui-type-body-line-height, 1.6)' }}>{description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset}>필터 초기화</Button>
      </header>
      <form role="search" aria-labelledby={`${id}-title`} onSubmit={(event) => event.preventDefault()} style={{ display: 'grid', gap: 'var(--ui-control-gap, 12px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ui-control-gap, 12px)', alignItems: 'end' }}>
          <div style={{ flex: '2 1 200px', minWidth: 0 }}><Field label={searchLabel}><Input ref={queryRef} type="search" name="query" placeholder="이름이나 설명으로 검색" value={currentFilters.query} onChange={(event) => change({ query: event.target.value })} /></Field></div>
          <div style={{ flex: '1 1 140px', minWidth: 0 }}><Field label="진행 상태"><Select name="status" value={currentFilters.status} onValueChange={(status) => change({ status })} items={options} /></Field></div>
        </div>
        <Checkbox label={mineLabel} checked={currentFilters.mineOnly} onCheckedChange={(mineOnly) => change({ mineOnly })} />
      </form>
      <p role="status" aria-live="polite" style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)' }}>검색 결과 {results.length}개{selected ? ` · ${selected} 선택됨` : ''}</p>
      {results.length ? <ul aria-label={resultsLabel} style={{ display: 'grid', gap: 'var(--ui-control-gap, 8px)', listStyle: 'none', margin: 0, padding: 0 }}>
        {results.map((project) => <li key={project.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--ui-control-gap, 12px)', padding: 'calc(var(--ui-space, 4px) * 4)', borderRadius: 'var(--ui-radius, 6px)', background: 'var(--ui-surface-hover)', minWidth: 0 }}>
          <div style={{ display: 'grid', gap: 4, minWidth: 0, flex: '1 1 180px', overflowWrap: 'anywhere' }}><strong style={{ fontSize: 'var(--ui-type-label-size, 14px)', fontWeight: 'var(--ui-type-label-weight, 550)' }}>{project.name}</strong><span style={{ color: 'var(--ui-muted)', fontSize: 'var(--ui-type-caption-size, 12px)', lineHeight: 'var(--ui-type-caption-line-height, 1.5)' }}>{project.summary}</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ui-control-gap, 8px)', flexWrap: 'wrap' }}><Badge variant="outline">{statusLabels[project.status] ?? project.status}</Badge><Button size="sm" variant="secondary" aria-label={`${project.name} ${selectLabel}`} onClick={() => { setSelectedId(project.id); onSelect?.(project.id) }}>{selectLabel}</Button></div>
        </li>)}
      </ul> : <div style={{ display: 'grid', justifyItems: 'start', gap: 'var(--ui-control-gap, 8px)', padding: 'var(--ui-card-padding, 24px)', background: 'var(--ui-surface-hover)', borderRadius: 'var(--ui-radius, 6px)' }}><strong>{emptyTitle}</strong><p style={{ margin: 0, color: 'var(--ui-muted)', fontSize: 'var(--ui-type-body-size, 14px)' }}>{emptyDescription}</p><Button variant="secondary" onClick={reset}>{emptyActionLabel}</Button></div>}
    </div>
  </Card>
}
