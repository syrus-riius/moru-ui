import { useEffect, useId, useState, type MouseEvent } from 'react'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import type { ComponentId } from './component-catalog'
import {
  componentGroups, componentPageHash, groupComponents,
  type ComponentGroupId, type ComponentPage,
} from './component-pages'
import './component-category-navigation.css'

export type ComponentCategoryNavigationProps = {
  page: ComponentPage
  active: boolean
  onNavigate: (page: ComponentPage) => void
  onSelect: (id: ComponentId) => void
}

function isPlainActivation(event: MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.defaultPrevented
}

export function ComponentCategoryNavigation({ page, active, onNavigate, onSelect }: ComponentCategoryNavigationProps) {
  const id = useId()
  const activeGroup = active && page.kind !== 'index' ? page.group : null
  const routeKey = page.kind === 'detail' ? `${page.group}/${page.component}` : page.kind === 'category' ? page.group : 'index'
  const [expanded, setExpanded] = useState<ComponentGroupId | null>(activeGroup)

  useEffect(() => { setExpanded(activeGroup) }, [activeGroup, active, routeKey])

  function navigate(event: MouseEvent<HTMLAnchorElement>, next: ComponentPage) {
    if (!isPlainActivation(event)) return
    event.preventDefault()
    onNavigate(next)
  }

  return <nav className="component-category-navigation" aria-label="카테고리별 컴포넌트">
    <a className="component-category-all" href={componentPageHash({ kind: 'index' })} aria-current={active && page.kind === 'index' ? 'page' : undefined} onClick={(event) => navigate(event, { kind: 'index' })}>
      <LayoutGrid size={12} aria-hidden="true" /><span>전체 카테고리</span><small>{componentGroups.length}</small>
    </a>
    {componentGroups.map((group) => {
      const open = expanded === group.id
      const categoryPage: ComponentPage = { kind: 'category', group: group.id }
      return <section className="component-category-group" key={group.id} data-active={activeGroup === group.id || undefined}>
        <div className="component-category-group-heading">
          <a href={componentPageHash(categoryPage)} className="component-category-group-link" aria-current={active && page.kind !== 'index' && page.group === group.id ? 'page' : undefined} aria-label={`${group.label} 카테고리 · ${group.componentIds.length}개 컴포넌트`} onClick={(event) => navigate(event, categoryPage)}><span>{group.label}</span><small>{group.componentIds.length}</small></a>
          <button className="component-category-expand" type="button" aria-expanded={open} aria-controls={`${id}-${group.id}`} aria-label={`${group.label} 컴포넌트 ${open ? '접기' : '펼치기'}`} onClick={() => setExpanded(open ? null : group.id)}><ChevronRight size={12} aria-hidden="true" /></button>
        </div>
        <ul className="component-category-items" id={`${id}-${group.id}`} hidden={!open}>
          {groupComponents(group.id).map((component) => {
            const selected = active && page.kind === 'detail' && page.component === component.id
            const componentPage: ComponentPage = { kind: 'detail', group: group.id, component: component.id }
            return <li key={component.id}><a href={componentPageHash(componentPage)} aria-current={selected ? 'page' : undefined} onClick={(event) => {
              if (!isPlainActivation(event)) return
              event.preventDefault()
              onSelect(component.id)
            }}><span>{component.name}</span>{selected ? <i className="component-category-selected-dot" aria-hidden="true" /> : component.generation === 'completion' ? <i className="component-category-new-dot" aria-label="새 컴포넌트" /> : null}</a></li>
          })}
        </ul>
      </section>
    })}
  </nav>
}
