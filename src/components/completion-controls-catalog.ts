export const controlsComponents = [
  { id: 'aspect-ratio', name: 'Aspect Ratio', subtitle: '콘텐츠의 비율을 일정하게', category: 'layout', generation: 'completion' },
  { id: 'button-group', name: 'Button Group', subtitle: '연결된 동작을 한 묶음으로', category: 'interaction', generation: 'completion' },
  { id: 'direction', name: 'Direction', subtitle: '읽기 방향과 키보드 이동', category: 'layout', generation: 'completion' },
  { id: 'input-group', name: 'Input Group', subtitle: '아이콘과 버튼을 품은 입력', category: 'forms', generation: 'completion' },
  { id: 'input-otp', name: 'Input OTP', subtitle: '인증 번호 입력과 붙여넣기', category: 'forms', generation: 'completion' },
  { id: 'item', name: 'Item', subtitle: '정보와 동작을 담은 목록 항목', category: 'layout', generation: 'completion' },
  { id: 'kbd', name: 'Kbd', subtitle: '키보드 단축키의 표시', category: 'layout', generation: 'completion' },
  { id: 'label', name: 'Label', subtitle: '입력과 연결된 이름', category: 'forms', generation: 'completion' },
  { id: 'native-select', name: 'Native Select', subtitle: '기기의 기본 선택 목록', category: 'forms', generation: 'completion' },
  { id: 'spinner', name: 'Spinner', subtitle: '진행 중인 작업의 표시', category: 'feedback', generation: 'completion' },
  { id: 'toggle', name: 'Toggle', subtitle: '하나의 옵션을 켜고 끄기', category: 'forms', generation: 'completion' },
] as const
export type ControlsComponentId = (typeof controlsComponents)[number]['id']
export const controlsAliases: Record<ControlsComponentId, string> = {
  'aspect-ratio': '종횡비 비율 이미지', 'button-group': '버튼그룹 버튼 그룹', direction: '디렉션 방향 rtl ltr 국제화',
  'input-group': '입력그룹 인풋그룹 접두사 접미사 검색', 'input-otp': '인증번호 일회용 비밀번호 오티피 otp',
  item: '아이템 항목 목록', kbd: '키보드 단축키 키', label: '라벨 레이블 이름',
  'native-select': '네이티브 셀렉트 기본 선택 목록', spinner: '스피너 로딩 대기', toggle: '토글 켜기 끄기',
}
export const controlsSnippets: Record<ControlsComponentId, string> = {
  'aspect-ratio': '<AspectRatio ratio={16 / 9}>\n  <img src="/project.jpg" alt="프로젝트 미리보기" />\n</AspectRatio>',
  'button-group': '<ButtonGroup aria-label="페이지 이동">\n  <Button variant="secondary" onClick={previous}>이전</Button>\n  <ButtonGroupText>{page} / 5</ButtonGroupText>\n  <Button variant="secondary" onClick={next}>다음</Button>\n</ButtonGroup>',
  direction: '<DirectionProvider direction="rtl">\n  <div dir="rtl">\n    <Tabs items={items} aria-label="콘텐츠 선택" />\n  </div>\n</DirectionProvider>',
  'input-group': '<Field label="프로젝트 검색">\n  <InputGroup>\n    <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>\n    <InputGroupInput placeholder="이름으로 검색" />\n    <InputGroupAddon align="inline-end">\n      <Kbd>⌘ K</Kbd>\n    </InputGroupAddon>\n  </InputGroup>\n</Field>',
  'input-otp': '<Field label="6자리 인증 번호" description="숫자만 입력하거나 붙여넣으세요.">\n  <InputOTP length={6} value={code}\n    onValueChange={setCode}\n    onComplete={(code) => verify(code)} />\n</Field>',
  item: '<Item variant="outline">\n  <ItemMedia><FileText aria-hidden="true" /></ItemMedia>\n  <ItemContent>\n    <ItemTitle>프로젝트 안내</ItemTitle>\n    <ItemDescription>함께 시작하기 위한 문서</ItemDescription>\n  </ItemContent>\n  <ItemActions><Button size="sm">열기</Button></ItemActions>\n</Item>',
  kbd: '<span>빠른 실행 <KbdGroup>\n  <Kbd>⌘</Kbd><Kbd>K</Kbd>\n</KbdGroup></span>',
  label: '<Label htmlFor="project-name">프로젝트 이름</Label>\n<Input id="project-name" />',
  'native-select': '<Field label="프로젝트 공개 범위">\n  <NativeSelect value={visibility} onValueChange={setVisibility}>\n    <option value="private">나만 보기</option>\n    <option value="team">팀과 공유</option>\n  </NativeSelect>\n</Field>',
  spinner: '<div aria-busy={loading}>\n  {loading ? <Spinner label="프로젝트 불러오는 중" /> : <Check />}\n  {loading ? "불러오는 중" : "완료"}\n</div>',
  toggle: '<Toggle aria-label="굵게" pressed={bold}\n  onPressedChange={setBold} variant="outline">\n  <Bold aria-hidden="true" />\n</Toggle>',
}
