import { lazy, Suspense, useState, type ReactNode } from 'react'
import { CalendarDays, FolderKanban, FolderPlus, MessageSquare, Rocket, Settings2 } from 'lucide-react'
import { MoruLogo } from '../brand'
import { useWorkspaceMembers } from '../WorkspaceMembersContext'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Breadcrumb } from '../ui/breadcrumb'
import { Sidebar } from '../ui/sidebar'
import { ExamplesHub } from './ExamplesHub'
import type { BlockId } from '../blocks/block-catalog'
import { Button } from '../ui/button'
import { useExampleSession } from './ExampleSessionContext'
import type { ExampleScene } from './example-session-state'
import './examples-page.css'

const ProjectOperations = lazy(() => import('./ProjectOperations').then((module) => ({ default: module.ProjectOperations })))
const TeamConversation = lazy(() => import('./TeamConversation').then((module) => ({ default: module.TeamConversation })))
const ReleaseWorkspace = lazy(() => import('./ReleaseWorkspace').then((module) => ({ default: module.ReleaseWorkspace })))
const ProjectSetup = lazy(() => import('./ProjectSetup').then((module) => ({ default: module.ProjectSetup })))
const SchedulePlanner = lazy(() => import('./SchedulePlanner').then((module) => ({ default: module.SchedulePlanner })))
const sceneLabels: Record<ExampleScene, string> = { projects: '프로젝트 운영', conversation: '팀 대화', release: '릴리스 준비', settings: '공간 설정', setup: '프로젝트 시작', schedule: '일정 계획' }
const scenes = new Set<string>(Object.keys(sceneLabels))

export function ExamplesPage({ workspace, name, standalone = false, onBlocks }: { workspace: ReactNode; name: string; standalone?: boolean; onBlocks?: (id?: BlockId) => void }) {
  const [showWorkspace, setShowWorkspace] = useState(!standalone)
  const [workspaceOpened, setWorkspaceOpened] = useState(!standalone)
  const { state, setScene } = useExampleSession()
  const { members } = useWorkspaceMembers()
  const [collapsed, setCollapsed] = useState(() => !standalone)
  const [setupOpened, setSetupOpened] = useState(() => state.scene === 'setup')
  const [scheduleOpened, setScheduleOpened] = useState(() => state.scene === 'schedule')
  function changeWorkspace(next: boolean) {
    if (next) setWorkspaceOpened(true)
    setShowWorkspace(next)
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }
  return <>
    {!showWorkspace ? <ExamplesHub onWorkspace={() => changeWorkspace(true)} onBlocks={onBlocks} /> : null}
    {workspaceOpened ? <div hidden={!showWorkspace} className="examples-workspace-view">
    {standalone ? <nav className="examples-workspace-return" aria-label="예제 허브 이동"><Button variant="ghost" size="sm" onClick={() => changeWorkspace(false)}>← 예제 허브로</Button>{onBlocks ? <Button variant="secondary" size="sm" onClick={() => onBlocks()}>블록·패턴 살펴보기</Button> : null}</nav> : null}
    {standalone ? <h1 className="sr-only">Moru 작업 공간 예제</h1> : <header className="catalog-intro">
      <span className="eyebrow">MORU UI / EXAMPLES</span>
      <h1>기본이 모여, <span className="brand-title-tail">하나의 화면으로.</span></h1>
      <p>프로젝트를 다듬고, 팀과 대화하고, 다음 릴리스를 준비해 보세요. 작은 컴포넌트가 실제 작업 흐름으로 이어집니다.</p>
      <div className="catalog-meta"><span>ONE WORKSPACE / SIX FLOWS</span><span>시작 · 프로젝트 · 일정 · 대화 · 릴리스 · 공간 설정</span></div>
    </header>}
    <section className={`examples-hub${standalone ? ' examples-hub-standalone' : ''}`} aria-label="Moru 작업 공간 예제">
      <header className="examples-hub-topbar">
        <div className="examples-hub-identity"><MoruLogo /><span className="examples-hub-name">{name || 'Moru Studio'}</span><Badge variant="outline">팀 공간</Badge></div>
        <div className="examples-hub-people" role="group" aria-label={`함께하는 팀원 ${members.length}명`}>{members.slice(0, 3).map((member) => <Avatar key={member.id} alt={member.name} fallback={member.name.slice(0, 1)} size="sm" />)}<span>{members.length}명</span></div>
      </header>
      <div className="examples-hub-layout">
        <div className="examples-hub-navigation"><Sidebar title={name || 'Moru Studio'} aria-label="예제 작업 공간 탐색" size="sm" collapsed={collapsed} onCollapsedChange={setCollapsed} value={state.scene} onValueChange={(value) => { if (scenes.has(value)) { if (value === 'setup') setSetupOpened(true); if (value === 'schedule') setScheduleOpened(true); setScene(value as ExampleScene) } }} items={[
          { id: 'setup', label: sceneLabels.setup, icon: <FolderPlus /> },
          { id: 'projects', label: sceneLabels.projects, icon: <FolderKanban />, badge: state.projects.length },
          { id: 'schedule', label: sceneLabels.schedule, icon: <CalendarDays /> },
          { id: 'conversation', label: sceneLabels.conversation, icon: <MessageSquare />, badge: state.conversation.messages.length },
          { id: 'release', label: sceneLabels.release, icon: <Rocket />, badge: state.release.traceStatus === 'success' ? '완료' : undefined },
          { id: 'settings', label: sceneLabels.settings, icon: <Settings2 /> },
        ]} footer="직접 다듬고, 함께 완성해요." /></div>
        <div className="examples-hub-content">
          <Breadcrumb aria-label="예제 안의 현재 위치" size="sm" items={[{ label: name || 'Moru Studio', onClick: () => setScene('projects') }, { label: sceneLabels[state.scene] }]} />
          <div className={`examples-hub-scene examples-hub-scene-${state.scene}`}>
            <Suspense fallback={<p className="examples-hub-loading" role="status">작업 공간을 준비하고 있어요.</p>}>
              {state.scene === 'setup' || state.scene === 'schedule' ? null : state.scene === 'projects' ? <ProjectOperations /> : state.scene === 'conversation' ? <TeamConversation /> : state.scene === 'release' ? <ReleaseWorkspace /> : workspace}
              {setupOpened ? <div hidden={state.scene !== 'setup'}><ProjectSetup /></div> : null}
              {scheduleOpened ? <div hidden={state.scene !== 'schedule'}><SchedulePlanner /></div> : null}
            </Suspense>
          </div>
        </div>
      </div>
    </section>
    {!standalone ? <p className="examples-hub-note">프로젝트와 대화, 준비한 설정은 화면을 오가도 유지됩니다. 새로고침하면 예제의 처음 상태로 돌아갑니다.</p> : null}
    </div> : null}
  </>
}
