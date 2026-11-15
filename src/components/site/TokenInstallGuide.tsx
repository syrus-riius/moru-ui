import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowDownToLine, Check, Copy, FileJson, SlidersHorizontal } from 'lucide-react'
import { useI18n } from '../../i18n'
import { createTokenInstallGuide, type TokenInstallTarget } from './token-install'
import { Button } from '../ui/button'
import { DocumentationCodeBlock } from './DocumentationCodeBlock'
import { ToggleGroup } from '../ui/toggle-group'
import './token-install-guide.css'

export type TokenInstallGuideProps = {
  json: string
  onEdit?: () => void
  embedded?: boolean
}

/** One guide powers the export dialog and the shareable installation page. */
export function TokenInstallGuide({ json, onEdit, embedded = false }: TokenInstallGuideProps) {
  const { t, locale } = useI18n()
  const id = useId()
  const [target, setTarget] = useState<TokenInstallTarget>('vite')
  const [copiedText, setCopiedText] = useState('')
  const [feedback, setFeedback] = useState<'copied' | 'downloaded' | 'error' | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mounted = useRef(true)
  const result = useMemo(() => {
    try {
      return { guide: createTokenInstallGuide(json, target, locale), error: false }
    } catch {
      return { guide: null, error: true }
    }
  }, [json, target, locale])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (resetTimer.current) clearTimeout(resetTimer.current)
    }
  }, [])

  function announce(next: 'copied' | 'downloaded' | 'error') {
    if (!mounted.current) return
    if (resetTimer.current) clearTimeout(resetTimer.current)
    setFeedback(next)
    resetTimer.current = setTimeout(() => {
      setFeedback(null)
      setCopiedText('')
    }, 2500)
  }

  async function copyGuide() {
    if (!result.guide) return
    const text = result.guide.text
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      if (!mounted.current) return
      setCopiedText(text)
      announce('copied')
    } catch {
      announce('error')
    }
  }

  function downloadJson() {
    const file = result.guide?.files.find((item) => item.language === 'json')
    if (!file) return
    const url = URL.createObjectURL(new Blob([file.code], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'moru-tokens.json'
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    announce('downloaded')
  }

  if (result.error || !result.guide) {
    return (
      <section className="token-install-guide token-install-guide-error" role="alert">
        <p>{t('토큰 설정을 읽지 못했어요. 스튜디오에서 JSON을 다시 내보내 주세요.')}</p>
        {onEdit && <Button onClick={onEdit}>{t('토큰 편집으로 돌아가기')}</Button>}
      </section>
    )
  }

  const guide = result.guide
  const jsonFile = guide.files.find((file) => file.language === 'json')!
  const codeFiles = guide.files.filter((file) => file.language !== 'json')
  const Heading = embedded ? 'h3' : 'h2'
  const copied = copiedText === guide.text
  const modeLabel = guide.mode === 'dark' ? t('다크') : t('라이트')

  return (
    <article
      className="token-install-guide"
      data-embedded={embedded}
      aria-label={embedded ? t('npm 프로젝트 적용 안내') : undefined}
      aria-labelledby={embedded ? undefined : `${id}-title`}
    >
      <header className="token-install-intro">
        {!embedded && (
          <>
            <span className="token-install-eyebrow">MORU / YOUR DESIGN</span>
            <h1 id={`${id}-title`}>{t('내 프로젝트에 적용')}</h1>
          </>
        )}
        <p>
          {t(
            '지금의 디자인을 JSON과 코드로 가져가세요. 설치부터 Provider 연결까지 한곳에서 안내합니다.',
          )}
        </p>
        <div className="token-install-summary">
          <span>{t('시작 모드: {mode}', { mode: modeLabel })}</span>
          <span>{t('라이트·다크 설정 포함')}</span>
          <span>{t('TypeScript · React 19.3 이상 · 19.x')}</span>
        </div>
      </header>

      <div className="token-install-toolbar">
        <div className="token-install-target">
          <span id={`${id}-target`}>{t('사용 중인 프로젝트')}</span>
          <ToggleGroup
            aria-labelledby={`${id}-target`}
            size="sm"
            layout="segmented"
            preventEmpty
            value={[target]}
            onValueChange={([next]) => {
              if (next === 'vite' || next === 'next') setTarget(next)
            }}
            items={[
              { value: 'vite', label: 'Vite / React' },
              { value: 'next', label: 'Next.js App Router' },
            ]}
          />
        </div>
        <div className="token-install-actions">
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <SlidersHorizontal size={15} aria-hidden="true" />
              {t('디자인 수정')}
            </Button>
          )}
          <Button size="sm" onClick={() => void copyGuide()}>
            {copied ? (
              <Check size={15} aria-hidden="true" />
            ) : (
              <Copy size={15} aria-hidden="true" />
            )}
            {copied ? t('전체 안내를 복사했어요') : t('전체 안내 복사')}
          </Button>
        </div>
      </div>
      <p className="token-install-feedback" role="status" aria-live="polite">
        {feedback === 'copied'
          ? t('설치 명령과 파일별 코드, 디자인 JSON을 함께 복사했어요.')
          : feedback === 'downloaded'
            ? t('moru-tokens.json을 다운로드했어요.')
            : feedback === 'error'
              ? t('복사하지 못했어요. 아래 코드를 선택해 직접 복사해 주세요.')
              : t('파일별로 복사하거나 전체 안내를 개발 도구에 붙여넣을 수 있어요.')}
      </p>

      <ol className="token-install-steps">
        <li className="token-install-step">
          <div className="token-install-step-heading">
            <span className="token-install-step-number" aria-hidden="true">
              01
            </span>
            <div>
              <Heading>{t('패키지 설치')}</Heading>
              <p>{t('프로젝트 폴더의 터미널에서 실행하세요. Tailwind CSS는 필요하지 않습니다.')}</p>
            </div>
          </div>
          <DocumentationCodeBlock
            filename={t('터미널')}
            language="sh"
            value={guide.command}
            size="sm"
            defaultWrap
          />
          <p className="token-install-note">
            {t(
              '선택한 웹폰트가 필요한 경우 설치 명령과 스타일 import에 함께 포함됩니다. 시스템 폰트는 기기에 따라 다를 수 있어요.',
            )}
          </p>
        </li>

        <li className="token-install-step">
          <div className="token-install-step-heading">
            <span className="token-install-step-number" aria-hidden="true">
              02
            </span>
            <div>
              <Heading>{t('디자인 JSON 저장')}</Heading>
              <p>
                {t(
                  '파일을 내려받아 아래 경로에 넣으세요. 두 모드와 스튜디오 편집 설정을 함께 보관합니다.',
                )}
              </p>
            </div>
          </div>
          <div className="token-install-file-row">
            <span>
              <FileJson size={16} aria-hidden="true" />
              <code>{jsonFile.path}</code>
            </span>
            <Button variant="secondary" size="sm" onClick={downloadJson}>
              <ArrowDownToLine size={15} aria-hidden="true" />
              {t('JSON 다운로드')}
            </Button>
          </div>
          <details className="token-install-code-details">
            <summary>{t('JSON 확인 및 복사')}</summary>
            <DocumentationCodeBlock
              filename={jsonFile.path}
              language="json"
              value={jsonFile.code}
              size="sm"
              defaultWrap
            />
          </details>
        </li>

        <li className="token-install-step">
          <div className="token-install-step-heading">
            <span className="token-install-step-number" aria-hidden="true">
              03
            </span>
            <div>
              <Heading>{t('Provider와 앱 연결')}</Heading>
              <p>
                {t(
                  '파일 이름을 확인하고 코드를 적용하세요. Provider 안의 Moru 컴포넌트가 같은 디자인을 사용합니다.',
                )}
              </p>
            </div>
          </div>
          <p className="token-install-callout">
            {t(
              '기존 앱에서는 App 또는 layout 예제를 그대로 덮어쓰지 마세요. 기존 화면·Provider·metadata를 유지하며 import와 감싸는 부분을 합쳐 주세요.',
            )}
          </p>
          {target === 'next' && (
            <p className="token-install-note">
              {t('src/app 구조의 Next.js 프로젝트라면 아래 app/ 파일을 모두 src/app/에 넣으세요.')}
            </p>
          )}
          <div className="token-install-files" key={target}>
            {codeFiles.map((file, index) => (
              <details className="token-install-code-details" key={file.path} open={index === 0}>
                <summary>
                  <code>{file.path}</code>
                </summary>
                <DocumentationCodeBlock
                  filename={file.path}
                  language={file.language}
                  value={file.code}
                  size="sm"
                  defaultWrap
                />
              </details>
            ))}
          </div>
          <p className="token-install-note">
            {t(
              '스타일은 한 번만 가져옵니다. 다크 모드로 바꿀 때는 mode와 해당 모드의 tokens를 함께 전달하세요.',
            )}
          </p>
          <p className="token-install-note">
            {t(
              'JSON import 오류가 나면 tsconfig.json의 compilerOptions에 resolveJsonModule: true를 추가하세요.',
            )}
          </p>
        </li>
      </ol>

      <aside className="token-install-aftercare">
        <Heading>{t('디자인을 다시 바꾸려면')}</Heading>
        <p>
          {t(
            '스튜디오에서 같은 JSON을 불러와 수정한 뒤, 프로젝트의 JSON을 교체하고 앱을 빌드·배포하세요. Moru 패키지를 다시 배포할 필요는 없습니다.',
          )}
        </p>
        <p>
          {t(
            '사이트에서 바꾼 값이 운영 앱으로 자동 동기화되지는 않습니다. 화면 구성과 콘텐츠는 앱에서 직접 만드세요.',
          )}
        </p>
      </aside>
    </article>
  )
}
