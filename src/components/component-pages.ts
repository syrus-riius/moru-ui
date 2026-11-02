import { components, type ComponentId } from './component-catalog'

export type ComponentGroupId = 'forms' | 'actions' | 'overlays' | 'navigation' | 'layout' | 'feedback' | 'data' | 'conversation'
export type ComponentGroup = {
  id: ComponentGroupId
  label: string
  eyebrow: string
  description: string
  componentIds: readonly ComponentId[]
}

/** Browse by the task a component solves; the original catalog metadata remains compatible. */
export const componentGroups: readonly ComponentGroup[] = [
  {
    id: 'forms', label: '폼 · 입력', eyebrow: 'FORMS & INPUT',
    description: '입력하고 선택하고 검증하는, 데이터 수집의 기본입니다.',
    componentIds: ['field', 'input', 'number-input', 'password-input', 'textarea', 'checkbox', 'select', 'multi-select', 'switch', 'radio-group', 'slider', 'combobox', 'calendar', 'date-picker', 'date-range-picker', 'time-picker', 'time-range-picker', 'toggle-group', 'input-group', 'input-otp', 'label', 'native-select', 'file-input', 'attachment', 'questionnaire'],
  },
  {
    id: 'actions', label: '버튼 · 동작', eyebrow: 'ACTIONS',
    description: '주요 동작과 옵션, 빠른 명령을 분명하게 전달합니다.',
    componentIds: ['button', 'command', 'button-group', 'kbd', 'toggle'],
  },
  {
    id: 'overlays', label: '오버레이', eyebrow: 'OVERLAYS',
    description: '현재 맥락 안에서 메뉴와 정보, 편집 화면을 엽니다.',
    componentIds: ['dialog', 'menu', 'popover', 'tooltip', 'alert-dialog', 'sheet', 'context-menu', 'drawer', 'hover-card'],
  },
  {
    id: 'navigation', label: '탐색', eyebrow: 'NAVIGATION',
    description: '현재 위치를 알리고 다른 화면과 콘텐츠로 이어 줍니다.',
    componentIds: ['tabs', 'pagination', 'breadcrumb', 'menubar', 'navigation-menu', 'sidebar', 'stepper'],
  },
  {
    id: 'layout', label: '레이아웃', eyebrow: 'LAYOUT',
    description: '정보를 묶고 나누며 화면의 구조와 읽는 흐름을 만듭니다.',
    componentIds: ['card', 'accordion', 'avatar', 'separator', 'aspect-ratio', 'direction', 'item', 'collapsible', 'carousel', 'resizable', 'scroll-area', 'typography'],
  },
  {
    id: 'feedback', label: '상태 · 피드백', eyebrow: 'STATUS & FEEDBACK',
    description: '상태와 진행, 결과와 다음 행동을 명확하게 안내합니다.',
    componentIds: ['badge', 'alert', 'progress', 'ring-progress', 'skeleton', 'toast', 'empty', 'spinner', 'marker'],
  },
  {
    id: 'data', label: '데이터', eyebrow: 'DATA',
    description: '표와 차트로 데이터를 비교하고 탐색합니다.',
    componentIds: ['table', 'chart', 'data-table'],
  },
  {
    id: 'conversation', label: '대화 · 콘텐츠', eyebrow: 'CONVERSATION & CONTENT',
    description: '메시지와 코드, 작업 과정을 읽기 좋은 흐름으로 엮습니다.',
    componentIds: ['bubble', 'code-block', 'message', 'message-scroller', 'trace'],
  },
]

export type ComponentPage =
  | { kind: 'index' }
  | { kind: 'category'; group: ComponentGroupId }
  | { kind: 'detail'; group: ComponentGroupId; component: ComponentId }

const groupById = new Map(componentGroups.map((group) => [group.id, group]))
const groupByComponent = new Map<ComponentId, ComponentGroup>(componentGroups.flatMap((group) => group.componentIds.map((id) => [id, group] as const)))
const componentById = new Map(components.map((component) => [component.id, component]))

export function componentGroupFor(id: ComponentId): ComponentGroup {
  return groupByComponent.get(id)!
}

/** Fresh results follow the established catalog order, independent of category declaration order. */
export function groupComponents(group: ComponentGroupId): readonly typeof components[number][] {
  const ids = groupById.get(group)?.componentIds ?? []
  return components.filter((component) => ids.includes(component.id))
}

function decoded(value: string): string | null {
  try { return decodeURIComponent(value) } catch { return null }
}

function componentId(value: string | null): ComponentId | null {
  return value !== null && componentById.has(value as ComponentId) ? value as ComponentId : null
}

function detailPage(component: ComponentId): ComponentPage {
  return { kind: 'detail', group: componentGroupFor(component).id, component }
}

/** Non-library hashes remain the responsibility of the studio's other screens. */
export function parseComponentPage(hash: string): ComponentPage | null {
  const source = hash.startsWith('#') ? hash.slice(1) : hash
  const path = source.split('?', 1)[0].replace(/\/+$/, '')
  if (!path || path === 'components') return { kind: 'index' }
  if (path.startsWith('component-')) {
    const component = componentId(decoded(path.slice('component-'.length)))
    return component ? detailPage(component) : { kind: 'index' }
  }
  if (!path.startsWith('components/')) return null
  const segments = path.slice('components/'.length).split('/')
  const first = decoded(segments[0])
  if (first !== null && groupById.has(first as ComponentGroupId)) {
    const group = first as ComponentGroupId
    const component = segments.length > 1 ? componentId(decoded(segments[1])) : null
    return component ? detailPage(component) : { kind: 'category', group }
  }
  const component = segments.length === 1 ? componentId(first) : null
  return component ? detailPage(component) : { kind: 'index' }
}

export function componentPageHash(page: ComponentPage): string {
  if (page.kind === 'index') return '#components'
  if (page.kind === 'category') return `#components/${page.group}`
  return `#components/${componentGroupFor(page.component).id}/${page.component}`
}

export function componentPageTitle(page: ComponentPage): string {
  if (page.kind === 'index') return '컴포넌트'
  if (page.kind === 'category') return groupById.get(page.group)!.label
  return componentById.get(page.component)!.name
}

export function componentPageKey(page: ComponentPage): string {
  return componentPageHash(page)
}

/** The position is zero-based; neighboring pages stay inside the current category. */
export function adjacentComponents(id: ComponentId): { previous: ComponentId | null; next: ComponentId | null; index: number; total: number } {
  const siblings = groupComponents(componentGroupFor(id).id)
  const index = siblings.findIndex((component) => component.id === id)
  return { previous: siblings[index - 1]?.id ?? null, next: siblings[index + 1]?.id ?? null, index, total: siblings.length }
}
