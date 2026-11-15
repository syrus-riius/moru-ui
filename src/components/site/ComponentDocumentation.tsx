import { useEffect, useState, type ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { components, type ComponentId } from '../catalog/component-catalog'
import type { ComponentPage } from '../catalog/component-pages'
import { Button } from '../ui/button'
import { CodeBlock } from '../ui/code-block'
import { Spinner } from '../ui/spinner'
import { Tabs } from '../ui/tabs'
import { ComponentDocumentationLayout } from './ComponentDocumentationLayout'
import { ComponentInstallation } from './ComponentInstallation'
import { ComponentApiReference } from './ComponentApiReference'
import { loadComponentDocument, type ComponentDocument } from './component-document'

export function ComponentDocumentation({
  id,
  preview,
  onOpenStudio,
  onNavigate,
  aiAction,
}: {
  id: ComponentId
  preview: ReactNode
  onOpenStudio: () => void
  onNavigate: (page: ComponentPage) => void
  aiAction?: ReactNode
}) {
  const { t } = useI18n()
  const [document, setDocument] = useState<ComponentDocument | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const registryId = id === 'dialog' ? 'modal' : id
  const component = components.find((item) => item.id === id)!
  useEffect(() => {
    const controller = new AbortController()
    setDocument(null)
    setFailed(false)
    loadComponentDocument(registryId, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setDocument(value)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
    return () => controller.abort()
  }, [registryId, attempt])
  const reference = document?.id === registryId ? document : null
  const sections = [
    { id: `${id}-preview`, label: '미리보기' },
    { id: `${id}-installation`, label: '설치' },
    { id: `${id}-usage`, label: '사용법' },
    { id: `${id}-props`, label: 'Props' },
  ]
  const loading = failed ? (
    <div className="moru-component-doc__load-state" role="alert">
      <p>{t('문서를 불러오지 못했어요. 미리보기는 계속 사용할 수 있습니다.')}</p>
      <Button variant="secondary" size="sm" onClick={() => setAttempt((value) => value + 1)}>
        {t('다시 시도')}
      </Button>
    </div>
  ) : (
    <div className="moru-component-doc__load-state" role="status">
      <Spinner size="sm" decorative />
      {t('사용법과 속성을 불러오는 중')}
    </div>
  )
  return (
    <ComponentDocumentationLayout
      id={id}
      sections={reference ? sections : sections.slice(0, 1)}
      onOpenStudio={onOpenStudio}
      onNavigate={onNavigate}
      aiAction={aiAction}
    >
      <section id={`${id}-preview`} tabIndex={-1} aria-label={t('미리보기')}>
        <Tabs
          className="moru-component-doc__tabs"
          aria-label={t('{name} 예제 보기', { name: component.name })}
          defaultValue="preview"
          items={[
            {
              value: 'preview',
              label: t('미리보기'),
              content: (
                <div className="moru-component-doc__preview moru-component-doc__live">
                  <div className={`specimen-content specimen-${id}`}>{preview}</div>
                </div>
              ),
            },
            {
              value: 'code',
              label: t('코드'),
              content: reference ? (
                <CodeBlock
                  value={reference.example}
                  filename={`${registryId}-example.tsx`}
                  language="tsx"
                  defaultWrap
                />
              ) : (
                loading
              ),
            },
          ]}
        />
        <p className="moru-component-doc__preview-note">
          {t('미리보기에서 동작과 상태를 살펴보고, 사용법에서 기본 예제 코드를 복사하세요.')}
        </p>
      </section>
      {reference ? (
        <>
          <section aria-labelledby={`${id}-installation`}>
            <h2 id={`${id}-installation`} tabIndex={-1}>
              {t('설치')}
            </h2>
            <ComponentInstallation command={reference.installCommand} />
          </section>
          <section aria-labelledby={`${id}-usage`}>
            <h2 id={`${id}-usage`} tabIndex={-1}>
              {t('사용법')}
            </h2>
            <CodeBlock
              value={reference.example}
              filename={`${registryId}-example.tsx`}
              language="tsx"
              defaultWrap
            />
          </section>
          <section aria-labelledby={`${id}-props`}>
            <h2 id={`${id}-props`} tabIndex={-1}>
              Props
            </h2>
            <ComponentApiReference document={reference} name={component.name} />
          </section>
        </>
      ) : (
        loading
      )}
    </ComponentDocumentationLayout>
  )
}
