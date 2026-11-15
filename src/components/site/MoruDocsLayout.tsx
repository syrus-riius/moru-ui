import { useI18n } from '../../i18n'
import { useRef, useState, type ReactNode } from 'react'
import { BookOpen, Search, X } from 'lucide-react'
import { ComponentCategoryNavigation } from '../catalog/ComponentCategoryNavigation'
import type { ComponentId } from '../catalog/component-catalog'
import type { ComponentPage } from '../catalog/component-pages'
import { Collapsible } from '../ui/collapsible'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group'
import './moru-docs-layout.css'
import './component-design-inspector.css'

type MoruDocsLayoutProps = {
  page: ComponentPage
  active: 'guide' | 'components'
  compact: boolean
  onGuide: () => void
  onNavigate: (page: ComponentPage) => void
  onSelect: (id: ComponentId) => void
  tools?: ReactNode
  children: ReactNode
}

export function MoruDocsLayout({
  page,
  active,
  compact,
  onGuide,
  onNavigate,
  onSelect,
  tools,
  children,
}: MoruDocsLayoutProps) {
  const { t } = useI18n()
  const mobileNavigation = useRef<HTMLDivElement>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [navigationOpen, setNavigationOpen] = useState(false)

  function follow(action: () => void) {
    setNavigationOpen(false)
    action()
  }

  const navigation = (
    <>
      <InputGroup className="moru-docs-sidebar-search">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          ref={searchInput}
          size={compact ? 'md' : 'sm'}
          type="search"
          aria-label={t('사이드바 컴포넌트 검색')}
          placeholder={t('컴포넌트 검색')}
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing || event.key !== 'Escape' || !query) return
            event.preventDefault()
            event.stopPropagation()
            setQuery('')
          }}
        />
        {query && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={t('사이드바 검색어 지우기')}
              onClick={() => {
                setQuery('')
                searchInput.current?.focus({ preventScroll: true })
              }}
            >
              <X size={14} aria-hidden="true" />
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>
      <a
        className="moru-docs-guide-link"
        href="#guide"
        aria-current={active === 'guide' ? 'page' : undefined}
        onClick={(event) => {
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.altKey ||
            event.shiftKey
          )
            return
          event.preventDefault()
          follow(onGuide)
        }}
      >
        <BookOpen aria-hidden="true" />
        {t('시작하기')}
      </a>
      <p className="moru-docs-sidebar-label">{t('컴포넌트')}</p>
      <ComponentCategoryNavigation
        page={page}
        query={query}
        active={active === 'components'}
        onNavigate={(next) => follow(() => onNavigate(next))}
        onSelect={(id) => follow(() => onSelect(id))}
      />
    </>
  )

  return (
    <div className="moru-docs-layout">
      {compact ? (
        <div
          ref={mobileNavigation}
          onKeyDown={(event) => {
            if (event.key !== 'Escape' || !navigationOpen || event.defaultPrevented) return
            event.preventDefault()
            setNavigationOpen(false)
            mobileNavigation.current
              ?.querySelector<HTMLButtonElement>('.ui-collapsible-trigger')
              ?.focus({ preventScroll: true })
          }}
        >
          <Collapsible
            className="moru-docs-mobile-nav"
            title={t('문서 탐색')}
            open={navigationOpen}
            onOpenChange={setNavigationOpen}
          >
            <div className="moru-docs-sidebar-inner">{navigation}</div>
          </Collapsible>
        </div>
      ) : (
        <aside className="moru-docs-sidebar" aria-label={t('문서 탐색')}>
          {navigation}
        </aside>
      )}
      <div className="moru-docs-content">
        {tools}
        {children}
      </div>
    </div>
  )
}
