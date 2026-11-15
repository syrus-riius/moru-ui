import { useI18n } from '../../i18n'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Box,
  Columns2,
  LayoutGrid,
  LayoutPanelTop,
  Monitor,
  MousePointer2,
  Palette,
  Smartphone,
  X,
} from 'lucide-react'
import { Button } from '../ui/button'
import { SimulatorBetaBadge } from '../simulator/SimulatorBetaBadge'
import { components } from '../catalog/component-catalog'
import { ComponentCategoryNavigation } from '../catalog/ComponentCategoryNavigation'
import { MoruLogo, MoruMark } from '../brand'
import { registryRelease } from '../../lib/registry-install'
import { useStudio } from './useStudioController'

/** Workspace navigation; a modal drawer on narrow screens. */
export function StudioSidebar() {
  const { t } = useI18n()
  const {
    view,
    componentPage,
    mobileNav,
    setMobileNav,
    sidebarRef,
    mobileViewport,
    navDrawerOpen,
    editorDrawerOpen,
    navigateComponentPage,
    go,
    openBlocks,
    selectComponent,
    standalone,
    publicView,
  } = useStudio()
  if (standalone || publicView) return null
  return (
    <>
      {mobileNav ? (
        <button
          className="nav-scrim"
          aria-label={t('메뉴 닫기')}
          onClick={() => setMobileNav(false)}
        />
      ) : null}
      <aside
        id="workspace-navigation"
        ref={sidebarRef}
        className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}
        inert={(mobileViewport && !mobileNav) || editorDrawerOpen}
        role={navDrawerOpen ? 'dialog' : undefined}
        aria-modal={navDrawerOpen || undefined}
        aria-label={t('워크스페이스 탐색')}
      >
        <Button
          variant="ghost"
          size="sm"
          textWrap="wrap"
          className="sidebar-close icon-button"
          aria-label={t('탐색 메뉴 닫기')}
          onClick={() => setMobileNav(false)}
        >
          <X size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          textWrap="wrap"
          className="brand"
          onClick={() => go('home')}
          aria-label={t('Moru UI 홈')}
        >
          <MoruLogo aria-hidden="true" />
        </Button>
        <div className="nav-section-label">NAVIGATION</div>
        <nav className="primary-nav" aria-label={t('워크스페이스')}>
          <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => go('components')}>
            <LayoutGrid size={17} />
            {t('컴포넌트')}
            <span className="nav-count">{components.length}</span>
          </Button>
          <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => openBlocks()}>
            <Box size={17} />
            {t('화면 블록')}
            <span className="nav-new">NEW</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            textWrap="wrap"
            aria-current={view === 'mobile' ? 'page' : undefined}
            className={view === 'mobile' ? 'active' : ''}
            onClick={() => go('mobile')}
          >
            <Smartphone size={17} />
            {t('모바일 UI')}
            <span className="nav-new">EXPO</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            textWrap="wrap"
            aria-current={view === 'comparison' ? 'page' : undefined}
            className={view === 'comparison' ? 'active' : ''}
            onClick={() => go('comparison')}
          >
            <Columns2 size={17} />
            {t('디자인 비교')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            textWrap="wrap"
            aria-current={view === 'states' ? 'page' : undefined}
            className={view === 'states' ? 'active' : ''}
            onClick={() => go('states')}
          >
            <MousePointer2 size={17} />
            {t('상태 표현')}
            <span className="nav-new">NEW</span>
          </Button>
          <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => go('examples')}>
            <Monitor size={17} />
            {t('예제 화면')}
            <ArrowUpRight size={12} className="nav-end" />
          </Button>
          <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => go('simulator')}>
            <LayoutPanelTop size={17} />
            {t('시뮬레이터')}
            <SimulatorBetaBadge className="simulator-beta-nav" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            textWrap="wrap"
            aria-current={view === 'tokens' ? 'page' : undefined}
            className={view === 'tokens' ? 'active' : ''}
            onClick={() => go('tokens')}
          >
            <Palette size={17} />
            {t('디자인 토큰')}
          </Button>
          <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => go('guide')}>
            <BookOpen size={17} />
            {t('시작 가이드')}
          </Button>
          <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => go('brand')}>
            <MoruMark width={17} height={17} />
            {t('Moru 이야기')}
          </Button>
        </nav>
        <div className="nav-section-label component-list-label">
          COMPONENTS <span>{components.length}</span>
        </div>
        <ComponentCategoryNavigation
          page={componentPage}
          active={false}
          onNavigate={navigateComponentPage}
          onSelect={selectComponent}
        />
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-spark">
              <MoruMark width={19} height={19} />
            </span>
            <strong>{t('직접 다듬는 UI')}</strong>
            <p>{t('색상·글꼴·간격을 조절하며 나만의 UI를 만들어 보세요.')}</p>
            <Button variant="ghost" size="sm" textWrap="wrap" onClick={() => go('brand')}>
              {t('Moru의 이름에 담은 뜻 ')}
              <ArrowRight size={12} />
            </Button>
          </div>
          <div className="sidebar-status">
            <span>
              <i />
              {t('로컬 미리보기')}
            </span>
            <span>v{registryRelease}</span>
          </div>
        </div>
      </aside>
    </>
  )
}
