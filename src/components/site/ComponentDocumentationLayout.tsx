import type { MouseEvent, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useI18n } from '../../i18n'
import { components, type ComponentId } from '../catalog/component-catalog'
import {
  adjacentComponents,
  componentGroupFor,
  componentPageHash,
  type ComponentPage,
} from '../catalog/component-pages'
import './component-documentation.css'

export type DocumentationSection = { id: string; label: string }

export function ComponentDocumentationLayout({
  id,
  description,
  sections,
  onOpenStudio,
  onNavigate,
  aiAction,
  children,
}: {
  id: ComponentId
  description?: string
  sections: readonly DocumentationSection[]
  onOpenStudio: () => void
  onNavigate: (page: ComponentPage) => void
  aiAction?: ReactNode
  children: ReactNode
}) {
  const { t } = useI18n()
  const component = components.find((item) => item.id === id)!
  const group = componentGroupFor(id)
  const adjacent = adjacentComponents(id)
  function follow(event: MouseEvent<HTMLAnchorElement>, page: ComponentPage) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    onNavigate(page)
  }
  return (
    <article
      id={`component-${id}`}
      tabIndex={-1}
      className="moru-component-doc"
      aria-labelledby={`${id}-doc-title`}
    >
      <div className="moru-component-doc__layout">
        <header className="moru-component-doc__header">
          <div>
            <a
              className="moru-component-doc__category"
              href={componentPageHash({ kind: 'category', group: group.id })}
              onClick={(event) => follow(event, { kind: 'category', group: group.id })}
            >
              {t(group.label)}
            </a>
            <h1 id={`${id}-doc-title`}>{component.name}</h1>
            <p className="moru-component-doc__description">
              {t(description ?? component.subtitle)}
            </p>
          </div>
          <div className="moru-component-doc__actions">
            {aiAction}
            <button type="button" className="moru-component-doc__studio" onClick={onOpenStudio}>
              {t('디자인 편집 열기')}
              <ArrowUpRight size={14} aria-hidden="true" />
            </button>
          </div>
        </header>
        <nav className="moru-component-doc__outline" aria-labelledby={`${id}-outline-title`}>
          <p id={`${id}-outline-title`}>{t('이 페이지에서')}</p>
          <ul>
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => {
                    const target = document.getElementById(section.id)
                    target?.focus({ preventScroll: true })
                    target?.scrollIntoView({ block: 'start' })
                  }}
                >
                  {t(section.label)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="moru-component-doc__body">
          {children}
          <nav className="moru-component-doc__neighbors" aria-label={t('다른 컴포넌트 문서')}>
            {(['previous', 'next'] as const).map((direction) => {
              const neighbor = components.find((item) => item.id === adjacent[direction])
              return neighbor ? (
                <a
                  key={direction}
                  data-direction={direction}
                  href={componentPageHash({
                    kind: 'detail',
                    group: group.id,
                    component: neighbor.id,
                  })}
                  onClick={(event) =>
                    follow(event, { kind: 'detail', group: group.id, component: neighbor.id })
                  }
                >
                  <span>
                    {direction === 'previous' ? (
                      <ArrowLeft size={14} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={14} aria-hidden="true" />
                    )}
                    {t(direction === 'previous' ? '이전 컴포넌트' : '다음 컴포넌트')}
                  </span>
                  <strong>{neighbor.name}</strong>
                </a>
              ) : (
                <span key={direction} />
              )
            })}
          </nav>
        </div>
      </div>
    </article>
  )
}
