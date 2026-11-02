import type { QuestionnaireAnswers } from '../ui/questionnaire'
import { addCalendarDays, calendarDateKey } from '../ui/calendar-utils'

export type ExampleScene = 'projects' | 'conversation' | 'release' | 'settings' | 'setup' | 'schedule'
export type ProjectStatus = 'planning' | 'active' | 'review' | 'done'
export interface ExampleProject {
  id: string
  name: string
  description: string
  ownerId: string | null
  status: ProjectStatus
  progress: number
  dueDate: string | null
  priority: 'low' | 'normal' | 'high'
  favorite: boolean
}
export interface ExampleFile { id: string; name: string; size: number; type?: string }
export interface ConversationMessage {
  id: string
  authorId: string
  authorName: string
  text: string
  time: string
  files: ExampleFile[]
  liked: boolean
  pinned: boolean
  code?: { value: string; language: string; filename?: string }
}
export interface ExampleConversation {
  messages: ConversationMessage[]
  draft: string
  pendingFiles: ExampleFile[]
  activeTab: 'conversation' | 'files'
  direction: 'ltr' | 'rtl'
}
export interface ExampleRelease {
  projectId: string | null
  version: string
  channel: string
  notes: string
  otp: string
  verified: boolean
  readiness: string[]
  traceStatus: 'idle' | 'running' | 'success' | 'error'
  traceStep: number
  report: string
  error: string
}
export interface ExampleSessionState {
  scene: ExampleScene
  projects: ExampleProject[]
  selectedProjectId: string | null
  projectView: 'table' | 'cards'
  conversation: ExampleConversation
  release: ExampleRelease
  wizardAnswers: QuestionnaireAnswers
}
export type ExampleSessionAction =
  | { type: 'scene/set'; scene: ExampleScene }
  | { type: 'project/select'; id: string | null }
  | { type: 'project/view'; view: 'table' | 'cards' }
  | { type: 'project/add'; project: ExampleProject }
  | { type: 'project/update'; id: string; patch: Partial<Omit<ExampleProject, 'id'>> }
  | { type: 'project/duplicate'; id: string; newId: string }
  | { type: 'project/remove'; id: string }
  | { type: 'project/restore'; project: ExampleProject; index: number }
  | { type: 'conversation/patch'; patch: Partial<Omit<ExampleConversation, 'messages'>> }
  | { type: 'conversation/send'; message: ConversationMessage }
  | { type: 'conversation/react'; id: string }
  | { type: 'conversation/pin'; id: string }
  | { type: 'release/patch'; patch: Partial<ExampleRelease> }
  | { type: 'wizard/answers'; answers: QuestionnaireAnswers }

export function createExampleSession(now = new Date()): ExampleSessionState {
  const due = (days: number) => calendarDateKey(addCalendarDays(now, days)) ?? null
  return {
    scene: 'projects', selectedProjectId: 'library', projectView: 'table',
    projects: [
      { id: 'library', name: 'Moru UI 첫 번째 릴리스', description: '직접 다듬고 오래 쓸 수 있는 기본 컴포넌트를 준비합니다.', ownerId: 'minji', status: 'active', progress: 76, dueDate: due(7), priority: 'high', favorite: true },
      { id: 'brand', name: '브랜드 리뉴얼', description: '브랜드의 말투와 화면의 작은 디테일을 정리합니다.', ownerId: 'jae', status: 'review', progress: 90, dueDate: due(3), priority: 'normal', favorite: true },
      { id: 'onboarding', name: '팀 온보딩', description: '처음 함께하는 사람에게 필요한 안내를 만듭니다.', ownerId: 'suhyeon', status: 'planning', progress: 20, dueDate: due(12), priority: 'normal', favorite: false },
      { id: 'tokens', name: '디자인 토큰 정리', description: '색상, 글꼴, 간격의 공통 기준을 점검합니다.', ownerId: 'minji', status: 'done', progress: 100, dueDate: due(-1), priority: 'normal', favorite: false },
      { id: 'guide', name: '사용 가이드', description: '만드는 사람을 위한 시작 방법과 사용 예시를 다듬습니다.', ownerId: 'seoyeon', status: 'active', progress: 45, dueDate: due(10), priority: 'low', favorite: false },
      { id: 'research', name: '다음 제품 탐색', description: '팀의 다음 실험을 위한 질문을 모읍니다.', ownerId: null, status: 'planning', progress: 10, dueDate: null, priority: 'low', favorite: false },
    ],
    conversation: { draft: '', pendingFiles: [], activeTab: 'conversation', direction: 'ltr', messages: [
      { id: 'welcome', authorId: 'minji', authorName: '민지', text: '첫 번째 릴리스에 필요한 화면을 함께 정리해 볼까요?', time: '오전 9:10', files: [], liked: false, pinned: true },
      { id: 'guide-file', authorId: 'jae', authorName: '제이', text: '브랜드 가이드 초안을 공유해요. 로고와 타이포그래피 기준을 확인해 주세요.', time: '오전 9:15', files: [{ id: 'brand-guide', name: 'brand-guidelines.pdf', size: 2457600, type: 'application/pdf' }], liked: false, pinned: false },
      { id: 'theme-code', authorId: 'suhyeon', authorName: '수현', text: '버튼과 입력창에 공통 기준을 적용했어요. 아래 코드로 같은 토큰을 가져올 수 있어요.', time: '오전 9:24', files: [], liked: false, pinned: false, code: { value: "import { Button, Input } from './ui'\nimport './theme/default.css'", language: 'tsx', filename: 'workspace.tsx' } },
      { id: 'my-note', authorId: 'me', authorName: '나', text: '모바일과 다크 모드를 확인한 뒤 릴리스 점검을 진행할게요.', time: '오전 9:30', files: [], liked: false, pinned: false },
    ] },
    release: { projectId: 'library', version: '0.4.0', channel: 'preview', notes: '첫 번째 릴리스의 컴포넌트와 접근성 동작을 확인합니다.', otp: '', verified: false, readiness: [], traceStatus: 'idle', traceStep: 0, report: '', error: '' },
    wizardAnswers: {},
  }
}

function normalizeProject(project: ExampleProject): ExampleProject {
  return { ...project, name: project.name.trim().slice(0, 100) || '이름 없는 프로젝트', description: project.description.trim().slice(0, 500), progress: project.status === 'done' ? 100 : Math.min(100, Math.max(0, Number.isFinite(project.progress) ? Math.round(project.progress) : 0)) }
}

function invalidateRelease(release: ExampleRelease): ExampleRelease {
  return { ...release, traceStatus: 'idle', traceStep: 0, report: '', error: '' }
}

export function exampleSessionReducer(state: ExampleSessionState, action: ExampleSessionAction): ExampleSessionState {
  switch (action.type) {
    case 'scene/set': return { ...state, scene: action.scene }
    case 'project/select': return { ...state, selectedProjectId: action.id && state.projects.some((project) => project.id === action.id) ? action.id : null }
    case 'project/view': return { ...state, projectView: action.view }
    case 'project/add': {
      if (state.projects.some((project) => project.id === action.project.id)) return state
      const project = normalizeProject(action.project)
      return { ...state, projects: [project, ...state.projects], selectedProjectId: project.id }
    }
    case 'project/update': {
      const current = state.projects.find((project) => project.id === action.id)
      if (!current) return state
      const next = normalizeProject({ ...current, ...action.patch, name: action.patch.name?.trim() || current.name })
      const changed = Object.keys(action.patch).some((key) => key !== 'favorite' && current[key as keyof ExampleProject] !== next[key as keyof ExampleProject])
      return { ...state, projects: state.projects.map((project) => project.id === action.id ? next : project), release: changed && state.release.projectId === action.id ? invalidateRelease(state.release) : state.release }
    }
    case 'project/duplicate': {
      const original = state.projects.find((project) => project.id === action.id)
      if (!original || state.projects.some((project) => project.id === action.newId)) return state
      const project = normalizeProject({ ...original, id: action.newId, name: `${original.name} 사본`, status: 'planning', progress: 0, favorite: false })
      return { ...state, projects: [project, ...state.projects], selectedProjectId: project.id }
    }
    case 'project/remove': {
      const projects = state.projects.filter((project) => project.id !== action.id)
      return { ...state, projects, selectedProjectId: state.selectedProjectId === action.id ? projects[0]?.id ?? null : state.selectedProjectId, release: state.release.projectId === action.id ? { ...invalidateRelease(state.release), projectId: null, verified: false } : state.release }
    }
    case 'project/restore': {
      if (state.projects.some((project) => project.id === action.project.id)) return state
      const projects = [...state.projects]
      projects.splice(Math.max(0, Math.min(projects.length, action.index)), 0, normalizeProject(action.project))
      return { ...state, projects }
    }
    case 'conversation/patch': return { ...state, conversation: { ...state.conversation, ...action.patch, pendingFiles: (action.patch.pendingFiles ?? state.conversation.pendingFiles).map((file) => ({ ...file })) } }
    case 'conversation/send': {
      const message = action.message
      if ((!message.text.trim() && !message.files.length) || state.conversation.messages.some((item) => item.id === message.id)) return state
      return { ...state, conversation: { ...state.conversation, messages: [...state.conversation.messages, { ...message, text: message.text.trim().slice(0, 2000), files: message.files.map((file) => ({ ...file })) }], draft: '', pendingFiles: [] } }
    }
    case 'conversation/react': return { ...state, conversation: { ...state.conversation, messages: state.conversation.messages.map((message) => message.id === action.id ? { ...message, liked: !message.liked } : message) } }
    case 'conversation/pin': return { ...state, conversation: { ...state.conversation, messages: state.conversation.messages.map((message) => message.id === action.id ? { ...message, pinned: !message.pinned } : message) } }
    case 'release/patch': {
      const invalidated = ['projectId', 'version', 'channel', 'notes', 'otp', 'readiness'].some((key) => key in action.patch && JSON.stringify(action.patch[key as keyof ExampleRelease]) !== JSON.stringify(state.release[key as keyof ExampleRelease]))
      const release = { ...state.release, ...action.patch, readiness: [...(action.patch.readiness ?? state.release.readiness)] }
      if (action.patch.otp !== undefined && action.patch.otp !== state.release.otp) release.verified = false
      if (release.verified && release.otp !== '123456') release.verified = false
      if (invalidated && action.patch.traceStatus === undefined && release.traceStatus !== 'running') { release.traceStatus = 'idle'; release.error = ''; release.report = ''; release.traceStep = 0 }
      return { ...state, release }
    }
    case 'wizard/answers': return { ...state, wizardAnswers: Object.fromEntries(Object.entries(action.answers).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value])) }
  }
}
