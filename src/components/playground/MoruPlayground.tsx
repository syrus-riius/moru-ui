import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Download, PanelLeftClose, SlidersHorizontal } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useStudio } from '../studio/useStudioController'
import { useMediaQuery } from '../studio/studio-hooks'
import { TokenEditor } from '../token-editor/TokenEditor'
import { Button } from '../ui/button'
import { ThemeScope } from '../ui/theme-scope'
import { ToastProvider } from '../ui/toast'
import { PlaygroundExamples } from './PlaygroundExamples'
import './moru-playground.css'

/** One shared theme drives both the editor and every preview, including portalled UI. */
export function MoruPlayground() {
  const { t } = useI18n()
  const { theme, selected, setSelected, tokenFocusRequest, setExportOpen, go } = useStudio()
  const compact = useMediaQuery('(max-width: 900px)')
  const [mobileEditorOpen, setMobileEditorOpen] = useState(!compact)
  const [headerHeight, setHeaderHeight] = useState(64)
  const panelRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const panelVisible = !compact || mobileEditorOpen

  // Preserve the visible editor when resizing; never hide an input that has focus.
  useEffect(() => {
    if (!compact) setMobileEditorOpen(true)
  }, [compact])

  useEffect(() => {
    const header = document.querySelector('.moru-public-header')
    if (!header) return
    const measure = () => setHeaderHeight(Math.ceil(header.getBoundingClientRect().height))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frame = 0
    function revealEditor(event: Event) {
      const tokenId = (event as CustomEvent<{ tokenId?: string | null }>).detail?.tokenId
      setMobileEditorOpen(true)
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const target = tokenId ? document.getElementById(tokenId) : null
        const fallback = panelRef.current?.querySelector<HTMLElement>(
          '[role="tab"][aria-selected="true"]',
        )
        ;(target ?? fallback)?.focus({ preventScroll: true })
      })
    }
    window.addEventListener('moru:playground-tokens', revealEditor)
    return () => {
      window.removeEventListener('moru:playground-tokens', revealEditor)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className="moru-playground"
      style={{ '--playground-header-height': `${headerHeight}px` } as CSSProperties}
    >
      <aside className="moru-playground-sidebar" aria-label={t('Playground 토큰 설정')}>
        <div className="moru-playground-mobile-bar" data-moru-editor>
          <span>{t('미리보며 다듬기')}</span>
          <Button
            id="playground-token-toggle"
            size="sm"
            variant="secondary"
            aria-expanded={panelVisible}
            aria-controls="playground-token-panel"
            onClick={() => setMobileEditorOpen((open) => !open)}
          >
            {mobileEditorOpen ? <PanelLeftClose size={16} /> : <SlidersHorizontal size={16} />}
            {t(mobileEditorOpen ? '토큰 설정 접기' : '토큰 설정 펼치기')}
          </Button>
        </div>
        <div
          id="playground-token-panel"
          ref={panelRef}
          className="moru-playground-token-panel"
          hidden={!panelVisible}
        >
          <TokenEditor
            tokens={theme.savedTokens}
            palette={{
              savedTokens: theme.savedTokens,
              preview: theme.palettePreview,
              onPreview: theme.previewPalette,
              onSave: theme.savePalettePreview,
              onCancel: theme.cancelPalettePreview,
              lockedRoles: theme.paletteLockedRoles,
              onToggleLock: theme.togglePaletteRoleLock,
              onClearLocks: theme.clearPaletteLocks,
            }}
            mode={theme.mode}
            presetId={theme.presetId}
            focusRequest={tokenFocusRequest}
            spacingTarget={selected}
            onSpacingTargetChange={setSelected}
            onChange={theme.setToken}
            onTokensChange={theme.setTokens}
            onTypographyChange={theme.setTypography}
            onModeChange={theme.setMode}
            onPresetChange={theme.applyPreset}
            onReset={theme.reset}
            onExport={() => setExportOpen(true)}
          />
        </div>
      </aside>

      <ThemeScope tokens={theme.tokens} mode={theme.mode} className="moru-playground-preview">
        <ToastProvider layout="stack">
          <header className="moru-playground-heading">
            <div>
              <h1 ref={headingRef} tabIndex={-1}>
                Playground
              </h1>
              <p>{t('직접 눌러보고, 나만의 디자인으로 다듬어 보세요.')}</p>
            </div>
            <div className="moru-playground-actions">
              <Button
                size="sm"
                variant="secondary"
                disabled={Boolean(theme.palettePreview)}
                onClick={() => setExportOpen(true)}
              >
                <Download size={15} aria-hidden="true" />
                {t('토큰 내보내기')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                nativeButton={false}
                role="link"
                render={<a href="#guide/tokens" />}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                  event.preventDefault()
                  go('token-guide')
                }}
              >
                {t('내 프로젝트에 적용')}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Button>
            </div>
          </header>
          {theme.palettePreview ? (
            <div className="moru-playground-palette-status">
              <div role="status">
                <strong>{t(theme.palettePreview.name)}</strong>
                <span>{t('팔레트 미리보기 · 아직 저장되지 않았어요.')}</span>
              </div>
              <div className="moru-playground-actions">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    headingRef.current?.focus({ preventScroll: true })
                    theme.cancelPalettePreview()
                  }}
                >
                  {t('되돌리기')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    headingRef.current?.focus({ preventScroll: true })
                    theme.savePalettePreview()
                  }}
                >
                  {t('이 팔레트 저장')}
                </Button>
              </div>
            </div>
          ) : null}
          <PlaygroundExamples />
          <footer className="moru-playground-note">
            {t(
              '실제 Moru 컴포넌트로 만든 예제입니다. 예제의 입력과 동작은 이 화면에서만 유지됩니다.',
            )}
          </footer>
        </ToastProvider>
      </ThemeScope>
    </div>
  )
}
