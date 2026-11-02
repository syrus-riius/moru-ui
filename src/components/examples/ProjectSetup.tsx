import { useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, FolderPlus, RotateCcw } from 'lucide-react'
import { Button } from '../ui/button'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { NumberInput } from '../ui/number-input'
import { PasswordInput } from '../ui/password-input'
import { MultiSelect } from '../ui/multi-select'
import { FileInput } from '../ui/file-input'
import { RingProgress } from '../ui/ring-progress'
import { Stepper } from '../ui/stepper'
import { useExampleSession } from './ExampleSessionContext'
import './project-setup.css'

const areas = [{ value: 'design', label: '디자인' }, { value: 'engineering', label: '개발' }, { value: 'research', label: '리서치' }, { value: 'content', label: '콘텐츠' }]

export function ProjectSetup() {
  const id = useId()
  const { addProject, dispatch, setScene } = useExampleSession()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('새로운 아이디어')
  const [budget, setBudget] = useState<number | null>(300000)
  const [password, setPassword] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['design'])
  const [files, setFiles] = useState<File[]>([])
  const [attempted, setAttempted] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const budgetRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const selectionRef = useRef<HTMLDivElement>(null)
  const nameError = attempted && !name.trim()
  const budgetError = attempted && (budget === null || budget < 0)
  const passwordError = attempted && password.length < 8
  const areasError = attempted && !selectedAreas.length
  const completedFields = [Boolean(name.trim()), budget !== null && budget >= 0, password.length >= 8, selectedAreas.length > 0, files.length > 0].filter(Boolean).length

  function focusStep() { requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })) }
  function next() {
    setAttempted(true)
    if (step === 0) {
      if (!name.trim()) { nameRef.current?.focus(); return }
      if (budget === null || budget < 0) { budgetRef.current?.focus(); return }
    }
    if (step === 1) {
      if (password.length < 8) { passwordRef.current?.focus(); return }
      if (!selectedAreas.length) { selectionRef.current?.querySelector<HTMLInputElement>('input[role=combobox]')?.focus(); return }
    }
    setAttempted(false)
    if (step === 2) {
      const projectId = crypto.randomUUID()
      addProject({ id: projectId, name: name.trim(), description: `${selectedAreas.map((area) => areas.find((item) => item.value === area)?.label).join(' · ')} · 예산 ${new Intl.NumberFormat('ko-KR').format(budget ?? 0)}원 · 문서 ${files.length}개`, ownerId: 'me', status: 'planning', progress: 0, dueDate: null, priority: 'normal', favorite: false })
      setCreatedId(projectId)
      setPassword('')
      setFiles([])
    }
    setStep((current) => Math.min(3, current + 1)); focusStep()
  }
  function reset() { setStep(0); setName('새로운 아이디어'); setBudget(300000); setPassword(''); setSelectedAreas(['design']); setFiles([]); setAttempted(false); setCreatedId(null); setResetKey((value) => value + 1); focusStep() }

  return <section className="project-setup" aria-labelledby={`${id}-title`}>
    <header className="project-setup-header"><div><span className="project-setup-eyebrow">CREATE / COMPOSE</span><h2 ref={heading} tabIndex={-1} id={`${id}-title`}>{step === 3 ? '첫 번째 준비를 마쳤어요.' : '아이디어가 프로젝트가 되는 순간.'}</h2><p>필요한 정보를 차례로 정하고, 준비가 되면 팀의 프로젝트 목록에 추가하세요.</p></div><span className="project-setup-source">Moru 컴포넌트 6종 조합</span></header>
    <div className="project-setup-layout">
      <div className="project-setup-main">
        <Stepper value={step} onValueChange={(value) => { setStep(value); setAttempted(false); focusStep() }} allowStepSelect={step !== 3} aria-label="새 프로젝트 만들기 단계" items={[
          { id: 'basics', label: '기본 정보', description: '이름과 예산', error: step === 0 && (nameError || budgetError) },
          { id: 'access', label: '협업 준비', description: '분야와 문서', error: step === 1 && (passwordError || areasError) },
          { id: 'review', label: '최종 확인', description: '준비 내용 검토' },
        ]} completedContent={<div className="project-setup-success"><span><Check size={22} aria-hidden="true" /></span><h3>{name.trim()}</h3><p>이 브라우저의 예제 프로젝트 목록에 추가했어요. 접근키와 실제 파일은 프로젝트에 저장하지 않습니다.</p><Button onClick={() => { if (createdId) dispatch({ type: 'project/select', id: createdId }); setScene('projects') }}>프로젝트 목록으로<ArrowRight size={14} aria-hidden="true" /></Button></div>} />
        {step < 3 ? <form noValidate onSubmit={(event) => { event.preventDefault(); next() }}>
          <div className="project-setup-fields" hidden={step !== 0}>
            <Field label="프로젝트 이름" description="팀이 바로 알아볼 수 있는 이름을 지어 주세요." error={nameError ? '프로젝트 이름을 입력해 주세요.' : undefined}><Input ref={nameRef} value={name} maxLength={100} required autoComplete="off" onChange={(event) => setName(event.target.value)} /></Field>
            <Field label="예산" description="0원부터 1,000,000,000원까지. 비워 두면 다음 단계에서 안내합니다." error={budgetError ? '0원 이상의 예산을 입력해 주세요.' : undefined}><NumberInput ref={budgetRef} value={budget} onValueChange={setBudget} min={0} max={1000000000} step={10000} precision={0} locale="ko-KR" format={{ style: 'currency', currency: 'KRW' }} required /></Field>
          </div><div className="project-setup-fields" hidden={step !== 1}>
            <Field label="예제 접근키" description="보기·숨기기를 확인할 8자 이상의 예제 문구입니다. 실제 계정은 만들어지지 않습니다." error={passwordError ? '8자 이상의 예제 문구를 입력해 주세요.' : undefined}><PasswordInput ref={passwordRef} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="off" minLength={8} maxLength={128} required /></Field>
            <div ref={selectionRef}><Field label="프로젝트 분야" description="함께 작업할 분야를 1~3개 고르세요." error={areasError ? '프로젝트 분야를 하나 이상 선택해 주세요.' : undefined}><MultiSelect value={selectedAreas} onValueChange={setSelectedAreas} items={areas} maxSelected={3} required /></Field></div>
            <Field label="참고 문서 · 선택" description="PDF·텍스트·이미지, 파일당 5MB 이하 · 최대 3개. 파일은 서버에 전송하지 않습니다."><FileInput key={resetKey} multiple accept=".pdf,.txt,image/*" maxFiles={3} maxSize={5 * 1024 * 1024} onFilesChange={setFiles} /></Field>
          </div><div className="project-setup-review" hidden={step !== 2}><h3>이렇게 시작할게요.</h3><dl><div><dt>프로젝트</dt><dd>{name.trim()}</dd></div><div><dt>예산</dt><dd>{new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(budget ?? 0)}</dd></div><div><dt>분야</dt><dd>{selectedAreas.map((area) => areas.find((item) => item.value === area)?.label).join(' · ')}</dd></div><div><dt>접근키</dt><dd>입력 확인 · 프로젝트에는 저장하지 않음</dd></div><div><dt>참고 문서</dt><dd>{files.length ? files.map((file) => file.name).join(', ') : '선택한 문서 없음'}</dd></div></dl></div>
          <footer className="project-setup-actions"><Button type="button" variant="secondary" disabled={step === 0} onClick={() => { setStep((current) => Math.max(0, current - 1)); setAttempted(false); focusStep() }}><ArrowLeft size={14} aria-hidden="true" />이전</Button><Button type="submit">{step === 2 ? '예제 프로젝트 만들기' : '다음 단계'}{step === 2 ? <FolderPlus size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}</Button></footer>
        </form> : <Button variant="ghost" onClick={reset}><RotateCcw size={14} aria-hidden="true" />다른 프로젝트 준비하기</Button>}
      </div>
      <aside className="project-setup-aside" aria-label="프로젝트 준비 현황"><RingProgress label={step === 3 ? '프로젝트 준비 완료' : '프로젝트 준비'} value={step === 3 ? 100 : completedFields * 20} /><div><h3>한 번에 한 가지씩.</h3><p>입력은 작은 단계로 나누고, 완료 전에 내용을 다시 확인합니다. 문서는 선택 사항이라 첨부하지 않아도 시작할 수 있어요.</p></div><ul><li>Number Input · Password Input</li><li>Multi Select · File Input</li><li>Stepper · Ring Progress</li></ul></aside>
    </div>
  </section>
}
