export type BlockId = 'login' | 'otp' | 'search-filters' | 'settings'
export interface BlockDefinition {
  id: BlockId
  title: string
  description: string
  category: '인증' | '탐색' | '설정'
  components: readonly string[]
}

export const BLOCKS: readonly BlockDefinition[] = [
  { id: 'login', title: '로그인', description: '이메일과 비밀번호 입력부터 검증·처리 상태까지, 다시 방문한 사용자를 위한 시작점.', category: '인증', components: ['Card', 'Field', 'Input', 'PasswordInput', 'Checkbox', 'Button'] },
  { id: 'otp', title: 'OTP 인증', description: '6자리 인증번호 입력, 오류 피드백과 재전송을 하나의 흐름으로.', category: '인증', components: ['Card', 'Field', 'InputOTP', 'Button'] },
  { id: 'search-filters', title: '검색 필터', description: '검색어·진행 상태·담당자 필터를 조합하고 결과와 빈 상태를 확인하세요.', category: '탐색', components: ['Card', 'Field', 'Input', 'Select', 'Checkbox', 'Badge', 'Button'] },
  { id: 'settings', title: '설정 폼', description: '기본 정보와 공개 범위, 알림 설정을 편집하고 저장하거나 되돌리세요.', category: '설정', components: ['Card', 'Field', 'Input', 'Select', 'Switch', 'Button'] },
]

