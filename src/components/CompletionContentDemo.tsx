import { useRef, useState } from 'react'
import { Check, GitBranch, MessageCircle, Paperclip, Plus, Send, ThumbsUp } from 'lucide-react'
import { Attachment } from './ui/attachment'
import { Avatar } from './ui/avatar'
import { Bubble, BubbleContent, BubbleFooter, BubbleReactions } from './ui/bubble'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { CodeBlock } from './ui/code-block'
import { Input } from './ui/input'
import { Marker, MarkerContent, MarkerIcon } from './ui/marker'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from './ui/message'
import { MessageScroller, MessageScrollerItem, type MessageScrollerHandle } from './ui/message-scroller'
import { Questionnaire, type QuestionnaireQuestion } from './ui/questionnaire'
import { Trace } from './ui/trace'
import type { ContentComponentId } from './completion-content-catalog'
import './completion-content-demo.css'

const source = `import { Button } from './ui/button'\n\nexport function Welcome() {\n  return <Button>직접 다듬는 시작</Button>\n}`
const cssSource = `:root {\n  --ui-primary: #181818;\n  --ui-accent: #ef543d;\n  --ui-radius: 6px;\n  --ui-space: 4px;\n}`
const questions: QuestionnaireQuestion[] = [
  { id: 'purpose', title: '어떤 제품을 만들고 있나요?', description: '가장 가까운 방향을 하나 골라 주세요.', type: 'single', required: true, options: [{ value: 'dashboard', label: '대시보드' }, { value: 'service', label: '고객 서비스' }, { value: 'portfolio', label: '포트폴리오' }] },
  { id: 'priorities', title: '중요하게 생각하는 것은?', description: '여러 개를 고르거나 건너뛸 수 있어요.', type: 'multiple', options: [{ value: 'a11y', label: '접근성' }, { value: 'brand', label: '브랜드 개성' }, { value: 'speed', label: '개발 속도' }] },
  { id: 'name', title: '프로젝트 이름을 알려주세요.', type: 'text', required: true, placeholder: '예: Moru Studio', validate: (answer) => typeof answer === 'string' && answer.trim().length < 2 ? '두 글자 이상 입력해 주세요.' : undefined },
]
interface DemoAttachment { id: string; name: string; size: number }
const initialAttachments: DemoAttachment[] = [{ id: 'guide', name: 'brand-guidelines.pdf', size: 2457600 }]
const initialMessages = Array.from({ length: 8 }, (_, index) => ({ id: `message-${index + 1}`, author: index % 2 ? '나' : '민지', text: ['새로운 컴포넌트의 첫 화면을 정리했어요.', '역할별 타이포그래피와 공통 여백을 적용해볼게요.', '라이트·다크 모드에서도 같은 리듬이 유지되네요.', '다음 단계에서는 키보드 동작까지 확인해요.'][index % 4] }))

export interface CompletionContentDemoProps { id: ContentComponentId; disabled: boolean; size: 'sm' | 'md' | 'lg'; onNotice?: (message: string) => void }
export function CompletionContentDemo({ id, disabled, size, onNotice }: CompletionContentDemoProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const scroller = useRef<MessageScrollerHandle>(null)
  const [files, setFiles] = useState(initialAttachments)
  const [variant, setVariant] = useState<'default' | 'secondary' | 'outline'>('outline')
  const [liked, setLiked] = useState(false)
  const [language, setLanguage] = useState('tsx')
  const [lineNumbers, setLineNumbers] = useState(true)
  const [phase, setPhase] = useState(0)
  const [messages, setMessages] = useState([{ id: 'first', author: '민지', text: 'Moru로 작은 디테일까지 함께 다듬어볼까요?' }])
  const [draft, setDraft] = useState('')
  const [transcript, setTranscript] = useState(initialMessages)
  const [traceRecovered, setTraceRecovered] = useState(false)
  switch (id) {
    case 'attachment': return <div className="completion-content-stack">
      <input ref={fileInput} className="ui-content-sr-only" type="file" multiple tabIndex={-1} aria-label="로컬 파일 선택" disabled={disabled} onChange={(event) => {
        const picked = Array.from(event.currentTarget.files ?? []).map((file) => ({ id: crypto.randomUUID(), name: file.name, size: file.size }))
        if (picked.length) { setFiles((previous) => [...previous, ...picked]); onNotice?.(`${picked.length}개 파일을 예제에 추가했어요.`) }
        event.currentTarget.value = ''
      }} />
      {files.map((file) => <Attachment key={file.id} fileName={file.name} fileSize={file.size} status="done" size={size} disabled={disabled} onRemove={() => { setFiles((previous) => previous.filter((item) => item.id !== file.id)); onNotice?.(`${file.name} 첨부를 제거했어요.`) }} />)}
      {!files.length && <p className="completion-content-caption">첨부한 파일이 없어요.</p>}
      <Button variant="secondary" size={size} disabled={disabled} onClick={() => fileInput.current?.click()}><Paperclip size={15} aria-hidden="true" />파일 선택</Button>
      <span className="completion-content-caption">파일 이름과 크기만 이 화면에 표시하며, 서버로 업로드하지 않아요.</span>
    </div>
    case 'bubble': return <div className="completion-content-stack">
      <Bubble variant={variant}><BubbleContent>작은 디테일까지 직접 다듬는 UI.</BubbleContent><BubbleFooter>Moru 팀 · 오후 2:30</BubbleFooter><BubbleReactions><Button variant="ghost" size="sm" disabled={disabled} aria-label="메시지 좋아요" aria-pressed={liked} onClick={() => setLiked(!liked)}><ThumbsUp size={13} aria-hidden="true" />{liked ? '1' : '0'}</Button></BubbleReactions></Bubble>
      <div className="completion-content-row" role="group" aria-label="말풍선 스타일">{(['default', 'secondary', 'outline'] as const).map((item) => <Button key={item} variant="secondary" size="sm" aria-pressed={variant === item} disabled={disabled} onClick={() => setVariant(item)}>{item === 'default' ? '기본' : item === 'secondary' ? '강조' : '외곽선'}</Button>)}</div>
    </div>
    case 'code-block': return <div className="completion-content-stack"><CodeBlock value={language === 'tsx' ? source : cssSource} filename={language === 'tsx' ? 'welcome.tsx' : 'tokens.css'} language={language} lineNumbers={lineNumbers} highlightLines={[language === 'tsx' ? 4 : 2]} disabled={disabled} size={size} onCopy={() => onNotice?.('코드를 복사했어요.')} onCopyError={() => onNotice?.('코드를 선택해서 복사해 주세요.')} /><div className="completion-content-row"><Checkbox label="줄번호" checked={lineNumbers} onCheckedChange={setLineNumbers} disabled={disabled} size={size} /><Button variant="secondary" size="sm" disabled={disabled} onClick={() => setLanguage(language === 'tsx' ? 'css' : 'tsx')}>{language === 'tsx' ? 'CSS 보기' : 'TSX 보기'}</Button></div></div>
    case 'marker': return <div className="completion-content-stack">
      <Marker variant="separator"><MarkerContent>오늘의 작업</MarkerContent></Marker>
      <Marker><MarkerIcon><GitBranch /></MarkerIcon><MarkerContent>새 디자인 분기로 전환했어요.</MarkerContent></Marker>
      <Marker role="status" variant="border" tone={phase === 2 ? 'success' : 'info'}><MarkerIcon>{phase === 2 ? <Check /> : <MessageCircle />}</MarkerIcon><MarkerContent>{['토큰을 확인하고 있어요.', '컴포넌트를 조합하고 있어요.', '화면 점검을 마쳤어요.'][phase]}</MarkerContent></Marker>
      <Button variant="secondary" size={size} disabled={disabled} onClick={() => setPhase((phase + 1) % 3)}>다음 상태</Button>
    </div>
    case 'message': return <div className="completion-content-stack">
      <div className="ui-message-group">{messages.map((message) => <Message key={message.id} align={message.author === '나' ? 'end' : 'start'} aria-label={`${message.author}의 메시지`}><MessageAvatar><Avatar alt={message.author} size="sm" /></MessageAvatar><MessageContent><MessageHeader>{message.author}</MessageHeader><Bubble variant={message.author === '나' ? 'secondary' : 'outline'}><BubbleContent>{message.text}</BubbleContent></Bubble><MessageFooter>{message.author === '나' ? '전송됨' : '오후 2:30'}</MessageFooter></MessageContent></Message>)}</div>
      <form className="completion-content-composer" onSubmit={(event) => { event.preventDefault(); if (disabled || !draft.trim()) return; setMessages((previous) => [...previous, { id: crypto.randomUUID(), author: '나', text: draft.trim() }]); setDraft('') }}><Input value={draft} onValueChange={setDraft} size={size} disabled={disabled} aria-label="메시지 작성" placeholder="메시지를 입력하세요" /><Button type="submit" size={size} disabled={disabled || !draft.trim()} aria-label="메시지 전송"><Send size={15} aria-hidden="true" /></Button></form>
      <span className="completion-content-caption">이 예제 안에서만 메시지가 추가돼요.</span>
    </div>
    case 'message-scroller': return <div className="completion-content-stack"><MessageScroller ref={scroller} height={300} disabled={disabled} aria-label="스크롤 동작을 확인하는 팀 대화">{transcript.map((message) => <MessageScrollerItem key={message.id} messageId={message.id}><Message align={message.author === '나' ? 'end' : 'start'} aria-label={`${message.author}의 메시지`}><MessageContent><MessageHeader>{message.author}</MessageHeader><Bubble variant={message.author === '나' ? 'secondary' : 'outline'}><BubbleContent>{message.text}</BubbleContent></Bubble></MessageContent></Message></MessageScrollerItem>)}</MessageScroller><div className="completion-content-row"><Button variant="secondary" size={size} disabled={disabled} onClick={() => scroller.current?.scrollToMessage('message-1')}>처음 메시지</Button><Button variant="secondary" size={size} disabled={disabled} onClick={() => setTranscript((previous) => [...previous, { id: `message-${previous.length + 1}`, author: '민지', text: `새로운 피드백 ${previous.length - 7}: 읽던 위치는 유지하고, 최신 대화로 돌아갈 수 있어요.` }])}><Plus size={14} aria-hidden="true" />새 메시지</Button></div><span className="completion-content-caption">위로 스크롤한 뒤 새 메시지를 추가해 보세요.</span></div>
    case 'questionnaire': return <Questionnaire questions={questions} disabled={disabled} size={size} submitLabel="계획 정리" onComplete={() => onNotice?.('프로젝트 답변을 정리했어요.')} />
    case 'trace': return <div className="completion-content-stack"><Trace disabled={disabled} defaultExpanded={['check']} items={[
      { id: 'read', title: '디자인 토큰 확인', description: '색상과 타이포그래피 기준을 읽었어요.', status: 'complete', durationMs: 320, details: '기본 색상·간격·글꼴 토큰을 확인했어요.' },
      { id: 'build', title: '컴포넌트 구성', status: 'complete', durationMs: 1520, details: <CodeBlock value="Button · Input · Card\n3개 컴포넌트를 구성했어요." language="output" copyable={false} size="sm" /> },
      { id: 'check', title: '화면 점검', status: traceRecovered ? 'complete' : 'error', durationMs: traceRecovered ? 840 : 680, details: traceRecovered ? '320px 화면에서도 내용이 맞게 표시돼요.' : '좁은 화면에서 긴 제목을 확인해 주세요. 다시 실행하면 완료 상태로 전환돼요.' },
      { id: 'share', title: traceRecovered ? '결과 정리' : '결과 정리 대기', status: traceRecovered ? 'complete' : 'pending', durationMs: traceRecovered ? 120 : undefined },
    ]} /><Button variant="secondary" size={size} disabled={disabled} onClick={() => { setTraceRecovered(!traceRecovered); onNotice?.(traceRecovered ? '오류 예제로 돌아왔어요.' : '예제 점검을 마쳤어요.') }}>{traceRecovered ? '오류 예시로 돌아가기' : '다시 실행'}</Button></div>
  }
}
