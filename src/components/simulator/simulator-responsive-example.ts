import { createBlankScreen, createSimNode } from './simulator-model'
import { DEFAULT_SIM_LAYOUT } from './simulator-layout'
import type { SimAction, SimLayout, SimNode, SimNodeType, SimProject, SimProps } from './simulator-types'

function layout(patch: Partial<SimLayout> = {}): SimLayout {
  return { ...DEFAULT_SIM_LAYOUT, padding: 0, ...patch }
}

function node(id: string, type: SimNodeType, props: Partial<SimProps>, height: number, parentId?: string, action: Partial<SimAction> = {}): SimNode {
  const base = createSimNode(type, id, 0, 0)
  return {
    ...base, width: 320, height, ...(parentId ? { parentId } : {}),
    props: { ...base.props, ...props }, action: { ...base.action, ...action },
    layoutItem: { width: 'fill', height: 'fixed' },
  }
}

function copy(id: string, text: string, role: SimProps['textRole'], height: number, parentId?: string): SimNode {
  return node(id, 'text', { label: text, text, textRole: role }, height, parentId)
}

function container(id: string, label: string, settings: Partial<SimLayout>, parentId?: string, surface = false): SimNode {
  return {
    ...node(id, 'container', { label, variant: surface ? 'secondary' : 'ghost' }, 120, parentId),
    layout: layout(settings), layoutItem: { width: 'fill', height: 'hug' },
  }
}

/** A real simulator document: every visible item stays selectable and editable. */
export function createResponsiveExampleProject(): SimProject {
  const dashboard = createBlankScreen('pocket-home', '월간 가계부')
  dashboard.layout = layout({ gap: 24, padding: 24 })
  dashboard.nodes = [
    container('pocket-header', '앱 헤더', { mode: 'horizontal', gap: 12, align: 'center', stackOnMobile: false }),
    { ...node('pocket-profile', 'avatar', { label: '모루' }, 48, 'pocket-header'), width: 48, layoutItem: { width: 'fixed', height: 'fixed' } },
    container('pocket-greeting', '인사말', { gap: 0 }, 'pocket-header'),
    copy('pocket-wordmark', 'MORU POCKET', 'body', 26, 'pocket-greeting'),
    copy('pocket-subtitle', '나의 돈, 나다운 계획.', 'caption', 20, 'pocket-greeting'),

    container('pocket-intro', '월간 요약 제목', { gap: 8 }),
    copy('pocket-title', '좋은 습관이 쌓이는 한 달', 'heading', 40, 'pocket-intro'),
    copy('pocket-description', '10월의 지출과 저축 목표를 한눈에 확인하세요.', 'caption', 40, 'pocket-intro'),

    container('pocket-summary', '잔액 요약 그리드', { mode: 'grid', gap: 12, columns: 3, tabletColumns: 2, mobileColumns: 1 }),
    container('pocket-balance', '사용 가능한 잔액', { gap: 6, padding: 16 }, 'pocket-summary', true),
    copy('pocket-balance-label', '사용 가능한 잔액', 'caption', 20, 'pocket-balance'),
    copy('pocket-balance-value', '₩2,480,000', 'heading', 40, 'pocket-balance'),
    container('pocket-spend', '이번 달 지출', { gap: 6, padding: 16 }, 'pocket-summary', true),
    copy('pocket-spend-label', '이번 달 지출', 'caption', 20, 'pocket-spend'),
    copy('pocket-spend-value', '₩864,000', 'heading', 40, 'pocket-spend'),
    container('pocket-saving', '저축 목표 달성률', { gap: 6, padding: 16 }, 'pocket-summary', true),
    copy('pocket-saving-label', '저축 목표 달성률', 'caption', 20, 'pocket-saving'),
    copy('pocket-saving-value', '64%', 'heading', 40, 'pocket-saving'),

    container('pocket-content', '지출과 거래 내역', { mode: 'horizontal', gap: 16, align: 'start', stackOnMobile: true }),
    node('pocket-chart', 'chart', { label: '이번 주 지출', text: '주간 지출 · 단위: 원', value: 'bar', options: ['월 | 18000', '화 | 32000', '수 | 24000', '목 | 48000', '금 | 28000', '토 | 56000', '일 | 16000'] }, 304, 'pocket-content'),
    container('pocket-activity', '최근 거래 영역', { gap: 12 }, 'pocket-content'),
    copy('pocket-activity-title', '최근 거래', 'body', 28, 'pocket-activity'),
    node('pocket-transactions', 'list', { label: '최근 거래 목록', options: ['동네 카페 | 오늘 · 식비 · −₩6,000', '주간 장보기 | 어제 · 생활 · −₩42,000', '급여 입금 | 10월 25일 · 수입 · +₩3,200,000'] }, 218, 'pocket-activity', { type: 'navigate', targetScreenId: 'pocket-budget' }),
    node('pocket-all-activity', 'button', { label: '예산과 저축 목표 보기', variant: 'secondary' }, 44, 'pocket-activity', { type: 'navigate', targetScreenId: 'pocket-budget' }),
  ]

  const budget = createBlankScreen('pocket-budget', '예산과 저축 목표')
  budget.layout = layout({ gap: 20, padding: 24 })
  budget.nodes = [
    { ...node('pocket-budget-back', 'button', { label: '← 가계부로', variant: 'ghost' }, 44, undefined, { type: 'back' }), width: 144, layoutItem: { width: 'fixed', height: 'fixed' } },
    container('pocket-budget-intro', '예산 제목', { gap: 8 }),
    copy('pocket-budget-title', '조금씩, 원하는 곳으로', 'heading', 40, 'pocket-budget-intro'),
    copy('pocket-budget-description', '남은 예산을 확인하고 다음 목표를 준비해요.', 'caption', 40, 'pocket-budget-intro'),
    container('pocket-goals', '저축 목표 그리드', { mode: 'grid', gap: 12, columns: 3, tabletColumns: 2, mobileColumns: 1 }),
    node('pocket-goal-travel', 'card', { label: '다음 여행', text: '₩3,200,000 / ₩5,000,000 · 64% 달성' }, 136, 'pocket-goals', { type: 'toast', message: '다음 여행 목표를 확인했어요. 조금씩 저축을 이어가요.' }),
    node('pocket-goal-emergency', 'card', { label: '든든한 비상금', text: '₩4,500,000 / ₩10,000,000 · 45% 달성' }, 136, 'pocket-goals', { type: 'toast', message: '비상금 목표를 확인했어요.' }),
    node('pocket-goal-desk', 'card', { label: '나만의 작업실', text: '₩900,000 / ₩1,500,000 · 60% 달성' }, 136, 'pocket-goals', { type: 'toast', message: '작업실 목표를 확인했어요.' }),
    container('pocket-budget-content', '예산 상세 영역', { mode: 'horizontal', gap: 16, align: 'start', stackOnMobile: true }),
    node('pocket-budget-chart', 'chart', { label: '어디에 쓰고 있을까요?', text: '이번 달 지출 비중', value: 'donut', options: ['생활 | 360000', '식비 | 240000', '교통 | 96000', '여가 | 168000'] }, 304, 'pocket-budget-content'),
    container('pocket-budget-settings', '예산 알림 설정', { gap: 16 }, 'pocket-budget-content'),
    node('pocket-budget-remaining', 'card', { label: '이번 달 남은 예산 ₩336,000', text: '목표 예산 ₩1,200,000의 72%를 사용했어요.' }, 120, 'pocket-budget-settings'),
    node('pocket-budget-notification', 'switch', { label: '예산 알림 받기', text: '예산의 80%를 사용하면 알려드려요.', checked: true }, 68, 'pocket-budget-settings'),
    node('pocket-budget-save', 'button', { label: '알림 설정 저장' }, 48, 'pocket-budget-settings', { type: 'toast', message: '예산 알림 설정을 저장했어요. 이 예제에서는 현재 실행 중에만 반영됩니다.' }),
  ]

  return { schemaVersion: 1, name: 'Moru Pocket · 반응형 가계부', startScreenId: dashboard.id, style: 'moru', screens: [dashboard, budget] }
}
