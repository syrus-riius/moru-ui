import { useI18n } from '../../i18n'
import { ArrowDownToLine, ArrowUpRight, Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { RegistryInstaller } from './RegistryInstaller'
import { DocumentationCodeBlock } from './DocumentationCodeBlock'
import { registryInstallCommand, registryRelease } from '../../lib/registry-install'
import { moruNpmVersion } from './token-install'
import { gettingStartedExamples } from './getting-started-examples'
import './getting-started-guide.css'

const packageGuide =
  'https://github.com/syrus-riius/moru-ui/blob/main/packages/moru-react/README.md'

export function GettingStartedGuide({
  onProjectTemplate,
  aiAction,
}: {
  onProjectTemplate: () => void
  aiAction?: ReactNode
}) {
  const { t, locale } = useI18n()
  const examples = gettingStartedExamples(locale, {
    project: t('프로젝트 이름'),
    placeholder: t('새 프로젝트'),
    date: t('날짜'),
  })

  return (
    <article className="getting-started-guide moru-start-doc" aria-labelledby="moru-start-title">
      <header className="moru-start-intro">
        <div className="moru-start-release">
          <span>moru-ui</span>
          <a href={`https://www.npmjs.com/package/moru-ui/v/${moruNpmVersion}`}>{moruNpmVersion}</a>
          <span>{t('베타')}</span>
        </div>
        <h1 id="moru-start-title">{t('시작하기')}</h1>
        <p>{t('패키지 설치부터 첫 입력창까지. 내 React 프로젝트에서 Moru를 시작하세요.')}</p>
        <div className="moru-start-requirements">
          <strong>{t('시작 전 확인')}</strong>
          <ul>
            <li>{t('React와 React DOM 19.3 이상, 20 미만의 웹 프로젝트가 필요합니다.')}</li>
            <li>{t('ES Modules를 사용합니다. Tailwind CSS와 별도 CLI는 필요하지 않습니다.')}</li>
            <li>{t('React Native·Expo는 별도 구현이며 이 npm 패키지에 포함되지 않습니다.')}</li>
          </ul>
          <p>{t('아래 예제는 Vite + React + TypeScript 프로젝트 기준입니다.')}</p>
          <a className="moru-start-link" href="https://vite.dev/guide/">
            {t('아직 프로젝트가 없나요?')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </header>

      <section aria-labelledby="moru-start-install">
        <h2 id="moru-start-install">
          <span className="moru-start-number" aria-hidden="true">
            01
          </span>
          {t('패키지 설치')}
        </h2>
        <p>{t('package.json이 있는 프로젝트 폴더에서 실행하세요.')}</p>
        <DocumentationCodeBlock
          value={`npm install moru-ui@${moruNpmVersion}`}
          filename={t('터미널')}
          language="sh"
          size="sm"
          lineNumbers={false}
        />
        <p className="moru-start-note">
          {t(
            '현재 latest와 beta는 같은 베타 버전입니다. 위 명령은 이 안내에서 확인한 버전을 설치합니다.',
          )}
        </p>
      </section>

      <section aria-labelledby="moru-start-theme">
        <h2 id="moru-start-theme">
          <span className="moru-start-number" aria-hidden="true">
            02
          </span>
          {t('스타일과 Provider 연결')}
        </h2>
        <p>
          {t(
            'src/App.tsx를 아래 예제로 바꿔 보세요. 스타일은 앱에서 한 번 불러오고, MoruProvider 안에 컴포넌트를 배치합니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value={examples.app}
          filename="src/App.tsx"
          language="tsx"
          size="sm"
        />
        <DocumentationCodeBlock
          value="npm run dev"
          filename={t('터미널')}
          language="sh"
          size="sm"
          lineNumbers={false}
        />
        <p className="moru-start-check">
          <Check size={16} aria-hidden="true" />
          {t('프로젝트 이름 라벨과 입력창이 보이고 입력할 수 있으면 준비 완료입니다.')}
        </p>
        <p className="moru-start-note">
          {t(
            '처음에는 기본 테마로 동작합니다. 별칭 설정이나 토큰 파일을 먼저 만들 필요는 없습니다.',
          )}
        </p>
        <details className="moru-start-disclosure">
          <summary>{t('Next.js App Router에서 사용한다면')}</summary>
          <div>
            <p>
              {t(
                '클라이언트 Provider를 만들고 기존 루트 레이아웃에 연결하세요. 기존 메타데이터와 전역 스타일은 유지합니다.',
              )}
            </p>
            <DocumentationCodeBlock
              value={examples.nextProvider}
              filename="app/providers.tsx"
              language="tsx"
              size="sm"
            />
            <DocumentationCodeBlock
              value={examples.nextLayout}
              filename="app/layout.tsx"
              language="tsx"
              size="sm"
            />
            <DocumentationCodeBlock
              value={examples.nextPage}
              filename="app/page.tsx"
              language="tsx"
              size="sm"
            />
            <p className="moru-start-note">
              {t(
                'src/app 구조라면 같은 파일을 src/app 안에 둡니다. 상태와 이벤트 핸들러는 클라이언트 컴포넌트에서 사용하세요.',
              )}
            </p>
          </div>
        </details>
      </section>

      <section aria-labelledby="moru-start-customize">
        <h2 id="moru-start-customize">
          <span className="moru-start-number" aria-hidden="true">
            03
          </span>
          {t('내 디자인과 언어 적용')}
        </h2>
        <p>
          {t(
            '기본 사용을 확인했다면 색상·크기·간격을 내 디자인으로 바꿔 보세요. 스튜디오에서 만든 토큰 JSON과 Provider 코드를 함께 가져올 수 있습니다.',
          )}
        </p>
        <div className="getting-started-actions">
          <a className="getting-started-button" href="#guide/tokens">
            {t('내 프로젝트에 적용')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            className="getting-started-button getting-started-button-quiet"
            href="#components/forms/input"
          >
            {t('Input 상세에서 직접 써보기')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <details className="moru-start-disclosure">
          <summary>{t('언어와 날짜 표시 설정')}</summary>
          <div>
            <p>
              {t(
                'MoruProvider의 locale로 기본 안내와 날짜 표시를 바꿉니다. 한국어·영어·일본어·중국어 간체를 지원합니다.',
              )}
            </p>
            <code className="moru-start-locales">ko · en · ja · zh-CN</code>
            <DocumentationCodeBlock
              value={examples.locale}
              filename="src/App.tsx"
              language="tsx"
              size="sm"
            />
            <p className="moru-start-note">
              {t(
                '직접 작성한 라벨과 데이터는 유지됩니다. messages 속성으로 기본 문구를 덮어쓸 수 있습니다.',
              )}
            </p>
          </div>
        </details>
      </section>

      <section aria-labelledby="moru-start-update">
        <h2 id="moru-start-update">{t('업데이트와 다음 단계')}</h2>
        <p>
          {t(
            '새 버전의 변경 기록을 확인한 뒤 패키지를 업데이트하세요. 직접 만든 토큰과 앱 코드는 프로젝트에서 관리합니다.',
          )}
        </p>
        <DocumentationCodeBlock
          value="npm install moru-ui@latest"
          filename={t('터미널')}
          language="sh"
          size="sm"
          lineNumbers={false}
        />
        <div className="getting-started-actions">
          <a className="moru-start-link" href={packageGuide}>
            {t('npm 패키지 사용법')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a
            className="moru-start-link"
            href="https://github.com/syrus-riius/moru-ui/blob/main/packages/moru-react/CHANGELOG.md"
          >
            {t('변경 기록')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a className="moru-start-link" href="#blocks">
            {t('블록 둘러보기')}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="moru-start-alternatives" aria-labelledby="moru-start-source">
        <h2 id="moru-start-source">{t('소스 코드로 시작하는 다른 방법')}</h2>
        <p>
          {t(
            '컴포넌트 구현을 직접 수정하려면 소스 설치를 선택할 수 있습니다. 위 npm 설치 과정에 추가로 수행하는 단계는 아닙니다.',
          )}
        </p>
        <details className="moru-start-disclosure">
          <summary>{t('레지스트리에서 필요한 소스만 설치')}</summary>
          <div>
            <p>
              {t(
                '이 경로는 shadcn CLI로 Moru 소스를 복사합니다. Node.js 24 이상, React 19.3, TypeScript, Tailwind CSS 4와 components.json이 준비된 Vite 프로젝트를 기준으로 합니다.',
              )}
            </p>
            <a className="moru-start-link" href="https://ui.shadcn.com/docs/installation/vite">
              {t('소스 설치용 프로젝트 설정')}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <DocumentationCodeBlock
              value={`${registryInstallCommand('field')}\n${registryInstallCommand('input')}`}
              filename={`Registry · v${registryRelease}`}
              language="sh"
              size="sm"
              lineNumbers={false}
            />
            <p>
              {t(
                '생성된 파일을 프로젝트 별칭에 맞게 불러옵니다. npm 설치 예제와 import 경로가 다릅니다.',
              )}
            </p>
            <DocumentationCodeBlock
              value={examples.source}
              filename="src/App.tsx"
              language="tsx"
              size="sm"
            />
            <details className="moru-start-registry">
              <summary>{t('다른 컴포넌트의 설치 명령 찾기')}</summary>
              <RegistryInstaller />
            </details>
            <p className="moru-start-note">
              {t(
                '소스를 업데이트할 때는 현재 파일을 커밋하고 CLI의 변경 비교·덮어쓰기 안내를 확인하세요.',
              )}
            </p>
            <a
              className="moru-start-link"
              href="https://github.com/syrus-riius/moru-ui/blob/main/docs/registry.ko.md"
            >
              {t('레지스트리 설치 문서')}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </details>
        <details className="moru-start-disclosure">
          <summary>{t('소스 포함 웹 스타터와 예제')}</summary>
          <div>
            <p>
              {t(
                '웹 스타터 ZIP은 Moru 소스를 포함한 별도 프로젝트입니다. 압축을 풀고 해당 폴더에서 npm ci와 npm run dev를 실행하세요.',
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
          </div>
        </details>
        <details className="moru-start-disclosure">
          <summary>{t('AI에 소스 설치 명세 전달')}</summary>
          <div>
            <p>
              {t(
                '이 도구는 웹 레지스트리 또는 Expo 소스용 명세를 만듭니다. npm으로 작업할 때는 위 설치 예제와 토큰 적용 안내를 AI에 전달하세요.',
              )}
            </p>
            <div className="getting-started-actions">
              {aiAction}
              <a className="moru-start-link" href="/llms.txt" target="_blank" rel="noreferrer">
                {t('AI 소스 안내')}
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>
            <p className="moru-start-note">
              {t(
                'Moru는 전달할 내용을 준비합니다. 복사한 내용은 원하는 AI 도구에 직접 붙여넣으세요.',
              )}
            </p>
          </div>
        </details>
      </section>
    </article>
  )
}
