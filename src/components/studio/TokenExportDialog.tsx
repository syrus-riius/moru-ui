import { useRef, useState } from 'react'
import { ArrowDownToLine, Check, Code2, Copy, FileJson, Upload } from 'lucide-react'
import { useI18n } from '../../i18n'
import { Button } from '../ui/button'
import { Modal, type ModalProps } from '../ui/modal'

/** Export the edited tokens as CSS variables or JSON, or load a saved JSON file. */
export function TokenExportDialog({
  open,
  onOpenChange,
  finalFocus,
  exportCss,
  exportJson,
  onImport,
  copied,
  onCopy,
  onNotice,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  finalFocus?: ModalProps['finalFocus']
  exportCss: () => string
  exportJson: () => string
  onImport: (json: string) => void
  copied: boolean
  onCopy: (text: string) => void
  onNotice: (title: string) => void
}) {
  const { t } = useI18n()
  const [exportFormat, setExportFormat] = useState<'css' | 'json'>('css')
  const importRef = useRef<HTMLInputElement>(null)
  const exportText = exportFormat === 'css' ? exportCss() : exportJson()
  function download() {
    const blob = new Blob([exportText], {
      type: exportFormat === 'css' ? 'text/css' : 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `moru-tokens.${exportFormat}`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    onNotice(t('디자인 토큰을 내보냈어요.'))
  }
  return (
    <>
      <input
        ref={importRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-label={t('디자인 토큰 JSON 불러오기')}
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          try {
            if (file.size > 100_000) throw new Error(t('100KB 이하의 토큰 파일을 선택해 주세요.'))
            onImport(await file.text())
            onNotice(t('디자인 토큰을 불러왔어요.'))
          } catch (error) {
            onNotice(error instanceof Error ? error.message : t('토큰 파일을 확인해 주세요.'))
          }
          event.target.value = ''
        }}
      />
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        finalFocus={finalFocus}
        title={t('내 디자인을 가져가세요.')}
        description={t('조절한 토큰을 프로젝트에서 그대로 사용하세요.')}
        footer={
          <>
            <Button variant="secondary" onClick={() => onCopy(exportText)}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? t('복사했어요') : t('클립보드에 복사')}
            </Button>
            <Button onClick={download}>
              <ArrowDownToLine size={14} />
              {t('다운로드')}
            </Button>
          </>
        }
      >
        <div className="export-format-tabs" role="group" aria-label={t('내보내기 형식')}>
          <button
            className={exportFormat === 'css' ? 'active' : ''}
            aria-pressed={exportFormat === 'css'}
            onClick={() => setExportFormat('css')}
          >
            <Code2 size={15} />
            {t('CSS 변수')}
          </button>
          <button
            className={exportFormat === 'json' ? 'active' : ''}
            aria-pressed={exportFormat === 'json'}
            onClick={() => setExportFormat('json')}
          >
            <FileJson size={15} />
            {t('JSON 설정')}
          </button>
          <button className="import-button" onClick={() => importRef.current?.click()}>
            <Upload size={13} />
            {t('불러오기')}
          </button>
        </div>
        <textarea
          className="export-code"
          aria-label={t('내보내기 코드')}
          value={exportText}
          readOnly
          spellCheck={false}
        />
        <p className="export-note">
          {exportFormat === 'css'
            ? t('현재 모드의 CSS입니다. 프로젝트의 전역 스타일에 추가해 주세요.')
            : t('라이트·다크 모드 설정을 포함합니다. JSON으로 다시 불러올 수 있어요.')}
        </p>
      </Modal>
    </>
  )
}
