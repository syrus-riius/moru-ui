import { useI18n } from '../../i18n'
import { type ReactNode, Suspense, lazy } from 'react'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'
import { Button } from '../ui/button'
import { type ComponentId, snippets } from '../catalog/component-catalog'
import { ComponentCatalogPage } from '../catalog/ComponentCatalogPage'
import { DesignTokensPage } from '../token-editor/DesignTokensPage'
import { GettingStartedGuide } from '../site/GettingStartedGuide'
import { MoruDocsLayout } from '../site/MoruDocsLayout'
import { MoruHome } from '../site/MoruHome'
import { MoruSiteFooter } from '../site/MoruSiteFooter'
import { InputDocumentation } from '../site/InputDocumentation'
import { AiContextButton } from '../ai/AiContextButton'
import { registryRelease } from '../../lib/registry-install'
import { ComponentDemo } from './ComponentPlayground'
import { DemoCard } from './DemoCard'
import { ExamplesView } from './ExamplesView'
import { useStudio } from './useStudioController'

const FoundationComparison = lazy(() =>
  import('../comparison/FoundationComparison').then((module) => ({
    default: module.FoundationComparison,
  })),
)

const StateComparison = lazy(() =>
  import('../comparison/StateComparison').then((module) => ({ default: module.StateComparison })),
)

const MoruSimulator = lazy(() =>
  import('../simulator/MoruSimulator').then((module) => ({
    default: module.MoruSimulator,
  })),
)

const MobileReadinessLab = lazy(() =>
  import('../mobile/MobileReadinessLab').then((module) => ({
    default: module.MobileReadinessLab,
  })),
)

const BlocksPage = lazy(() =>
  import('../blocks/BlocksPage').then((module) => ({ default: module.BlocksPage })),
)

const ProjectTasksApp = lazy(() =>
  import('../project-template/ProjectTasksApp').then((module) => ({
    default: module.ProjectTasksApp,
  })),
)

const BrandStory = lazy(() =>
  import('../site/BrandStory').then((module) => ({ default: module.BrandStory })),
)

const TokenInstallGuide = lazy(() =>
  import('../site/TokenInstallGuide').then((module) => ({ default: module.TokenInstallGuide })),
)

/** The page content for the current view. */
export function StudioMain() {
  const { t } = useI18n()
  const {
    theme,
    setNotice,
    view,
    blockId,
    componentPage,
    standalone,
    publicView,
    inputDoc,
    newOnly,
    setNewOnly,
    query,
    setQuery,
    selected,
    code,
    setCode,
    copied,
    editorOpen,
    searchRef,
    compactDocs,
    compactInspectorWorkspace,
    componentInspectorDocked,
    drawerOpen,
    navigateComponentPage,
    go,
    chooseBlock,
    insertBlock,
    openEditor,
    closeEditor,
    selectComponent,
    inspectComponent,
    copy,
    exportNativeTheme,
  } = useStudio()
  function specimen(id: ComponentId, children: ReactNode) {
    return (
      <DemoCard
        key={id}
        id={id}
        selected={selected === id}
        onSelect={() => inspectComponent(id)}
        code={code}
        copied={copied === id}
        onCopy={() => void copy(snippets[id], id)}
        onOpenDocumentation={id === 'input' ? () => selectComponent(id) : undefined}
      >
        {children}
      </DemoCard>
    )
  }

  function componentDemo(id: ComponentId): ReactNode {
    return (
      <ComponentDemo
        id={id}
        onNotice={setNotice}
        onOpenExamples={() => {
          go('examples')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    )
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`main-content ${publicView ? 'moru-public-main' : ''} ${view === 'blocks' || view === 'brand' ? 'moru-public-wide' : ''} ${standalone ? `standalone-workspace standalone-workspace-${view}` : ''} ${view === 'brand' ? 'main-content-brand' : ''} ${view === 'simulator' ? 'simulator-workspace' : ''} ${view === 'components' || view === 'blocks' ? 'component-workspace' : ''} ${view === 'examples' ? 'example-workspace' : ''} ${view === 'comparison' || view === 'states' ? 'comparison-workspace' : ''} ${view === 'tokens' || view === 'mobile' ? 'reference-workspace' : ''}`}
      inert={drawerOpen}
    >
      {view === 'home' ? (
        <MoruHome
          tokens={theme.tokens}
          mode={theme.mode}
          onStart={() => go('guide')}
          onComponents={() => go('components')}
          onExample={() => go('project-template')}
          onEditTokens={(tokens) => {
            theme.setTokens(tokens)
            go('tokens')
            setNotice(t('선택한 디자인 토큰을 적용했어요. 여기서 이어서 편집하세요.'))
          }}
        />
      ) : null}
      {view === 'tokens' ? (
        <header className="catalog-intro">
          <span className="eyebrow">MORU UI / TOKENS</span>
          <h1>{t('디자인 토큰')}</h1>
          <p>{t('컬러 스키마를 설계하고, 형태와 리듬을 조절해 제품의 기준을 만드세요.')}</p>
        </header>
      ) : null}
      {view === 'comparison' || view === 'states' ? (
        <header className="catalog-intro">
          <span className="eyebrow">
            MORU UI / {view === 'comparison' ? 'FOUNDATIONS' : 'STATES'}
          </span>
          <h1>{view === 'comparison' ? t('디자인 비교') : t('상태 표현')}</h1>
          <p>
            {view === 'comparison'
              ? t('Pretendard와 Noto Sans, 세 가지 밀도와 두 가지 모드를 나란히 비교해 보세요.')
              : t('기본부터 로딩까지 일곱 가지 상태와 성공·경고·정보·오류 색상을 함께 살펴보세요.')}
          </p>
          <div className="catalog-meta">
            <span>{view === 'comparison' ? '12 COMBINATIONS' : '7 STATES / 4 COLORS'}</span>
            <span>
              {view === 'comparison'
                ? t('글꼴 · 역할별 타이포그래피 · 공통 크기')
                : t('상태 비교 · 의미 색상 · 직접 조작')}
            </span>
          </div>
        </header>
      ) : null}
      {view === 'guide' || view === 'token-guide' || view === 'components' ? (
        <MoruDocsLayout
          page={componentPage}
          active={view}
          compact={compactDocs || (componentInspectorDocked && compactInspectorWorkspace)}
          onGuide={() => go('guide')}
          onTokenGuide={() => go('token-guide')}
          onNavigate={navigateComponentPage}
          onSelect={selectComponent}
          tools={
            view === 'components' ? (
              <div className="component-design-toolbar">
                <span>{t('토큰을 조절하며 미리보기')}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  id="component-design-toggle"
                  type="button"
                  aria-expanded={editorOpen}
                  aria-controls="design-inspector"
                  onClick={() => (editorOpen ? closeEditor() : openEditor())}
                >
                  {editorOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                  {t('디자인 토큰')}
                </Button>
              </div>
            ) : undefined
          }
        >
          {view === 'token-guide' ? (
            <Suspense fallback={<p role="status">{t('적용 안내를 준비하고 있어요.')}</p>}>
              <TokenInstallGuide json={theme.exportJson()} onEdit={() => go('tokens')} />
            </Suspense>
          ) : view === 'guide' ? (
            <GettingStartedGuide
              onProjectTemplate={() => go('project-template')}
              aiAction={
                <AiContextButton
                  tokens={theme.tokens}
                  mode={theme.mode}
                  initialItems={['button', 'input', 'field']}
                />
              }
            />
          ) : inputDoc ? (
            <InputDocumentation
              onOpenStudio={() => inspectComponent('input')}
              aiAction={
                <AiContextButton
                  tokens={theme.tokens}
                  mode={theme.mode}
                  initialItems={['input', 'formatted-input', 'field']}
                />
              }
            />
          ) : (
            <ComponentCatalogPage
              aiAction={
                <AiContextButton
                  tokens={theme.tokens}
                  mode={theme.mode}
                  initialItems={componentPage.kind === 'detail' ? [componentPage.component] : []}
                />
              }
              page={componentPage}
              query={query}
              onQueryChange={setQuery}
              newOnly={newOnly}
              onNewOnlyChange={setNewOnly}
              onNavigate={navigateComponentPage}
              renderComponent={(id) => specimen(id, componentDemo(id))}
              code={code}
              onCodeChange={setCode}
              onExamples={() => go('examples')}
              onSimulator={() => go('simulator')}
              searchRef={searchRef}
            />
          )}
        </MoruDocsLayout>
      ) : null}
      {view === 'blocks' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('화면 블록을 준비하고 있어요.')}
            </p>
          }
        >
          <BlocksPage
            initialBlockId={blockId}
            onBlockChange={chooseBlock}
            onInsert={insertBlock}
            onExamples={() => go('examples')}
            renderAiAction={(id) => (
              <AiContextButton tokens={theme.tokens} mode={theme.mode} initialItems={[id]} />
            )}
          />
        </Suspense>
      ) : null}
      {view === 'mobile' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('모바일 UI 랩을 준비하고 있어요.')}
            </p>
          }
        >
          <MobileReadinessLab
            tokens={theme.tokens}
            mode={theme.mode}
            onModeChange={theme.setMode}
            onExportNative={exportNativeTheme}
            aiAction={
              <AiContextButton
                tokens={theme.tokens}
                mode={theme.mode}
                defaultTarget="expo-starter"
              />
            }
          />
        </Suspense>
      ) : null}
      {view === 'simulator' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('시뮬레이터를 준비하고 있어요.')}
            </p>
          }
        >
          <MoruSimulator />
        </Suspense>
      ) : null}
      {view === 'brand' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('Moru 이야기를 준비하고 있어요.')}
            </p>
          }
        >
          <BrandStory onExplore={() => go('components')} />
        </Suspense>
      ) : null}
      {view === 'comparison' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('비교 화면을 준비하고 있어요.')}
            </p>
          }
        >
          <FoundationComparison
            themes={theme.themes}
            activeMode={theme.mode}
            onApply={(font, density, mode) => {
              theme.setToken('fontFamily', font)
              theme.setToken('density', density)
              theme.setMode(mode)
            }}
          />
        </Suspense>
      ) : null}
      {view === 'states' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('상태 비교 화면을 준비하고 있어요.')}
            </p>
          }
        >
          <StateComparison themes={theme.themes} activeMode={theme.mode} />
        </Suspense>
      ) : null}
      {view === 'project-template' ? (
        <Suspense
          fallback={
            <p className="comparison-loading" role="status">
              {t('프로젝트 템플릿을 준비하고 있어요.')}
            </p>
          }
        >
          <ProjectTasksApp embedded />
        </Suspense>
      ) : null}
      {view === 'examples' ? <ExamplesView /> : null}
      {view === 'tokens' ? (
        <DesignTokensPage
          aiAction={<AiContextButton tokens={theme.tokens} mode={theme.mode} />}
          tokens={theme.tokens}
          cssText={theme.exportCss()}
          copied={copied === 'all-css'}
          mode={theme.mode}
          onModeChange={theme.setMode}
          onChange={theme.setToken}
          onTokensChange={theme.setTokens}
          onTypographyChange={theme.setTypography}
          colorSchemeSettings={theme.colorSchemeSettings}
          onApplyScheme={theme.applyColorScheme}
          onCopy={() => void copy(theme.exportCss(), 'all-css')}
          onEditColor={(key) => openEditor(`token-${key}`)}
        />
      ) : null}
      {!standalone ? <MoruSiteFooter version={registryRelease} compact={!publicView} /> : null}
    </main>
  )
}
