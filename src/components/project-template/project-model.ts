export const PROJECT_STORE_KEY = 'moru-project-tasks:v1'
export const PROJECT_STORE_VERSION = 1
export const MAX_PROJECTS = 200
export const MAX_TASKS = 2000

export type ProjectStatus = 'planned' | 'active' | 'done'
export type TaskStatus = 'todo' | 'doing' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type Owner = 'me' | 'team'
export type WorkspaceSettings = { name: string; email: string; visibility: 'private' | 'team' | 'public'; updates: boolean; digest: boolean }
export type ProjectDraft = { name: string; summary: string; status: ProjectStatus; owner: Owner; due: string }
export type Project = ProjectDraft & { id: string }
export type TaskDraft = { name: string; notes: string; projectId: string; status: TaskStatus; priority: TaskPriority; owner: Owner; due: string }
export type Task = TaskDraft & { id: string }
export type ProjectAppState = { schemaVersion: 1; projects: Project[]; tasks: Task[]; workspace: WorkspaceSettings; mode: 'light' | 'dark' }
export type DeletedRecords = { projects: Project[]; tasks: Task[] }
export type DraftErrors = Partial<Record<'name' | 'summary' | 'notes' | 'projectId' | 'status' | 'owner' | 'priority' | 'due' | 'limit', string>>
export type StorageAdapter = Pick<Storage, 'getItem' | 'setItem'>

export const projectStatusOptions = [{ value: 'planned', label: '예정' }, { value: 'active', label: '진행 중' }, { value: 'done', label: '완료' }]
export const taskStatusOptions = [{ value: 'todo', label: '할 일' }, { value: 'doing', label: '진행 중' }, { value: 'done', label: '완료' }]
export const priorityOptions = [{ value: 'low', label: '낮음' }, { value: 'medium', label: '보통' }, { value: 'high', label: '높음' }]
export const ownerOptions = [{ value: 'me', label: '나' }, { value: 'team', label: '팀' }]

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string') return false
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function createDemoProjectState(today = new Date()): ProjectAppState {
  const due = (offset: number) => { const date = new Date(today); date.setDate(date.getDate() + offset); return dateKey(date) }
  return {
    schemaVersion: 1, mode: 'light',
    workspace: { name: 'Moru Studio', email: 'hello@moru.example', visibility: 'private', updates: true, digest: false },
    projects: [
      { id: 'project-website', name: '새로운 제품 웹사이트', summary: '우리의 다음 이야기를 담을, 명료한 첫 화면.', status: 'active', owner: 'me', due: due(10) },
      { id: 'project-mobile', name: '모바일 경험 다듬기', summary: '작은 화면에서도 자연스러운 작업의 흐름.', status: 'active', owner: 'team', due: due(17) },
      { id: 'project-brand', name: '브랜드 플레이북', summary: '오래 함께 쓸 수 있는 팀의 공통 언어.', status: 'planned', owner: 'me', due: due(24) },
      { id: 'project-research', name: '사용자 인터뷰', summary: '좋은 질문에서 시작한 여덟 번의 대화.', status: 'done', owner: 'team', due: due(-3) },
    ],
    tasks: [
      { id: 'task-hero', name: '첫 화면 메시지 정리', notes: '제품이 해결하는 문제와 다음 행동을 한 문장으로 정리하세요.', projectId: 'project-website', status: 'doing', priority: 'high', owner: 'me', due: due(0) },
      { id: 'task-wireframe', name: '핵심 페이지 와이어프레임', notes: '소개, 기능, 시작하기 페이지의 정보 순서를 확인해요.', projectId: 'project-website', status: 'todo', priority: 'medium', owner: 'me', due: due(2) },
      { id: 'task-content', name: '콘텐츠 목록 만들기', notes: '', projectId: 'project-website', status: 'done', priority: 'medium', owner: 'team', due: due(-1) },
      { id: 'task-touch', name: '터치 영역과 키보드 점검', notes: '작은 화면에서 폼과 하단 탐색을 직접 조작해 보세요.', projectId: 'project-mobile', status: 'doing', priority: 'high', owner: 'me', due: due(1) },
      { id: 'task-mobile', name: '모바일 탐색 흐름 정리', notes: '', projectId: 'project-mobile', status: 'todo', priority: 'medium', owner: 'team', due: due(4) },
      { id: 'task-tokens', name: '색상과 타이포그래피 원칙', notes: '', projectId: 'project-brand', status: 'todo', priority: 'low', owner: 'me', due: due(7) },
      { id: 'task-interview', name: '인터뷰 인사이트 공유', notes: '팀이 바로 실행할 수 있는 세 가지 발견을 정리했어요.', projectId: 'project-research', status: 'done', priority: 'medium', owner: 'team', due: due(-3) },
    ],
  }
}

export function validateProject(draft: ProjectDraft): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.name.trim() || draft.name.trim().length > 80) errors.name = '프로젝트 이름을 1~80자로 입력하세요.'
  if (draft.summary.length > 300) errors.summary = '설명은 300자까지 입력할 수 있어요.'
  if (!projectStatusOptions.some(({ value }) => value === draft.status)) errors.status = '프로젝트 상태를 선택하세요.'
  if (!ownerOptions.some(({ value }) => value === draft.owner)) errors.owner = '담당자를 선택하세요.'
  if (!isDateKey(draft.due)) errors.due = '올바른 마감일을 입력하세요.'
  return errors
}

export function validateTask(draft: TaskDraft, projects: Project[]): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.name.trim() || draft.name.trim().length > 120) errors.name = '할일 이름을 1~120자로 입력하세요.'
  if (draft.notes.length > 4000) errors.notes = '메모는 4,000자까지 입력할 수 있어요.'
  if (!projects.some(({ id }) => id === draft.projectId)) errors.projectId = '할일을 담을 프로젝트를 선택하세요.'
  if (!taskStatusOptions.some(({ value }) => value === draft.status)) errors.status = '할일 상태를 선택하세요.'
  if (!priorityOptions.some(({ value }) => value === draft.priority)) errors.priority = '우선순위를 선택하세요.'
  if (!ownerOptions.some(({ value }) => value === draft.owner)) errors.owner = '담당자를 선택하세요.'
  if (!isDateKey(draft.due)) errors.due = '올바른 마감일을 입력하세요.'
  return errors
}

const newId = (): string => globalThis.crypto?.randomUUID?.() ?? `moru-${Date.now()}-${Math.random().toString(36).slice(2)}`
export function saveProject(state: ProjectAppState, draft: ProjectDraft, id?: string, makeId = newId): { state: ProjectAppState; errors: DraftErrors } {
  const errors = validateProject(draft)
  if (id && !state.projects.some((project) => project.id === id)) errors.name = '이 프로젝트가 삭제됐어요. 목록을 다시 확인하세요.'
  if (!id && state.projects.length >= MAX_PROJECTS) errors.limit = '프로젝트는 최대 200개까지 만들 수 있어요.'
  if (Object.keys(errors).length) return { state, errors }
  const project = { ...draft, name: draft.name.trim(), summary: draft.summary.trim(), id: id ?? makeId() }
  if (!id && state.projects.some((existing) => existing.id === project.id)) return { state, errors: { name: '고유한 ID를 만들지 못했어요. 다시 시도하세요.' } }
  return { state: { ...state, projects: id ? state.projects.map((item) => item.id === id ? project : item) : [project, ...state.projects] }, errors: {} }
}

export function saveTask(state: ProjectAppState, draft: TaskDraft, id?: string, makeId = newId): { state: ProjectAppState; errors: DraftErrors } {
  const errors = validateTask(draft, state.projects)
  if (id && !state.tasks.some((task) => task.id === id)) errors.name = '이 할일이 삭제됐어요. 목록을 다시 확인하세요.'
  if (!id && state.tasks.length >= MAX_TASKS) errors.limit = '할일은 최대 2,000개까지 만들 수 있어요.'
  if (Object.keys(errors).length) return { state, errors }
  const task = { ...draft, name: draft.name.trim(), notes: draft.notes.trim(), id: id ?? makeId() }
  if (!id && state.tasks.some((existing) => existing.id === task.id)) return { state, errors: { name: '고유한 ID를 만들지 못했어요. 다시 시도하세요.' } }
  return { state: { ...state, tasks: id ? state.tasks.map((item) => item.id === id ? task : item) : [task, ...state.tasks] }, errors: {} }
}

export function removeProject(state: ProjectAppState, id: string) {
  const deleted: DeletedRecords = { projects: state.projects.filter((project) => project.id === id), tasks: state.tasks.filter((task) => task.projectId === id) }
  return { state: { ...state, projects: state.projects.filter((project) => project.id !== id), tasks: state.tasks.filter((task) => task.projectId !== id) }, deleted }
}
export function removeTask(state: ProjectAppState, id: string) {
  return { state: { ...state, tasks: state.tasks.filter((task) => task.id !== id) }, deleted: { projects: [], tasks: state.tasks.filter((task) => task.id === id) } }
}
export function restoreDeleted(state: ProjectAppState, deleted: DeletedRecords): ProjectAppState {
  const projects = [...state.projects, ...deleted.projects.filter((item) => !state.projects.some(({ id }) => id === item.id))].slice(0, MAX_PROJECTS)
  const tasks = [...state.tasks, ...deleted.tasks.filter((item) => projects.some(({ id }) => id === item.projectId) && !state.tasks.some(({ id }) => id === item.id))].slice(0, MAX_TASKS)
  return { ...state, projects, tasks }
}
export function toggleTask(state: ProjectAppState, id: string): ProjectAppState {
  return { ...state, tasks: state.tasks.map((task) => task.id === id ? { ...task, status: task.status === 'done' ? 'todo' : 'done' } : task) }
}
export function projectProgress(tasks: Task[], projectId: string) {
  const all = tasks.filter((task) => task.projectId === projectId)
  const completed = all.filter((task) => task.status === 'done').length
  return { total: all.length, completed, percent: all.length ? Math.round(completed / all.length * 100) : 0 }
}
export function taskIsOverdue(task: Task, today = dateKey(new Date())) { return task.status !== 'done' && !!task.due && task.due < today }

function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) }
function text(value: unknown, max: number, required = false): value is string { return typeof value === 'string' && value.length <= max && (!required || !!value.trim()) }
export function isProjectAppState(value: unknown): value is ProjectAppState {
  if (!object(value) || value.schemaVersion !== PROJECT_STORE_VERSION || !['light', 'dark'].includes(String(value.mode)) || !Array.isArray(value.projects) || !Array.isArray(value.tasks)) return false
  if (value.projects.length > MAX_PROJECTS || value.tasks.length > MAX_TASKS) return false
  const settings = value.workspace
  if (!object(settings) || !text(settings.name, 80, true) || !text(settings.email, 254, true) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email) || !['private', 'team', 'public'].includes(String(settings.visibility)) || typeof settings.updates !== 'boolean' || typeof settings.digest !== 'boolean') return false
  const ids = new Set<string>()
  for (const project of value.projects) {
    if (!object(project) || !text(project.id, 160, true) || ids.has(project.id) || !text(project.name, 80, true) || !text(project.summary, 300) || !isDateKey(project.due)) return false
    if (Object.keys(validateProject(project as unknown as ProjectDraft)).length) return false
    ids.add(project.id)
  }
  const taskIds = new Set<string>()
  for (const task of value.tasks) {
    if (!object(task) || !text(task.id, 160, true) || taskIds.has(task.id) || !text(task.name, 120, true) || !text(task.notes, 4000) || !text(task.projectId, 160, true) || !ids.has(task.projectId) || !isDateKey(task.due)) return false
    if (Object.keys(validateTask(task as unknown as TaskDraft, value.projects as Project[])).length) return false
    taskIds.add(task.id)
  }
  return true
}

export function decodeProjectStore(raw: string | null, fallback = createDemoProjectState()): { state: ProjectAppState; status: 'empty' | 'restored' | 'corrupt' | 'unsupported' } {
  if (raw === null) return { state: fallback, status: 'empty' }
  if (raw.length > 2_000_000) return { state: fallback, status: 'corrupt' }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (object(parsed) && typeof parsed.schemaVersion === 'number' && parsed.schemaVersion !== PROJECT_STORE_VERSION) return { state: fallback, status: 'unsupported' }
    return isProjectAppState(parsed) ? { state: parsed, status: 'restored' } : { state: fallback, status: 'corrupt' }
  } catch { return { state: fallback, status: 'corrupt' } }
}
export function readProjectStore(storage: StorageAdapter | undefined, fallback = createDemoProjectState()) {
  try { return storage ? decodeProjectStore(storage.getItem(PROJECT_STORE_KEY), fallback) : { state: fallback, status: 'unavailable' as const } }
  catch { return { state: fallback, status: 'unavailable' as const } }
}
export function writeProjectStore(storage: StorageAdapter | undefined, state: ProjectAppState): boolean {
  if (!storage || !isProjectAppState(state)) return false
  try {
    const raw = JSON.stringify(state)
    if (raw.length > 2_000_000) return false
    storage.setItem(PROJECT_STORE_KEY, raw)
    return true
  } catch { return false }
}
