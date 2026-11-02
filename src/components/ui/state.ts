/** Preview states share the same visual rules as actual pointer and keyboard states. */
export type UIState = 'default' | 'hover' | 'pressed' | 'focus' | 'disabled' | 'error' | 'loading'

export const uiStateOptions: ReadonlyArray<{ value: UIState; label: string; description: string }> = [
  { value: 'default', label: '기본', description: '아직 조작하지 않은 상태' },
  { value: 'hover', label: '호버', description: '포인터를 올린 상태' },
  { value: 'pressed', label: '누름', description: '컨트롤을 누르고 있는 상태' },
  { value: 'focus', label: '포커스', description: '키보드로 선택한 상태' },
  { value: 'disabled', label: '비활성', description: '현재 사용할 수 없는 상태' },
  { value: 'error', label: '오류', description: '내용을 확인하거나 다시 시도해야 하는 상태' },
  { value: 'loading', label: '로딩', description: '작업을 처리하는 동안 기다리는 상태' },
]

export { semanticToneOptions, type SemanticTone } from '../../theme/tokens'
