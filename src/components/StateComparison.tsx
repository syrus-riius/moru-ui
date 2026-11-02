import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, ArrowRight, Check, CircleAlert, CircleCheck, Info, Layers2, Moon, MousePointer2, Palette, Sun, TriangleAlert } from 'lucide-react'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Select } from './ui/select'
import { StatusMessage } from './ui/status-message'
import { Textarea } from './ui/textarea'
import { ThemeScope } from './ui/theme-scope'
import { Typography } from './ui/typography'
import { uiStateOptions } from './ui/state'
import type { UIState } from './ui'
import { densityOptions, fontOptions, getContrastRatio, getCssVariables, semanticToneOptions } from '../theme/tokens'
import type { SemanticTone, ThemeMode, ThemeTokens } from '../theme/tokens'
import './state-comparison.css'

type Panel = 'states' | 'colors' | 'live'
type ComponentName = 'button' | 'input' | 'select' | 'checkbox' | 'textarea'
type Props = { themes: Record<ThemeMode, ThemeTokens>; activeMode: ThemeMode }
const modes: ThemeMode[] = ['light', 'dark']
const componentOptions: { value: ComponentName; label: string; detail: string }[] = [
  { value: 'button', label: 'Button', detail: '주요 행동 / 보조 행동' },
  { value: 'input', label: 'Input', detail: '한 줄 입력' },
  { value: 'select', label: 'Select', detail: '선택 목록' },
  { value: 'checkbox', label: 'Checkbox', detail: '선택과 동의' },
  { value: 'textarea', label: 'Textarea', detail: '여러 줄 입력' },
]
const teamItems = [{ value: 'design', label: '팀 A' }, { value: 'product', label: '팀 B' }, { value: 'dev', label: '팀 C' }]
const toneIcons = { success: CircleCheck, warning: TriangleAlert, info: Info, danger: CircleAlert }
const messages: Record<SemanticTone, { title: string; body: string }> = {
  success: { title: '설정을 저장했어요.', body: '변경한 내용이 프로젝트에 반영되었어요.' },
  warning: { title: '저장하지 않은 변경이 있어요.', body: '화면을 떠나기 전에 내용을 확인해 주세요.' },
  info: { title: '팀원과 함께할 수 있어요.', body: '초대 링크를 공유해 다음 아이디어를 시작하세요.' },
  danger: { title: '저장하지 못했어요.', body: '입력한 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.' },
}
const stateNotes: Record<UIState, string> = {
  default: '조작 전', hover: '포인터 올림', pressed: '누르고 있는 동안', focus: '키보드 선택',
  disabled: '조작할 수 없음', error: '내용 확인 필요', loading: '처리 중 · 중복 방지',
}
const modeName = (mode: ThemeMode) => mode === 'light' ? '라이트' : '다크'

function ModeHeading({ mode, tokens }: { mode: ThemeMode; tokens: ThemeTokens }) {
  return <div className="state-mode-heading"><div>{mode === 'light' ? <Sun size={14} /> : <Moon size={14} />}<h2>{modeName(mode)}</h2><span>{fontOptions.find((font) => font.value === tokens.fontFamily)?.label}</span></div><span>{densityOptions.find((density) => density.value === tokens.density)?.label}</span></div>
}

function StateControl({ component, state, mode, size }: { component: ComponentName; state: UIState; mode: ThemeMode; size: 'sm' | 'md' | 'lg' }) {
  const label = `${modeName(mode)} ${uiStateOptions.find((item) => item.value === state)?.label} ${componentOptions.find((item) => item.value === component)?.label}`
  const errorId = state === 'error' && component !== 'button' ? `state-error-${mode}-${component}` : undefined
  if (component === 'button') return <div className="state-button-stack"><Button size={size} previewState={state} aria-label={`${label} 주요 행동`}>{state === 'error' ? '재시도' : '저장'}</Button><Button size={size} variant="secondary" previewState={state} aria-label={`${label} 보조 행동`}>보조</Button></div>
  if (component === 'input') return <Input size={size} previewState={state} value="Moru" readOnly aria-label={label} aria-describedby={errorId} />
  if (component === 'textarea') return <Textarea size={size} previewState={state} value={'Moru\n아이디어'} readOnly rows={2} aria-label={label} aria-describedby={errorId} />
  if (component === 'select') return <Select size={size} previewState={state} items={teamItems} value="design" readOnly aria-label={label} aria-describedby={errorId} />
  return <Checkbox size={size} previewState={state} label="알림" checked readOnly aria-label={label} aria-describedby={errorId} />
}

function ToneRibbon() {
  return <div className="state-tone-ribbon" aria-label="의미 색상 요약">{semanticToneOptions.map(({ value, label }) => {
    const Icon = toneIcons[value]
    return <span key={value} style={{ color: `var(--ui-${value}-text)`, background: `var(--ui-${value}-soft)` }}><Icon size={13} />{label}</span>
  })}</div>
}

function StateMatrix({ mode, tokens, components, size }: { mode: ThemeMode; tokens: ThemeTokens; components: typeof componentOptions; size: 'sm' | 'md' | 'lg' }) {
  return <section className="state-mode-section">
    <ModeHeading mode={mode} tokens={tokens} />
    <ThemeScope tokens={tokens} mode={mode} className="state-matrix-scope">
      <div className="state-matrix-scroll" role="region" aria-label={`${modeName(mode)} 상태 비교 표`} tabIndex={0}>
        <table className="state-matrix" data-size={size}>
          <caption className="sr-only">{modeName(mode)} 모드의 일곱 가지 컴포넌트 상태. 표본은 고정된 모습이며 실제 조작은 직접 조작 탭에서 확인할 수 있습니다.</caption>
          <thead><tr>{uiStateOptions.map(({ value, label }, index) => <th key={value} scope="col"><span className={`state-column-label state-column-${value}`}><i>{String(index + 1).padStart(2, '0')}</i>{label}</span></th>)}</tr></thead>
          <tbody>{components.map(({ value, label, detail }) => <Fragment key={value}>
            <tr className="state-row-heading"><th colSpan={7}><strong>{label}</strong><span>{detail}</span></th></tr>
            <tr className="state-control-row" data-component={value}>{uiStateOptions.map(({ value: state, label: stateLabel }) => <td key={state} data-preview-state={state}>
              <div className="state-cell"><StateControl component={value} state={state} mode={mode} size={size} />{state === 'error' && value !== 'button' ? <span id={`state-error-${mode}-${value}`} className="state-field-error"><CircleAlert size={11} />{value === 'checkbox' ? '동의 필요' : '확인 필요'}</span> : null}</div>
              <span className="sr-only">{stateLabel}: {stateNotes[state]}</span>
            </td>)}</tr>
          </Fragment>)}</tbody>
        </table>
      </div>
      <ToneRibbon />
    </ThemeScope>
  </section>
}

function SemanticPalette({ tokens, mode, variant }: { tokens: ThemeTokens; mode: ThemeMode; variant: 'soft' | 'outline' }) {
  const variables = getCssVariables(tokens, mode)
  return <section className="state-mode-section">
    <ModeHeading mode={mode} tokens={tokens} />
    <ThemeScope tokens={tokens} mode={mode} className="semantic-palette-scope">
      {semanticToneOptions.map(({ value: tone, label, description }) => <article key={tone} className="semantic-palette-card" data-semantic-tone={tone}>
        <div className="semantic-palette-heading"><strong>{label}</strong><span>{description}</span></div>
        <StatusMessage tone={tone} title={messages[tone].title} variant={variant} role="group">{messages[tone].body}</StatusMessage>
        <div className="semantic-color-specs">
          <span><i style={{ background: tokens[tone] }} /><span>기준색<code>{tokens[tone]}</code></span></span>
          <span><i style={{ background: variables[`--ui-${tone}-soft`], color: variables[`--ui-${tone}-text`] }}>Aa</i><span>안내 배경<code>{variables[`--ui-${tone}-soft`]}</code></span></span>
          <span className="semantic-contrast"><Check size={12} /><span>글자 대비<strong>{getContrastRatio(variables[`--ui-${tone}-text`], variables[`--ui-${tone}-soft`]).toFixed(2)} : 1</strong></span></span>
        </div>
      </article>)}
    </ThemeScope>
  </section>
}

function LiveExample({ tokens, mode }: { tokens: ThemeTokens; mode: ThemeMode }) {
  const [name, setName] = useState('Moru Studio')
  const [team, setTeam] = useState('design')
  const [agreed, setAgreed] = useState(false)
  const [simulateError, setSimulateError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const busy = result === 'loading'
  const nameError = submitted && !name.trim() ? '프로젝트 이름을 입력해 주세요.' : undefined
  const agreementError = submitted && !agreed
  const hasErrors = Boolean(nameError || agreementError)
  const tone: SemanticTone = hasErrors || result === 'error' ? 'danger' : result === 'success' ? 'success' : busy ? 'info' : 'warning'
  const feedback = hasErrors ? { title: '입력 내용을 확인해 주세요.', body: '오류가 표시된 항목을 수정한 뒤 다시 저장해 주세요.' }
    : result === 'error' ? messages.danger : result === 'success' ? messages.success
      : busy ? { title: '설정을 저장하고 있어요.', body: '처리가 끝날 때까지 중복 입력을 잠시 막아 두었어요.' }
        : { title: '아직 저장하지 않았어요.', body: '알림 수신에 동의하고 저장하거나, 빈 값으로 오류를 확인해 보세요.' }

  function submit() {
    if (busy) return
    setSubmitted(true)
    if (!name.trim() || !agreed) { setResult('idle'); return }
    setResult('loading')
    timer.current = setTimeout(() => setResult(simulateError ? 'error' : 'success'), 1000)
  }
  function changed() { setResult('idle') }
  return <section className="state-mode-section">
    <ModeHeading mode={mode} tokens={tokens} />
    <ThemeScope tokens={tokens} mode={mode} className="state-live-scope">
      <form className="state-live-form" noValidate onSubmit={(event) => { event.preventDefault(); submit() }} aria-label="상태 동작 예제" aria-busy={busy || undefined}>
        <div className="state-live-heading"><span><Layers2 size={20} /></span><div><Typography variant="heading" as="h3">작은 반응을 직접 느껴보세요.</Typography><Typography variant="body">마우스를 올리고, 누르고, Tab 키로 이동해 보세요.</Typography></div></div>
        <div className="state-live-fields"><Field label="프로젝트 이름" description="한 글자 이상 입력해 주세요." error={nameError}><Input value={name} onChange={(event) => { setName(event.target.value); changed() }} maxLength={60} placeholder="프로젝트 이름" loading={busy} /></Field><Field label="함께할 팀"><Select items={[{ value: 'design', label: '디자인 팀' }, { value: 'product', label: '프로덕트 팀' }, { value: 'dev', label: '개발 팀' }]} value={team} onValueChange={(value) => { setTeam(value); changed() }} loading={busy} /></Field></div>
        <Field label="프로젝트 소개" description="짧은 설명으로 프로젝트를 소개해 주세요."><Textarea placeholder="어떤 아이디어를 함께 만들까요?" rows={3} maxLength={200} loading={busy} onChange={changed} /></Field>
        <div className="state-live-agreement"><Checkbox label="프로젝트 알림 수신에 동의해요" description="필수 선택 · 이 화면 안에서만 동작하는 예제예요." checked={agreed} onCheckedChange={(checked) => { setAgreed(checked); changed() }} loading={busy} aria-invalid={agreementError || undefined} aria-describedby={agreementError ? 'state-agreement-error' : undefined} />{agreementError ? <p id="state-agreement-error" className="ui-field-error"><CircleAlert size={13} />알림 수신 동의가 필요해요.</p> : null}</div>
        <StatusMessage tone={tone} title={feedback.title}>{feedback.body}</StatusMessage>
        <div className="state-live-actions"><Checkbox label="저장 실패 재현" checked={simulateError} disabled={busy} onCheckedChange={(checked) => { setSimulateError(checked); changed() }} /><div><Button type="reset" variant="secondary" disabled={busy} onClick={() => { setName(''); setAgreed(false); setSimulateError(false); setSubmitted(false); setResult('idle') }}>입력 비우기</Button><Button type="submit" loading={busy}>{busy ? '저장 중' : result === 'error' ? '다시 시도' : '설정 저장'}{busy ? null : <ArrowRight size={14} />}</Button></div></div>
      </form>
    </ThemeScope>
  </section>
}

export function StateComparison({ themes, activeMode }: Props) {
  const [panel, setPanel] = useState<Panel>('states')
  const [modeFilter, setModeFilter] = useState<'all' | ThemeMode>('all')
  const [componentFilter, setComponentFilter] = useState<'all' | ComponentName>('all')
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [variant, setVariant] = useState<'soft' | 'outline'>('soft')
  const visibleModes = modeFilter === 'all' ? modes : [modeFilter]
  const visibleComponents = componentFilter === 'all' ? componentOptions : componentOptions.filter((item) => item.value === componentFilter)
  const liveMode = modeFilter === 'all' ? activeMode : modeFilter
  return <div className="comparison-page state-comparison">
    <div className="state-overview comparison-overview"><div className="state-overview-copy comparison-overview-copy"><span className="state-overview-icon comparison-overview-icon"><MousePointer2 size={20} /></span><div><strong>모양을 넘어, 반응의 규칙까지.</strong><p>같은 의미는 같은 신호로. 색상과 아이콘, 동작을 함께 확인하세요.</p></div></div><div className="state-overview-count comparison-overview-numbers"><strong>7</strong><span>상태</span><i>+</i><strong>4</strong><span>의미 색상</span></div></div>
    <div className="state-panel-tabs comparison-page-tabs" role="group" aria-label="상태 확인 항목">
      <button className={panel === 'states' ? 'active' : ''} aria-pressed={panel === 'states'} onClick={() => setPanel('states')}><Layers2 size={14} />상태 비교<span>7</span></button>
      <button className={panel === 'colors' ? 'active' : ''} aria-pressed={panel === 'colors'} onClick={() => setPanel('colors')}><Palette size={14} />의미 색상<span>4</span></button>
      <button className={panel === 'live' ? 'active' : ''} aria-pressed={panel === 'live'} onClick={() => setPanel('live')}><MousePointer2 size={14} />직접 조작</button>
    </div>
    <div className="state-filters comparison-page-filters">
      {panel === 'states' ? <><label>컴포넌트<select aria-label="상태를 비교할 컴포넌트" value={componentFilter} onChange={(event) => setComponentFilter(event.target.value as 'all' | ComponentName)}><option value="all">전체 5개</option>{componentOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}</select></label><label>크기<select aria-label="상태 표본 크기" value={size} onChange={(event) => setSize(event.target.value as 'sm' | 'md' | 'lg')}><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option></select></label></> : null}
      {panel === 'colors' ? <label>표현<select aria-label="의미 색상 표현" value={variant} onChange={(event) => setVariant(event.target.value as 'soft' | 'outline')}><option value="soft">은은한 배경</option><option value="outline">테두리</option></select></label> : null}
      <label>모드<select aria-label="상태 비교 모드" value={modeFilter} onChange={(event) => setModeFilter(event.target.value as 'all' | ThemeMode)}><option value="all">{panel === 'live' ? '현재 화면 모드' : '라이트 + 다크'}</option><option value="light">라이트</option><option value="dark">다크</option></select></label>
      <span className="state-filter-note">글꼴·밀도·색상은 디자인 편집에서 조절</span>
    </div>
    {panel === 'states' ? <><p className="state-context-note comparison-page-context"><Info size={13} />표본은 각 상태의 모습으로 고정됩니다. 실제 반응은 ‘직접 조작’에서 확인하세요.</p><div className="state-scroll-hint"><ArrowLeftRight size={12} />좁은 화면에서는 표를 좌우로 스크롤할 수 있어요.</div><div className="state-mode-groups">{visibleModes.map((mode) => <StateMatrix key={mode} mode={mode} tokens={themes[mode]} components={visibleComponents} size={size} />)}</div><div className="state-rule-notes"><div><strong>포커스는 위치를 분명하게</strong><p>외곽 링으로 표시합니다. 실제 키보드 포커스도 별도로 유지돼요.</p></div><div><strong>오류는 색상과 설명을 함께</strong><p>입력은 확인 안내를, 행동은 재시도를 보여줍니다.</p></div><div><strong>로딩은 기다림을 알리기</strong><p>진행 표시와 함께 중복 조작을 막고, 비활성과 구분합니다.</p></div></div></> : null}
    {panel === 'colors' ? <><p className="state-context-note comparison-page-context"><Info size={13} />기준색을 바꾸면 안내 배경과 읽기 좋은 글자색이 함께 조정됩니다.</p><div className={`semantic-mode-groups ${visibleModes.length === 1 ? 'single-mode' : ''}`}>{visibleModes.map((mode) => <SemanticPalette key={mode} tokens={themes[mode]} mode={mode} variant={variant} />)}</div><p className="state-bottom-note">아이콘과 문장으로 의미를 함께 전달합니다. 글자 대비는 안내 배경을 기준으로 계산합니다.</p></> : null}
    {panel === 'live' ? <><p className="state-context-note comparison-page-context"><Info size={13} />빈 입력 → 오류 → 수정 → 로딩 → 성공까지. ‘저장 실패 재현’으로 재시도도 확인해 보세요.</p><LiveExample tokens={themes[liveMode]} mode={liveMode} /><p className="state-bottom-note">저장은 약 1초 동안 처리되는 예제입니다. 입력한 내용은 외부로 전송되지 않아요.</p></> : null}
  </div>
}
