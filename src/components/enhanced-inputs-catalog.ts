export const enhancedInputComponents = [
  { id: 'number-input', name: 'Number Input', subtitle: '숫자·소수·단위와 범위 조절', category: 'forms', generation: 'completion' },
  { id: 'password-input', name: 'Password Input', subtitle: '안전한 입력과 비밀번호 표시', category: 'forms', generation: 'completion' },
  { id: 'multi-select', name: 'Multi Select', subtitle: '검색하고 여러 항목 선택', category: 'forms', generation: 'completion' },
] as const

export type EnhancedInputComponentId = (typeof enhancedInputComponents)[number]['id']
export const enhancedInputAliases: Record<EnhancedInputComponentId, string> = {
  'number-input': '숫자 수량 금액 넘버 인풋 스테퍼 소수 정밀도',
  'password-input': '비밀번호 패스워드 보안 표시 숨기기',
  'multi-select': '다중 선택 멀티 셀렉트 태그 칩 검색 여러 선택',
}
export const enhancedInputSnippets: Record<EnhancedInputComponentId, string> = {
  'number-input': '<Field label="월 예산" description="0부터 10,000까지 설정하세요.">\n  <NumberInput\n    value={budget}\n    onValueChange={setBudget}\n    min={0} max={10000} step={100}\n    precision={2}\n    locale="ko-KR"\n    format={{ style: "currency", currency: "KRW" }}\n  />\n</Field>',
  'password-input': '<Field label="비밀번호" description="8자 이상 입력하세요.">\n  <PasswordInput\n    name="password"\n    autoComplete="new-password"\n    minLength={8}\n    required\n  />\n</Field>',
  'multi-select': '<Field label="프로젝트 분야">\n  <MultiSelect\n    name="areas"\n    value={areas}\n    onValueChange={setAreas}\n    maxSelected={3}\n    items={[\n      { value: "design", label: "디자인" },\n      { value: "develop", label: "개발" },\n      { value: "research", label: "리서치" },\n    ]}\n  />\n</Field>',
}
