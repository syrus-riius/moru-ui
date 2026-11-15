import { useI18n } from '../i18n'
import { filterLocalizedComponents } from './catalog-search'
import { useEffect, useId, useState, type MouseEvent } from 'react'
import { ChevronRight, LayoutGrid } from 'lucide-react'
import { type ComponentId } from './component-catalog'
import { Button } from './ui/button'
import {
  componentGroups,
  componentPageHash,
  groupComponents,
  type ComponentGroupId,
  type ComponentPage,
} from './component-pages'
import './component-category-navigation.css'

export type ComponentCategoryNavigationProps = {
  page: ComponentPage
  active: boolean
  query?: string
  onNavigate: (page: ComponentPage) => void
  onSelect: (id: ComponentId) => void
}

function isPlainActivation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.shiftKey &&
    !event.defaultPrevented
  )
}

export function ComponentCategoryNavigation({
  page,
  active,
  query = '',
  onNavigate,
  onSelect,
}: ComponentCategoryNavigationProps) {
  const { t } = useI18n()
  const id = useId()
  const activeGroup = active && page.kind !== 'index' ? page.group : null
  const routeKey =
    page.kind === 'detail'
      ? `${page.group}/${page.component}`
      : page.kind === 'category'
        ? page.group
        : 'index'
  const [expanded, setExpanded] = useState<ComponentGroupId | null>(activeGroup)
  const searching = Boolean(query.trim())
  const matches = new Set(
    filterLocalizedComponents('all', query, false, t).map((component) => component.id),
  )
  const visibleGroups = componentGroups
    .map((group) => ({
      ...group,
      items: groupComponents(group.id).filter((component) => matches.has(component.id)),
    }))
    .filter((group) => group.items.length > 0)

  useEffect(() => {
    setExpanded(activeGroup)
  }, [activeGroup, active, routeKey])

  function navigate(event: MouseEvent<HTMLAnchorElement>, next: ComponentPage) {
    if (!isPlainActivation(event)) return
    event.preventDefault()
    onNavigate(next)
  }

  return (
    <nav className="component-category-navigation" aria-label={t('카테고리별 컴포넌트')}>
      {searching && (
        <p className="component-category-search-status" role="status">
          {matches.size
            ? t('{count}개 컴포넌트', { count: matches.size })
            : t('검색 결과가 없어요. 다른 이름으로 검색해 보세요.')}
        </p>
      )}
      <a
        className="component-category-all"
        href={componentPageHash({ kind: 'index' })}
        aria-current={active && page.kind === 'index' ? 'page' : undefined}
        onClick={(event) => navigate(event, { kind: 'index' })}
      >
        <LayoutGrid size={12} aria-hidden="true" />
        <span>{t('전체 카테고리')}</span>
        <small>{componentGroups.length}</small>
      </a>
      {visibleGroups.map((group) => {
        const open = searching || expanded === group.id
        const categoryPage: ComponentPage = { kind: 'category', group: group.id }
        return (
          <section
            className="component-category-group"
            key={group.id}
            data-active={activeGroup === group.id || undefined}
          >
            <div className="component-category-group-heading">
              <a
                href={componentPageHash(categoryPage)}
                className="component-category-group-link"
                aria-current={
                  active && page.kind !== 'index' && page.group === group.id ? 'page' : undefined
                }
                aria-label={t('{category} 카테고리 · {count}개 컴포넌트', {
                  category: t(group.label),
                  count: group.items.length,
                })}
                onClick={(event) => navigate(event, categoryPage)}
              >
                <span>{t(group.label)}</span>
                <small>{group.items.length}</small>
              </a>
              {!searching && (
                <Button
                  className="component-category-expand"
                  variant="ghost"
                  size="sm"
                  aria-expanded={open}
                  aria-controls={`${id}-${group.id}`}
                  aria-label={t(open ? '{category} 컴포넌트 접기' : '{category} 컴포넌트 펼치기', {
                    category: t(group.label),
                  })}
                  onClick={() => setExpanded(open ? null : group.id)}
                >
                  <ChevronRight size={12} aria-hidden="true" />
                </Button>
              )}
            </div>
            <ul className="component-category-items" id={`${id}-${group.id}`} hidden={!open}>
              {group.items.map((component) => {
                const selected = active && page.kind === 'detail' && page.component === component.id
                const componentPage: ComponentPage = {
                  kind: 'detail',
                  group: group.id,
                  component: component.id,
                }
                return (
                  <li key={component.id}>
                    <a
                      href={componentPageHash(componentPage)}
                      aria-current={selected ? 'page' : undefined}
                      onClick={(event) => {
                        if (!isPlainActivation(event)) return
                        event.preventDefault()
                        onSelect(component.id)
                      }}
                    >
                      <span>{component.name}</span>
                      {selected ? (
                        <i className="component-category-selected-dot" aria-hidden="true" />
                      ) : component.generation === 'completion' ? (
                        <i className="component-category-new-dot" aria-label={t('새 컴포넌트')} />
                      ) : null}
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}
