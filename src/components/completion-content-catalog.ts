export const contentComponents = [
  { id: 'attachment', name: 'Attachment', subtitle: '파일 정보와 첨부 상태', category: 'forms', generation: 'completion' },
  { id: 'bubble', name: 'Bubble', subtitle: '대화의 표면과 반응', category: 'layout', generation: 'completion' },
  { id: 'code-block', name: 'Code Block', subtitle: '복사와 줄번호가 있는 코드', category: 'layout', generation: 'completion' },
  { id: 'marker', name: 'Marker', subtitle: '대화 속 상태와 구분', category: 'feedback', generation: 'completion' },
  { id: 'message', name: 'Message', subtitle: '사람과 내용을 묶는 메시지', category: 'layout', generation: 'completion' },
  { id: 'message-scroller', name: 'Message Scroller', subtitle: '읽던 위치를 지키는 대화', category: 'layout', generation: 'completion' },
  { id: 'questionnaire', name: 'Questionnaire', subtitle: '단계별 질문과 답변 검증', category: 'forms', generation: 'completion' },
  { id: 'trace', name: 'Trace', subtitle: '단계별 실행 상태와 상세', category: 'feedback', generation: 'completion' },
] as const
export type ContentComponentId = (typeof contentComponents)[number]['id']
export const contentAliases: Record<ContentComponentId, string> = {
  attachment: '첨부 파일 이미지 업로드 다운로드', bubble: '버블 말풍선 대화 반응',
  'code-block': '코드 블록 복사 줄번호 터미널', marker: '마커 대화 상태 구분선 시스템 노트',
  message: '메시지 메세지 채팅 대화', 'message-scroller': '메시지 스크롤 채팅 최신 대화',
  questionnaire: '질문 설문 답변 단계 폼 검증', trace: '트레이스 작업 단계 실행 추적 로그',
}
export const contentSnippets: Record<ContentComponentId, string> = {
  attachment: '<Attachment\n  fileName="brand-guidelines.pdf"\n  fileSize={2457600}\n  status="done"\n  onRemove={() => removeAttachment()}\n/>',
  bubble: '<Bubble variant="outline">\n  <BubbleContent>작은 디테일까지 직접 다듬어요.</BubbleContent>\n  <BubbleFooter>오후 2:30</BubbleFooter>\n</Bubble>',
  'code-block': '<CodeBlock\n  filename="app.tsx"\n  language="tsx"\n  value={source}\n  lineNumbers\n  highlightLines={[2]}\n  onCopy={() => toast({ title: "복사했어요." })}\n/>',
  marker: '<Marker variant="separator">\n  <MarkerContent>오늘의 대화</MarkerContent>\n</Marker>\n<Marker role="status" tone="success">\n  <MarkerContent>변경 사항을 저장했어요.</MarkerContent>\n</Marker>',
  message: '<Message align="start" aria-label="민지의 메시지">\n  <MessageAvatar><Avatar alt="민지" /></MessageAvatar>\n  <MessageContent>\n    <MessageHeader>민지</MessageHeader>\n    <Bubble><BubbleContent>함께 다듬어볼까요?</BubbleContent></Bubble>\n    <MessageFooter>오후 2:30</MessageFooter>\n  </MessageContent>\n</Message>',
  'message-scroller': '<MessageScroller height={320} aria-label="팀 대화">\n  {messages.map((message) => (\n    <MessageScrollerItem key={message.id} messageId={message.id}>\n      <Message aria-label={message.author}>\n        <MessageContent>\n          <Bubble><BubbleContent>{message.text}</BubbleContent></Bubble>\n        </MessageContent>\n      </Message>\n    </MessageScrollerItem>\n  ))}\n</MessageScroller>',
  questionnaire: '<Questionnaire\n  questions={[\n    { id: "name", title: "프로젝트 이름은?",\n      type: "text", required: true },\n    { id: "size", title: "팀 규모는?", type: "single",\n      options: [\n        { value: "small", label: "작은 팀" },\n        { value: "large", label: "큰 팀" },\n      ] },\n  ]}\n  onComplete={(answers) => saveAnswers(answers)}\n/>',
  trace: '<Trace defaultExpanded={["build"]} items={[\n  { id: "read", title: "토큰 확인", status: "complete", durationMs: 320 },\n  { id: "build", title: "컴포넌트 생성", status: "running",\n    details: "버튼과 입력 필드를 구성하고 있어요." },\n  { id: "check", title: "화면 점검", status: "pending" },\n]} />',
}
