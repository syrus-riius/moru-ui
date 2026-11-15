import { createSimNode } from './simulator-model'
import { DEFAULT_SIM_LAYOUT } from './simulator-layout'
import type {
  SimAction,
  SimLayout,
  SimNode,
  SimNodeType,
  SimProject,
  SimProps,
  SimScreen,
} from './simulator-types'

// Legacy helper IDs remain available to existing integrations.
export type SimBlockId = 'dashboard' | 'login' | 'signup' | 'otp' | 'search-filters' | 'settings'
export type SimBlockDevice = 'mobile' | 'web'
export const SIM_BLOCK_INSERT_EVENT = 'moru:insert-block'
const names: Record<SimBlockId, string> = {
  dashboard: '프로젝트 대시보드',
  signup: '회원가입',
  login: '로그인',
  otp: '이메일 인증',
  'search-filters': '검색 필터',
  settings: '작업 공간 설정',
}
let pending: { id: SimBlockId; device: SimBlockDevice } | null = null

/** The payload contains only the chosen design, never values entered in a preview. */
export function requestBlockInsertion(id: SimBlockId, device: SimBlockDevice): void {
  pending = { id, device }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SIM_BLOCK_INSERT_EVENT))
}

/** Consume from the simulator effect, not its render/state initializer (Strict Mode safe). */
export function consumeBlockInsertion() {
  const request = pending
  pending = null
  return request
}

export interface InsertedSimBlock {
  project: SimProject
  screenId: string
  screenName: string
  selectedIds: string[]
}

/** Append an editable auto-layout composition as a single history transaction. */
export function insertSimBlock(
  project: SimProject,
  id: SimBlockId,
  device: SimBlockDevice,
  makeId: () => string = () => crypto.randomUUID(),
): InsertedSimBlock | null {
  if (project.screens.length >= 20) return null
  const used = new Set(
    project.screens.flatMap((screen) => [screen.id, ...screen.nodes.map((node) => node.id)]),
  )
  const unique = () => {
    const base = makeId()
    let candidate = base,
      suffix = 1
    while (used.has(candidate)) candidate = `${base.slice(0, 70)}-${++suffix}`
    used.add(candidate)
    return candidate
  }
  const screenId = unique()
  const nodes: SimNode[] = []
  const layout = (patch: Partial<SimLayout> = {}): SimLayout => ({
    ...DEFAULT_SIM_LAYOUT,
    mode: 'vertical',
    padding: 0,
    gap: 16,
    ...patch,
  })
  function node(
    type: SimNodeType,
    height: number,
    props: Partial<SimProps>,
    parentId?: string,
    action?: Partial<SimAction>,
  ): string {
    const entry = createSimNode(type, unique(), 0, 0)
    nodes.push({
      ...entry,
      width: type === 'badge' ? 88 : 432,
      height,
      props: { ...entry.props, ...props },
      action: { ...entry.action, ...action },
      ...(parentId ? { parentId } : {}),
    })
    return entry.id
  }
  function container(
    label: string,
    parentId?: string,
    patch?: Partial<SimLayout>,
    width = 480,
  ): string {
    const containerId = node(
      'container',
      80,
      { label, variant: parentId ? 'ghost' : 'secondary' },
      parentId,
    )
    const entry = nodes[nodes.length - 1]
    entry.width = width
    entry.layout = layout(patch)
    entry.layoutItem = { width: parentId ? 'fill' : 'fixed', height: 'hug' }
    return containerId
  }
  const panel = container(
    `${names[id]} 블록`,
    undefined,
    { padding: 24, gap: 16 },
    id === 'dashboard' ? 880 : id === 'search-filters' ? 760 : id === 'settings' ? 560 : 420,
  )
  const heading = (title: string, description: string, overline?: string) => {
    if (overline) node('text', 24, { label: overline, text: overline, textRole: 'caption' }, panel)
    node('text', 56, { label: title, text: title, textRole: 'heading' }, panel)
    node('text', 64, { label: '안내', text: description, textRole: 'caption' }, panel)
  }
  if (id === 'login') {
    heading('다시 만나 반가워요', '이메일로 나의 작업 공간을 이어가세요.', 'MORU WORKSPACE')
    node(
      'input',
      104,
      { label: '이메일', inputType: 'email', placeholder: 'you@example.com', required: true },
      panel,
    )
    node(
      'input',
      104,
      {
        label: '비밀번호',
        inputType: 'password',
        placeholder: '비밀번호 입력',
        required: true,
        value: '',
      },
      panel,
    )
    node(
      'text',
      28,
      { label: '비밀번호 안내', text: '8자 이상 입력하세요.', textRole: 'caption' },
      panel,
    )
    node('checkbox', 48, { label: '로그인 상태 유지', checked: false }, panel)
    node('button', 48, { label: '로그인' }, panel, {
      type: 'toast',
      message: '로그인 정보를 확인했어요. 다음 화면을 연결할 준비가 됐어요.',
      validate: true,
    })
  } else if (id === 'signup') {
    heading('함께 시작해요', '계정 입력부터 이메일 인증까지 한 흐름으로.', 'CREATE YOUR ACCOUNT')
    node('text', 32, { label: '계정 정보 단계', text: '01 · 계정 정보', textRole: 'body' }, panel)
    node(
      'input',
      104,
      { label: '이름', placeholder: '이름을 입력하세요', value: '', required: true },
      panel,
    )
    node(
      'input',
      104,
      {
        label: '이메일',
        inputType: 'email',
        placeholder: 'you@example.com',
        value: '',
        required: true,
      },
      panel,
    )
    node(
      'input',
      104,
      {
        label: '비밀번호',
        inputType: 'password',
        placeholder: '8자 이상 입력하세요',
        value: '',
        required: true,
      },
      panel,
    )
    node(
      'checkbox',
      64,
      { label: '이용약관과 개인정보 처리방침에 동의합니다', checked: false, required: true },
      panel,
    )
    node(
      'text',
      32,
      { label: '이메일 인증 단계', text: '02 · 이메일 인증', textRole: 'body' },
      panel,
    )
    node('input-otp', 112, { label: '인증번호', required: true, value: '' }, panel)
    node(
      'text',
      56,
      {
        label: '단계 안내',
        text: '단계별 화면을 편집할 수 있는 초안입니다. 실제 가입 흐름은 블록 미리보기에서 확인하세요.',
        textRole: 'caption',
      },
      panel,
    )
    node('button', 48, { label: '가입 완료' }, panel, {
      type: 'toast',
      message: '입력한 형식을 확인했어요. 실제 계정은 생성하지 않아요.',
      validate: true,
    })
  } else if (id === 'otp') {
    heading('인증번호를 입력하세요', '이메일로 받은 6자리 번호로 계속하세요.', 'VERIFY YOUR EMAIL')
    node('input-otp', 112, { label: '인증번호', required: true, value: '' }, panel)
    node(
      'text',
      28,
      { label: '인증번호 안내', text: '미리보기 인증번호는 123456입니다.', textRole: 'caption' },
      panel,
    )
    node('button', 48, { label: '인증하기' }, panel, {
      type: 'toast',
      message: '이메일 인증이 완료됐어요.',
      validate: true,
    })
    node(
      'text',
      28,
      { label: '재전송 안내', text: '번호를 받지 못했나요?', textRole: 'caption' },
      panel,
    )
    node('button', 44, { label: '다시 보내기', variant: 'ghost' }, panel, {
      type: 'toast',
      message: '이 예제에서는 실제 메일을 보내지 않아요.',
    })
  } else if (id === 'search-filters' || id === 'dashboard') {
    if (id === 'dashboard') {
      heading(
        '프로젝트 대시보드',
        '팀의 흐름과 진행 중인 작업을 한눈에 확인하세요.',
        'MORU WORKSPACE',
      )
      const toolbar = container('대시보드 도구', panel, {
        mode: 'horizontal',
        gap: 12,
        stackOnMobile: true,
      })
      node('tabs', 48, { label: '대시보드 기간', options: ['이번 주', '이번 달'] }, toolbar)
      node('button', 48, { label: '새 프로젝트' }, toolbar, {
        type: 'dialog',
        message: '새 프로젝트 입력 모달을 연결하세요.',
      })
      const metrics = container('팀 현황', panel, {
        mode: 'horizontal',
        gap: 16,
        stackOnMobile: true,
      })
      for (const [label, value, detail] of [
        ['진행 중', '2', '현재 진행 중인 프로젝트'],
        ['완료', '1', '마무리한 프로젝트'],
        ['예정', '1', '다음에 시작할 프로젝트'],
      ]) {
        const metric = container(label, metrics, { padding: 16, gap: 8 })
        nodes[nodes.length - 1].props.variant = 'secondary'
        node('text', 28, { label, text: label, textRole: 'caption' }, metric)
        node('text', 48, { label: `${label} 수`, text: value, textRole: 'heading' }, metric)
        node('text', 36, { label: `${label} 안내`, text: detail, textRole: 'caption' }, metric)
      }
      node(
        'chart',
        280,
        {
          label: '팀 활동',
          text: '이번 주 완료한 작업',
          value: 'bar',
          options: ['월 | 12', '화 | 18', '수 | 16', '목 | 24', '금 | 21', '토 | 8', '일 | 5'],
        },
        panel,
      )
      node('text', 40, { label: '프로젝트 섹션', text: '내 프로젝트', textRole: 'heading' }, panel)
    } else {
      heading('프로젝트를 찾아보세요', '검색과 필터를 조합해 필요한 작업만 모으세요.')
    }
    node('button', 40, { label: '필터 초기화', variant: 'ghost' }, panel)
    const filters = container('검색과 진행 상태', panel, {
      mode: 'horizontal',
      gap: 12,
      stackOnMobile: true,
    })
    node('input', 96, { label: '프로젝트 검색', placeholder: '이름이나 설명으로 검색' }, filters)
    node(
      'select',
      96,
      { label: '진행 상태', options: ['모든 상태', '진행 중', '예정', '완료'], value: '모든 상태' },
      filters,
    )
    node('checkbox', 48, { label: '내가 담당한 프로젝트만', checked: false }, panel)
    node('text', 28, { label: '검색 결과 수', text: '검색 결과 4개', textRole: 'caption' }, panel)
    const results = [
      { name: '브랜드 가이드', summary: '브랜드의 공통 언어를 정리해요.', status: '진행 중' },
      { name: '제품 소개 웹사이트', summary: '새로운 제품을 소개하는 첫 화면.', status: '진행 중' },
      { name: '팀 온보딩', summary: '함께 시작하기 위한 체크리스트.', status: '예정' },
      { name: '모바일 앱 리서치', summary: '작은 화면에서 더 나은 경험을 찾아요.', status: '완료' },
    ]
    for (const result of results) {
      const row = container(result.name, panel, {
        mode: 'horizontal',
        gap: 12,
        padding: 16,
        stackOnMobile: true,
      })
      nodes[nodes.length - 1].props.variant = 'secondary'
      const copy = container(`${result.name} 내용`, row, { gap: 4 })
      node('text', 36, { label: result.name, text: result.name, textRole: 'body' }, copy)
      node(
        'text',
        40,
        { label: `${result.name} 설명`, text: result.summary, textRole: 'caption' },
        copy,
      )
      const actions = container(`${result.name} 동작`, row, {
        mode: 'horizontal',
        gap: 8,
        stackOnMobile: false,
      })
      node('badge', 32, { label: result.status, variant: 'outline' }, actions)
      node('button', 40, { label: '선택', variant: 'secondary' }, actions, {
        type: 'toast',
        message: `${result.name} 선택됨`,
      })
    }
  } else {
    heading('작업 공간 설정', '기본 정보와 팀에 필요한 알림을 정하세요.')
    node('input', 104, { label: '작업 공간 이름', value: 'Moru Studio', required: true }, panel)
    node(
      'input',
      104,
      { label: '연락 이메일', value: 'hello@moru.example', inputType: 'email', required: true },
      panel,
    )
    node(
      'select',
      96,
      {
        label: '공개 범위',
        value: '초대한 팀원만',
        options: ['초대한 팀원만', '워크스페이스 전체', '링크를 가진 누구나'],
      },
      panel,
    )
    node('text', 32, { label: '알림 설정', text: '알림 설정', textRole: 'body' }, panel)
    node(
      'switch',
      64,
      { label: '프로젝트 업데이트', text: '담당한 작업의 변경 사항을 받아요.', checked: true },
      panel,
    )
    node(
      'switch',
      64,
      { label: '주간 요약', text: '한 주의 진행 상황을 이메일로 모아봐요.', checked: false },
      panel,
    )
    const actions = container('설정 저장과 취소', panel, {
      mode: 'horizontal',
      gap: 8,
      stackOnMobile: false,
    })
    node('button', 48, { label: '변경 취소', variant: 'secondary' }, actions)
    node('button', 48, { label: '설정 저장' }, actions, {
      type: 'toast',
      message: '변경한 설정을 저장했어요.',
      validate: true,
    })
    node(
      'text',
      40,
      { label: '저장 상태', text: '모든 변경 사항을 저장했어요.', textRole: 'caption' },
      panel,
    )
  }
  const screen: SimScreen = {
    id: screenId,
    name: names[id],
    width: device === 'mobile' ? 390 : 1280,
    height: device === 'mobile' ? 844 : 800,
    layout: layout({ padding: 24, align: 'center' }),
    nodes,
  }
  return {
    project: { ...project, screens: [...project.screens, screen] },
    screenId,
    screenName: screen.name,
    selectedIds: [panel],
  }
}
