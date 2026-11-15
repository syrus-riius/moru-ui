import { useI18n } from '../../i18n'
import { ArrowDownToLine, ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { RegistryInstaller } from './RegistryInstaller'
import { DocumentationCodeBlock } from './DocumentationCodeBlock'
import { registryInstallCommand, registryRelease } from '../../lib/registry-install'
import './getting-started-guide.css'

const inputExample = `import { Input } from '@/components/ui/moru/input'
import { MoruProvider } from '@/components/ui/moru/provider'
import '@/components/ui/moru/styles.css'

export default function App() {
  return (
    <MoruProvider>
      <Input aria-label="프로젝트 이름" placeholder="새 프로젝트" />
    </MoruProvider>
  )
}`

export function GettingStartedGuide({
  onProjectTemplate,
  aiAction,
}: {
  onProjectTemplate: () => void
  aiAction?: ReactNode
}) {
  const { t } = useI18n()
  return (
    <article className="getting-started-guide moru-start-doc" aria-labelledby="moru-start-title">
      <header className="moru-start-intro">
        <h1 id="moru-start-title">{t('시작하기')}</h1>
        <p>{t('React 프로젝트에 Moru의 Input을 설치하고 테마를 연결해 보세요.')}</p>
      </header>

      <section aria-labelledby="moru-start-npm">
        <h2 id="moru-start-npm">{t('npm으로 내 디자인 적용하기')}</h2>
        <p>
          {t(
            '패키지를 설치하고, 스튜디오에서 만든 토큰을 Provider에 연결하세요. Tailwind는 필요하지 않습니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value="npm install moru-ui"
          filename="npm"
          language="sh"
          size="sm"
          lineNumbers={false}
        />
        <a className="moru-start-link" href="#guide/tokens">
          {t('내 프로젝트에 적용')}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </section>

      <section className="moru-start-ai" aria-labelledby="moru-start-ai">
        <span className="moru-start-ai__eyebrow">DESIGNED FOR PEOPLE. READY FOR AI.</span>
        <h2 id="moru-start-ai">{t('AI와 함께 만들기')}</h2>
        <p>
          {t(
            '만들 화면과 필요한 컴포넌트를 고르세요. 정확한 사용법과 지금의 디자인 토큰을 묶어, 사용 중인 AI에 전달할 수 있어요.',
          )}
        </p>
        <ol>
          <li>{t('React 웹 또는 Expo를 선택해요.')}</li>
          <li>{t('필요한 명세와 현재 토큰을 확인하고 복사해요.')}</li>
          <li>{t('AI에 붙여넣고 만들 화면을 설명해요.')}</li>
        </ol>
        <div className="getting-started-actions">
          {aiAction}
          <a className="moru-start-link" href="/llms.txt" target="_blank" rel="noreferrer">
            {t('AI 시작 안내')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <p className="moru-start-ai__note">
          {t('Moru는 전달할 내용을 준비합니다. 복사한 내용은 원하는 AI 도구에 직접 붙여넣으세요.')}
        </p>
      </section>

      <section aria-labelledby="moru-start-prepare">
        <h2 id="moru-start-prepare">{t('소스 설치 준비')}</h2>
        <p>
          {t(
            'Node.js 24 이상과 React 19.3, TypeScript, Vite, Tailwind CSS 4를 사용합니다. 프로젝트에 Tailwind와 components.json을 준비하세요.',
          )}
        </p>
        <a className="moru-start-link" href="https://ui.shadcn.com/docs/installation/vite">
          {t('Vite 프로젝트 설정 가이드')}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </section>

      <section aria-labelledby="moru-start-install">
        <h2 id="moru-start-install">{t('Input 설치')}</h2>
        <p>
          {t(
            '프로젝트 폴더에서 실행하세요. CLI가 Input과 공통 스타일·테마를 moru/ 폴더에 추가합니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value={registryInstallCommand('input')}
          filename={`Input · v${registryRelease}`}
          language="sh"
          size="sm"
          lineNumbers={false}
        />
        <details className="moru-start-registry">
          <summary>{t('다른 컴포넌트의 설치 명령 찾기')}</summary>
          <RegistryInstaller />
        </details>
      </section>

      <section aria-labelledby="moru-start-theme">
        <h2 id="moru-start-theme">{t('스타일과 테마 연결')}</h2>
        <p>
          {t(
            '앱에서 Moru의 스타일을 한 번 불러오고, 컴포넌트를 MoruProvider로 감싸세요. UI 경로는 프로젝트의 별칭에 맞춰 바꿉니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value={inputExample}
          filename="App.tsx"
          language="tsx"
          size="sm"
          lineNumbers={false}
        />
        <a className="moru-start-link" href="#components/forms/input">
          {t('Input 상세에서 직접 써보기')}
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </section>

      <section aria-labelledby="moru-start-locale">
        <h2 id="moru-start-locale">{t('언어 설정')}</h2>
        <p>
          {t(
            'MoruProvider의 locale로 기본 안내와 날짜 표시를 바꿉니다. 한국어·영어·일본어·중국어 간체를 지원합니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value={`<MoruProvider locale="en">
  <DatePicker />
  <LoginBlock />
</MoruProvider>`}
          filename="locale: ko | en | ja | zh-CN"
          language="tsx"
          size="sm"
        />
        <p>
          {t(
            '직접 작성한 라벨과 데이터는 유지됩니다. messages 속성으로 기본 문구를 덮어쓸 수 있습니다.',
          )}
        </p>
      </section>

      <section aria-labelledby="moru-start-starter">
        <h2 id="moru-start-starter">{t('예제 프로젝트로 시작하기')}</h2>
        <p>
          {t(
            '웹 스타터를 내려받고 압축을 푼 뒤 npm ci와 npm run dev를 실행하면 폼 예제를 열 수 있습니다.',
          )}
        </p>
        <div className="getting-started-actions">
          <a className="getting-started-button" href="/downloads/moru-web-starter.zip" download>
            <ArrowDownToLine size={15} aria-hidden="true" />
            {t('웹 스타터 받기')}
          </a>
          <a
            className="getting-started-button getting-started-button-quiet"
            href="#project-template"
            onClick={(event) => {
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.altKey ||
                event.shiftKey
              )
                return
              event.preventDefault()
              onProjectTemplate()
            }}
          >
            {t('프로젝트·할 일 예제')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section aria-labelledby="moru-start-update">
        <h2 id="moru-start-update">{t('테마 편집과 업데이트')}</h2>
        <p>
          {t(
            '스튜디오에서 색상과 간격을 조절하고 토큰을 내보낼 수 있습니다. 새 버전을 설치할 때는 변경한 파일을 커밋하고 CLI의 덮어쓰기 안내를 확인하세요.',
          )}
        </p>
        <div className="getting-started-actions">
          <a className="getting-started-button getting-started-button-quiet" href="#tokens">
            {t('디자인 토큰 열기')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            className="getting-started-button getting-started-button-quiet"
            href="https://github.com/syrus-riius/moru-ui/blob/main/docs/registry.ko.md"
          >
            {t('전체 설치 문서')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>
    </article>
  )
}
