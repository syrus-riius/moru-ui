import { controlsComponents, controlsAliases, controlsSnippets } from './completion-controls-catalog'
import { navigationComponents, navigationAliases, navigationSnippets } from './completion-navigation-catalog'
import { contentComponents, contentAliases, contentSnippets } from './completion-content-catalog'
import { dataComponents, dataAliases, dataSnippets } from './completion-data-catalog'
import { enhancedInputComponents, enhancedInputAliases, enhancedInputSnippets } from './enhanced-inputs-catalog'
import { workflowPatternComponents, workflowPatternAliases, workflowPatternSnippets } from './workflow-patterns-catalog'
import { dateRangeComponents, dateRangeAliases, dateRangeSnippets } from './date-range-catalog'
import { timeControlComponents, timeControlAliases, timeControlSnippets } from './time-controls-catalog'

export type Category = 'all' | 'forms' | 'interaction' | 'layout' | 'feedback'

export const components = [
  { id: 'button', name: 'Button', subtitle: '동작과 우선순위', category: 'interaction', generation: 'core' },
  { id: 'field', name: 'Field', subtitle: '라벨·도움말·오류', category: 'forms', generation: 'core' },
  { id: 'input', name: 'Input', subtitle: '한 줄 입력', category: 'forms', generation: 'core' },
  { id: 'textarea', name: 'Textarea', subtitle: '여러 줄 입력', category: 'forms', generation: 'core' },
  { id: 'checkbox', name: 'Checkbox', subtitle: '다중 선택', category: 'forms', generation: 'core' },
  { id: 'select', name: 'Select', subtitle: '선택 목록', category: 'forms', generation: 'core' },
  { id: 'dialog', name: 'Dialog', subtitle: '집중된 대화', category: 'interaction', generation: 'core' },
  { id: 'menu', name: 'Dropdown Menu', subtitle: '관련 동작', category: 'interaction', generation: 'core' },
  { id: 'tabs', name: 'Tabs', subtitle: '콘텐츠 전환', category: 'layout', generation: 'core' },
  { id: 'card', name: 'Card', subtitle: '콘텐츠 묶음', category: 'layout', generation: 'core' },
  { id: 'switch', name: 'Switch', subtitle: '설정 켜고 끄기', category: 'forms', generation: 'foundation' },
  { id: 'radio-group', name: 'Radio Group', subtitle: '하나의 옵션 선택', category: 'forms', generation: 'foundation' },
  { id: 'slider', name: 'Slider', subtitle: '범위 안의 값 조절', category: 'forms', generation: 'foundation' },
  { id: 'accordion', name: 'Accordion', subtitle: '차례로 펼치는 정보', category: 'interaction', generation: 'foundation' },
  { id: 'popover', name: 'Popover', subtitle: '맥락 안에서 빠른 설정', category: 'interaction', generation: 'foundation' },
  { id: 'tooltip', name: 'Tooltip', subtitle: '짧은 보충 설명', category: 'interaction', generation: 'foundation' },
  { id: 'badge', name: 'Badge', subtitle: '작은 상태와 분류', category: 'feedback', generation: 'foundation' },
  { id: 'alert', name: 'Alert', subtitle: '놓치지 않아야 할 안내', category: 'feedback', generation: 'foundation' },
  { id: 'avatar', name: 'Avatar', subtitle: '사람과 팀의 표시', category: 'layout', generation: 'foundation' },
  { id: 'progress', name: 'Progress', subtitle: '작업의 진행 상황', category: 'feedback', generation: 'foundation' },
  { id: 'separator', name: 'Separator', subtitle: '콘텐츠 사이의 구분', category: 'layout', generation: 'foundation' },
  { id: 'skeleton', name: 'Skeleton', subtitle: '기다리는 동안의 윤곽', category: 'feedback', generation: 'foundation' },
  { id: 'toast', name: 'Toast', subtitle: '결과 알림과 실행 취소', category: 'feedback', generation: 'advanced' },
  { id: 'combobox', name: 'Combobox', subtitle: '검색해서 고르는 목록', category: 'forms', generation: 'advanced' },
  { id: 'alert-dialog', name: 'Alert Dialog', subtitle: '중요한 동작 전 확인', category: 'interaction', generation: 'advanced' },
  { id: 'sheet', name: 'Sheet', subtitle: '맥락을 유지하는 편집 패널', category: 'interaction', generation: 'advanced' },
  { id: 'empty', name: 'Empty', subtitle: '빈 화면의 다음 행동', category: 'feedback', generation: 'advanced' },
  { id: 'table', name: 'Table', subtitle: '비교하고 관리하는 데이터', category: 'layout', generation: 'advanced' },
  { id: 'pagination', name: 'Pagination', subtitle: '긴 목록의 페이지 이동', category: 'layout', generation: 'advanced' },
  { id: 'calendar', name: 'Calendar', subtitle: '기본·미니멀·일정·활동 달력', category: 'forms', generation: 'advanced' },
  { id: 'date-picker', name: 'Date Picker', subtitle: '필드에서 날짜 선택', category: 'forms', generation: 'advanced' },
  { id: 'command', name: 'Command', subtitle: '빠르게 찾고 실행하기', category: 'interaction', generation: 'advanced' },
  { id: 'toggle-group', name: 'Toggle Group', subtitle: '보기와 옵션 전환', category: 'forms', generation: 'advanced' },
  ...controlsComponents,
  ...navigationComponents,
  ...dataComponents,
  ...contentComponents,
  ...enhancedInputComponents,
  ...workflowPatternComponents,
  { id: 'file-input', name: 'File Input', subtitle: '실제 파일 선택과 형식·크기 검증', category: 'forms', generation: 'completion' },
  ...dateRangeComponents,
  ...timeControlComponents,
] as const

export type ComponentId = (typeof components)[number]['id']
export type AddedComponentId = Extract<(typeof components)[number], { generation: 'foundation' }>['id']
export type AdvancedComponentId = Extract<(typeof components)[number], { generation: 'advanced' }>['id']
export type CompletionComponentId = Extract<(typeof components)[number], { generation: 'completion' }>['id']
export const addedComponentCount = components.filter((item) => item.generation === 'completion').length

export const categoryItems: { id: Category; label: string }[] = [
  { id: 'all', label: '전체' }, { id: 'forms', label: '폼' },
  { id: 'interaction', label: '인터랙션' }, { id: 'layout', label: '레이아웃' },
  { id: 'feedback', label: '피드백' },
]

export const componentAliases: Record<ComponentId, string> = {
  button: '버튼', field: '필드 라벨 폼', input: '인풋 입력 검색', textarea: '텍스트에어리어 텍스트 영역',
  checkbox: '체크박스 체크 박스', select: '셀렉트 드롭다운', dialog: '다이얼로그 모달', menu: '메뉴 드롭다운 dropdown menu',
  tabs: '탭', card: '카드', switch: '스위치 토글', 'radio-group': '라디오 라디오그룹 라디오 그룹',
  slider: '슬라이더', accordion: '아코디언 접기 펼치기', popover: '팝오버', tooltip: '툴팁 도움말',
  badge: '배지 뱃지', alert: '알림 경고 안내', avatar: '아바타 프로필', progress: '진행률 프로그레스',
  separator: '구분선 세퍼레이터', skeleton: '스켈레톤 로딩',
  toast: '토스트 알림 실행취소', combobox: '콤보박스 검색 선택', 'alert-dialog': '알림대화상자 삭제 확인',
  sheet: '시트 드로어 패널', empty: '빈 상태 없음', table: '테이블 표', pagination: '페이지네이션 페이지 이동',
  calendar: '캘린더 달력 일정', 'date-picker': '데이트피커 날짜 선택', command: '커맨드 명령 검색 팔레트',
  'toggle-group': '토글 그룹 전환',
  ...controlsAliases, ...navigationAliases, ...dataAliases, ...contentAliases,
  ...enhancedInputAliases, ...workflowPatternAliases,
  ...dateRangeAliases, ...timeControlAliases,
  'file-input': '파일 인풋 업로드 첨부 선택 형식 크기 검증',
}

export function filterComponents(category: Category, query: string, newOnly = false) {
  const search = query.trim().toLocaleLowerCase().replace(/[\s-]+/g, '')
  return components.filter((item) =>
    (!newOnly || item.generation === 'completion') && (category === 'all' || item.category === category) &&
    `${item.id}${item.name}${item.subtitle}${componentAliases[item.id]}`.toLocaleLowerCase().replace(/[\s-]+/g, '').includes(search),
  )
}

export const snippets: Record<ComponentId, string> = {
  ...controlsSnippets, ...navigationSnippets, ...dataSnippets, ...contentSnippets,
  ...enhancedInputSnippets, ...workflowPatternSnippets,
  ...dateRangeSnippets, ...timeControlSnippets,
  'file-input': '<Field label="프로젝트 문서" description="PDF · 최대 5MB, 3개까지">\n  <FileInput name="brief" accept=".pdf" multiple\n    maxSize={5 * 1024 * 1024} maxFiles={3}\n    onFilesChange={setFiles} />\n</Field>\n{/* 선택한 File을 실제 업로드할 때는 서버에서도 검증하세요. */}',
  toast: 'const { toast } = useToast()\n\n<Button onClick={() => toast({\n  title: "변경 사항을 저장했어요.",\n  tone: "success",\n})}>저장하기</Button>\n\n{/* 앱을 ToastProvider로 감싸세요. */}',
  combobox: '<Combobox\n  aria-label="프로젝트 담당자"\n  placeholder="이름으로 검색"\n  items={[\n    { value: "minji", label: "민지" },\n    { value: "suhyeon", label: "수현" },\n  ]}\n/>',
  'alert-dialog': '<AlertDialog\n  trigger={<Button variant="danger">삭제하기</Button>}\n  title="프로젝트를 삭제할까요?"\n  description="이 동작을 진행할지 확인해 주세요."\n  confirmLabel="삭제하기"\n  destructive\n  onConfirm={() => removeProject()}\n/>',
  sheet: '<Sheet\n  title="프로젝트 편집"\n  description="작업 중인 내용을 확인하세요."\n  trigger={<Button variant="secondary">상세 보기</Button>}\n>\n  <Field label="이름"><Input defaultValue="Moru Studio" /></Field>\n</Sheet>',
  empty: '<Empty\n  title="아직 프로젝트가 없어요."\n  description="첫 번째 아이디어를 시작해 보세요."\n>\n  <Button>프로젝트 만들기</Button>\n</Empty>',
  table: '<Table aria-label="팀원 목록">\n  <TableHeader><TableRow>\n    <TableHead scope="col">이름</TableHead>\n    <TableHead scope="col">역할</TableHead>\n  </TableRow></TableHeader>\n  <TableBody><TableRow>\n    <TableCell>민지</TableCell>\n    <TableCell>디자이너</TableCell>\n  </TableRow></TableBody>\n</Table>',
  pagination: '<Pagination\n  page={page}\n  pageCount={8}\n  onPageChange={setPage}\n/>',
  calendar: '<Calendar variant="schedule"\n  value={date} onValueChange={setDate}\n  dayShape="rounded" size="md" weekStartsOn={1}\n  showOutsideDays={false} fixedWeeks={false}\n  dayData={{\n    "2026-10-28": { label: "디자인 리뷰", count: 2, tone: "accent" },\n  }}\n/>\n\n<Calendar variant="activity" dayShape="circle"\n  dayData={{\n    "2026-10-28": { label: "걷기", completed: true },\n  }}\n/>\n{/* variant: default | minimal | schedule | activity */}\n{/* mode="range"도 같은 모양 옵션을 사용합니다. */}\n\n<DateRangePicker calendarOptions={{\n  variant: "minimal", weekStartsOn: 1, fixedWeeks: false,\n}} />',
  'date-picker': '<DatePicker\n  label="프로젝트 마감일"\n  value={date}\n  onValueChange={setDate}\n/>',
  command: '<Command\n  trigger={<Button variant="secondary">빠른 실행</Button>}\n  title="빠른 실행"\n  items={[\n    { id: "new", label: "새 프로젝트",\n      onSelect: () => createProject() },\n  ]}\n/>',
  'toggle-group': '<ToggleGroup\n  aria-label="목록 보기 방식"\n  defaultValue={["list"]}\n  preventEmpty\n  items={[\n    { value: "list", label: "목록" },\n    { value: "grid", label: "카드" },\n  ]}\n/>',

  button: '<Button variant="primary" size="md">\n  시작하기\n</Button>',
  field: '<Field label="프로젝트 이름"\n  description="언제든 변경할 수 있어요.">\n  <Input placeholder="새로운 프로젝트" />\n</Field>',
  input: '<Input\n  aria-label="이메일"\n  type="email"\n  placeholder="hello@moru.design"\n/>',
  textarea: '<Textarea\n  aria-label="프로젝트 소개"\n  placeholder="어떤 프로젝트인가요?"\n  maxLength={200}\n/>',
  checkbox: '<Checkbox\n  label="이메일 알림 받기"\n  checked={checked}\n  onCheckedChange={setChecked}\n/>',
  select: '<Select\n  aria-label="프로젝트 공개 범위"\n  items={visibilityOptions}\n  value={visibility}\n  onValueChange={setVisibility}\n/>',
  dialog: '<Dialog\n  title="팀원 초대"\n  trigger={<Button>초대하기</Button>}\n>\n  <Field label="이메일"><Input /></Field>\n</Dialog>',
  menu: '<Menu\n  trigger={<Button>프로젝트 관리</Button>}\n  items={[\n    { label: "이름 변경", onClick: rename },\n    { label: "복제하기", onClick: duplicate },\n  ]}\n/>',
  tabs: '<Tabs defaultValue="overview" items={[\n  { value: "overview", label: "개요",\n    content: <Overview /> },\n  { value: "activity", label: "활동",\n    content: <Activity /> },\n]} />',
  card: '<Card>\n  <h3>아이디어를 모으는 공간</h3>\n  <p>작은 시작을 위한 새로운 프로젝트.</p>\n  <Button>프로젝트 열기</Button>\n</Card>',
  switch: '<Switch\n  label="새로운 활동 알림"\n  description="팀의 소식을 바로 받아보세요."\n  defaultChecked\n  name="notifications"\n/>',
  'radio-group': '<RadioGroup\n  aria-label="프로젝트 접근 권한"\n  name="access"\n  defaultValue="team"\n  items={[\n    { value: "private", label: "나만 보기" },\n    { value: "team", label: "팀과 공유" },\n    { value: "public", label: "전체 공개" },\n  ]}\n/>',
  slider: '<Slider\n  label="미리보기 배율"\n  defaultValue={60}\n  min={0}\n  max={100}\n  step={5}\n  showValue\n/>',
  accordion: '<Accordion defaultValue={["tokens"]} items={[\n  { value: "tokens", title: "내 제품에 맞게 바꿀 수 있나요?",\n    content: "색상·글꼴·밀도를 토큰으로 조절하세요." },\n  { value: "source", title: "소스도 수정할 수 있나요?",\n    content: "필요한 컴포넌트를 가져와 직접 다듬으세요." },\n]} />',
  popover: '<Popover\n  trigger={<Button variant="secondary">빠른 설정</Button>}\n  title="알림 설정"\n  description="필요한 소식만 골라 받아보세요."\n>\n  <Switch label="새 댓글 알림" defaultChecked />\n</Popover>',
  tooltip: '<Tooltip\n  trigger={<Button variant="secondary" aria-label="링크 복사">\n    링크 복사\n  </Button>}\n>\n  현재 페이지의 링크를 복사합니다.\n</Tooltip>',
  badge: '<div className="flex flex-wrap gap-2">\n  <Badge>진행 중</Badge>\n  <Badge variant="outline">디자인</Badge>\n  <Badge tone="success">완료</Badge>\n  <Badge tone="warning">검토 필요</Badge>\n</div>',
  alert: '<Alert title="변경 사항을 저장했어요." tone="success">\n  팀원에게도 새로운 설정이 적용됩니다.\n</Alert>',
  avatar: '<div className="flex items-center gap-2">\n  <Avatar alt="민지" fallback="MJ" size="sm" />\n  <Avatar alt="수현" fallback="SH" />\n  <Avatar alt="Moru 팀" fallback="M" size="lg" />\n</div>',
  progress: '<Progress\n  label="프로젝트 준비"\n  value={60}\n  max={100}\n  showValue\n/>\n\n{/* 완료 시점을 알 수 없다면 value={null} */}',
  separator: '<div>프로젝트 정보</div>\n<Separator className="my-4" />\n<div className="flex h-5 items-center gap-3">\n  <span>디자인</span>\n  <Separator orientation="vertical" />\n  <span>개발</span>\n</div>',
  skeleton: '<div role="status" aria-label="프로젝트 불러오는 중">\n  <Skeleton style={{ width: 40, height: 40, borderRadius: "50%" }} />\n  <Skeleton style={{ width: "65%", height: 16, marginTop: 12 }} />\n  <Skeleton style={{ width: "100%", height: 12, marginTop: 8 }} />\n</div>',
}
