import { useI18n } from '../../i18n'
import { SlidersHorizontal } from 'lucide-react'

import { StudioCommandPalette } from './StudioCommandPalette'
import { TokenExportDialog } from './TokenExportDialog'
import { useStudio } from './useStudioController'

/** Floating editor button, command palette and the dialogs opened from anywhere. */
export function StudioOverlays() {
  const { t } = useI18n()
  const {
    theme,
    setNotice,
    view,
    standalone,
    publicView,
    exportOpen,
    setExportOpen,
    copied,
    commandOpen,
    setCommandOpen,
    editorOpen,
    invite,
    drawerOpen,
    go,
    openBlocks,
    openEditor,
    selectComponent,
    copy,
  } = useStudio()
  return (
    <>
      {!standalone && !publicView ? (
        <button className="floating-editor-button" inert={drawerOpen} onClick={() => openEditor()}>
          <SlidersHorizontal size={18} />
          {t('디자인 편집')}
        </button>
      ) : null}
      <StudioCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        view={view}
        mode={theme.mode}
        onModeChange={theme.setMode}
        go={go}
        selectComponent={selectComponent}
        openBlocks={openBlocks}
        openEditor={openEditor}
        openInvite={invite.openInvite}
        onExport={() => setExportOpen(true)}
      />
      {invite.dialog}
      <TokenExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        finalFocus={
          view === 'components' && !editorOpen
            ? () => document.getElementById('component-design-toggle')
            : undefined
        }
        exportCss={theme.exportCss}
        exportJson={theme.exportJson}
        onImport={theme.importJson}
        copied={copied === 'export'}
        onCopy={(text) => void copy(text, 'export')}
        onNotice={setNotice}
        onOpenGuide={() => {
          setExportOpen(false)
          go('token-guide')
        }}
      />
    </>
  )
}
