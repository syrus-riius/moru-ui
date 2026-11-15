import { useI18n } from '../../i18n'
import { LanguageSelector } from '../../i18n/LanguageSelector'
import {
  ArrowDownToLine,
  ArrowLeft,
  LayoutGrid,
  Menu as MenuIcon,
  Moon,
  Search,
  SlidersHorizontal,
  Sun,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Breadcrumb } from '../ui/breadcrumb'

import { useStudio } from './useStudioController'

/** The bar above the content: a slim one for standalone views, the workspace bar otherwise. */
export function StudioTopbar() {
  const { t } = useI18n()
  const {
    theme,
    view,
    standalone,
    publicView,
    catalogTitle,
    setExportOpen,
    setCommandOpen,
    navDrawerOpen,
    drawerOpen,
    go,
    returnToLibrary,
    openNavigation,
    openEditor,
  } = useStudio()
  return (
    <>
      {standalone ? (
        <header className="standalone-topbar" inert={drawerOpen}>
          <div className="standalone-location">
            <Button
              variant="ghost"
              size="sm"
              className="standalone-back"
              onClick={returnToLibrary}
              aria-label={t('이전 · Moru UI로 돌아가기')}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span>
                {t('이전 ')}
                <span className="standalone-back-name">· Moru UI</span>
              </span>
            </Button>
            <span className="standalone-divider" aria-hidden="true" />
            <div className="standalone-title">
              {view === 'simulator' ? (
                <h1>{t('시뮬레이터')}</h1>
              ) : (
                <span>
                  {view === 'project-template' ? t('프로젝트·할 일 템플릿') : t('예제 화면')}
                </span>
              )}
            </div>
          </div>
          <div className="standalone-actions">
            <LanguageSelector />
            {view === 'project-template' ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="icon-button"
                  aria-label={t('예제 허브로 돌아가기')}
                  onClick={() => go('examples')}
                >
                  <LayoutGrid size={16} aria-hidden="true" />
                </Button>
                <a
                  className="icon-button"
                  href="/downloads/moru-project-starter.zip"
                  download
                  aria-label={t('프로젝트·할 일 템플릿 다운로드')}
                >
                  <ArrowDownToLine size={16} aria-hidden="true" />
                </a>
              </>
            ) : (
              <>
                {view === 'examples' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="icon-button"
                    aria-label={t('디자인 편집 열기')}
                    title={t('디자인 편집')}
                    onClick={() => openEditor()}
                  >
                    <SlidersHorizontal size={16} />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="icon-button theme-toggle"
                  onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')}
                  aria-label={
                    theme.mode === 'light' ? t('다크 모드로 전환') : t('라이트 모드로 전환')
                  }
                >
                  {theme.mode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
              </>
            )}
          </div>
        </header>
      ) : !publicView ? (
        <header className="topbar" inert={drawerOpen}>
          <div className="breadcrumb">
            <Button
              variant="ghost"
              size="sm"
              className="icon-button mobile-nav-button"
              aria-label={t('탐색 메뉴 열기')}
              aria-expanded={navDrawerOpen}
              aria-controls="workspace-navigation"
              onClick={openNavigation}
            >
              <MenuIcon size={19} />
            </Button>
            <Breadcrumb
              size="sm"
              items={[
                { label: 'Moru UI', href: '#home' },
                {
                  label: {
                    home: t('홈'),
                    blocks: t('화면 블록'),
                    components: t(catalogTitle),
                    examples: t('예제 화면'),
                    'project-template': t('프로젝트·할 일 템플릿'),
                    tokens: t('디자인 토큰'),
                    guide: t('시작 가이드'),
                    'token-guide': t('내 프로젝트에 적용'),
                    comparison: t('디자인 비교'),
                    states: t('상태 표현'),
                    brand: t('Moru 이야기'),
                    simulator: t('시뮬레이터'),
                    mobile: t('모바일 UI'),
                  }[view],
                },
              ]}
            />
          </div>
          <div className="topbar-actions">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="sm"
              className="icon-button"
              aria-label={t('빠른 실행 열기')}
              title={t('빠른 실행 · ⌘⇧K / Ctrl+Shift+K')}
              onClick={() => setCommandOpen(true)}
            >
              <Search size={17} />
            </Button>
            <span className="saved-indicator">
              <i aria-hidden="true" />
              {t('브라우저에 자동 저장')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="icon-button theme-toggle"
              onClick={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')}
              aria-label={theme.mode === 'light' ? t('다크 모드로 전환') : t('라이트 모드로 전환')}
              title={theme.mode === 'light' ? t('다크 모드로 전환') : t('라이트 모드로 전환')}
            >
              {theme.mode === 'light' ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="toolbar-export"
              aria-label={t('토큰 내보내기')}
              title={t('토큰 내보내기')}
              onClick={() => setExportOpen(true)}
            >
              <ArrowDownToLine size={14} />
              <span>{t('토큰 내보내기')}</span>
            </Button>
          </div>
        </header>
      ) : null}
    </>
  )
}
