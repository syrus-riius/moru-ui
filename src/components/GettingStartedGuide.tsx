import { ArrowRight, ArrowUpRight, Box, Columns2, Download, ExternalLink, Settings2, Upload } from 'lucide-react'
import { MoruMark } from './brand'
import './getting-started-guide.css'

export type GettingStartedGuideProps = {
  onExport: () => void
  onImport: () => void
  onExamples: () => void
  onOpenEditor: () => void
  onComparison: () => void
}

const componentCode = [
  'import { Button, Field, Input } from "./components/ui"',
  '',
  'export function ProjectForm() {',
  '  return (',
  '    <>',
  '      <Field label="프로젝트 이름">',
  '        <Input placeholder="새로운 아이디어" />',
  '      </Field>',
  '      <Button variant="primary">만들기</Button>',
  '    </>',
  '  )',
  '}',
].join('\n')

export function GettingStartedGuide({ onExport, onImport, onExamples, onOpenEditor, onComparison }: GettingStartedGuideProps) {
  return <div className="getting-started-guide">
    <section className="getting-started-summary" aria-label="Moru UI 프로젝트 정보">
      <MoruMark width={36} height={36} />
      <div className="getting-started-summary-copy">
        <div className="getting-started-summary-title"><strong>Moru UI</strong><span>v0.3</span></div>
        <p>React · TypeScript · Base UI · Tailwind CSS</p>
        <span className="getting-started-local">MIT LICENSE<span>소스를 직접 가져와 다듬는 오픈소스</span></span>
      </div>
    </section>

    <section className="getting-started-step" aria-labelledby="getting-started-customize">
      <span className="getting-started-step-number" aria-hidden="true">01</span>
      <div className="getting-started-step-copy">
        <h2 id="getting-started-customize">내 취향으로 다듬기</h2>
        <p>디자인 편집에서 색상·밀도·역할별 타이포그래피를 조절하세요. 같은 토큰이 컴포넌트와 예제 화면에 적용되고, 라이트·다크 색상은 각각 저장됩니다.</p>
        <div className="getting-started-actions">
          <button type="button" className="getting-started-button" onClick={onOpenEditor}><Settings2 size={14} aria-hidden="true" />디자인 편집 열기</button>
          <button type="button" className="getting-started-button getting-started-button-quiet" onClick={onComparison}><Columns2 size={14} aria-hidden="true" />디자인 비교하기<ArrowUpRight size={13} aria-hidden="true" /></button>
        </div>
      </div>
    </section>

    <section className="getting-started-step" aria-labelledby="getting-started-components">
      <span className="getting-started-step-number" aria-hidden="true">02</span>
      <div className="getting-started-step-copy">
        <h2 id="getting-started-components">컴포넌트 가져다 쓰기</h2>
        <p>웹 스타터를 받으면 Moru 컴포넌트 전체와 토큰, 실제 폼 예제가 들어 있습니다. 압축을 풀고 의존성을 설치한 뒤 바로 실행하거나, 필요한 소스를 프로젝트에 가져와 다듬으세요.</p>
        <div className="getting-started-actions">
          <a className="getting-started-button" href="/downloads/moru-web-starter.zip" download><Download size={14} aria-hidden="true" />React 웹 스타터 받기</a>
          <a className="getting-started-button getting-started-button-quiet" href="https://github.com/syrus-riius/moru-ui" target="_blank" rel="noreferrer">GitHub 소스 보기<ExternalLink size={14} aria-hidden="true" /></a>
        </div>
        <div className="getting-started-code-box">
          <div className="getting-started-code-heading"><span>컴포넌트 사용 예시</span><span>TSX</span></div>
          <div className="getting-started-code-scroll" role="region" tabIndex={0} aria-label="컴포넌트 사용 예시 코드">
            <pre><code>{componentCode}</code></pre>
          </div>
        </div>
        <p className="getting-started-footnote">Moru 소스는 MIT 라이선스로 사용·수정·재배포할 수 있습니다. 스타터의 LICENSE·NOTICE 고지를 유지하세요. README에 실행 방법과 CSS·테마 연결을 안내합니다. npm 게시와 컴포넌트 선택 설치는 아직 제공하지 않습니다.</p>
      </div>
    </section>

    <section className="getting-started-step" aria-labelledby="getting-started-tokens">
      <span className="getting-started-step-number" aria-hidden="true">03</span>
      <div className="getting-started-step-copy">
        <h2 id="getting-started-tokens">디자인 토큰 내보내기</h2>
        <p>CSS는 현재 선택한 모드의 디자인 변수를 담습니다. JSON은 라이트·다크 설정과 프리셋 정보를 포함해, 다시 불러와 작업을 이어갈 수 있습니다.</p>
        <div className="getting-started-actions">
          <button type="button" className="getting-started-button" onClick={onExport}><Download size={14} aria-hidden="true" />토큰 내보내기</button>
          <button type="button" className="getting-started-button getting-started-button-quiet" onClick={onImport}><Upload size={14} aria-hidden="true" />JSON 불러오기</button>
        </div>
      </div>
    </section>

    <section className="getting-started-step" aria-labelledby="getting-started-examples">
      <span className="getting-started-step-number" aria-hidden="true">04</span>
      <div className="getting-started-step-copy">
        <h2 id="getting-started-examples">실제 화면에서 확인하기</h2>
        <p>예제 설정 화면에서 폼·선택·메뉴·다이얼로그를 함께 사용해 보세요. Base UI의 키보드 동작과 포커스 관리도 확인할 수 있습니다.</p>
        <div className="getting-started-actions"><button type="button" className="getting-started-button" onClick={onExamples}>예제 화면으로 이동<ArrowRight size={14} aria-hidden="true" /></button></div>
      </div>
    </section>

    <a className="getting-started-base-link" href="https://base-ui.com/react/overview/quick-start" target="_blank" rel="noreferrer"><Box size={16} aria-hidden="true" /><span>기반이 궁금하다면, Base UI 공식 문서</span><ExternalLink size={14} aria-hidden="true" /></a>
  </div>
}
