import { useI18n } from '../../i18n'
import { LanguageSelector } from '../../i18n/LanguageSelector'
import { useState, type MouseEvent } from 'react'
import { ArrowUpRight, Code2, Moon, Search, Sun } from 'lucide-react'
import { MoruLogo } from '../brand'
import { Button } from '../ui/button'
import { Header } from '../ui/header'
import './moru-site-header.css'

const navigation = [
  { id: 'docs', href: '#guide', label: '문서' },
  { id: 'components', href: '#components', label: '컴포넌트' },
  { id: 'blocks', href: '#blocks', label: '블록' },
  { id: 'examples', href: '#examples', label: '예제' },
  { id: 'playground', href: '#playground', label: 'Playground' },
  { id: 'studio', href: '#tokens', label: '스튜디오' },
] as const

export type MoruSiteSection = 'home' | (typeof navigation)[number]['id']

type MoruSiteHeaderProps = {
  active: MoruSiteSection
  mode: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenSearch: () => void
  onNavigate?: (next: MoruSiteSection) => void
}

export function MoruSiteHeader({
  active,
  mode,
  onToggleTheme,
  onOpenSearch,
  onNavigate,
}: MoruSiteHeaderProps) {
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const themeLabel = mode === 'dark' ? t('라이트 모드로 전환') : t('다크 모드로 전환')

  function navigate(event: MouseEvent<HTMLAnchorElement>, next: MoruSiteSection) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    setMenuOpen(false)
    if (!onNavigate) return
    event.preventDefault()
    onNavigate(next)
  }

  const links = navigation.map(({ id, href, label }) => (
    <a
      key={id}
      href={href}
      aria-current={active === id ? 'page' : undefined}
      onClick={(event) => navigate(event, id)}
    >
      {id === 'playground' ? label : t(label)}
    </a>
  ))

  return (
    <Header
      className="moru-site-header"
      size="md"
      navigationLabel={t('사이트 메뉴')}
      menuLabel={t('사이트 메뉴')}
      menuOpen={menuOpen}
      onMenuOpenChange={setMenuOpen}
      navigation={links}
      brand={
        <a
          className="moru-site-header__brand"
          href="#home"
          aria-label={t('Moru UI 홈')}
          aria-current={active === 'home' ? 'page' : undefined}
          onClick={(event) => navigate(event, 'home')}
        >
          <MoruLogo aria-hidden="true" />
        </a>
      }
      actions={
        <>
          <LanguageSelector />
          <Button
            variant="secondary"
            size="sm"
            className="moru-site-header__action moru-site-header__search"
            aria-label={t('검색')}
            title={t('검색 · ⌘K / Ctrl+K')}
            onClick={() => {
              setMenuOpen(false)
              onOpenSearch()
            }}
          >
            <Search size={17} aria-hidden="true" />
            <span>{t('검색')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            role="link"
            className="moru-site-header__action moru-site-header__github"
            render={
              <a href="https://github.com/syrus-riius/moru-ui" target="_blank" rel="noreferrer" />
            }
            aria-label={t('GitHub 소스 코드')}
            title={t('GitHub 소스 코드')}
          >
            <Code2 size={17} className="moru-site-header__github-icon" aria-hidden="true" />
            <span>GitHub</span>
            <ArrowUpRight size={13} className="moru-site-header__github-arrow" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="moru-site-header__action"
            aria-label={themeLabel}
            title={themeLabel}
            onClick={onToggleTheme}
          >
            {mode === 'dark' ? (
              <Sun size={17} aria-hidden="true" />
            ) : (
              <Moon size={17} aria-hidden="true" />
            )}
          </Button>
        </>
      }
    />
  )
}
