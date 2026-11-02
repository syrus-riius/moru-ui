import { Fragment, useRef, type MouseEvent, type ReactNode, type RefObject } from 'react'
import {
  ArrowLeft, ArrowRight, BarChart3, Bell, Code2, Compass, LayoutGrid,
  Layers, LayoutPanelTop, MessageSquare, Monitor, MousePointer2, PanelTop, Search, SlidersHorizontal, Sparkles, X,
  type LucideIcon,
} from 'lucide-react'
import { addedComponentCount, components, filterComponents, type ComponentId } from './component-catalog'
import {
  componentGroups, componentPageHash, groupComponents,
  type ComponentGroupId, type ComponentPage,
} from './component-pages'
import './component-catalog-page.css'

export type ComponentCatalogPageProps = {
  page: ComponentPage
  query: string
  onQueryChange: (value: string) => void
  newOnly: boolean
  onNewOnlyChange: (value: boolean) => void
  onNavigate: (page: ComponentPage) => void
  renderComponent: (id: ComponentId) => ReactNode
  code: boolean
  onCodeChange: (code: boolean) => void
  onExamples: () => void
  onSimulator: () => void
  searchRef?: RefObject<HTMLInputElement | null>
}

const categoryIcons: Record<ComponentGroupId, LucideIcon> = {
  forms: SlidersHorizontal, actions: MousePointer2, overlays: PanelTop, navigation: Compass,
  layout: Layers, feedback: Bell, data: BarChart3, conversation: MessageSquare,
}

function follow(event: MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  action()
}

export function ComponentCatalogPage({ page, query, onQueryChange, newOnly, onNewOnlyChange, onNavigate, renderComponent, code, onCodeChange, onExamples, onSimulator, searchRef }: ComponentCatalogPageProps) {
  const fallbackSearchRef = useRef<HTMLInputElement>(null)
  const inputRef = searchRef ?? fallbackSearchRef
  const selectedGroup = page.kind === 'index' ? undefined : componentGroups.find((group) => group.id === page.group)
  const showingCategories = !selectedGroup && !query.trim() && !newOnly
  const filtered = filterComponents('all', query, newOnly).filter((component) => !selectedGroup || selectedGroup.componentIds.some((id) => id === component.id))
  function clearFilters() {
    onQueryChange('')
    onNewOnlyChange(false)
    inputRef.current?.focus()
  }

  return <div className="component-catalog-page">
    <header className="catalog-intro component-catalog-intro">
      {selectedGroup ? <a className="catalog-index-back" href={componentPageHash({ kind: 'index' })} onClick={(event) => follow(event, () => onNavigate({ kind: 'index' }))}><ArrowLeft size={12} aria-hidden="true" />전체 카테고리</a> : null}
      <span className="eyebrow">MORU UI / {selectedGroup ? selectedGroup.eyebrow : 'LIBRARY'}</span>
      <h1>{selectedGroup?.label ?? '컴포넌트'}</h1>
      <p>{selectedGroup ? `${selectedGroup.description} 카테고리의 모든 컴포넌트를 한곳에서 보고 조작하세요.` : '카테고리를 고르면 모든 컴포넌트 예제를 한곳에서 보고 다듬을 수 있어요.'}</p>
      <div className="catalog-meta"><span>{selectedGroup ? `${selectedGroup.componentIds.length} COMPONENTS` : `${components.length} COMPONENTS / ${componentGroups.length} CATEGORIES`}</span><span>미리보기 · 코드 · 디자인 조정</span></div>
    </header>

    {selectedGroup ? <nav className="catalog-category-switch" aria-label="컴포넌트 카테고리 이동">
      {componentGroups.map((group) => <a key={group.id} href={componentPageHash({ kind: 'category', group: group.id })} aria-current={selectedGroup.id === group.id ? 'page' : undefined} onClick={(event) => follow(event, () => onNavigate({ kind: 'category', group: group.id }))}>{group.label}<span>{group.componentIds.length}</span></a>)}
    </nav> : null}

    <div className="catalog-discovery-bar">
      <label className="catalog-page-search"><Search size={14} aria-hidden="true" /><input ref={inputRef} value={query} onChange={(event) => onQueryChange(event.target.value)} aria-label="컴포넌트 검색" placeholder={selectedGroup ? `${selectedGroup.label}에서 검색` : '이름이나 용도로 검색하세요'} />{query ? <button type="button" onClick={() => { onQueryChange(''); inputRef.current?.focus() }} aria-label="컴포넌트 검색 지우기"><X size={12} aria-hidden="true" /></button> : <kbd aria-hidden="true">⌘ K</kbd>}</label>
      <button type="button" className="catalog-new-filter" aria-pressed={newOnly} onClick={() => onNewOnlyChange(!newOnly)}><Sparkles size={12} aria-hidden="true" />새 컴포넌트<span>{addedComponentCount}</span></button>
    </div>

    {showingCategories ? <section className="catalog-category-directory" aria-label="컴포넌트 카테고리">
      {componentGroups.map((group) => {
        const Icon = categoryIcons[group.id]
        const names = groupComponents(group.id).slice(0, 3).map((component) => component.name).join(' · ')
        return <a key={group.id} className="catalog-category-card" href={componentPageHash({ kind: 'category', group: group.id })} onClick={(event) => follow(event, () => onNavigate({ kind: 'category', group: group.id }))}>
          <div className="catalog-category-card-top"><span className="catalog-category-icon"><Icon size={17} strokeWidth={1.5} aria-hidden="true" /></span><span className="catalog-category-count">{group.componentIds.length}<small>개</small></span></div>
          <h2>{group.label}</h2><p>{group.description}</p>
          <div className="catalog-category-card-bottom"><span>{names}</span><ArrowRight size={13} aria-hidden="true" /></div>
        </a>
      })}
    </section> : <section className="catalog-component-directory" aria-label={selectedGroup ? `${selectedGroup.label} 컴포넌트 목록` : '컴포넌트 검색 결과'}>
      <div className="catalog-results-heading">
        <p role="status">{newOnly ? '새 컴포넌트 · ' : ''}{filtered.length}개{query.trim() ? ` · “${query.trim()}” 검색 결과` : ' 컴포넌트'}{filtered.length ? <span>전체 표시</span> : null}</p>
        <div className="catalog-results-actions">
          {query || newOnly ? <button type="button" className="catalog-clear-filters" onClick={clearFilters}>필터 지우기</button> : null}
          <div className="catalog-preview-toggle" role="group" aria-label="컴포넌트 보기 방식">
            <button type="button" aria-pressed={!code} onClick={() => onCodeChange(false)}><LayoutGrid size={12} aria-hidden="true" />미리보기</button>
            <button type="button" aria-pressed={code} onClick={() => onCodeChange(true)}><Code2 size={12} aria-hidden="true" />코드</button>
          </div>
        </div>
      </div>
      {filtered.length ? <div className="component-grid catalog-component-grid">{filtered.map((component) => <Fragment key={component.id}>{renderComponent(component.id)}</Fragment>)}</div> : <div className="catalog-directory-empty"><Search size={22} aria-hidden="true" /><h2>일치하는 컴포넌트가 없어요.</h2><p>다른 이름으로 검색하거나 필터를 지워 보세요.</p><button type="button" onClick={clearFilters}>필터 지우기<ArrowRight size={12} aria-hidden="true" /></button></div>}
    </section>}

    <aside className="catalog-page-shortcuts" aria-label="컴포넌트 조합 예제"><div><strong>부품을 고른 다음, 화면으로.</strong><span>실제 조합을 보거나 직접 배치해 보세요.</span></div><a href="#examples" onClick={(event) => follow(event, onExamples)}><Monitor size={13} aria-hidden="true" />예제 화면<ArrowRight size={12} aria-hidden="true" /></a><a href="#simulator" onClick={(event) => follow(event, onSimulator)}><LayoutPanelTop size={13} aria-hidden="true" />시뮬레이터<ArrowRight size={12} aria-hidden="true" /></a></aside>
  </div>
}
