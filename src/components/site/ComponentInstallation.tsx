import { useI18n } from '../../i18n'
import { CodeBlock } from '../ui/code-block'

const providerCode = `import type { ReactNode } from 'react'
import { MoruProvider } from 'moru-ui'
import 'moru-ui/styles.css'

export function AppUI({ children }: { children: ReactNode }) {
  return <MoruProvider>{children}</MoruProvider>
}`

export function ComponentInstallation({ command = 'npm install moru-ui' }: { command?: string }) {
  const { t } = useI18n()
  return (
    <>
      <CodeBlock value={command} filename={t('터미널')} language="sh" defaultWrap size="sm" />
      <p>{t('스타일은 앱에서 한 번 불러오고, 컴포넌트를 MoruProvider로 감싸 주세요.')}</p>
      <details className="moru-component-doc__details">
        <summary>{t('Provider 연결 코드')}</summary>
        <CodeBlock value={providerCode} filename="app-ui.tsx" language="tsx" defaultWrap />
      </details>
      <p>
        {t('Next.js에서는 컴포넌트를 사용하는 파일에 use client를 선언하세요.')}{' '}
        <a href="#guide/tokens">{t('설치부터 내 디자인 적용까지')}</a>
      </p>
    </>
  )
}
