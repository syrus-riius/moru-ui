export const navigationComponents = [
  { id: 'breadcrumb', name: 'Breadcrumb', subtitle: '현재 위치와 상위 단계', category: 'layout', generation: 'completion' },
  { id: 'collapsible', name: 'Collapsible', subtitle: '필요할 때 펼치는 내용', category: 'interaction', generation: 'completion' },
  { id: 'context-menu', name: 'Context Menu', subtitle: '우클릭과 길게 누르는 메뉴', category: 'interaction', generation: 'completion' },
  { id: 'drawer', name: 'Drawer', subtitle: '아래에서 끌어 여닫는 패널', category: 'interaction', generation: 'completion' },
  { id: 'hover-card', name: 'Hover Card', subtitle: '마우스와 포커스로 보는 미리보기', category: 'interaction', generation: 'completion' },
  { id: 'menubar', name: 'Menubar', subtitle: '연결된 애플리케이션 메뉴', category: 'interaction', generation: 'completion' },
  { id: 'navigation-menu', name: 'Navigation Menu', subtitle: '주요 화면과 하위 탐색', category: 'layout', generation: 'completion' },
  { id: 'sidebar', name: 'Sidebar', subtitle: '접을 수 있는 반응형 탐색', category: 'layout', generation: 'completion' },
] as const
export type NavigationComponentId = (typeof navigationComponents)[number]['id']
export const navigationAliases: Record<NavigationComponentId, string> = {
  breadcrumb: '브레드크럼 경로 현재위치', collapsible: '콜랩시블 접기 펼치기', 'context-menu': '컨텍스트 우클릭 맥락 메뉴', drawer: '드로어 아래 패널 끌기', 'hover-card': '호버카드 미리보기 프로필', menubar: '메뉴바 메뉴 모음', 'navigation-menu': '내비게이션 네비게이션 탐색 메뉴', sidebar: '사이드바 측면 탐색 반응형',
}
export const navigationSnippets: Record<NavigationComponentId, string> = {
  breadcrumb: '<Breadcrumb items={[\n  { label: "홈", href: "/" },\n  { label: "워크스페이스", href: "/workspace" },\n  { label: "프로젝트" },\n]} />',
  collapsible: '<Collapsible title="프로젝트 파일" defaultOpen>\n  <p>README.md</p>\n  <p>components/</p>\n</Collapsible>',
  'context-menu': '<ContextMenu\n  aria-label="프로젝트 작업 메뉴"\n  items={[\n    { id: "open", label: "열기", onSelect: openProject },\n    { id: "share", label: "공유", children: [\n      { id: "link", label: "링크 복사", onSelect: copyLink },\n    ] },\n  ]}\n>\n  <div>우클릭하거나 Shift + F10을 누르세요.</div>\n</ContextMenu>',
  drawer: '<Drawer\n  title="프로젝트 편집"\n  description="손잡이를 아래로 끌어 닫을 수 있어요."\n  trigger={<Button variant="secondary">아래에서 편집</Button>}\n>\n  <Field label="프로젝트 이름"><Input defaultValue="Moru Studio" /></Field>\n</Drawer>',
  'hover-card': '<HoverCard\n  trigger={<button type="button">@minji</button>}\n  title="민지 · 프로덕트 디자이너"\n  description="Moru의 작은 디테일을 다듬고 있어요."\n>\n  <Badge variant="secondary">함께 작업 중</Badge>\n</HoverCard>',
  menubar: '<Menubar menus={[\n  { id: "file", label: "파일", items: [\n    { id: "new", label: "새 프로젝트", onSelect: createProject },\n  ] },\n  { id: "edit", label: "편집", items: [\n    { id: "undo", label: "실행 취소", disabled: true },\n  ] },\n]} />',
  'navigation-menu': '<NavigationMenu items={[\n  { id: "start", label: "시작", href: "/guide" },\n  { id: "resources", label: "리소스", links: [\n    { id: "tokens", label: "디자인 토큰", href: "/tokens",\n      description: "색상과 크기의 공통 언어" },\n  ] },\n]} />',
  sidebar: '<Sidebar\n  title="Moru Studio"\n  value={page}\n  onValueChange={setPage}\n  items={[\n    { id: "overview", label: "개요" },\n    { id: "projects", label: "프로젝트", badge: 4 },\n    { id: "team", label: "팀원" },\n  ]}\n  footer="차근차근, 우리답게."\n/>',
}
