import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Check, ClipboardCheck, FolderPlus, GitBranch, PackageCheck, Play, RotateCcw, ShieldCheck, Square, Terminal } from 'lucide-react'
import { useWorkspaceMembers } from '../WorkspaceMembersContext'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ButtonGroup } from '../ui/button-group'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { CodeBlock } from '../ui/code-block'
import { Collapsible } from '../ui/collapsible'
import { Drawer } from '../ui/drawer'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '../ui/input-group'
import { InputOTP } from '../ui/input-otp'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '../ui/item'
import { Kbd } from '../ui/kbd'
import { Label } from '../ui/label'
import { NativeSelect } from '../ui/native-select'
import { Questionnaire, type QuestionnaireAnswers, type QuestionnaireQuestion } from '../ui/questionnaire'
import { Spinner } from '../ui/spinner'
import { Trace, type TraceStep } from '../ui/trace'
import { useToast } from '../ui/toast'
import { useExampleSession } from './ExampleSessionContext'
import type { ExampleProject, ExampleRelease } from './example-session-state'
import './release-workspace.css'

const readinessItems = [
  { value: 'content', label: '내용과 사용 가이드 확인', description: '릴리스에 포함할 변경 내용과 문서를 확인했습니다.' },
  { value: 'keyboard', label: '키보드 흐름 확인', description: '이동, 선택, 닫기와 포커스 순서를 확인했습니다.' },
  { value: 'responsive', label: '모바일·다크 모드 확인', description: '좁은 화면과 두 가지 테마의 가독성을 확인했습니다.' },
]
const channels = [
  { value: 'preview', label: 'Preview · 내부 검토' },
  { value: 'beta', label: 'Beta · 사전 공개' },
  { value: 'stable', label: 'Stable · 정식 공개' },
]
const stageTitles = ['프로젝트와 버전 확인', '예제 확인 코드 검증', '릴리스 준비 목록 확인']
// SemVer 2.0.0 syntax: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const releaseVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

export function validateReleaseStage(release: ExampleRelease, projectExists: boolean, stage: number): string | undefined {
  if (stage === 0) {
    if (!projectExists) return '점검할 프로젝트를 선택해 주세요.'
    if (!releaseVersionPattern.test(release.version.trim())) return '버전을 0.4.0 또는 1.0.0-beta.1 형식으로 입력해 주세요.'
    if (!channels.some((channel) => channel.value === release.channel)) return '공개 채널을 선택해 주세요.'
  }
  if (stage === 1 && (!release.verified || release.otp !== '123456')) return '예제 확인 코드 123456을 입력하고 코드 확인을 눌러 주세요.'
  if (stage === 2) {
    const missing = readinessItems.filter((item) => !release.readiness.includes(item.value))
    if (missing.length) return `준비 목록에서 ${missing.map((item) => `‘${item.label}’`).join(', ')} 항목을 확인해 주세요.`
  }
  return undefined
}

function stageDetails(release: ExampleRelease, project: ExampleProject | undefined, index: number) {
  if (index === 0) return `${project?.name ?? '프로젝트 미선택'} · v${release.version.trim() || '버전 미입력'} · ${channels.find((channel) => channel.value === release.channel)?.label ?? '채널 미선택'}`
  if (index === 1) return release.verified ? '예제 코드가 일치합니다. 외부 인증 서비스에 연결하지 않습니다.' : '화면에 안내된 예제 코드를 직접 확인합니다.'
  return `${readinessItems.filter((item) => release.readiness.includes(item.value)).length} / ${readinessItems.length} 준비 항목 확인`
}

export function ReleaseWorkspace() {
  const id = useId()
  const { state, updateRelease, updateWizardAnswers, addProject, updateProject, setScene } = useExampleSession()
  const { members } = useWorkspaceMembers()
  const { toast } = useToast()
  const { release } = state
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardKey, setWizardKey] = useState(0)
  const [otpError, setOtpError] = useState('')
  const [logOpen, setLogOpen] = useState(false)
  const [manifestOpen, setManifestOpen] = useState(false)
  const [expandedTrace, setExpandedTrace] = useState<string[]>([])
  const otpInput = useRef<HTMLInputElement>(null)
  const project = state.projects.find((item) => item.id === release.projectId)
  const running = release.traceStatus === 'running'
  const complete = release.traceStatus === 'success'

  useEffect(() => {
    if (release.traceStatus !== 'running') return
    const step = Math.max(0, Math.min(stageTitles.length - 1, release.traceStep))
    const timer = setTimeout(() => {
      const issue = validateReleaseStage(release, Boolean(project), step)
      if (issue) {
        updateRelease({ traceStatus: 'error', traceStep: step, error: issue, report: `[LOCAL CHECK]\n${stageTitles.slice(0, step).map((title) => `✓ ${title}`).join('\n')}${step ? '\n' : ''}✕ ${stageTitles[step]}\n${issue}\n\n외부 배포나 인증 요청은 실행하지 않았습니다.` })
        return
      }
      if (step < stageTitles.length - 1) {
        updateRelease({ traceStep: step + 1 })
        return
      }
      if (project && project.status !== 'done') updateProject(project.id, { status: 'review' })
      updateRelease({ traceStatus: 'success', traceStep: stageTitles.length, error: '', report: `[LOCAL CHECK]\n${stageTitles.map((title) => `✓ ${title}`).join('\n')}\n\n프로젝트: ${project?.name ?? ''}\n버전: ${release.version.trim()}\n공개 채널: ${release.channel}\n결과: 로컬 준비 점검 통과\n\n${project?.status === 'done' ? '이미 완료된 프로젝트의 준비 상태를 다시 확인했습니다.' : '프로젝트가 검토 상태로 이동했습니다.'}\n실제 배포·이메일 전송·외부 인증은 실행하지 않았습니다.` })
      toast({ title: '릴리스 준비 점검을 통과했어요.', description: project?.status === 'done' ? '완료된 프로젝트의 준비 상태를 다시 확인했습니다.' : '프로젝트 목록에서도 검토 상태를 확인할 수 있어요.', tone: 'success' })
    }, 450)
    return () => clearTimeout(timer)
  }, [release, project, updateRelease, updateProject, toast])

  const questions: QuestionnaireQuestion[] = [
    { id: 'name', title: '어떤 프로젝트를 시작할까요?', description: '생성한 프로젝트는 프로젝트 목록과 릴리스 설정에서 함께 사용할 수 있어요.', type: 'text', required: true, placeholder: '예: 제품 소개 페이지', validate: (answer) => typeof answer === 'string' && answer.trim().length > 80 ? '프로젝트 이름을 80자 이내로 적어 주세요.' : undefined },
    { id: 'goal', title: '이번 프로젝트의 목표는 무엇인가요?', type: 'single', required: true, options: [{ value: 'product', label: '새로운 제품 만들기' }, { value: 'improve', label: '기존 경험 다듬기' }, { value: 'guide', label: '문서와 가이드 정리하기' }] },
    { id: 'owner', title: '함께 시작할 담당자를 선택해 주세요.', type: 'single', required: true, options: [{ value: 'unassigned', label: '담당자는 나중에 정할게요.' }, ...members.map((member) => ({ value: member.id, label: member.name, description: member.email }))] },
  ]

  function createProject(answers: QuestionnaireAnswers) {
    const name = typeof answers.name === 'string' ? answers.name.trim() : ''
    if (!name) throw new Error('프로젝트 이름을 입력해 주세요.')
    const ownerId = typeof answers.owner === 'string' && members.some((member) => member.id === answers.owner) ? answers.owner : null
    const goal = answers.goal === 'product' ? '새로운 제품 만들기' : answers.goal === 'guide' ? '문서와 가이드 정리하기' : '기존 경험 다듬기'
    const next: ExampleProject = { id: crypto.randomUUID(), name, description: goal, ownerId, status: 'planning', progress: 0, dueDate: null, priority: 'normal', favorite: false }
    addProject(next)
    updateRelease({ projectId: next.id, traceStatus: 'idle', traceStep: 0, error: '', report: '' })
    updateWizardAnswers({})
    setWizardOpen(false)
    setWizardKey((current) => current + 1)
    toast({ title: '새 프로젝트를 만들었어요.', description: `${name} 프로젝트를 목록에 추가했습니다.`, tone: 'success', action: { label: '목록 보기', onClick: () => setScene('projects') } })
  }

  function verifyCode() {
    if (release.otp !== '123456') {
      updateRelease({ verified: false })
      setOtpError('예제 코드 123456과 일치하지 않아요. 다시 입력해 주세요.')
      otpInput.current?.focus()
      return
    }
    updateRelease({ verified: true })
    setOtpError('')
  }

  function runCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (running) return
    setLogOpen(false)
    setExpandedTrace([])
    updateRelease({ version: release.version.trim(), traceStatus: 'running', traceStep: 0, error: '', report: '' })
  }

  const traceItems: TraceStep[] = stageTitles.map((title, index) => {
    const status = complete || index < release.traceStep ? 'complete' : index === release.traceStep && running ? 'running' : index === release.traceStep && release.traceStatus === 'error' ? 'error' : 'pending'
    return { id: `release-step-${index}`, title, description: stageDetails(release, project, index), status, ...(index < release.traceStep || complete ? { durationMs: 450 } : {}), details: <p className="release-workspace-caption">{index === release.traceStep && release.error ? release.error : index === 0 ? '프로젝트 존재 여부와 버전 형식, 공개 채널을 확인합니다.' : index === 1 ? '123456은 이 화면의 동작을 살펴보기 위한 공개된 예제 코드입니다.' : '체크한 준비 항목만 점검에 반영됩니다. 항목을 해제하면 다시 확인이 필요합니다.'}</p> }
  })
  const manifest = JSON.stringify({ project: project?.name ?? null, version: release.version, channel: release.channel, notes: release.notes, readiness: readinessItems.filter((item) => release.readiness.includes(item.value)).map((item) => item.label), localOnly: true }, null, 2)

  return <section className="release-workspace" aria-labelledby={`${id}-title`}>
    <header className="release-workspace-heading">
      <div><span className="release-workspace-eyebrow">READY TO SHAPE</span><h2 id={`${id}-title`}>작은 확인을 거쳐, 다음 릴리스로</h2><p>프로젝트를 시작하고 공개 설정과 준비 항목을 한 흐름으로 확인해 보세요.</p></div>
      <Button variant="secondary" type="button" onClick={() => setWizardOpen(true)} disabled={running}><FolderPlus size={15} aria-hidden="true" />새 프로젝트 시작</Button>
    </header>

    <form onSubmit={runCheck} noValidate className="release-workspace-grid" aria-label="릴리스 준비 설정">
      <Card className="release-workspace-card">
        <header className="release-workspace-card-heading"><div><h3>릴리스 설정</h3><p>공개할 프로젝트와 변경 내용을 정리합니다.</p></div><Badge variant="outline">이 브라우저의 예제</Badge></header>
        <div className="release-workspace-fields">
          <div className="release-workspace-field"><Label htmlFor={`${id}-project`}>프로젝트</Label><NativeSelect id={`${id}-project`} value={project?.id ?? ''} disabled={running} onValueChange={(projectId) => updateRelease({ projectId: projectId || null })} items={[{ value: '', label: '프로젝트를 선택해 주세요.' }, ...state.projects.map((item) => ({ value: item.id, label: item.name }))]} /></div>
          {project ? <Item variant="muted" className="release-workspace-project-item"><ItemMedia><PackageCheck size={20} aria-hidden="true" /></ItemMedia><ItemContent><ItemTitle>{project.name}</ItemTitle><ItemDescription>{members.find((member) => member.id === project.ownerId)?.name ?? '담당자 미정'} · {project.description || '프로젝트 설명 미작성'}</ItemDescription></ItemContent><ItemActions><Button size="sm" variant="ghost" type="button" disabled={running} onClick={() => setScene('projects')} aria-label={`${project.name} 프로젝트 목록에서 보기`}><ArrowRight size={15} aria-hidden="true" />목록</Button></ItemActions></Item> : null}
          <div className="release-workspace-field"><Label htmlFor={`${id}-version`}>버전</Label><InputGroup><InputGroupAddon>v</InputGroupAddon><InputGroupInput id={`${id}-version`} name="releaseVersion" value={release.version} onValueChange={(version) => updateRelease({ version })} disabled={running} maxLength={48} placeholder="0.4.0" autoComplete="off" aria-describedby={`${id}-version-hint`} /></InputGroup><p id={`${id}-version-hint`} className="release-workspace-caption">0.4.0 또는 1.0.0-beta.1 형식으로 적어 주세요.</p></div>
          <div className="release-workspace-field"><Label htmlFor={`${id}-channel`}>공개 채널</Label><NativeSelect id={`${id}-channel`} value={release.channel} items={channels} onValueChange={(channel) => updateRelease({ channel })} disabled={running} /></div>
          <div className="release-workspace-field"><Label htmlFor={`${id}-notes`}>릴리스 노트</Label><InputGroup><InputGroupTextarea id={`${id}-notes`} name="releaseNotes" value={release.notes} onChange={(event) => updateRelease({ notes: event.target.value })} maxLength={500} rows={4} disabled={running} placeholder="이번 릴리스에서 달라진 내용을 적어 주세요." aria-describedby={`${id}-notes-count`} /><InputGroupAddon align="block-end"><GitBranch size={14} aria-hidden="true" /><span id={`${id}-notes-count`}>{release.notes.length} / 500자</span></InputGroupAddon></InputGroup></div>
        </div>
        <Collapsible title="설정 JSON 미리보기" open={manifestOpen} onOpenChange={setManifestOpen}><CodeBlock value={manifest} language="json" filename="release-preview.json" defaultWrap size="sm" onCopy={() => toast({ title: '릴리스 설정을 복사했어요.' })} /></Collapsible>
      </Card>

      <Card className="release-workspace-card">
        <header className="release-workspace-card-heading"><div><h3>릴리스 준비 점검</h3><p>확인한 내용으로 로컬 점검을 실행합니다.</p></div><Badge variant="secondary" tone={complete ? 'success' : release.traceStatus === 'error' ? 'danger' : 'info'}>{complete ? '점검 통과' : running ? '점검 중' : release.traceStatus === 'error' ? '확인 필요' : '준비 중'}</Badge></header>
        <fieldset className="release-workspace-checks" disabled={running}><legend>마지막으로 확인할 것들</legend>{readinessItems.map((item) => <Checkbox key={item.value} label={item.label} description={item.description} checked={release.readiness.includes(item.value)} disabled={running} onCheckedChange={(checked) => updateRelease({ readiness: checked ? [...release.readiness, item.value] : release.readiness.filter((value) => value !== item.value) })} />)}</fieldset>
        <div className="release-workspace-auth"><div className="release-workspace-auth-heading"><ShieldCheck size={17} aria-hidden="true" /><strong id={`${id}-otp-label`}>예제 확인 코드</strong>{release.verified ? <Badge tone="success" variant="secondary"><Check size={12} aria-hidden="true" />확인 완료</Badge> : null}</div><p id={`${id}-otp-hint`} className="release-workspace-caption">공개된 예제 코드 <code>123456</code>을 입력해 주세요. 실제 본인 인증은 진행하지 않습니다.</p><div className="release-workspace-auth-row"><InputOTP ref={otpInput} value={release.otp} length={6} onValueChange={(otp) => { updateRelease({ otp }); setOtpError('') }} aria-labelledby={`${id}-otp-label`} aria-describedby={`${id}-otp-hint${otpError ? ` ${id}-otp-error` : ''}`} aria-invalid={Boolean(otpError)} disabled={running} /><Button variant="secondary" type="button" onClick={verifyCode} disabled={running || release.verified}>코드 확인</Button></div>{otpError ? <p id={`${id}-otp-error`} className="release-workspace-error" role="alert">{otpError}</p> : null}</div>
        <div className="release-workspace-actions"><ButtonGroup aria-label="릴리스 점검 실행"><Button type="submit" disabled={running}><Play size={14} aria-hidden="true" />{complete || release.traceStatus === 'error' ? '다시 점검' : '로컬 점검 실행'}</Button>{running ? <Button variant="secondary" type="button" onClick={() => updateRelease({ traceStatus: 'idle', traceStep: 0, error: '', report: '' })}><Square size={13} aria-hidden="true" />점검 중단</Button> : <Button variant="secondary" type="button" onClick={() => { updateRelease({ traceStatus: 'idle', traceStep: 0, error: '', report: '' }); setLogOpen(false) }} disabled={release.traceStatus === 'idle'}><RotateCcw size={14} aria-hidden="true" />결과 지우기</Button>}</ButtonGroup><p className="release-workspace-caption">버전 입력 중 <Kbd>Enter</Kbd>를 눌러 점검을 시작할 수 있어요.</p></div>
        <div className="release-workspace-check-result" aria-busy={running || undefined}>
          {running ? <><p className="release-workspace-running release-workspace-caption"><Spinner label="릴리스 준비 점검 중" />{stageTitles[release.traceStep] ?? '결과 정리 중'}…</p><p className="release-workspace-caption">다른 화면으로 이동하면 잠시 멈추고, 돌아오면 이어서 점검합니다.</p></> : null}
          <Trace items={traceItems} expanded={expandedTrace} onExpandedChange={setExpandedTrace} aria-label="릴리스 점검 단계" />
          {release.error ? <Alert tone="danger" title="확인이 필요한 항목이 있어요.">{release.error} 내용을 수정하고 다시 점검해 주세요.</Alert> : complete ? <Alert tone="success" title="로컬 준비 점검을 통과했어요.">{project?.status === 'done' ? '완료된 프로젝트의 준비 상태를 다시 확인했어요.' : '프로젝트가 검토 상태로 이동했어요.'} 실제 배포나 외부 인증은 실행하지 않았습니다.</Alert> : <p className="release-workspace-caption"><ClipboardCheck size={14} aria-hidden="true" /> 확인하지 않은 항목은 점검 결과에서 이유를 안내합니다.</p>}
          {release.report ? <Collapsible title={<span><Terminal size={14} aria-hidden="true" /> 점검 기록 보기</span>} open={logOpen} onOpenChange={setLogOpen}><CodeBlock value={release.report} language="text" filename="local-check.log" defaultWrap size="sm" /></Collapsible> : null}
        </div>
      </Card>
    </form>

    <Drawer open={wizardOpen} onOpenChange={setWizardOpen} title="새 프로젝트 시작" description="세 가지 질문으로 프로젝트의 출발점을 정해 보세요." className="release-workspace-wizard">
      <div className="release-workspace-wizard-body"><Alert title="프로젝트 목록에 함께 반영됩니다." tone="info">답변을 마치면 새 프로젝트가 생성되고 릴리스 점검 대상으로 선택됩니다.</Alert><Questionnaire key={wizardKey} questions={questions} value={state.wizardAnswers} onValueChange={updateWizardAnswers} onComplete={createProject} submitLabel="프로젝트 만들기" aria-label="새 프로젝트 시작 질문" /></div>
    </Drawer>
  </section>
}
