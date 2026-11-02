export type MobileCoverageStatus = 'source' | 'adapter'
export type MobileCoverage = {
  id: string
  pattern: string
  swiftUI: string
  web: string
  native: string
  status: MobileCoverageStatus
  check: string
}

export const nativeCrossPlatformComponents = [
  'AppScreen', 'NavigationBar', 'NativeButton', 'IconButton', 'TextField', 'ListSection', 'ListRow',
  'SegmentedControl', 'BottomTabBar', 'MetricCard', 'Amount', 'NativeSwitch', 'NativeStepper',
  'NativeCheckbox', 'NativeRadioGroup',
  'BottomSheet', 'SwipeableRow', 'DateStrip', 'ActivityCalendar', 'ProgressRing', 'CardStack',
  'AvatarGroup', 'ActionGrid', 'PageControl', 'MobileSearchField', 'NativeActionSheet',
  'NativeChart', 'NativeSparkline',
] as const

export const nativeOSComponents = ['NativePicker', 'NativeSlider', 'NativeDatePicker'] as const
export const nativeMobileComponents = [...nativeCrossPlatformComponents, ...nativeOSComponents] as const
export type NativeMobileComponent = typeof nativeMobileComponents[number]

export const mobileCoverage: readonly MobileCoverage[] = [
  { id: 'screen', pattern: '안전 영역 · 키보드', swiftUI: 'safeAreaInset / Form', web: 'AppScreen · React Native Web', native: 'AppScreen', status: 'source', check: '노치·홈 인디케이터·키보드가 열린 상태' },
  { id: 'navigation', pattern: '상단 탐색 · 돌아가기', swiftUI: 'NavigationStack / Toolbar', web: 'NavigationBar · Expo Router 웹 탐색', native: 'NavigationBar + Expo Router', status: 'source', check: '네이티브 스택·뒤로 제스처는 Router와 연결' },
  { id: 'tabs', pattern: '하단 탭 · 플로팅 독', swiftUI: 'TabView', web: '같은 BottomTabBar 소스', native: 'BottomTabBar', status: 'source', check: '선택 상태·배지·하단 안전 영역' },
  { id: 'actions', pattern: '아이콘 동작 · 빠른 실행', swiftUI: 'Button / ControlGroup', web: '같은 NativeButton · IconButton · ActionGrid 소스', native: 'NativeButton / IconButton / ActionGrid', status: 'source', check: '48pt 조작 영역·비활성·로딩' },
  { id: 'forms', pattern: '입력 · 검색 · 설정', swiftUI: 'TextField / Toggle / Stepper', web: '같은 TextField · Switch · Checkbox · Radio 소스', native: 'TextField / MobileSearchField / NativeSwitch / NativeStepper / NativeCheckbox / NativeRadioGroup', status: 'source', check: '입력 타입·오류 안내·화면 읽기' },
  { id: 'segments', pattern: '세그먼트 선택', swiftUI: 'Picker(.segmented)', web: '같은 SegmentedControl 소스', native: 'SegmentedControl', status: 'source', check: '선택값과 콘텐츠 동기화' },
  { id: 'list', pattern: '섹션 목록 · 거래 내역', swiftUI: 'List / Section', web: '같은 ListSection · ListRow 소스', native: 'ListSection / ListRow', status: 'source', check: '긴 목록은 FlatList로 가상화' },
  { id: 'swipe', pattern: '밀어서 작업 보기', swiftUI: 'swipeActions', web: '같은 SwipeableRow · 작업 보기 버튼', native: 'SwipeableRow', status: 'source', check: '가로 드래그와 세로 스크롤 충돌·명시적 작업 버튼' },
  { id: 'sheet', pattern: '하단 시트 · 작업 선택', swiftUI: 'sheet / confirmationDialog', web: '같은 BottomSheet · NativeActionSheet 소스', native: 'BottomSheet / NativeActionSheet', status: 'source', check: '높이 단계·닫기·Android 뒤로 버튼·포커스' },
  { id: 'cards', pattern: '겹친 카드 · 금액', swiftUI: 'ZStack / Text', web: '같은 CardStack · Amount · MetricCard 소스', native: 'CardStack / Amount / MetricCard', status: 'source', check: '카드 선택·금액 가리기·큰 글꼴' },
  { id: 'activity', pattern: '날짜 스트립 · 활동 달력', swiftUI: 'ScrollView / LazyVGrid', web: '같은 DateStrip · ActivityCalendar 소스', native: 'DateStrip / ActivityCalendar', status: 'source', check: '월 경계·윤년·날짜별 활동 안내' },
  { id: 'progress', pattern: '진행 링 · 팀원 · 페이지 점', swiftUI: 'Gauge / ProgressView', web: '같은 ProgressRing · AvatarGroup · PageControl 소스', native: 'ProgressRing / AvatarGroup / PageControl', status: 'source', check: '값 범위·접근성 값·대체 텍스트' },
  { id: 'system-input', pattern: 'OS 선택 · 날짜 · 범위', swiftUI: 'Picker / DatePicker / Slider', web: 'Universal 웹 구현 또는 명시한 웹 대체', native: 'NativePicker / NativeSlider / NativeDatePicker · @moru/native/expo', status: 'source', check: '웹 컨트롤과 OS 선택기의 외형·키보드·지역 설정은 기기에서 비교' },
  { id: 'system-menu', pattern: 'OS 메뉴 · 컨텍스트 메뉴', swiftUI: 'Menu / ContextMenu', web: '웹 메뉴 구현 가능 · 공통 어댑터 미연결', native: '@expo/ui 메뉴 어댑터', status: 'adapter', check: 'Apple·Android의 메뉴 동작과 접근성을 각각 연결' },
  { id: 'chart', pattern: '기본 차트 · 스파크라인', swiftUI: 'Charts', web: '같은 NativeChart · NativeSparkline 소스', native: 'NativeChart / NativeSparkline · React Native SVG', status: 'source', check: '막대·선·영역·도넛과 데이터 읽기. 확대·드래그 툴팁은 별도 확장' },
  { id: 'device', pattern: '사진 · 알림 · 햅틱', swiftUI: 'PhotosPicker / sensoryFeedback', web: '기능별 웹 API 지원·권한 차이 · 미연결', native: 'Expo 기기 API 연결', status: 'adapter', check: '권한·취소·오류를 실제 기기에서 검증' },
] as const

export const mobileReferencePatterns = [
  { title: '탐색과 조작', description: '플로팅 하단 바, 선택 강조, 가운데 추가 버튼, 상단 툴바' },
  { title: '정보의 계층', description: '잔액·지표, 겹친 카드, 빠른 동작, 섹션 목록과 팀원' },
  { title: '화면의 전환', description: '목록에서 상세로, 하단 시트에서 생성·수정하는 흐름' },
  { title: '활동의 리듬', description: '날짜 스트립, 활동 달력, 진행 링과 기간 선택' },
] as const


export type NativeExampleScreen = 'wallet' | 'tasks' | 'activity' | 'controls' | 'details' | 'system-tabs'
export type NativeComponentSource = {
  name: NativeMobileComponent
  entryPoint: '@moru/native' | '@moru/native/expo'
  sourceFile: string
  examples: readonly NativeExampleScreen[]
  /** A browser implementation can exercise the source without reproducing an OS view. */
  browserImplementation: 'shared' | 'adapted'
  browserSourceFile?: string
  deviceVerification: 'pending'
}

const nativeSource = (name: NativeMobileComponent, file: 'core' | 'patterns' | 'chart' | 'expo', examples: readonly NativeExampleScreen[]): NativeComponentSource => ({
  name, entryPoint: file === 'expo' ? '@moru/native/expo' : '@moru/native',
  sourceFile: `packages/moru-native/src/${file}.tsx`, examples,
  browserImplementation: name === 'NativeDatePicker' ? 'adapted' : 'shared', deviceVerification: 'pending',
  ...(name === 'NativeDatePicker' ? { browserSourceFile: 'apps/moru-expo/src/components/BrowserDatePicker.tsx' } : {}),
})

/** Component count describes exports; the screen mapping describes which source a real example imports. */
export const nativeComponentSources: readonly NativeComponentSource[] = [
  nativeSource('AppScreen', 'core', ['wallet', 'tasks', 'activity', 'controls', 'details']),
  nativeSource('NavigationBar', 'core', ['wallet', 'tasks', 'activity', 'controls', 'details']),
  nativeSource('NativeButton', 'core', ['wallet', 'tasks', 'activity', 'controls', 'details', 'system-tabs']),
  nativeSource('IconButton', 'core', ['wallet', 'tasks', 'activity']),
  nativeSource('TextField', 'core', ['wallet', 'tasks', 'details']),
  nativeSource('ListSection', 'core', ['system-tabs', 'details']),
  nativeSource('ListRow', 'core', ['wallet', 'tasks', 'details', 'system-tabs']),
  nativeSource('SegmentedControl', 'core', ['wallet', 'tasks', 'activity']),
  nativeSource('BottomTabBar', 'core', ['wallet', 'tasks', 'activity']),
  nativeSource('MetricCard', 'core', ['wallet', 'activity', 'system-tabs']),
  nativeSource('Amount', 'core', ['wallet', 'details']),
  nativeSource('NativeSwitch', 'core', ['controls']),
  nativeSource('NativeStepper', 'core', ['controls']),
  nativeSource('NativeCheckbox', 'core', ['tasks', 'controls', 'details']),
  nativeSource('NativeRadioGroup', 'core', ['controls']),
  nativeSource('BottomSheet', 'patterns', ['wallet', 'tasks', 'controls']),
  nativeSource('SwipeableRow', 'patterns', ['wallet']),
  nativeSource('DateStrip', 'patterns', ['tasks']),
  nativeSource('ActivityCalendar', 'patterns', ['activity']),
  nativeSource('ProgressRing', 'patterns', ['activity']),
  nativeSource('CardStack', 'patterns', ['wallet']),
  nativeSource('AvatarGroup', 'patterns', ['tasks']),
  nativeSource('ActionGrid', 'patterns', ['wallet']),
  nativeSource('PageControl', 'patterns', ['wallet']),
  nativeSource('MobileSearchField', 'patterns', ['wallet']),
  nativeSource('NativeActionSheet', 'patterns', ['controls']),
  nativeSource('NativeChart', 'chart', ['activity']),
  nativeSource('NativeSparkline', 'chart', ['wallet']),
  nativeSource('NativePicker', 'expo', ['controls']),
  nativeSource('NativeSlider', 'expo', ['controls']),
  nativeSource('NativeDatePicker', 'expo', ['controls']),
]

export type NativePlatformCapability = {
  id: string
  name: string
  group: 'pattern' | 'system' | 'device'
  scope: 'shared' | 'platform-specific' | 'native-only'
  web: string
  ios: string
  android: string
  implementationStatus: 'implemented' | 'pending'
  componentNames: readonly NativeMobileComponent[]
  sourceFiles: readonly string[]
  verificationNote: string
  docs: readonly { label: string; url: string }[]
}

/** Platform availability and Moru implementation status are separate facts. No entry certifies device QA. */
export const nativePlatformCapabilities: readonly NativePlatformCapability[] = [
  {
    id: 'shared-controls', name: '버튼 · 입력 · 목록 · 카드 · 차트', group: 'pattern', scope: 'shared',
    web: 'React Native Web으로 같은 Moru 소스를 실행', ios: 'React Native 뷰와 컨트롤', android: 'React Native 뷰와 컨트롤',
    implementationStatus: 'implemented', componentNames: ['NativeButton', 'TextField', 'ListRow', 'MetricCard', 'NativeChart', 'NativeSparkline'],
    sourceFiles: ['packages/moru-native/src/core.tsx', 'packages/moru-native/src/chart.tsx'],
    verificationNote: '소스를 공유해도 글꼴 확대·포커스·스크린 리더 동작은 각 플랫폼에서 확인해야 합니다.',
    docs: [{ label: 'Expo 웹과 코드 공유', url: 'https://docs.expo.dev/workflow/web/' }],
  },
  {
    id: 'touch-patterns', name: '스와이프 행 · 하단 시트 · 당겨서 새로고침', group: 'pattern', scope: 'platform-specific',
    web: '같은 시트·스와이프 소스와 명시적 작업 버튼을 확인. 당겨서 새로고침의 OS 감각은 재현하지 않음',
    ios: '터치 제스처·시트 높이 단계·목록 새로고침', android: '터치 제스처·시트·뒤로 버튼·목록 새로고침',
    implementationStatus: 'implemented', componentNames: ['SwipeableRow', 'BottomSheet', 'NativeActionSheet', 'AppScreen'],
    sourceFiles: ['packages/moru-native/src/patterns.tsx', 'packages/moru-native/src/core.tsx'],
    verificationNote: '세로 스크롤과 가로 스와이프 충돌, 시트 안 입력, 새로고침은 기기 검증이 남아 있습니다.',
    docs: [{ label: 'React Native RefreshControl', url: 'https://reactnative.dev/docs/refreshcontrol' }],
  },
  {
    id: 'native-navigation', name: '기기 OS 탭 바 · 뒤로가기 제스처', group: 'system', scope: 'native-only',
    web: '같은 NativeTabs API의 웹 렌더러와 브라우저 탐색. 기기 OS 탭 바의 실제 외형은 표시하지 않음',
    ios: 'Expo Router NativeTabs·스택 뒤로가기', android: 'Expo Router NativeTabs·시스템 뒤로가기',
    implementationStatus: 'implemented', componentNames: ['NavigationBar', 'BottomTabBar'],
    sourceFiles: ['apps/moru-expo/src/app/_layout.tsx', 'apps/moru-expo/src/app/system-tabs/_layout.tsx'],
    verificationNote: 'Moru의 맞춤 BottomTabBar와 OS NativeTabs는 별도 구현입니다. 시스템 탭·뒤로 제스처는 기기에서 확인합니다.',
    docs: [{ label: 'Expo Native tabs의 웹 레이아웃', url: 'https://docs.expo.dev/router/advanced/native-tabs/' }],
  },
  {
    id: 'safe-area-keyboard', name: '안전 영역 · 소프트 키보드 회피', group: 'system', scope: 'platform-specific',
    web: '폰 테두리는 목업. 브라우저/CSS 안전 영역과 기기 키보드의 동작 차이가 있음',
    ios: 'SafeAreaView·KeyboardAvoidingView', android: 'SafeAreaView·키보드 리사이즈와 뒤로 버튼',
    implementationStatus: 'implemented', componentNames: ['AppScreen', 'BottomSheet'],
    sourceFiles: ['packages/moru-native/src/core.tsx', 'packages/moru-native/src/patterns.tsx'],
    verificationNote: 'Expo Router 웹의 safe-area hook 측정값은 0입니다. 노치·홈 인디케이터·IME 가림은 실제 기기로 확인합니다.',
    docs: [{ label: 'Expo 안전 영역의 플랫폼 차이', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/safe-area-context/' }, { label: 'KeyboardAvoidingView', url: 'https://reactnative.dev/docs/keyboardavoidingview' }],
  },
  {
    id: 'system-pickers', name: '시스템 Picker · Slider · 날짜 선택', group: 'system', scope: 'platform-specific',
    web: 'Picker·Slider는 같은 Universal API의 웹 렌더러. 날짜 선택은 명시한 브라우저 대체',
    ios: 'Expo UI를 통한 SwiftUI 계열 컨트롤', android: 'Expo UI를 통한 Compose 계열 컨트롤',
    implementationStatus: 'implemented', componentNames: ['NativePicker', 'NativeSlider', 'NativeDatePicker'],
    sourceFiles: ['packages/moru-native/src/expo.tsx', 'apps/moru-expo/src/app/controls.tsx'],
    verificationNote: '현재 설치본의 Picker·Slider는 웹 구현이 있고 DatePicker는 웹 대체가 필요합니다. OS 외형·언어·날짜 형식은 기기 확인이 남아 있습니다.',
    docs: [{ label: 'Expo UI 플랫폼 지원', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/ui/' }],
  },
  {
    id: 'system-menu', name: 'OS 메뉴 · 컨텍스트 메뉴', group: 'system', scope: 'platform-specific',
    web: '웹 메뉴로 구성 가능', ios: 'SwiftUI 메뉴·길게 누르기 메뉴 연결 대상', android: 'Compose 메뉴·길게 누르기 메뉴 연결 대상',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: '기존 Moru 웹 메뉴는 있지만 모바일 공통 메뉴 어댑터는 아직 연결하지 않았습니다.',
    docs: [{ label: 'Expo UI', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/ui/' }],
  },
  {
    id: 'photos-camera', name: '사진 선택 · 카메라', group: 'device', scope: 'platform-specific',
    web: '지원 브라우저에서 파일 선택·카메라 사용 가능. 사용자 동작·권한·보안 환경 필요',
    ios: '사진 보관함·카메라 권한과 선택 UI', android: '시스템 사진 선택·카메라 권한과 선택 UI',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: '모바일 전용으로 분류하지 않습니다. Moru에는 아직 기기 연결이 없으며 허용·거절·취소·파일 수명 처리가 필요합니다.',
    docs: [{ label: 'Expo ImagePicker', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/' }, { label: 'Expo Camera', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/camera/' }],
  },
  {
    id: 'document-picker', name: '문서 선택 · 첨부', group: 'device', scope: 'shared',
    web: '사용자 클릭으로 브라우저 파일 선택 가능', ios: '시스템 문서 선택기', android: '시스템 문서 선택기',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: '화면상의 첨부 예제와 실제 파일 선택·보관·업로드는 다릅니다. 취소·크기 제한·재접근 처리를 연결해야 합니다.',
    docs: [{ label: 'Expo DocumentPicker', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/document-picker/' }],
  },
  {
    id: 'share-sheet', name: 'OS 공유 시트', group: 'device', scope: 'platform-specific',
    web: 'Web Share 지원 여부·HTTPS 확인 필요. 로컬 파일 URI 공유는 네이티브와 다름',
    ios: '시스템 공유 시트·iPad 표시 위치', android: '시스템 공유 대상 선택',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: '공유 UI를 그리는 것과 다른 앱으로 실제 데이터를 전달하는 기능을 구분합니다. 현재 외부 전송은 연결하지 않았습니다.',
    docs: [{ label: 'Expo Sharing의 웹 제한', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/sharing/' }],
  },
  {
    id: 'haptics', name: '햅틱 · 진동 피드백', group: 'device', scope: 'platform-specific',
    web: 'Vibration API를 지원하는 브라우저·하드웨어에서만 가능', ios: 'Taptic Engine·기기 설정에 따라 동작', android: '시스템 진동 효과·하드웨어에 따라 동작',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: '웹에서도 조건부 지원하지만 iOS 햅틱과 같은 효과를 보장하지 않습니다. 기기 상태·무음·저전력 등을 확인해야 합니다.',
    docs: [{ label: 'Expo Haptics', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/haptics/' }],
  },
  {
    id: 'notifications', name: '로컬 · 푸시 알림', group: 'device', scope: 'platform-specific',
    web: '별도의 웹 알림·웹 푸시 구현과 브라우저 권한 필요', ios: 'Expo Notifications·권한·토큰·개발 빌드 확인', android: 'Expo Notifications·권한·채널·토큰·개발 빌드 확인',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: '앱 안의 알림 메시지·Toast는 OS 알림이 아닙니다. 수신·예약·앱 상태·알림 탭 후 이동은 미연결입니다.',
    docs: [{ label: 'Expo Notifications', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/notifications/' }],
  },
  {
    id: 'maps', name: '지도 · 위치 기반 화면', group: 'device', scope: 'platform-specific',
    web: '별도 웹 지도 SDK·위치 권한으로 구현 가능', ios: 'Expo Maps의 Apple Maps 연결 대상', android: 'Expo Maps의 Google Maps 연결 대상',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: 'Expo Maps와 웹 지도는 구현을 나눕니다. 지도 SDK 설정·위치 권한·위치 없음·실패 상태는 아직 연결하지 않았습니다.',
    docs: [{ label: 'Expo Maps', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/maps/' }],
  },
  {
    id: 'biometrics', name: 'Face ID · Touch ID · 기기 생체 인증', group: 'device', scope: 'native-only',
    web: 'Expo LocalAuthentication 미지원. 웹 인증은 Passkey 등 별도 설계', ios: 'Expo LocalAuthentication·등록된 생체 정보·기기 인증', android: 'Expo LocalAuthentication·기기 생체 인증',
    implementationStatus: 'pending', componentNames: [], sourceFiles: [],
    verificationNote: 'Moru 인증 UI와 실제 인증 보장은 별개입니다. 생체 정보 직접 수집 없이 OS 결과를 처리해야 하며 현재 미연결입니다.',
    docs: [{ label: 'Expo LocalAuthentication', url: 'https://docs.expo.dev/versions/v58.0.0/sdk/local-authentication/' }],
  },
]
