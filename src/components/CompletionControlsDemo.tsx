import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Bold, Check, FileText, Search, X } from 'lucide-react'
import { AspectRatio } from './ui/aspect-ratio'
import { ButtonGroup, ButtonGroupText } from './ui/button-group'
import { DirectionProvider } from './ui/direction-provider'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from './ui/input-group'
import { InputOTP } from './ui/input-otp'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from './ui/item'
import { Kbd, KbdGroup } from './ui/kbd'
import { Label } from './ui/label'
import { NativeSelect } from './ui/native-select'
import { Spinner } from './ui/spinner'
import { Toggle } from './ui/toggle'
import { Button } from './ui/button'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Tabs } from './ui/tabs'
import { Badge } from './ui/badge'
import { MoruMark } from './brand'
import type { ControlsComponentId } from './completion-controls-catalog'
import './completion-controls-demo.css'

export interface CompletionControlsDemoProps { id: ControlsComponentId; disabled: boolean; size: 'sm' | 'md' | 'lg'; onNotice?: (message: string) => void }

const projects = ['브랜드 리뉴얼', '디자인 시스템', '새로운 프로젝트']

export function CompletionControlsDemo({ id, disabled, size, onNotice }: CompletionControlsDemoProps) {
  const labelControlId = `label-project-${useId()}`
  const [ratio, setRatio] = useState(16 / 9)
  const [page, setPage] = useState(1)
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr')
  const [query, setQuery] = useState('')
  const [otp, setOtp] = useState('')
  const [opened, setOpened] = useState(false)
  const [visibility, setVisibility] = useState('team')
  const [bold, setBold] = useState(false)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [note, setNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  switch (id) {
    case 'aspect-ratio': return <div className="completion-controls-stack"><ButtonGroup aria-label="콘텐츠 비율"><Button size="sm" variant={ratio === 16 / 9 ? 'primary' : 'secondary'} disabled={disabled} aria-pressed={ratio === 16 / 9} onClick={() => setRatio(16 / 9)}>16:9</Button><Button size="sm" variant={ratio === 1 ? 'primary' : 'secondary'} disabled={disabled} aria-pressed={ratio === 1} onClick={() => setRatio(1)}>1:1</Button></ButtonGroup><AspectRatio ratio={ratio} className="completion-controls-art"><MoruMark className="completion-controls-art-mark" width={64} height={64} /><span>Moru Studio</span></AspectRatio></div>
    case 'button-group': return <div className="completion-controls-stack"><ButtonGroup aria-label="예제 페이지 이동"><Button variant="secondary" size={size} disabled={disabled || page === 1} aria-label="이전 예제 페이지" onClick={() => setPage((current) => current - 1)}><ArrowLeft /></Button><ButtonGroupText>{page} / 5</ButtonGroupText><Button variant="secondary" size={size} disabled={disabled || page === 5} aria-label="다음 예제 페이지" onClick={() => setPage((current) => current + 1)}><ArrowRight /></Button></ButtonGroup><p className="completion-controls-caption" role="status">프로젝트 {page} · 연결된 버튼으로 이동해 보세요.</p></div>
    case 'direction': return <div className="completion-controls-stack"><Toggle pressed={direction === 'rtl'} onPressedChange={(pressed) => setDirection(pressed ? 'rtl' : 'ltr')} disabled={disabled} size={size} variant="outline" aria-label="오른쪽에서 왼쪽으로 읽기">RTL {direction === 'rtl' ? '켜짐' : '꺼짐'}</Toggle><DirectionProvider direction={direction}><div dir={direction} inert={disabled || undefined} className="completion-controls-direction"><Tabs size={size} aria-label="읽기 방향 예제" items={[{ value: 'first', label: 'First', content: <p>1 · {direction.toUpperCase()}</p> }, { value: 'second', label: 'Second', content: <p>2 · {direction.toUpperCase()}</p> }]} /></div></DirectionProvider><p className="completion-controls-caption">읽기 방향과 탭의 좌우 방향키가 함께 바뀝니다.</p></div>
    case 'input-group': return <div className="completion-controls-stack"><Field label="프로젝트 검색"><InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput value={query} onChange={(event) => setQuery(event.target.value)} disabled={disabled} size={size} placeholder="프로젝트 이름" /><InputGroupAddon align="inline-end"><InputGroupButton disabled={disabled || !query} aria-label="검색어 지우기" onClick={() => setQuery('')}><X /></InputGroupButton></InputGroupAddon></InputGroup></Field><div className="completion-controls-results" role="status">{projects.filter((project) => project.includes(query.trim())).map((project) => <span key={project}>{project}</span>)}{!projects.some((project) => project.includes(query.trim())) ? <span>일치하는 프로젝트가 없어요.</span> : null}</div></div>
    case 'input-otp': return <div className="completion-controls-stack"><Field label="6자리 인증 번호" description="숫자를 입력하거나 123 456을 붙여넣으세요."><InputOTP value={otp} onValueChange={setOtp} length={6} size={size} disabled={disabled} onComplete={() => onNotice?.('6자리 입력을 완료했어요.')} /></Field><p className="completion-controls-caption" role="status">{otp.length === 6 ? '6자리 입력 완료 · 실제 인증 요청은 보내지 않아요.' : `${otp.length} / 6자리 입력`}</p><Button size="sm" variant="ghost" disabled={disabled || !otp} onClick={() => setOtp('')}>지우기</Button></div>
    case 'item': return <div className="completion-controls-stack"><Item variant="outline" size={size}><ItemMedia><FileText aria-hidden="true" /></ItemMedia><ItemContent><ItemTitle>프로젝트 안내</ItemTitle><ItemDescription>함께 시작하기 위한 문서</ItemDescription></ItemContent><ItemActions><Button variant="secondary" size="sm" disabled={disabled} onClick={() => setOpened((current) => !current)} aria-expanded={opened}>{opened ? '접기' : '열기'}</Button></ItemActions></Item>{opened ? <p className="completion-controls-note">프로젝트의 목표를 정하고, 팀원을 초대한 뒤 첫 일정을 등록하세요.</p> : null}</div>
    case 'kbd': return <div className="completion-controls-stack"><form onSubmit={(event) => { event.preventDefault(); if (disabled || !note.trim()) return; setSavedNote(note.trim()); onNotice?.('메모를 저장했어요.') }}><Field label="빠른 메모"><Input value={note} onChange={(event) => setNote(event.target.value)} disabled={disabled} size={size} placeholder="메모를 입력하세요" onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !disabled && note.trim()) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} /></Field><div className="completion-controls-row"><Button size="sm" type="submit" disabled={disabled || !note.trim()}>저장</Button><KbdGroup aria-label="Command 또는 Control 더하기 Enter"><Kbd>⌘ / Ctrl</Kbd><Kbd>↵</Kbd></KbdGroup></div></form>{savedNote ? <p className="completion-controls-caption" role="status">저장한 메모 · {savedNote}</p> : null}</div>
    case 'label': return <div className="completion-controls-stack"><Label htmlFor={labelControlId}>프로젝트 이름</Label><Input id={labelControlId} size={size} disabled={disabled} placeholder="라벨을 누르면 여기에 초점이 와요" /><p className="completion-controls-caption">이름을 클릭해 입력으로 이동해 보세요.</p></div>
    case 'native-select': return <div className="completion-controls-stack"><Field label="프로젝트 공개 범위"><NativeSelect size={size} disabled={disabled} value={visibility} onValueChange={setVisibility}><option value="private">나만 보기</option><option value="team">팀과 공유</option><option value="public">전체 공개</option><option value="enterprise" disabled>조직 공개 · 준비 중</option></NativeSelect></Field><Badge variant="secondary" tone={visibility === 'public' ? 'warning' : 'info'}>{visibility === 'private' ? '나만 볼 수 있어요' : visibility === 'team' ? '팀원과 공유해요' : '누구나 볼 수 있어요'}</Badge></div>
    case 'spinner': return <div className="completion-controls-stack"><div className="completion-controls-row" aria-busy={loading}>{loading ? <Spinner size={size} label="예제 프로젝트 불러오는 중" /> : completed ? <Check size={16} aria-hidden="true" /> : <Spinner size={size} label="로딩 표시 미리보기" />}<span className="completion-controls-caption" role="status">{loading ? '프로젝트를 불러오고 있어요.' : completed ? '프로젝트를 불러왔어요.' : '로딩 상태를 확인해 보세요.'}</span></div><Button variant="secondary" size={size} disabled={disabled || loading} onClick={() => { setLoading(true); setCompleted(false); timer.current = setTimeout(() => { setLoading(false); setCompleted(true); timer.current = null }, 1000) }}>{loading ? '불러오는 중' : '불러오기'}</Button></div>
    case 'toggle': return <div className="completion-controls-stack"><Toggle aria-label="미리보기 글자 굵게" pressed={bold} onPressedChange={setBold} disabled={disabled} size={size} variant="outline"><Bold aria-hidden="true" />굵게</Toggle><p className="completion-controls-note" style={{ fontWeight: bold ? 700 : 400 }}>작은 시작을 단단한 제품으로.</p><p className="completion-controls-caption">굵게 · {bold ? '켜짐' : '꺼짐'}</p></div>
  }
}
