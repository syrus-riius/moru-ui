import { useI18n } from './i18n'
import { ToastProvider } from './components/ui/toast'
import { WorkspaceMembersProvider } from './components/workspace-example/WorkspaceMembersContext'
import { ExampleSessionProvider } from './components/examples/ExampleSessionContext'
import { MoruSiteHeader } from './components/site/MoruSiteHeader'
import { ComponentPlaygroundProvider } from './components/studio/ComponentPlayground'
import { StudioInspector } from './components/studio/StudioInspector'
import { StudioMain } from './components/studio/StudioMain'
import { StudioOverlays } from './components/studio/StudioOverlays'
import { StudioSidebar } from './components/studio/StudioSidebar'
import { StudioTopbar } from './components/studio/StudioTopbar'
import { StudioProvider, useStudioController } from './components/studio/useStudioController'
import { WorkspaceExampleStateProvider } from './components/studio/WorkspaceExampleState'
import './components/studio/studio-content.css'
import './components/catalog/component-gallery.css'
import './components/studio/studio-navigation.css'
import './components/studio/studio-topbar.css'
import './components/comparison/comparison-workspace.css'
import './components/studio/reference-workspace.css'
import './components/studio/standalone-workspace.css'

export default function App() {
  return (
    <ToastProvider>
      <WorkspaceMembersProvider>
        <ExampleSessionProvider>
          <ComponentPlaygroundProvider>
            <WorkspaceExampleStateProvider>
              <Studio />
            </WorkspaceExampleStateProvider>
          </ComponentPlaygroundProvider>
        </ExampleSessionProvider>
      </WorkspaceMembersProvider>
    </ToastProvider>
  )
}

/**
 * The lab shell. useStudioController owns the state and actions; the parts below read
 * them through StudioProvider instead of receiving dozens of props.
 */
function Studio() {
  const { t } = useI18n()
  const studio = useStudioController()
  const {
    standalone,
    publicView,
    view,
    drawerOpen,
    siteSection,
    theme,
    navigateSite,
    setCommandOpen,
    componentInspectorDocked,
  } = studio
  return (
    <StudioProvider value={studio}>
      <div
        className={`studio-shell ${standalone ? 'studio-shell-standalone' : ''} ${publicView ? 'studio-shell-public' : ''} ${view === 'components' ? 'studio-shell-components' : ''} ${view === 'blocks' ? 'studio-shell-blocks' : ''}`}
      >
        <a
          className="skip-link"
          href="#main-content"
          onClick={(event) => {
            event.preventDefault()
            document.getElementById('main-content')?.focus()
          }}
        >
          {t('본문으로 이동')}
        </a>
        {publicView ? (
          <div className="moru-public-header" inert={drawerOpen}>
            <MoruSiteHeader
              active={siteSection}
              mode={theme.mode}
              onNavigate={navigateSite}
              onToggleTheme={() => theme.setMode(theme.mode === 'light' ? 'dark' : 'light')}
              onOpenSearch={() => setCommandOpen(true)}
            />
          </div>
        ) : null}
        <StudioSidebar />
        <div className="workspace-main">
          <StudioTopbar />
          <div
            className={`workspace-body ${standalone ? 'workspace-body-standalone' : ''} ${view === 'brand' ? 'workspace-body-brand' : ''} ${view === 'simulator' ? 'workspace-body-simulator' : ''} ${componentInspectorDocked ? 'workspace-body-design-docked' : ''}`}
          >
            <StudioMain />
            <StudioInspector />
          </div>
        </div>
        <StudioOverlays />
      </div>
    </StudioProvider>
  )
}
