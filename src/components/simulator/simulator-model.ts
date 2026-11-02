import { nodeTypes, type SimAction, type SimComponentDefinition, type SimLayout, type SimLayoutItem, type SimNode, type SimNodePatch, type SimNodeType, type SimProject, type SimProps, type SimRuntimeValues, type SimScreen } from './simulator-types'
import { DEFAULT_SIM_LAYOUT, getSimLayout } from './simulator-layout'

export const SIM_STORAGE_KEY = 'moru-simulator-project-v1'
export const FRAME_PRESETS = [
  { id: 'mobile', label: '모바일', width: 390, height: 844 },
  { id: 'tablet', label: '태블릿', width: 768, height: 1024 },
  { id: 'desktop', label: '데스크톱', width: 1280, height: 800 },
] as const

export const SIM_COMPONENTS: SimComponentDefinition[] = [
  { type: 'container', label: '컨테이너', description: '스택과 반응형 그리드', category: '레이아웃', width: 320, height: 120 },
  { type: 'text', label: '텍스트', description: '제목과 설명', category: '기본', width: 320, height: 64 },
  { type: 'button', label: '버튼', description: '화면 이동과 동작', category: '기본', width: 320, height: 44 },
  { type: 'image', label: '이미지 자리', description: '사진과 콘텐츠 영역', category: '기본', width: 320, height: 160 },
  { type: 'separator', label: '구분선', description: '영역 사이의 구분', category: '기본', width: 320, height: 8 },
  { type: 'input', label: '입력창', description: '한 줄의 입력', category: '입력', width: 320, height: 96 },
  { type: 'input-otp', label: '인증번호', description: '6자리 일회용 코드', category: '입력', width: 320, height: 104 },
  { type: 'textarea', label: '여러 줄 입력', description: '자세한 내용 작성', category: '입력', width: 320, height: 128 },
  { type: 'select', label: '선택창', description: '목록에서 하나 선택', category: '입력', width: 320, height: 72 },
  { type: 'checkbox', label: '체크박스', description: '동의와 복수 선택', category: '입력', width: 320, height: 40 },
  { type: 'switch', label: '스위치', description: '설정 켜기와 끄기', category: '입력', width: 320, height: 40 },
  { type: 'card', label: '카드', description: '정보와 상세 화면 연결', category: '콘텐츠', width: 320, height: 136 },
  { type: 'tabs', label: '탭', description: '콘텐츠 분류', category: '콘텐츠', width: 320, height: 52 },
  { type: 'list', label: '목록', description: '여러 항목의 모음', category: '콘텐츠', width: 320, height: 200 },
  { type: 'table', label: '표', description: '행과 열로 비교', category: '콘텐츠', width: 320, height: 180 },
  { type: 'chart', label: '차트', description: '막대 · 선 · 영역 · 도넛', category: '콘텐츠', width: 320, height: 300 },
  { type: 'avatar', label: '아바타', description: '사람과 프로필', category: '콘텐츠', width: 48, height: 48 },
  { type: 'badge', label: '배지', description: '상태와 분류', category: '콘텐츠', width: 88, height: 32 },
  { type: 'dialog', label: '다이얼로그', description: '안내와 확인', category: '콘텐츠', width: 320, height: 44 },
]

const baseProps: SimProps = { label: '', text: '', placeholder: '', value: '', options: ['첫 번째 항목', '두 번째 항목', '세 번째 항목'], variant: 'primary', state: 'default', tone: 'info', checked: false, required: false, inputType: 'text', textRole: 'body' }
const baseAction: SimAction = { type: 'none', targetScreenId: '', message: '동작을 확인했어요.', validate: false }
const defaults: Partial<Record<SimNodeType, Partial<SimProps>>> = {
  container: { label: '새 컨테이너', variant: 'ghost' },
  text: { label: '새로운 아이디어', text: '새로운 아이디어', textRole: 'heading' },
  button: { label: '다음으로' },
  input: { label: '이름', placeholder: '내용을 입력해 주세요.' },
  'input-otp': { label: '인증번호', required: true },
  textarea: { label: '설명', placeholder: '자세한 내용을 적어 주세요.' },
  select: { label: '분류 선택' },
  checkbox: { label: '내용을 확인했어요.' },
  switch: { label: '알림 받기' },
  card: { label: '아이디어를 모으는 공간', text: '작은 시작을 다음 단계로 이어 보세요.' },
  image: { label: '이미지 영역' },
  tabs: { label: '콘텐츠 보기', options: ['전체', '진행 중', '완료'] },
  list: { label: '프로젝트 목록', options: ['브랜드 가이드', '제품 소개 페이지', '팀 온보딩'] },
  table: { label: '프로젝트 현황', options: ['프로젝트|상태', '브랜드 가이드|진행 중', '제품 소개|준비 중', '팀 온보딩|완료'] },
  chart: { label: '주간 방문 현황', text: '지난 5일의 방문 수', value: 'bar', options: ['월 | 120', '화 | 186', '수 | 148', '목 | 224', '금 | 280'] },
  avatar: { label: '나' },
  badge: { label: '진행 중', variant: 'secondary' },
  dialog: { label: '안내 보기', text: '확인이 필요한 내용을 함께 살펴보세요.' },
}

export function createSimNode(type: SimNodeType, id: string, x = 24, y = 24): SimNode {
  const definition = SIM_COMPONENTS.find((item) => item.type === type)!
  return { id, type, x, y, width: definition.width, height: definition.height, props: { ...baseProps, ...defaults[type], options: [...(defaults[type]?.options ?? baseProps.options)] }, action: { ...baseAction, ...(type === 'dialog' ? { type: 'dialog' as const } : {}) }, ...(type === 'container' ? { layout: { ...DEFAULT_SIM_LAYOUT }, layoutItem: { width: 'fill' as const, height: 'hug' as const } } : {}) }
}

export function createBlankScreen(id: string, name = '새 화면', presetId = 'mobile'): SimScreen {
  const preset = FRAME_PRESETS.find((item) => item.id === presetId) ?? FRAME_PRESETS[0]
  return { id, name: name.trim().slice(0, 80) || '새 화면', width: preset.width, height: preset.height, nodes: [] }
}

function starterNode(screenId: string, type: SimNodeType, suffix: string, x: number, y: number, props: Partial<SimProps>, geometry: { width?: number; height?: number } = {}, action: Partial<SimAction> = {}): SimNode {
  const node = createSimNode(type, `${screenId}-${suffix}`, x, y)
  return { ...node, ...geometry, props: { ...node.props, ...props }, action: { ...node.action, ...action } }
}

export function createStarterProject(): SimProject {
  const login = createBlankScreen('login', '로그인')
  login.nodes = [
    starterNode('login', 'badge', 'brand', 24, 48, { label: 'MORU NOTES', variant: 'outline' }, { width: 136 }),
    starterNode('login', 'text', 'title', 24, 112, { label: '작은 아이디어의 시작', text: '작은 아이디어의 시작', textRole: 'heading' }, { width: 342, height: 56 }),
    starterNode('login', 'text', 'description', 24, 184, { label: '작업실 소개', text: '나만의 작업실에서 새로운 프로젝트를 만나 보세요.', textRole: 'body' }, { width: 342, height: 56 }),
    starterNode('login', 'input', 'email', 24, 256, { label: '이메일', placeholder: 'demo@moru.example', required: true, inputType: 'email' }, { width: 342, height: 96 }),
    starterNode('login', 'input', 'password', 24, 368, { label: '비밀번호', placeholder: '예제 비밀번호를 입력하세요.', required: true, inputType: 'password' }, { width: 342, height: 96 }),
    starterNode('login', 'checkbox', 'remember', 24, 480, { label: '로그인 상태 유지' }, { width: 342 }),
    starterNode('login', 'button', 'continue', 24, 552, { label: '로그인하고 둘러보기' }, { width: 342, height: 48 }, { type: 'navigate', targetScreenId: 'list', validate: true }),
    starterNode('login', 'text', 'note', 24, 624, { label: '로그인 예제 안내', text: '기획을 위한 로그인 예제입니다. 입력한 정보는 실제 인증이나 외부 전송에 사용되지 않아요.', textRole: 'caption' }, { width: 342, height: 72 }),
  ]
  const list = createBlankScreen('list', '프로젝트 목록')
  list.nodes = [
    starterNode('list', 'avatar', 'profile', 24, 32, { label: '나' }),
    starterNode('list', 'text', 'welcome', 88, 32, { label: '반가워요, Moru 님', text: '반가워요, Moru 님', textRole: 'body' }, { width: 278, height: 32 }),
    starterNode('list', 'text', 'welcome-note', 88, 64, { label: '오늘의 아이디어', text: '오늘의 아이디어를 이어 가세요.', textRole: 'caption' }, { width: 278, height: 32 }),
    starterNode('list', 'text', 'title', 24, 128, { label: '우리의 프로젝트', text: '우리의 프로젝트', textRole: 'heading' }, { width: 342, height: 40 }),
    starterNode('list', 'text', 'description', 24, 176, { label: '목록 안내', text: '카드를 눌러 프로젝트 상세를 확인해 보세요.', textRole: 'caption' }, { width: 342, height: 40 }),
    starterNode('list', 'tabs', 'tabs', 24, 232, { label: '프로젝트 분류', options: ['전체', '진행 중', '완료'] }, { width: 342 }),
    starterNode('list', 'card', 'brand', 24, 312, { label: '브랜드 가이드', text: '팀의 말투와 화면의 작은 디테일을 정리합니다.' }, { width: 342, height: 152 }, { type: 'navigate', targetScreenId: 'detail' }),
    starterNode('list', 'card', 'product', 24, 488, { label: '제품 소개 페이지', text: '제품의 첫인상을 함께 만들어요.' }, { width: 342, height: 152 }, { type: 'navigate', targetScreenId: 'detail' }),
    starterNode('list', 'button', 'back', 24, 688, { label: '로그인으로 돌아가기', variant: 'ghost' }, { width: 342 }, { type: 'navigate', targetScreenId: 'login' }),
  ]
  const detail = createBlankScreen('detail', '프로젝트 상세')
  detail.nodes = [
    starterNode('detail', 'button', 'back', 24, 24, { label: '← 목록으로', variant: 'ghost' }, { width: 128 }, { type: 'back' }),
    starterNode('detail', 'badge', 'status', 24, 104, { label: '진행 중', tone: 'info' }),
    starterNode('detail', 'text', 'title', 24, 160, { label: '브랜드 가이드', text: '브랜드 가이드', textRole: 'heading' }, { width: 342, height: 48 }),
    starterNode('detail', 'text', 'subtitle', 24, 224, { label: '함께 만드는 경험', text: '같은 기준으로, 함께 만드는 경험.', textRole: 'caption' }, { width: 342, height: 32 }),
    starterNode('detail', 'image', 'cover', 24, 280, { label: '프로젝트 대표 이미지' }, { width: 342, height: 160 }),
    starterNode('detail', 'text', 'section', 24, 464, { label: '프로젝트 소개', text: '프로젝트 소개', textRole: 'body' }, { width: 342, height: 32 }),
    starterNode('detail', 'text', 'description', 24, 504, { label: '프로젝트 소개 본문', text: '로고와 타이포그래피, 공통 컴포넌트의 기준을 정리합니다. 작은 디테일을 다듬어 팀의 일관된 경험을 만들어 가요.', textRole: 'body' }, { width: 342, height: 104 }),
    starterNode('detail', 'button', 'save', 24, 632, { label: '관심 프로젝트에 저장' }, { width: 342, height: 48 }, { type: 'toast', message: '관심 프로젝트에 저장했어요.' }),
    starterNode('detail', 'dialog', 'guide', 24, 704, { label: '프로젝트 안내 보기', text: '이 화면은 초기 아이디어를 확인하기 위한 프로토타입입니다.' }, { width: 342 }, { type: 'dialog', message: '팀과 함께 브랜드 기준을 다듬고 다음 릴리스를 준비해요.' }),
  ]
  return { schemaVersion: 1, name: '새 앱의 첫 번째 흐름', startScreenId: 'login', style: 'wireframe', screens: [login, list, detail] }
}

const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

export function normalizeNode(node: SimNode, screen: Pick<SimScreen, 'width' | 'height'> & Partial<Pick<SimScreen, 'layout' | 'nodes'>>): SimNode {
  // Managed nodes retain intrinsic dimensions across frame changes; placement is derived.
  if (node.parentId || screen.layout) {
    const freeRoot = !node.parentId && getSimLayout(screen.layout).mode === 'free'
    const maxWidth = freeRoot ? Math.max(1, finite(screen.width, 390)) : 2400
    const width = Math.round(clamp(finite(node.width, 160), 1, maxWidth))
    return { ...node, width, height: Math.round(clamp(finite(node.height, 44), 1, 3200)), x: Math.round(clamp(finite(node.x, 0), 0, freeRoot ? maxWidth - width : 2400)), y: Math.round(clamp(finite(node.y, 0), 0, 320_000)), props: node.props.inputType === 'password' && node.props.value ? { ...node.props, value: '' } : node.props }
  }
  const bounds = { width: Math.max(1, Math.floor(finite(screen.width, 390))), height: Math.max(1, Math.floor(finite(screen.height, 844))) }
  const width = Math.round(clamp(finite(node.width, 160), Math.min(32, bounds.width), bounds.width))
  const height = Math.round(clamp(finite(node.height, 44), Math.min(node.type === 'separator' ? 2 : 16, bounds.height), bounds.height))
  return { ...node, width, height, x: Math.round(clamp(finite(node.x, 0), 0, bounds.width - width)), y: Math.round(clamp(finite(node.y, 0), 0, bounds.height - height)), props: node.props.inputType === 'password' && node.props.value ? { ...node.props, value: '' } : node.props }
}

export function patchNode(project: SimProject, screenId: string, nodeId: string, patch: SimNodePatch): SimProject {
  const screen = project.screens.find((item) => item.id === screenId)
  const node = screen?.nodes.find((item) => item.id === nodeId)
  if (!screen || !node) return project
  const next = normalizeNode({ ...node, ...patch, props: patch.props ? { ...node.props, ...patch.props, ...(patch.props.options ? { options: [...patch.props.options] } : {}) } : node.props, action: patch.action ? { ...node.action, ...patch.action } : node.action }, screen)
  // Passwords belong to the temporary playback state, never the design document.
  if (next.props.inputType === 'password' && next.props.value) next.props = { ...next.props, value: '' }
  return { ...project, screens: project.screens.map((item) => item.id === screenId ? { ...item, nodes: item.nodes.map((existing) => existing.id === nodeId ? next : existing) } : item) }
}

export function removeScreen(project: SimProject, id: string): SimProject {
  if (project.screens.length <= 1 || !project.screens.some((screen) => screen.id === id)) return project
  const screens = project.screens.filter((screen) => screen.id !== id).map((screen) => ({ ...screen, nodes: screen.nodes.map((node) => node.action.targetScreenId === id ? { ...node, action: { ...node.action, type: node.action.type === 'navigate' ? 'none' as const : node.action.type, targetScreenId: '' } } : node) }))
  return { ...project, screens, startScreenId: project.startScreenId === id ? screens[0].id : project.startScreenId }
}

export function duplicateScreen(project: SimProject, id: string, newId: string): SimProject {
  const sourceIndex = project.screens.findIndex((screen) => screen.id === id)
  if (sourceIndex < 0 || project.screens.length >= 20 || project.screens.some((screen) => screen.id === newId)) return project
  const source = project.screens[sourceIndex]
  const existingIds = new Set(project.screens.flatMap((screen) => screen.nodes.map((node) => node.id)))
  const idMap = new Map<string, string>()
  source.nodes.forEach((node, index) => {
    let nextId = `${newId.slice(0, 45)}-node-${index + 1}`
    while (existingIds.has(nextId)) nextId = `${newId.slice(0, 45)}-${crypto.randomUUID()}`
    existingIds.add(nextId); idMap.set(node.id, nextId)
  })
  const nodes = source.nodes.map((node) => ({ ...node, id: idMap.get(node.id)!, ...(node.parentId ? { parentId: idMap.get(node.parentId) } : {}), ...(node.layout ? { layout: { ...node.layout } } : {}), ...(node.layoutItem ? { layoutItem: { ...node.layoutItem } } : {}), props: { ...node.props, options: [...node.props.options], ...(node.props.inputType === 'password' ? { value: '' } : {}) }, action: { ...node.action, targetScreenId: node.action.targetScreenId === id ? newId : node.action.targetScreenId } }))
  const copy = { ...source, ...(source.layout ? { layout: { ...source.layout } } : {}), id: newId, name: `${source.name.slice(0, 76)} 사본`, nodes }
  return { ...project, screens: [...project.screens.slice(0, sourceIndex + 1), copy, ...project.screens.slice(sourceIndex + 1)] }
}

const projectKeys = ['schemaVersion', 'name', 'startScreenId', 'style', 'screens']
const screenKeys = ['id', 'name', 'width', 'height', 'nodes']
const nodeKeys = ['id', 'type', 'x', 'y', 'width', 'height', 'props', 'action']
const propsKeys = Object.keys(baseProps)
const actionKeys = Object.keys(baseAction)
function invalid(message = '프로젝트 파일의 형식을 확인해 주세요.'): never { throw new Error(message) }
function record(value: unknown, keys: string[], optionalKeys: string[] = []): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return invalid()
  const object = value as Record<string, unknown>
  if (Object.keys(object).some((key) => !keys.includes(key) && !optionalKeys.includes(key)) || keys.some((key) => !Object.hasOwn(object, key))) return invalid()
  return object
}
function string(value: unknown, max: number, allowEmpty = true): string {
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && !value.trim())) return invalid()
  return value
}
function identifier(value: unknown): string {
  const id = string(value, 100, false)
  if (!/^[A-Za-z0-9_-]+$/.test(id) || ['__proto__', 'prototype', 'constructor'].includes(id)) return invalid()
  return id
}
function number(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) return invalid()
  return value
}
function bool(value: unknown): boolean { if (typeof value !== 'boolean') return invalid(); return value }
function oneOf<T extends string>(value: unknown, choices: readonly T[]): T { if (typeof value !== 'string' || !choices.includes(value as T)) return invalid(); return value as T }
function parseProps(input: unknown): SimProps {
  const p = record(input, propsKeys)
  if (!Array.isArray(p.options) || p.options.length > 30) return invalid('선택 항목은 30개까지 사용할 수 있어요.')
  const inputType = oneOf(p.inputType, ['text', 'email', 'password'])
  const value = string(p.value, 2000)
  return { label: string(p.label, 200), text: string(p.text, 4000), placeholder: string(p.placeholder, 300), value: inputType === 'password' ? '' : value, options: p.options.map((item) => string(item, 500)), variant: oneOf(p.variant, ['primary', 'secondary', 'outline', 'ghost']), state: oneOf(p.state, ['default', 'disabled', 'error', 'loading']), tone: oneOf(p.tone, ['info', 'success', 'warning', 'danger']), checked: bool(p.checked), required: bool(p.required), inputType, textRole: oneOf(p.textRole, ['heading', 'body', 'caption']) }
}

function parseLayout(input: unknown): SimLayout {
  const l = record(input, ['mode', 'gap', 'padding', 'align', 'justify', 'columns', 'tabletColumns', 'mobileColumns', 'stackOnMobile'])
  const columns = (value: unknown) => { const count = number(value, 1, 12); if (!Number.isInteger(count)) return invalid('그리드 열 수는 정수로 입력해 주세요.'); return count }
  return { mode: oneOf(l.mode, ['free', 'vertical', 'horizontal', 'grid']), gap: number(l.gap, 0, 128), padding: number(l.padding, 0, 128), align: oneOf(l.align, ['start', 'center', 'end', 'stretch']), justify: oneOf(l.justify, ['start', 'center', 'end', 'between']), columns: columns(l.columns), tabletColumns: columns(l.tabletColumns), mobileColumns: columns(l.mobileColumns), stackOnMobile: bool(l.stackOnMobile) }
}

function parseLayoutItem(input: unknown): SimLayoutItem {
  const item = record(input, ['width', 'height'])
  return { width: oneOf(item.width, ['fill', 'fixed']), height: oneOf(item.height, ['hug', 'fixed']) }
}

function validateHierarchy(screen: SimScreen): void {
  const byId = new Map(screen.nodes.map((node) => [node.id, node]))
  for (const node of screen.nodes) {
    if (node.layout && node.type !== 'container') return invalid('컨테이너에만 내부 레이아웃을 지정할 수 있어요.')
    const visited = new Set([node.id])
    let parentId = node.parentId
    while (parentId) {
      const parent = byId.get(parentId)
      if (!parent || parent.type !== 'container') return invalid('요소의 상위 컨테이너를 확인해 주세요.')
      if (visited.has(parentId)) return invalid('컨테이너를 자신이나 하위 컨테이너 안에 넣을 수 없어요.')
      visited.add(parentId); parentId = parent.parentId
    }
  }
}

export function parseSimProject(text: string): SimProject {
  if (typeof text !== 'string' || text.length > 1_000_000 || new TextEncoder().encode(text).byteLength > 1_000_000) return invalid('1MB 이하의 프로젝트 파일을 선택해 주세요.')
  let input: unknown
  try { input = JSON.parse(text) } catch { return invalid('올바른 JSON 프로젝트 파일을 선택해 주세요.') }
  const p = record(input, projectKeys)
  if (p.schemaVersion !== 1) return invalid('지원하지 않는 프로젝트 버전입니다.')
  if (!Array.isArray(p.screens) || p.screens.length < 1 || p.screens.length > 20) return invalid('화면은 1개에서 20개까지 사용할 수 있어요.')
  const allIds = new Set<string>()
  const unique = (value: unknown) => { const id = identifier(value); if (allIds.has(id)) return invalid('화면과 요소의 ID는 중복될 수 없어요.'); allIds.add(id); return id }
  const screens: SimScreen[] = p.screens.map((screenValue) => {
    const s = record(screenValue, screenKeys, ['layout'])
    const id = unique(s.id)
    const width = number(s.width, 160, 2400)
    const height = number(s.height, 160, 3200)
    if (!Array.isArray(s.nodes) || s.nodes.length > 100) return invalid('한 화면에는 요소를 100개까지 배치할 수 있어요.')
    const nodes: SimNode[] = s.nodes.map((nodeValue) => {
      const n = record(nodeValue, nodeKeys, ['parentId', 'layout', 'layoutItem'])
      const a = record(n.action, actionKeys)
      const node: SimNode = { id: unique(n.id), type: oneOf(n.type, nodeTypes), x: number(n.x, 0, 2400), y: number(n.y, 0, 320_000), width: number(n.width, 1, 2400), height: number(n.height, 1, 3200), props: parseProps(n.props), action: { type: oneOf(a.type, ['none', 'navigate', 'back', 'dialog', 'toast']), targetScreenId: a.targetScreenId === '' ? '' : identifier(a.targetScreenId), message: string(a.message, 2000), validate: bool(a.validate) }, ...(Object.hasOwn(n, 'parentId') ? { parentId: identifier(n.parentId) } : {}), ...(Object.hasOwn(n, 'layout') ? { layout: parseLayout(n.layout) } : {}), ...(Object.hasOwn(n, 'layoutItem') ? { layoutItem: parseLayoutItem(n.layoutItem) } : {}) }
      return node
    })
    const screen: SimScreen = { id, name: string(s.name, 80, false), width, height, nodes, ...(Object.hasOwn(s, 'layout') ? { layout: parseLayout(s.layout) } : {}) }
    validateHierarchy(screen)
    screen.nodes = nodes.map((node) => {
      if (!node.parentId && getSimLayout(screen.layout).mode === 'free' && (node.x + node.width > width || !screen.layout && node.y + node.height > height)) return invalid('화면 밖에 있는 요소의 위치와 크기를 확인해 주세요.')
      return normalizeNode(node, screen)
    })
    return screen
  })
  const screenIds = new Set(screens.map((screen) => screen.id))
  const startScreenId = identifier(p.startScreenId)
  if (!screenIds.has(startScreenId)) return invalid('시작 화면이 존재하지 않습니다.')
  for (const screen of screens) for (const node of screen.nodes) {
    // An empty target is an editable, disconnected draft. Non-empty targets must exist.
    if (node.action.targetScreenId && !screenIds.has(node.action.targetScreenId)) return invalid('연결 대상 화면이 존재하지 않습니다.')
  }
  return { schemaVersion: 1, name: string(p.name, 80, false), startScreenId, style: oneOf(p.style, ['wireframe', 'moru']), screens }
}

export function serializeSimProject(project: SimProject): string {
  const cleaned = { ...project, screens: project.screens.map((screen) => ({ ...screen, nodes: screen.nodes.map((node) => node.props.inputType === 'password' ? { ...node, props: { ...node.props, value: '' } } : node) })) }
  // Round-trip validation protects the exported document as well as imported files.
  const validated = parseSimProject(JSON.stringify(cleaned))
  const formatted = JSON.stringify(validated, null, 2)
  // Formatting must not make an otherwise valid portable document impossible to reopen.
  return new TextEncoder().encode(formatted).byteLength <= 1_000_000 ? formatted : JSON.stringify(validated)
}

export function getRequiredFieldErrors(screen: SimScreen, values: SimRuntimeValues): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const node of screen.nodes) {
    if (!node.props.required || node.props.state === 'disabled' || node.props.state === 'loading') continue
    if (!['input', 'input-otp', 'textarea', 'select', 'checkbox', 'switch'].includes(node.type)) continue
    const value = Object.hasOwn(values, node.id) ? values[node.id] : node.type === 'checkbox' || node.type === 'switch' ? node.props.checked : node.props.value
    const label = node.props.label || '필수 항목'
    if (node.type === 'checkbox' || node.type === 'switch') {
      if (value !== true) errors[node.id] = `${label} 항목을 확인해 주세요.`
      continue
    }
    if (node.type === 'select') {
      const options = node.props.options.filter((option) => option.trim().length > 0)
      const validLabel = typeof value === 'string' && options.includes(value)
      const validIndex = typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) < options.length
      if (!validLabel && !validIndex) errors[node.id] = `${label} 항목을 선택해 주세요.`
      continue
    }
    if (typeof value !== 'string' || !value.trim()) errors[node.id] = `${label} 항목을 입력해 주세요.`
    else if (node.type === 'input-otp' && !/^[0-9]{6}$/.test(value)) errors[node.id] = '6자리 인증번호를 입력해 주세요.'
    else if (node.type === 'input' && node.props.inputType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errors[node.id] = '올바른 이메일 주소를 입력해 주세요.'
  }
  return errors
}
