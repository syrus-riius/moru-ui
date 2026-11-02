import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronRight, FolderKanban, HardDrive, LayoutDashboard, ListTodo, Moon, Plus, RotateCcw, Settings2, Sun, Trash2, X } from 'lucide-react'
import { MoruProvider } from '@/components/ui/moru/provider'
import { Button } from '@/components/ui/moru/button'
import { Field } from '@/components/ui/moru/field'
import { Input } from '@/components/ui/moru/input'
import { Textarea } from '@/components/ui/moru/textarea'
import { Select } from '@/components/ui/moru/select'
import { Dialog } from '@/components/ui/moru/dialog'
import { Badge } from '@/components/ui/moru/badge'
import { createDarkTokens, defaultTokens } from '@/components/ui/moru/_theme/tokens'
import { SearchFiltersBlock, type SearchFiltersValue } from '@/components/ui/moru/blocks/SearchFiltersBlock'
import { SettingsBlock } from '@/components/ui/moru/blocks/SettingsBlock'
import '@/components/ui/moru/styles.css'
import { createDemoProjectState, dateKey, ownerOptions, priorityOptions, projectProgress, projectStatusOptions, readProjectStore, removeProject, removeTask, restoreDeleted, saveProject, saveTask, taskIsOverdue, taskStatusOptions, toggleTask, writeProjectStore, type DeletedRecords, type DraftErrors, type Owner, type Project, type ProjectAppState, type ProjectDraft, type ProjectStatus, type Task, type TaskDraft, type TaskPriority, type TaskStatus } from './project-model'
import './project-template.css'

type View = 'overview' | 'projects' | 'tasks' | 'settings'
const emptyFilters: SearchFiltersValue = { query: '', status: 'all', mineOnly: false }
const blankProject: ProjectDraft = { name: '', summary: '', status: 'planned', owner: 'me', due: '' }
const blankTask: TaskDraft = { name: '', notes: '', projectId: '', status: 'todo', priority: 'medium', owner: 'me', due: '' }
const pages = [
  { id: 'overview', label: '오버뷰', icon: LayoutDashboard }, { id: 'projects', label: '프로젝트', icon: FolderKanban },
  { id: 'tasks', label: '할일', icon: ListTodo }, { id: 'settings', label: '설정', icon: Settings2 },
] as const
const pageCopy: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'WORKSPACE OVERVIEW', title: '좋은 하루의 시작, 한눈에.', description: '지금 중요한 일에 집중하고, 작은 성취를 쌓아가세요.' },
  projects: { eyebrow: 'YOUR PROJECTS', title: '아이디어가 완성되는 곳.', description: '프로젝트를 찾고, 상세 내용을 열어 다음 단계를 정하세요.' },
  tasks: { eyebrow: 'MAKE IT HAPPEN', title: '하나씩, 확실하게.', description: '해야 할 일을 모으고 우선순위에 따라 진행하세요.' },
  settings: { eyebrow: 'MAKE IT YOURS', title: '나에게 맞는 작업 공간.', description: '작업 공간의 기본 정보와 표시할 환경설정을 관리하세요.' },
}
function browserStorage() { try { return typeof window === 'undefined' ? undefined : window.localStorage } catch { return undefined } }
function dateLabel(value: string) {
  if (!value) return '마감일 없음'
  const [, month, day] = value.split('-')
  return `${Number(month)}월 ${Number(day)}일`
}
function labelOf(items: { value: string; label: string }[], value: string) { return items.find((item) => item.value === value)?.label ?? value }

/** A local, source-first project app. Replace storage/service adapters for a connected product. */
export function ProjectTasksApp({ onBack, embedded = false }: { onBack?: () => void; embedded?: boolean }) {
  const [boot] = useState(() => readProjectStore(browserStorage()))
  const [state, setState] = useState(boot.state)
  const [storageStatus, setStorageStatus] = useState<string>(boot.status)
  const [view, setView] = useState<View>('overview')
  const [projectFilters, setProjectFilters] = useState(emptyFilters)
  const [taskFilters, setTaskFilters] = useState(emptyFilters)
  const [editor, setEditor] = useState<{ kind: 'project' | 'task'; id?: string } | null>(null)
  const [projectDraft, setProjectDraft] = useState(blankProject)
  const [taskDraft, setTaskDraft] = useState(blankTask)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [undo, setUndo] = useState<DeletedRecords | null>(null)
  const [notice, setNotice] = useState('')
  const [resetOpen, setResetOpen] = useState(false)
  const [settingsKey, setSettingsKey] = useState(0)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const focusOrigin = useRef<HTMLElement | null>(null)
  const shouldFocusPage = useRef(false)
  const formId = useId()
  const Main = embedded ? 'div' : 'main'
  const tokens = useMemo(() => {
    const light = { ...defaultTokens, accent: '#3d42c9' }
    return state.mode === 'dark' ? createDarkTokens(light) : light
  }, [state.mode])
  useEffect(() => {
    if (shouldFocusPage.current) {
      headingRef.current?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'auto' })
      shouldFocusPage.current = false
    }
  }, [view])

  function navigate(next: View) { if (view !== next) { shouldFocusPage.current = true; setView(next) } }
  function rememberFocus() { focusOrigin.current = typeof document === 'undefined' ? null : document.activeElement as HTMLElement }
  function commit(next: ProjectAppState, message?: string, deleted?: DeletedRecords) {
    setState(next)
    const saved = writeProjectStore(browserStorage(), next)
    setStorageStatus(saved ? 'saved' : 'unavailable')
    if (message) {
      setUndo(deleted ?? null)
      setNotice(message + (saved ? '' : ' 저장 공간을 사용할 수 없어 이 탭에만 유지돼요.'))
    }
  }
  function openProject(project?: Project) {
    rememberFocus(); setErrors({}); setProjectDraft(project ? { ...project } : { ...blankProject }); setEditor({ kind: 'project', id: project?.id })
  }
  function openTask(task?: Task, projectId?: string) {
    rememberFocus(); setErrors({}); setTaskDraft(task ? { ...task } : { ...blankTask, projectId: projectId ?? state.projects[0]?.id ?? '' }); setEditor({ kind: 'task', id: task?.id })
  }
  function saveEditor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editor) return
    const result = editor.kind === 'project' ? saveProject(state, projectDraft, editor.id) : saveTask(state, taskDraft, editor.id)
    setErrors(result.errors)
    if (Object.keys(result.errors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    commit(result.state, `${editor.kind === 'project' ? '프로젝트' : '할일'}를 ${editor.id ? '수정' : '추가'}했어요.`)
    setEditor(null)
  }
  function deleteEditor() {
    if (!editor?.id) return
    const result = editor.kind === 'project' ? removeProject(state, editor.id) : removeTask(state, editor.id)
    const count = result.deleted.tasks.length
    commit(result.state, editor.kind === 'project' ? `프로젝트${count ? `와 연결된 할일 ${count}개` : ''}를 삭제했어요.` : '할일을 삭제했어요.', result.deleted)
    setEditor(null)
  }
  function completeTask(task: Task) { commit(toggleTask(state, task.id), task.status === 'done' ? '할일을 다시 열었어요.' : '할일을 완료했어요. 한 걸음 더 나아갔네요.') }

  const openTasks = state.tasks.filter((task) => task.status !== 'done')
  const completed = state.tasks.length - openTasks.length
  const percent = state.tasks.length ? Math.round(completed / state.tasks.length * 100) : 0
  const overdue = openTasks.filter((task) => taskIsOverdue(task)).length
  const upcoming = [...openTasks].sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 4)
  const activeProjects = state.projects.filter((project) => project.status !== 'done').slice(0, 4)
  const copy = pageCopy[view]
  const isProjectEditor = editor?.kind === 'project'
  const storageWarning = storageStatus === 'unavailable' ? '브라우저 저장 공간을 사용할 수 없어요. 변경은 이 탭에만 유지됩니다.'
    : storageStatus === 'corrupt' ? '저장 데이터를 읽지 못해 예제로 시작했어요. 변경을 저장하면 새 데이터로 대체됩니다.'
      : storageStatus === 'unsupported' ? '다른 버전의 저장 데이터가 있어 예제로 시작했어요. 변경을 저장하면 현재 형식으로 대체됩니다.' : ''

  return <MoruProvider mode={state.mode} tokens={tokens} className="pt-app">
    <a className="pt-skip" href="#pt-main" onClick={(event) => {
      if (!embedded) return
      event.preventDefault()
      headingRef.current?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'auto' })
    }}>본문으로 이동</a>
    <div className="pt-shell">
      <aside className="pt-sidebar" aria-label="작업 공간 탐색">
        <button type="button" className="pt-brand" onClick={() => navigate('overview')} aria-label="Moru Projects 오버뷰">
          <span className="pt-brand-mark"><svg width="27" height="27" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M5 19V7l9 8 9-8v12M3 23h22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></span><span>Moru<span className="pt-brand-suffix">Projects</span></span>
        </button>
        <div className="pt-workspace"><span className="pt-workspace-avatar">{state.workspace.name.trim().slice(0, 1)}</span><span><strong>{state.workspace.name}</strong><small>나의 작업 공간</small></span></div>
        <span className="pt-nav-label">WORKSPACE</span>
        <nav className="pt-navigation" aria-label="주요 메뉴">{pages.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} aria-hidden="true" /><span>{label}</span>{id === 'projects' || id === 'tasks' ? <small>{id === 'projects' ? state.projects.length : openTasks.length}</small> : null}</button>)}</nav>
        <div className="pt-sidebar-bottom">
          <div className="pt-storage-label"><HardDrive size={15} aria-hidden="true" /><span>{storageStatus === 'saved' || storageStatus === 'restored' ? '이 브라우저에 저장됨' : storageStatus === 'unavailable' ? '현재 탭에서만 사용' : '로컬 예제'}</span></div>
          <p>로그인 없이, 이 기기에서.<br />서버 동기화·알림 전송은 연결하지 않았어요.</p>
          <button type="button" className="pt-text-button" onClick={() => { rememberFocus(); setResetOpen(true) }}><RotateCcw size={13} aria-hidden="true" />예제 데이터 초기화</button>
          {onBack ? <button type="button" className="pt-text-button" onClick={onBack}><ArrowLeft size={13} aria-hidden="true" />Moru UI로 돌아가기</button> : null}
        </div>
      </aside>
      <div className="pt-workarea">
        <header className="pt-topbar"><span className="pt-breadcrumb"><span>{state.workspace.name}</span><ChevronRight size={13} aria-hidden="true" /><strong>{pages.find((page) => page.id === view)?.label}</strong></span><div className="pt-topbar-actions"><span className="pt-local-indicator">LOCAL WORKSPACE</span><Button size="sm" variant="ghost" aria-label={state.mode === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'} onClick={() => commit({ ...state, mode: state.mode === 'light' ? 'dark' : 'light' })}>{state.mode === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}</Button><span className="pt-profile" aria-label="현재 담당자: 나">M</span></div></header>
        <Main className="pt-main" id="pt-main" tabIndex={-1}>
          <div className="pt-page-heading"><div><span className="pt-eyebrow">{copy.eyebrow}</span><h1 ref={headingRef} tabIndex={-1}>{copy.title}</h1><p>{copy.description}</p></div>{view !== 'settings' ? <Button onClick={() => view === 'tasks' ? openTask() : openProject()}><Plus size={16} aria-hidden="true" />{view === 'tasks' ? '할일 만들기' : '프로젝트 만들기'}</Button> : null}</div>
          {storageWarning ? <div className="pt-storage-warning" role="status"><HardDrive size={17} aria-hidden="true" /><p>{storageWarning}</p>{storageStatus === 'unavailable' ? <Button size="sm" variant="secondary" onClick={() => commit(state, '저장 상태를 다시 확인했어요.')}>저장 다시 시도</Button> : null}</div> : null}

          {view === 'overview' ? <>
            <section className="pt-metrics" aria-label="작업 현황">
              {[{ label: '전체 프로젝트', value: state.projects.length, hint: `${state.projects.filter((project) => project.status === 'active').length}개 진행 중`, icon: FolderKanban }, { label: '남은 할일', value: openTasks.length, hint: '다음 성취를 기다리는 일', icon: ListTodo }, { label: '완료한 할일', value: completed, hint: `전체의 ${percent}% 완료`, icon: CheckCircle2 }, { label: '마감 지난 할일', value: overdue, hint: overdue ? '일정을 한 번 살펴보세요' : '차근차근, 잘 가고 있어요', icon: CalendarDays }].map(({ label, value, hint, icon: Icon }) => <article className="pt-metric" key={label}><div><span>{label}</span><Icon size={17} aria-hidden="true" /></div><strong>{String(value).padStart(2, '0')}</strong><small>{hint}</small></article>)}
            </section>
            <section className="pt-focus-card" aria-labelledby="pt-focus-title"><div><span className="pt-eyebrow">A LITTLE PROGRESS, EVERY DAY</span><h2 id="pt-focus-title">계획은 가볍게.<br />실행은 선명하게.</h2><p>작은 할일 하나가, 다음 프로젝트의 시작이 됩니다.</p><Button variant="secondary" onClick={() => { setTaskFilters({ query: '', status: 'all', mineOnly: true }); navigate('tasks') }}>내 할일 살펴보기<ArrowRight size={15} aria-hidden="true" /></Button></div><div className="pt-progress-display"><div className="pt-progress-ring" role="img" aria-label={`전체 할일 ${state.tasks.length}개 중 ${completed}개 완료, ${percent}%`} style={{ '--pt-progress': `${percent}%` } as CSSProperties}><div><strong>{percent}<span>%</span></strong><small>전체 완료율</small></div></div><span>{completed} of {state.tasks.length} tasks completed</span></div></section>
            <div className="pt-dashboard-grid"><section aria-labelledby="pt-active-title"><div className="pt-section-heading"><div><span className="pt-eyebrow">IN MOTION</span><h2 id="pt-active-title">진행 중인 프로젝트</h2></div><button type="button" className="pt-text-button" onClick={() => navigate('projects')}>전체 보기<ArrowUpRight size={14} aria-hidden="true" /></button></div><div className="pt-project-grid">{activeProjects.length ? activeProjects.map((project, index) => {
              const progress = projectProgress(state.tasks, project.id)
              return <article className="pt-project-card" key={project.id}><div className="pt-project-card-top"><span className="pt-project-number">{String(index + 1).padStart(2, '0')}</span><Badge variant="secondary">{labelOf(projectStatusOptions, project.status)}</Badge></div><button type="button" className="pt-project-name" onClick={() => openProject(project)}>{project.name}<ArrowUpRight size={16} aria-hidden="true" /></button><p>{project.summary || '프로젝트의 다음 단계를 적어보세요.'}</p><div className="pt-card-progress"><span>진행률</span><strong>{progress.percent}%</strong><div className="pt-progress-track" role="progressbar" aria-label={`${project.name} 할일 완료율`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}><span style={{ width: `${progress.percent}%` }} /></div></div><div className="pt-project-card-footer"><span><CalendarDays size={13} aria-hidden="true" />{dateLabel(project.due)}</span><button type="button" className="pt-text-button" onClick={() => openTask(undefined, project.id)} aria-label={`${project.name}에 할일 추가`}><Plus size={14} aria-hidden="true" />할일</button></div></article>
            }) : <div className="pt-empty"><FolderKanban size={28} aria-hidden="true" /><h3>다음 프로젝트를 시작해 볼까요?</h3><p>새 프로젝트를 만들면 이곳에서 진행 상황을 볼 수 있어요.</p><Button onClick={() => openProject()}>첫 프로젝트 만들기</Button></div>}</div></section>
              <section className="pt-upcoming" aria-labelledby="pt-upcoming-title"><div className="pt-section-heading"><div><span className="pt-eyebrow">NEXT UP</span><h2 id="pt-upcoming-title">이어서 할 일</h2></div><Button size="sm" variant="ghost" aria-label="할일 추가" onClick={() => openTask()}><Plus size={17} aria-hidden="true" /></Button></div>{upcoming.length ? <ul className="pt-task-list">{upcoming.map((task) => <li key={task.id}><button type="button" className="pt-completion-button" aria-label={`${task.name} 완료`} aria-pressed={false} onClick={() => completeTask(task)}><Check size={14} aria-hidden="true" /></button><div><button type="button" className="pt-task-name" onClick={() => openTask(task)}>{task.name}</button><span>{state.projects.find(({ id }) => id === task.projectId)?.name}</span><small data-overdue={taskIsOverdue(task) || undefined}>{task.due === dateKey(new Date()) ? '오늘 마감' : dateLabel(task.due)}</small></div><span className="pt-priority-dot" data-high={task.priority === 'high' || undefined} title={`우선순위 ${labelOf(priorityOptions, task.priority)}`} aria-label={`우선순위 ${labelOf(priorityOptions, task.priority)}`} /></li>)}</ul> : <div className="pt-empty pt-empty-small"><CheckCircle2 size={26} aria-hidden="true" /><h3>모든 할일을 마쳤어요.</h3><p>다음 아이디어가 떠오르면 새 할일을 추가하세요.</p></div>}<button type="button" className="pt-upcoming-all" onClick={() => navigate('tasks')}>전체 할일 보기<ArrowRight size={15} aria-hidden="true" /></button></section></div>
          </> : null}

          {view === 'projects' || view === 'tasks' ? <div className="pt-list-layout"><section className="pt-search-block" aria-label={view === 'projects' ? '프로젝트 검색과 목록' : '할일 검색과 목록'}>
            <SearchFiltersBlock key={view} title={view === 'projects' ? '모든 프로젝트' : '모든 할일'} description={view === 'projects' ? '선택을 누르면 프로젝트를 수정하고 진행 상황을 확인할 수 있어요.' : '선택을 눌러 내용을 수정하거나 상태를 완료로 바꾸세요.'} searchLabel={view === 'projects' ? '프로젝트 검색' : '할일 검색'} mineLabel={view === 'projects' ? '내가 담당한 프로젝트만' : '내가 담당한 할일만'} resultsLabel={view === 'projects' ? '프로젝트 검색 결과' : '할일 검색 결과'} emptyTitle={view === 'projects' ? '해당하는 프로젝트가 없어요' : '해당하는 할일이 없어요'} emptyDescription="검색어나 상태를 바꾸거나, 새 항목을 만들어 보세요." emptyActionLabel="필터 초기화" filters={view === 'projects' ? projectFilters : taskFilters} onFiltersChange={view === 'projects' ? setProjectFilters : setTaskFilters} statusOptions={view === 'projects' ? projectStatusOptions : taskStatusOptions} items={view === 'projects' ? state.projects.map((project) => ({ ...project, summary: `${project.summary}${project.summary ? ' · ' : ''}${projectProgress(state.tasks, project.id).completed}/${projectProgress(state.tasks, project.id).total}개 할일 완료 · ${dateLabel(project.due)}` })) : state.tasks.map((task) => ({ id: task.id, name: task.name, owner: task.owner, status: task.status, summary: `${state.projects.find(({ id }) => id === task.projectId)?.name ?? '프로젝트'} · ${dateLabel(task.due)} · 우선순위 ${labelOf(priorityOptions, task.priority)}` }))} onSelect={(id) => { if (view === 'projects') { const project = state.projects.find((item) => item.id === id); if (project) openProject(project) } else { const task = state.tasks.find((item) => item.id === id); if (task) openTask(task) } }} />
          </section><aside className="pt-context-panel"><span className="pt-context-icon">{view === 'projects' ? <FolderKanban size={23} aria-hidden="true" /> : <ListTodo size={23} aria-hidden="true" />}</span><span className="pt-eyebrow">ONE STEP AT A TIME</span><h2>{view === 'projects' ? '좋은 시작을 위한 작은 공간.' : '작게 나누면, 더 멀리 갑니다.'}</h2><p>{view === 'projects' ? '프로젝트에 할일을 더해보세요. 완료율은 연결된 할일을 기준으로 자동 계산됩니다.' : '할일의 프로젝트·담당자·마감일·우선순위를 바꿀 수 있어요. 완료한 일도 목록에 남습니다.'}</p><div className="pt-context-stat"><strong>{view === 'projects' ? state.projects.length : state.tasks.length}</strong><span>{view === 'projects' ? '개의 프로젝트' : '개의 할일'}</span></div><Button variant="secondary" onClick={() => view === 'projects' ? openProject() : openTask()}><Plus size={15} aria-hidden="true" />{view === 'projects' ? '프로젝트 추가' : '할일 추가'}</Button><small>삭제한 항목은 하단 알림에서 취소할 수 있어요.</small></aside></div> : null}

          {view === 'settings' ? <div className="pt-settings-layout"><div className="pt-settings-block"><SettingsBlock key={settingsKey} defaultValue={state.workspace} title="작업 공간 기본 정보" description="변경한 값은 설정 저장을 누르면 이 브라우저에 반영됩니다." onSave={(workspace) => { commit({ ...state, workspace }, '작업 공간 설정을 저장했어요.') }} /></div><aside className="pt-context-panel"><Settings2 size={24} aria-hidden="true" /><span className="pt-eyebrow">YOUR SPACE, YOUR PACE</span><h2>필요한 만큼,<br />나답게.</h2><p>여기에 입력한 정보는 현재 기기의 브라우저에 저장됩니다.</p><ul><li>이름을 바꾸면 작업 공간에 바로 반영돼요.</li><li>공개 범위와 알림은 환경설정 예제입니다. 실제 공유·이메일은 전송하지 않아요.</li><li>서버 저장이나 인증은 별도의 서비스와 연결하세요.</li></ul><Button variant="secondary" onClick={() => { rememberFocus(); setResetOpen(true) }}><RotateCcw size={14} aria-hidden="true" />예제 데이터 초기화</Button></aside></div> : null}
          <footer className="pt-footer"><span>Moru Projects <i />A solid foundation. Made yours.</span><small>로컬 앱 템플릿 · 브라우저 저장 · 서버 연결 없음</small></footer>
        </Main>
      </div>
    </div>
    <nav className="pt-mobile-navigation" aria-label="모바일 주요 메뉴">{pages.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={19} aria-hidden="true" /><span>{label}</span></button>)}</nav>
    {notice ? <div className="pt-notice" role="status"><CheckCircle2 size={17} aria-hidden="true" /><span>{notice}</span>{undo ? <Button size="sm" variant="secondary" onClick={() => { commit(restoreDeleted(state, undo), '마지막으로 삭제한 항목을 복원했어요.'); setUndo(null) }}>삭제 취소</Button> : null}<button type="button" className="pt-notice-close" aria-label="알림 닫기" onClick={() => setNotice('')}><X size={15} aria-hidden="true" /></button></div> : null}

    <Dialog open={!!editor} onOpenChange={(open) => { if (!open) setEditor(null) }} title={`${isProjectEditor ? '프로젝트' : '할일'} ${editor?.id ? '상세' : '만들기'}`} description={isProjectEditor ? '이름과 일정을 정하고 팀의 다음 단계를 준비하세요.' : '작은 실행을 위한 내용을 정리하세요.'} className="pt-editor" initialFocus={nameInputRef} finalFocus={() => focusOrigin.current?.isConnected ? focusOrigin.current : headingRef.current} footer={<><div className="pt-editor-footer">{editor?.id ? <Button variant="ghost" onClick={deleteEditor}><Trash2 size={15} aria-hidden="true" />삭제</Button> : <span /> }<div><Button variant="secondary" onClick={() => setEditor(null)}>취소</Button><Button type="submit" form={formId}>{editor?.id ? '변경 저장' : '만들기'}</Button></div></div></>}>
      <form id={formId} ref={formRef} className="pt-editor-form" noValidate onSubmit={saveEditor}>
        <Field label={isProjectEditor ? '프로젝트 이름' : '할일 이름'} error={errors.name}><Input ref={nameInputRef} name="itemName" required maxLength={isProjectEditor ? 80 : 120} value={isProjectEditor ? projectDraft.name : taskDraft.name} placeholder={isProjectEditor ? '어떤 프로젝트를 시작할까요?' : '다음에 할 일을 적어보세요'} onChange={(event) => { if (isProjectEditor) setProjectDraft({ ...projectDraft, name: event.target.value }); else setTaskDraft({ ...taskDraft, name: event.target.value }); setErrors((current) => ({ ...current, name: '' })) }} /></Field>
        {!isProjectEditor ? <Field label="프로젝트" error={errors.projectId} description={!state.projects.length ? '먼저 프로젝트를 만들어 주세요.' : undefined}><Select name="projectId" value={taskDraft.projectId} placeholder="프로젝트 선택" items={state.projects.map((project) => ({ value: project.id, label: project.name }))} onValueChange={(projectId) => { setTaskDraft({ ...taskDraft, projectId }); setErrors((current) => ({ ...current, projectId: '' })) }} /></Field> : null}
        <Field label={isProjectEditor ? '프로젝트 설명' : '메모'} error={isProjectEditor ? errors.summary : errors.notes}><Textarea name="description" rows={3} maxLength={isProjectEditor ? 300 : 4000} value={isProjectEditor ? projectDraft.summary : taskDraft.notes} placeholder="필요한 맥락이나 다음 단계를 남겨보세요." onChange={(event) => { if (isProjectEditor) setProjectDraft({ ...projectDraft, summary: event.target.value }); else setTaskDraft({ ...taskDraft, notes: event.target.value }) }} /></Field>
        <div className="pt-editor-row"><Field label="진행 상태" error={errors.status}><Select name="status" value={isProjectEditor ? projectDraft.status : taskDraft.status} items={isProjectEditor ? projectStatusOptions : taskStatusOptions} onValueChange={(status) => { if (isProjectEditor) setProjectDraft({ ...projectDraft, status: status as ProjectStatus }); else setTaskDraft({ ...taskDraft, status: status as TaskStatus }) }} /></Field><Field label="담당자" error={errors.owner}><Select name="owner" value={isProjectEditor ? projectDraft.owner : taskDraft.owner} items={ownerOptions} onValueChange={(owner) => { if (isProjectEditor) setProjectDraft({ ...projectDraft, owner: owner as Owner }); else setTaskDraft({ ...taskDraft, owner: owner as Owner }) }} /></Field></div>
        <div className="pt-editor-row"><Field label="마감일" error={errors.due}><Input name="due" type="date" value={isProjectEditor ? projectDraft.due : taskDraft.due} onChange={(event) => { if (isProjectEditor) setProjectDraft({ ...projectDraft, due: event.target.value }); else setTaskDraft({ ...taskDraft, due: event.target.value }); setErrors((current) => ({ ...current, due: '' })) }} /></Field>{!isProjectEditor ? <Field label="우선순위" error={errors.priority}><Select name="priority" value={taskDraft.priority} items={priorityOptions} onValueChange={(priority) => setTaskDraft({ ...taskDraft, priority: priority as TaskPriority })} /></Field> : null}</div>
        {errors.limit ? <p role="alert" className="pt-form-error">{errors.limit}</p> : null}
        {editor?.id && isProjectEditor ? <p className="pt-editor-hint">연결된 할일 {projectProgress(state.tasks, editor.id).total}개 · 프로젝트를 삭제하면 연결된 할일도 함께 삭제되며, 하단 알림에서 되돌릴 수 있습니다.</p> : null}
      </form>
    </Dialog>
    <Dialog open={resetOpen} onOpenChange={setResetOpen} title="예제 데이터로 초기화할까요?" description="이 브라우저의 프로젝트·할일·작업 공간 설정을 처음 예제로 바꿉니다. 현재 데이터로 되돌릴 수 없어요." finalFocus={() => focusOrigin.current?.isConnected ? focusOrigin.current : headingRef.current} footer={<><Button variant="secondary" onClick={() => setResetOpen(false)}>취소</Button><Button variant="danger" onClick={() => { const demo = createDemoProjectState(); commit({ ...demo, mode: state.mode }, '예제 데이터를 새로 준비했어요.'); setUndo(null); setProjectFilters(emptyFilters); setTaskFilters(emptyFilters); setSettingsKey((key) => key + 1); setResetOpen(false) }}>예제 데이터로 초기화</Button></>}><p className="pt-reset-description">실제 서버나 다른 기기의 데이터에는 영향을 주지 않습니다.</p></Dialog>
  </MoruProvider>
}
