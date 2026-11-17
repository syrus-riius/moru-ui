import { useI18n } from '../../i18n'
import { Check, ChevronRight, Code2, PanelRightClose, X } from 'lucide-react'
import { Button } from '../ui/button'
import { TokenEditor } from '../token-editor/TokenEditor'
import { snippets } from '../catalog/component-catalog'
import { MoruMark } from '../brand'
import { ComponentDetailControls } from './ComponentPlayground'
import { useStudio } from './useStudioController'

/** The design editor panel, docked beside the gallery or opened as a drawer. */
export function StudioInspector() {
  const { t } = useI18n()
  const {
    theme,
    view,
    standalone,
    publicView,
    selected,
    setSelected,
    setExportOpen,
    copied,
    editorOpen,
    setEditorOpen,
    componentDetailsOpen,
    setComponentDetailsOpen,
    tokenFocusRequest,
    inspectorRef,
    compactViewport,
    componentInspectorDocked,
    navDrawerOpen,
    editorDrawerOpen,
    closeEditor,
    copy,
    selectedMeta,
  } = useStudio()
  return (
    <>
      {editorDrawerOpen ? (
        <button
          className="editor-scrim"
          aria-label={t('토큰 편집 패널 닫기')}
          tabIndex={-1}
          onClick={closeEditor}
        />
      ) : null}
      {view !== 'simulator' &&
      view !== 'playground' &&
      ((!standalone && !publicView) || view === 'components' || editorOpen) ? (
        <aside
          id="design-inspector"
          data-moru-editor
          ref={inspectorRef}
          className={`inspector ${editorOpen ? 'inspector-open' : ''} ${view === 'components' ? 'component-design-inspector' : ''} ${componentInspectorDocked ? 'inspector-docked' : ''}`}
          hidden={view === 'components' && !editorOpen}
          inert={((compactViewport || standalone || publicView) && !editorOpen) || navDrawerOpen}
          role={editorDrawerOpen ? 'dialog' : undefined}
          aria-modal={editorDrawerOpen || undefined}
          aria-label={t('디자인 편집 패널')}
        >
          <div className="inspector-mobile-header">
            <div>
              <strong>{view === 'components' ? t('디자인 토큰') : t('디자인 편집')}</strong>
              {view === 'components' ? <p>{t('스튜디오와 공유 · 실시간 적용')}</p> : null}
            </div>
            <Button
              size="sm"
              variant="ghost"
              textWrap="wrap"
              className="icon-button"
              onClick={closeEditor}
              aria-label={
                componentInspectorDocked ? t('디자인 토큰 패널 접기') : t('편집 패널 닫기')
              }
            >
              {componentInspectorDocked ? <PanelRightClose size={18} /> : <X size={18} />}
            </Button>
          </div>
          <TokenEditor
            tokens={theme.tokens}
            focusRequest={tokenFocusRequest}
            spacingTarget={selected}
            onSpacingTargetChange={(target) => setSelected(target)}
            onChange={theme.setToken}
            onTokensChange={theme.setTokens}
            onTypographyChange={theme.setTypography}
            mode={theme.mode}
            onModeChange={theme.setMode}
            presetId={theme.presetId}
            onPresetChange={theme.applyPreset}
            onReset={theme.reset}
            onExport={() => {
              if (!componentInspectorDocked) setEditorOpen(false)
              setExportOpen(true)
            }}
          >
            {view !== 'mobile' && view !== 'blocks' ? (
              <section className="component-inspector-dock" aria-label={t('컴포넌트 설정')}>
                <Button
                  size="sm"
                  variant="ghost"
                  textWrap="wrap"
                  type="button"
                  className="component-inspector-toggle"
                  aria-expanded={componentDetailsOpen}
                  aria-controls="component-details"
                  onClick={() => setComponentDetailsOpen(!componentDetailsOpen)}
                >
                  <span>{t('컴포넌트 세부 조정')}</span>
                  <span>
                    {selectedMeta.name}
                    <ChevronRight size={13} aria-hidden="true" />
                  </span>
                </Button>
                <div
                  id="component-details"
                  className="component-inspector"
                  hidden={!componentDetailsOpen}
                  tabIndex={-1}
                  role="group"
                  aria-label={t('{v0} 세부 조정', { v0: selectedMeta.name })}
                >
                  <div className="inspector-section-title">
                    <span>COMPONENT DETAILS</span>
                    <span>{selectedMeta.name}</span>
                  </div>
                  <ComponentDetailControls selected={selected} subtitle={selectedMeta.subtitle} />
                  <Button
                    size="sm"
                    variant="ghost"
                    textWrap="wrap"
                    className="inspector-copy"
                    onClick={() => void copy(snippets[selected], 'inspector')}
                  >
                    {copied === 'inspector' ? <Check size={13} /> : <Code2 size={13} />}
                    {copied === 'inspector'
                      ? t('복사했어요')
                      : t('{v0} 코드 복사', { v0: selectedMeta.name })}
                  </Button>
                </div>
              </section>
            ) : null}
            <div className="inspector-footer">
              <span>{t('작은 변화도, 바로 확인하세요.')}</span>
              <MoruMark width={16} height={16} />
            </div>
          </TokenEditor>
        </aside>
      ) : null}
    </>
  )
}
