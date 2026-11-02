import { useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowDown, ArrowUpRight, Code2, FileText, Languages, MessageSquare, Paperclip, Pin, Send, ThumbsUp } from 'lucide-react'
import { Attachment, AttachmentGroup } from '../ui/attachment'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Bubble, BubbleContent } from '../ui/bubble'
import { Button } from '../ui/button'
import { ButtonGroup } from '../ui/button-group'
import { CodeBlock } from '../ui/code-block'
import { Collapsible } from '../ui/collapsible'
import { DirectionProvider } from '../ui/direction-provider'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '../ui/input-group'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '../ui/item'
import { Kbd, KbdGroup } from '../ui/kbd'
import { Marker, MarkerContent, MarkerIcon } from '../ui/marker'
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from '../ui/message'
import { MessageScroller, MessageScrollerItem, type MessageScrollerHandle } from '../ui/message-scroller'
import { ScrollArea } from '../ui/scroll-area'
import { Toggle } from '../ui/toggle'
import { useToast } from '../ui/toast'
import { useWorkspaceMembers } from '../WorkspaceMembersContext'
import { useExampleSession } from './ExampleSessionContext'
import type { ConversationMessage, ExampleFile } from './example-session-state'
import './team-conversation.css'

const handoffCode = `:root {
  --brand-color: var(--ui-primary);
  --content-gap: var(--ui-form-gap);
  --body-font: var(--ui-font-family);
}

.project-card {
  padding: var(--content-gap);
  color: var(--brand-color);
  font-family: var(--body-font);
}`

function ConversationEntry({ message, authorName, onLike, onPin, messageRef }: {
  message: ConversationMessage
  authorName: string
  onLike: () => void
  onPin: () => void
  messageRef: (element: HTMLElement | null) => void
}) {
  const own = message.authorId === 'me'
  return <MessageScrollerItem messageId={message.id}>
    <Message ref={messageRef} tabIndex={-1} className="team-conversation-message" align={own ? 'end' : 'start'} aria-label={`${authorName}의 메시지`}>
      <MessageAvatar><Avatar alt="" fallback={own ? '나' : authorName.slice(0, 2)} size="sm" /></MessageAvatar>
      <MessageContent>
        <MessageHeader><strong>{own ? '나' : authorName}</strong><time>{message.time}</time>{message.pinned ? <Pin size={12} aria-label="고정됨" /> : null}</MessageHeader>
        {message.text ? <Bubble variant={own ? 'secondary' : 'default'} align={own ? 'end' : 'start'}><BubbleContent><p dir="auto">{message.text}</p></BubbleContent></Bubble> : null}
        {message.code ? <Collapsible title={<span className="team-conversation-code-title"><Code2 size={14} aria-hidden="true" />공유한 코드 보기</span>} className="team-conversation-shared-code"><CodeBlock value={message.code.value} filename={message.code.filename} language={message.code.language} lineNumbers defaultWrap size="sm" /></Collapsible> : null}
        {message.files.length ? <AttachmentGroup aria-label="메시지에 첨부한 파일">{message.files.map((file) => <Attachment key={file.id} fileName={file.name} fileSize={file.size} size="sm" />)}</AttachmentGroup> : null}
        <MessageFooter>
          <Toggle className="team-conversation-reaction" size="sm" variant="outline" pressed={message.liked} onPressedChange={onLike} aria-label={`${authorName}의 메시지에 좋아요`}><ThumbsUp size={13} aria-hidden="true" /><span>{message.liked ? '1' : '좋아요'}</span></Toggle>
          <Toggle className="team-conversation-pin-button" size="sm" pressed={message.pinned} onPressedChange={onPin} aria-label={`${authorName}의 메시지 고정`}><Pin size={13} aria-hidden="true" />{message.pinned ? '고정됨' : '고정'}</Toggle>
        </MessageFooter>
      </MessageContent>
    </Message>
  </MessageScrollerItem>
}

export function TeamConversation() {
  const { state, dispatch, patchConversation } = useExampleSession()
  const { members } = useWorkspaceMembers()
  const { toast } = useToast()
  const { messages, draft, pendingFiles, activeTab, direction } = state.conversation
  const [guideOpen, setGuideOpen] = useState(false)
  const scroller = useRef<MessageScrollerHandle>(null)
  const messageElements = useRef(new Map<string, HTMLElement>())
  const fileInput = useRef<HTMLInputElement>(null)
  const messageInput = useRef<HTMLTextAreaElement>(null)
  const composerId = useId()
  const headingId = useId()
  const tabId = useId()
  const pinned = messages.filter((message) => message.pinned)
  const sharedFiles = messages.flatMap((message) => message.files.map((file) => ({ file, message })))
  const canSend = draft.trim().length > 0 || pendingFiles.length > 0
  const activeMembers = members.filter((member) => member.status === 'active')

  function getAuthorName(message: ConversationMessage) {
    return members.find((member) => member.id === message.authorId)?.name ?? message.authorName
  }
  function jumpToMessage(id: string) {
    patchConversation({ activeTab: 'conversation' })
    requestAnimationFrame(() => {
      if (scroller.current?.scrollToMessage(id)) messageElements.current.get(id)?.focus({ preventScroll: true })
    })
  }
  function jumpToLatest() {
    patchConversation({ activeTab: 'conversation' })
    requestAnimationFrame(() => scroller.current?.scrollToLatest())
  }
  function send(event?: FormEvent) {
    event?.preventDefault()
    if (!canSend) return
    const author = members.find((member) => member.id === 'me')
    dispatch({ type: 'conversation/send', message: {
      id: crypto.randomUUID(), authorId: 'me', authorName: author?.name ?? '나', text: draft,
      time: new Intl.DateTimeFormat('ko-KR', { hour: 'numeric', minute: '2-digit' }).format(new Date()),
      files: pendingFiles.map((file) => ({ ...file })), liked: false, pinned: false,
    } })
    toast({ title: '메시지를 대화에 추가했어요.', tone: 'success' })
    messageInput.current?.focus()
  }
  function attachFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.currentTarget.files ?? [])
    if (!selected.length) return
    const existing = new Set(pendingFiles.map((file) => `${file.name}\u0000${file.size}`))
    const next: ExampleFile[] = []
    for (const file of selected) {
      const key = `${file.name}\u0000${file.size}`
      if (existing.has(key)) continue
      existing.add(key)
      next.push({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type })
    }
    patchConversation({ pendingFiles: [...pendingFiles, ...next] })
    event.currentTarget.value = ''
    if (next.length) toast({ title: `${next.length}개 파일의 첨부 정보를 추가했어요.` })
    else toast({ title: '같은 파일이 이미 첨부되어 있어요.' })
  }
  function removePendingFile(id: string) {
    patchConversation({ pendingFiles: pendingFiles.filter((file) => file.id !== id) })
    requestAnimationFrame(() => messageInput.current?.focus())
  }

  return <DirectionProvider direction={direction}>
    <section className="team-conversation" dir={direction} aria-labelledby={headingId}>
      <header className="team-conversation-header">
        <div className="team-conversation-heading">
          <div className="team-conversation-eyebrow"><MessageSquare size={15} aria-hidden="true" /><span>MORU STUDIO</span><Badge variant="outline">{activeMembers.length}명 참여 중</Badge></div>
          <h2 id={headingId}>함께 다듬는 작업실</h2>
          <p>작은 의견부터 공유 자료까지, 팀의 대화를 한곳에 모아요.</p>
        </div>
        <div className="team-conversation-top-actions"><Toggle variant="outline" pressed={direction === 'rtl'} onPressedChange={(pressed) => patchConversation({ direction: pressed ? 'rtl' : 'ltr' })} aria-label="오른쪽부터 읽기"><Languages size={15} aria-hidden="true" />오른쪽부터 읽기</Toggle></div>
      </header>

      <div className="team-conversation-nav">
        <ButtonGroup aria-label="작업실 보기">
          <Button variant={activeTab === 'conversation' ? 'primary' : 'secondary'} aria-pressed={activeTab === 'conversation'} aria-controls={`${tabId}-conversation`} onClick={() => patchConversation({ activeTab: 'conversation' })}><MessageSquare size={15} aria-hidden="true" />대화 <span>{messages.length}</span></Button>
          <Button variant={activeTab === 'files' ? 'primary' : 'secondary'} aria-pressed={activeTab === 'files'} aria-controls={`${tabId}-files`} onClick={() => patchConversation({ activeTab: 'files' })}><Paperclip size={15} aria-hidden="true" />공유 파일 <span>{sharedFiles.length}</span></Button>
        </ButtonGroup>
        <Button variant="ghost" size="sm" onClick={jumpToLatest}><ArrowDown size={14} aria-hidden="true" />최신 대화</Button>
      </div>

      <div className="team-conversation-body">
        {pinned.length ? <Collapsible className="team-conversation-pins" title={<span><Pin size={14} aria-hidden="true" />고정한 메시지 <Badge variant="secondary">{pinned.length}</Badge></span>}>
          <ScrollArea className="team-conversation-pin-scroll" aria-label="고정한 메시지 목록"><ItemGroup>
            {pinned.map((message) => <Item key={message.id} variant="muted" size="sm" className="team-conversation-pin-item"><ItemMedia><Pin size={15} aria-hidden="true" /></ItemMedia><ItemContent><ItemTitle>{message.text || '첨부 파일을 공유했어요.'}</ItemTitle><ItemDescription>{getAuthorName(message)} · {message.time}</ItemDescription></ItemContent><ItemActions><Button variant="ghost" size="sm" aria-label={`${getAuthorName(message)}의 고정 메시지로 이동`} onClick={() => jumpToMessage(message.id)}><ArrowUpRight size={15} aria-hidden="true" /></Button></ItemActions></Item>)}
          </ItemGroup></ScrollArea>
        </Collapsible> : null}

        <div id={`${tabId}-conversation`} className="team-conversation-panel" hidden={activeTab !== 'conversation'}>
          <MessageScroller ref={scroller} className="team-conversation-feed" height={470} aria-label="팀 작업실 대화" aria-live={activeTab === 'conversation' ? 'polite' : 'off'}>
            <Marker variant="separator"><MarkerContent>릴리스를 준비하는 팀의 대화</MarkerContent></Marker>
            {messages.map((message) => <ConversationEntry key={message.id} message={message} authorName={getAuthorName(message)} messageRef={(element) => { if (element) messageElements.current.set(message.id, element); else messageElements.current.delete(message.id) }} onLike={() => dispatch({ type: 'conversation/react', id: message.id })} onPin={() => dispatch({ type: 'conversation/pin', id: message.id })} />)}
            <Marker variant="border" tone="info"><MarkerIcon><MessageSquare size={14} /></MarkerIcon><MarkerContent>메시지와 첨부 목록은 현재 작업 세션에 보관됩니다.</MarkerContent></Marker>
          </MessageScroller>
        </div>

        <div id={`${tabId}-files`} className="team-conversation-panel" hidden={activeTab !== 'files'}>
          {sharedFiles.length ? <ScrollArea className="team-conversation-file-scroll" aria-label="대화에서 공유한 파일"><div className="team-conversation-file-list">
            {sharedFiles.map(({ file, message }) => <div key={`${message.id}-${file.id}`} className="team-conversation-file-entry"><Attachment fileName={file.name} fileSize={file.size} /><p>{getAuthorName(message)} · {message.time}</p><Button variant="ghost" size="sm" onClick={() => jumpToMessage(message.id)}>원본 메시지 보기<ArrowUpRight size={14} aria-hidden="true" /></Button></div>)}
          </div></ScrollArea> : <div className="team-conversation-empty-files"><FileText size={22} aria-hidden="true" /><h3>아직 공유한 파일이 없어요.</h3><p className="team-conversation-note">메시지에 파일을 첨부하면 이곳에서도 확인할 수 있어요.</p><Button variant="secondary" onClick={() => { patchConversation({ activeTab: 'conversation' }); fileInput.current?.click() }}>파일 첨부하기</Button></div>}
        </div>

        <form className="team-conversation-composer" onSubmit={send}>
          <label htmlFor={composerId}>작업실에 메시지 남기기</label>
          {pendingFiles.length ? <div className="team-conversation-attachments" aria-label="보낼 파일 목록">{pendingFiles.map((file) => <Attachment key={file.id} fileName={file.name} fileSize={file.size} size="sm" onRemove={() => removePendingFile(file.id)} />)}</div> : null}
          <InputGroup>
            <InputGroupTextarea ref={messageInput} id={composerId} value={draft} maxLength={2000} rows={3} placeholder="다음으로 다듬을 부분을 이야기해 주세요." aria-describedby={`${composerId}-help`} onChange={(event) => patchConversation({ draft: event.target.value })} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); send() } }} />
            <InputGroupAddon align="block-end">
              <div className="team-conversation-composer-tools"><InputGroupButton type="button" aria-label="메시지에 파일 첨부" onClick={() => fileInput.current?.click()}><Paperclip size={16} aria-hidden="true" />첨부</InputGroupButton><span className="team-conversation-composer-shortcut"><KbdGroup><Kbd>Ctrl / ⌘</Kbd><Kbd>Enter</Kbd></KbdGroup><span>전송</span></span></div>
              <InputGroupButton type="submit" variant="primary" disabled={!canSend}><Send size={15} aria-hidden="true" />보내기</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <input ref={fileInput} type="file" multiple className="team-conversation-sr-only" tabIndex={-1} aria-label="첨부할 파일 선택" onChange={attachFiles} />
          <p id={`${composerId}-help`} className="team-conversation-note">{draft.length.toLocaleString('ko-KR')} / 2,000자 · 파일은 이름과 크기만 보관하며, 외부로 전송되지 않습니다.</p>
        </form>

        <Collapsible className="team-conversation-guide" title="팀의 공유 가이드" open={guideOpen} onOpenChange={setGuideOpen}>
          <ul><li>결정한 내용은 메시지를 고정해 팀이 다시 찾기 쉽게 해 주세요.</li><li>짧은 공감은 좋아요로 남기고, 자세한 의견은 메시지로 이어가요.</li><li>화면을 구현할 때는 아래 공통 색상과 여백 기준을 함께 사용해요.</li></ul>
          <CodeBlock value={handoffCode} filename="brand-handoff.css" language="css" lineNumbers defaultWrap onCopy={() => toast({ title: '공유 가이드 코드를 복사했어요.', tone: 'success' })} />
        </Collapsible>
      </div>
    </section>
  </DirectionProvider>
}

