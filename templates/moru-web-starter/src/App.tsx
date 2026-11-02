import { useEffect, useMemo, useState } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Field } from './components/ui/field'
import { FileInput } from './components/ui/file-input'
import { Input } from './components/ui/input'
import { MultiSelect } from './components/ui/multi-select'
import { NativeSelect } from './components/ui/native-select'
import { NumberInput } from './components/ui/number-input'
import { PasswordInput } from './components/ui/password-input'
import { RingProgress } from './components/ui/ring-progress'
import { Stepper } from './components/ui/stepper'
import { ThemeScope } from './components/ui/theme-scope'
import { Typography } from './components/ui/typography'
import { applyDensity, createDarkTokens, defaultTokens, type Density, type ThemeMode } from './theme/tokens'

const areas = [
  { value: 'design', label: '디자인' },
  { value: 'development', label: '개발' },
  { value: 'research', label: '리서치' },
  { value: 'content', label: '콘텐츠' },
]

export default function App() {
  const [mode, setMode] = useState<ThemeMode>('light')
  const [density, setDensity] = useState<Density>('standard')
  const [name, setName] = useState('')
  const [people, setPeople] = useState<number | null>(4)
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['design'])
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const tokens = useMemo(() => {
    const next = applyDensity(defaultTokens, density)
    return mode === 'dark' ? createDarkTokens(next) : next
  }, [density, mode])
  useEffect(() => { document.documentElement.dataset.theme = mode }, [mode])
  const ready = name.trim().length >= 2 && people !== null && people >= 1 && selectedAreas.length > 0 && password.length >= 8
  const completed = Number(name.trim().length >= 2) + Number(people !== null && people >= 1) + Number(selectedAreas.length > 0) + Number(password.length >= 8)
  return <ThemeScope tokens={tokens} mode={mode} className="starter-app">
    <a className="starter-skip" href="#starter-main">본문으로 이동</a>
    <header className="starter-header">
      <a href="#" className="starter-brand" aria-label="Moru Web Starter 시작">Moru<span>WEB STARTER</span></a>
      <div className="starter-settings">
        <Field label="화면 밀도"><NativeSelect size="sm" value={density} onValueChange={(value) => setDensity(value as Density)}>
          <option value="compact">촘촘하게</option><option value="standard">기본</option><option value="comfortable">여유롭게</option>
        </NativeSelect></Field>
        <Button size="sm" variant="secondary" aria-pressed={mode === 'dark'} onClick={() => setMode((current) => current === 'light' ? 'dark' : 'light')}>다크 모드</Button>
      </div>
    </header>
    <main id="starter-main" className="starter-main">
      <section className="starter-intro">
        <Typography as="p" variant="caption">YOUR CODE. YOUR INTERFACE.</Typography>
        <Typography as="h1" variant="display">아이디어를 제품으로.</Typography>
        <p className="ui-prose">실제 Moru 컴포넌트와 디자인 토큰을 담은 작은 시작입니다. 입력하고, 선택하고, 테마를 바꿔 보세요. 가져온 소스는 프로젝트 안에서 직접 다듬을 수 있습니다.</p>
      </section>
      <div className="starter-grid">
        <Card className="starter-form-card">
          <div className="starter-section-heading"><Typography as="h2" variant="heading">새 프로젝트</Typography><Typography as="p" variant="caption">여기에 있는 입력은 서버로 전송되지 않습니다.</Typography></div>
          <Stepper value={saved ? 3 : name.trim().length >= 2 && selectedAreas.length > 0 ? password.length >= 8 ? 2 : 1 : 0} allowStepSelect={false} items={[{ id: 'information', label: '프로젝트' }, { id: 'security', label: '접근 설정' }, { id: 'review', label: '확인' }]} completedContent="입력 확인을 완료했어요." />
          <form onChange={() => setSaved(false)} onSubmit={(event) => { event.preventDefault(); if (ready) setSaved(true) }} className="starter-form">
            <Field label="프로젝트 이름" description="2자 이상 입력하세요."><Input name="project-name" required minLength={2} value={name} onValueChange={setName} placeholder="다음에 만들고 싶은 것" /></Field>
            <Field label="참여 인원" description="1명부터 20명까지. 빈 값은 0과 구분됩니다."><NumberInput name="people" value={people} onValueChange={(value) => { setPeople(value); setSaved(false) }} min={1} max={20} precision={0} required locale="ko-KR" /></Field>
            <Field label="프로젝트 분야"><MultiSelect name="areas" items={areas} value={selectedAreas} onValueChange={(values) => { setSelectedAreas(values); setSaved(false) }} maxSelected={3} required /></Field>
            <Field label="비밀번호" description="8자 이상. 실제 인증 기능은 앱에서 연결하세요." error={password.length > 0 && password.length < 8 ? '8자 이상 입력하세요.' : undefined}><PasswordInput name="password" value={password} onValueChange={setPassword} autoComplete="new-password" minLength={8} required placeholder="새 비밀번호" /></Field>
            <Field label="참고 파일 · 선택" description="PNG, JPEG 또는 PDF. 최대 2개, 파일당 2MB까지 선택할 수 있어요."><FileInput name="references" accept="image/png,image/jpeg,application/pdf" multiple maxFiles={2} maxSize={2 * 1024 * 1024} /></Field>
            <div className="starter-submit"><Button type="submit" disabled={!ready}>입력 확인</Button><Typography variant="caption" role="status">{saved ? '확인 완료 · 저장 API는 앱에서 연결하세요.' : '필수 항목을 채우면 확인할 수 있어요.'}</Typography></div>
          </form>
        </Card>
        <aside className="starter-aside" aria-label="프로젝트 준비와 소스 안내">
          <Card className="starter-progress-card"><Typography as="h2" variant="heading">준비 상황</Typography><RingProgress label="필수 입력" value={completed} max={4} /><Typography as="p" variant="caption">값과 의미를 텍스트로도 제공하므로 색상에만 의존하지 않습니다.</Typography></Card>
          <Card className="starter-source-card"><Typography as="h2" variant="heading">여기서 시작하세요</Typography><ol><li><code>src/App.tsx</code>에서 화면을 구성합니다.</li><li><code>src/components/ui</code>의 컴포넌트를 수정합니다.</li><li><code>src/theme/tokens.ts</code>에서 공통 규칙을 다듬습니다.</li></ol><p className="ui-prose">기본 컴포넌트·타이포그래피·팝업에 같은 토큰이 적용됩니다. 구현과 사용법은 동봉된 README에서 확인하세요.</p></Card>
        </aside>
      </div>
    </main>
    <footer className="starter-footer">Moru UI · 단단한 기본, 당신만의 UI.</footer>
  </ThemeScope>
}
