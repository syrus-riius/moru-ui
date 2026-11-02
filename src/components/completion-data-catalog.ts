export const dataComponents = [
  { id: 'carousel', name: 'Carousel', subtitle: '넘기며 살펴보는 콘텐츠', category: 'layout', generation: 'completion' },
  { id: 'chart', name: 'Chart', subtitle: '막대·선·영역·도넛의 기본', category: 'feedback', generation: 'completion' },
  { id: 'data-table', name: 'Data Table', subtitle: '검색·정렬·선택을 한곳에', category: 'layout', generation: 'completion' },
  { id: 'resizable', name: 'Resizable', subtitle: '직접 조절하는 작업 공간', category: 'layout', generation: 'completion' },
  { id: 'scroll-area', name: 'Scroll Area', subtitle: '콘텐츠 안에서 이어지는 탐색', category: 'layout', generation: 'completion' },
  { id: 'typography', name: 'Typography', subtitle: '역할이 분명한 글자', category: 'layout', generation: 'completion' },
] as const
export type DataComponentId = typeof dataComponents[number]['id']
export const dataAliases = { carousel: '캐러셀 슬라이드', chart: '차트 그래프 데이터 막대 선 영역 도넛 bar line area donut', 'data-table': '데이터 테이블 정렬 필터 검색', resizable: '리사이저블 크기 조절 패널', 'scroll-area': '스크롤 영역', typography: '타이포그래피 글꼴 글자' }
export const dataSnippets: Record<DataComponentId, string> = {
  carousel: '<Carousel aria-label="프로젝트 소개" items={[\n  { id: "first", content: <Card>첫 번째 프로젝트</Card> },\n  { id: "second", content: <Card>두 번째 프로젝트</Card> },\n]} />',
  chart: '// type: "bar" | "line" | "area" | "donut"\n<Chart title="주간 방문" xKey="day" type="bar"\n  data={[{ day: "월", visits: 120 }, { day: "화", visits: 180 }]}\n  config={{ visits: { label: "방문 수", color: "var(--ui-primary)" } }}\n  chartHeight={240}\n  showLegend\n  showDataTable\n/>',
  'data-table': '<DataTable caption="프로젝트 목록"\n  data={projects}\n  columns={[{ accessorKey: "name", header: "이름" }]}\n  getRowId={(project) => project.id}\n  pageSize={5}\n  onSelectionChange={(ids) => console.log(ids)}\n/>',
  resizable: '<div style={{ height: 240 }}>\n<ResizablePanelGroup orientation="horizontal">\n  <ResizablePanel defaultSize="35%" minSize="20%">탐색</ResizablePanel>\n  <ResizableHandle />\n  <ResizablePanel minSize="20%">내용</ResizablePanel>\n</ResizablePanelGroup>\n</div>',
  'scroll-area': '<ScrollArea aria-label="활동 목록" style={{ height: 200 }}>\n  {activities.map((activity) => <p key={activity.id}>{activity.title}</p>)}\n</ScrollArea>',
  typography: '<Typography variant="heading" as="h2">단단한 기본</Typography>\n<Typography variant="body">직접 다듬고, 오래 쓰는 UI.</Typography>\n<Typography variant="caption">Moru UI</Typography>',
}
