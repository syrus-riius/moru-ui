export type BlockId = 'dashboard' | 'login' | 'signup' | 'settings'
export interface BlockDefinition {
  id: BlockId
  title: string
  description: string
  category: '업무' | '인증' | '설정'
  fileName: string
  flow: readonly string[]
  components: readonly string[]
}

/** Public blocks are complete screen starting points, composed from shared primitives and patterns. */
export const BLOCKS: readonly BlockDefinition[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    description: '팀의 현황을 살펴보고, 필요한 프로젝트를 찾아 다음 작업으로 이어가세요.',
    category: '업무',
    fileName: 'DashboardBlock.tsx',
    flow: ['현황 지표', '활동 추이', '프로젝트 관리'],
    components: ['Header', 'Card', 'Chart', 'SearchFiltersBlock', 'Progress', 'Modal', 'Button'],
  },
  {
    id: 'login',
    title: '로그인',
    description: '이메일과 비밀번호를 확인하고 작업 공간으로 돌아오는 로그인 화면.',
    category: '인증',
    fileName: 'LoginBlock.tsx',
    flow: ['계정 입력', '검증', '로그인 완료'],
    components: ['Card', 'Field', 'Input', 'PasswordInput', 'Checkbox', 'Button'],
  },
  {
    id: 'signup',
    title: '회원가입',
    description: '계정 정보 입력부터 이메일 인증과 가입 완료까지 이어지는 시작 화면.',
    category: '인증',
    fileName: 'SignupBlock.tsx',
    flow: ['정보 입력', '이메일 인증', '가입 완료'],
    components: ['Card', 'Field', 'Input', 'PasswordInput', 'Checkbox', 'InputOTP', 'Button'],
  },
  {
    id: 'settings',
    title: '워크스페이스 설정',
    description: '팀의 기본 정보와 공개 범위, 알림을 한곳에서 편집하고 변경 사항을 저장하세요.',
    category: '설정',
    fileName: 'SettingsBlock.tsx',
    flow: ['기본 정보', '공개 범위·알림', '변경 저장'],
    components: ['Card', 'Field', 'Input', 'Select', 'Switch', 'Button'],
  },
]
