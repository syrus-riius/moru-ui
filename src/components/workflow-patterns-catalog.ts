export const workflowPatternComponents = [
  { id: 'stepper', name: 'Stepper', subtitle: '검증하며 이어가는 단계별 흐름', category: 'layout', generation: 'completion' },
  { id: 'ring-progress', name: 'Ring Progress', subtitle: '목표와 구성비를 읽는 원형 진행률', category: 'feedback', generation: 'completion' },
] as const
export type WorkflowPatternId = (typeof workflowPatternComponents)[number]['id']
export const workflowPatternAliases: Record<WorkflowPatternId, string> = {
  stepper: '스테퍼 단계 단계별 폼 마법사 온보딩 wizard step',
  'ring-progress': '링 프로그레스 원형 진행률 목표 구성비 저장공간 circle ring',
}
export const workflowPatternSnippets: Record<WorkflowPatternId, string> = {
  stepper: '<Stepper\n  value={step}\n  onValueChange={setStep}\n  aria-label="프로젝트 시작"\n  items={[\n    { id: "name", label: "기본 정보", content: <ProjectFields /> },\n    { id: "review", label: "최종 확인", content: <Review /> },\n  ]}\n  completedContent="프로젝트 준비를 마쳤어요."\n/>\n{/* 다음 버튼은 현재 입력을 검증한 뒤 setStep(step + 1)을 호출하세요. */}',
  'ring-progress': '<RingProgress label="팀 저장 공간" max={100}\n  sections={[\n    { label: "문서", value: 42, tone: "primary" },\n    { label: "미디어", value: 26, tone: "accent" },\n  ]}\n/>\n\n<RingProgress label="이번 주 목표" value={68} />',
}
