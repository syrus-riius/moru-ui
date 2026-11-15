import { lazy, Suspense, useRef, useState } from 'react'
import { ArrowDownToLine, ArrowUpRight, Check, Copy, Upload } from 'lucide-react'
import { useI18n } from '../../i18n'
import { Button } from '../ui/button'
import { Modal, type ModalProps } from '../ui/modal'
import { Tabs } from '../ui/tabs'
import './token-export-dialog.css'

const TokenInstallGuide = lazy(() =>
  import('../site/TokenInstallGuide').then((module) => ({ default: module.TokenInstallGuide })),
)

/** A guided npm handoff, with the original JSON/CSS export and import tools alongside it. */
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
  onOpenGuide,
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
  onOpenGuide?: () => void
}) {
  const { t } = useI18n()
  const [exportFormat, setExportFormat] = useState<'npm' | 'css' | 'json'>('npm')
  const importRef = useRef<HTMLInputElement>(null)
  const lastCopied = useRef('')
  const json = exportJson()
  const exportText = exportFormat === 'css' ? exportCss() : json
  const copyComplete = copied && lastCopied.current === exportText
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
        size="lg"
        className="token-export-dialog"
        footer={
          exportFormat !== 'npm' ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  lastCopied.current = exportText
                  onCopy(exportText)
                }}
              >
                {copyComplete ? <Check size={14} /> : <Copy size={14} />}
                {copyComplete ? t('복사했어요') : t('클립보드에 복사')}
              </Button>
              <Button onClick={download}>
                <ArrowDownToLine size={14} />
                {t('다운로드')}
              </Button>
            </>
          ) : undefined
        }
      >
        <div className="token-export-tools">
          {onOpenGuide ? (
            <Button variant="ghost" size="sm" onClick={onOpenGuide}>
              <ArrowUpRight size={14} aria-hidden="true" />
              {t('안내 페이지 열기')}
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => importRef.current?.click()}>
            <Upload size={13} />
            {t('불러오기')}
          </Button>
        </div>
        <Tabs
          className="token-export-tabs"
          size="sm"
          value={exportFormat}
          onValueChange={(value) => setExportFormat(value as typeof exportFormat)}
          aria-label={t('내보내기 형식')}
          items={[
            {
              value: 'npm',
              label: t('npm 적용 안내'),
              content: (
                <Suspense fallback={<p role="status">{t('적용 안내를 준비하고 있어요.')}</p>}>
                  <TokenInstallGuide json={json} embedded />
                </Suspense>
              ),
            },
            ...(['json', 'css'] as const).map((format) => ({
              value: format,
              label: t(format === 'json' ? 'JSON 설정' : 'CSS 변수'),
              content: (
                <>
                  <textarea
                    className="export-code"
                    aria-label={t('내보내기 코드')}
                    value={format === 'json' ? json : exportCss()}
                    readOnly
                    spellCheck={false}
                  />
                  <p className="export-note">
                    {t(
                      format === 'json'
                        ? '라이트·다크 모드 설정을 포함합니다. JSON으로 다시 불러올 수 있어요.'
                        : 'CSS 내보내기는 전역 변수용입니다. npm에서는 적용 안내의 JSON과 Provider를 사용하세요.',
                    )}
                  </p>
                </>
              ),
            })),
          ]}
        />
      </Modal>
    </>
  )
}
