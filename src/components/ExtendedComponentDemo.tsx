import { useState } from 'react'
import { ArrowRight, CircleHelp, Settings2 } from 'lucide-react'
import { Accordion } from './ui/accordion'
import { Alert } from './ui/alert'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Field } from './ui/field'
import { Popover } from './ui/popover'
import { Progress } from './ui/progress'
import { RadioGroup } from './ui/radio-group'
import { Separator } from './ui/separator'
import { Skeleton } from './ui/skeleton'
import { Slider } from './ui/slider'
import { Switch } from './ui/switch'
import { Tooltip } from './ui/tooltip'
import type { SemanticTone } from './ui'
import type { AddedComponentId } from './component-catalog'
import './extended-component-demo.css'

export type DemoSize = 'sm' | 'md' | 'lg'

export interface ExtendedComponentDemoProps {
  id: AddedComponentId
  disabled: boolean
  size: DemoSize
  tone: SemanticTone
  progress: number
  onProgressChange: (value: number) => void
  loading: boolean
  onLoadingChange: (loading: boolean) => void
  onNotice: (message: string) => void
}

// Kept outside App so each specimen owns its interaction state across token edits.
export function ExtendedComponentDemo({
  id, disabled, size, tone, progress, onProgressChange, loading, onLoadingChange, onNotice,
}: ExtendedComponentDemoProps) {
  const [notifications, setNotifications] = useState(true)
  const [access, setAccess] = useState('team')
  const [scale, setScale] = useState(60)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [comments, setComments] = useState(true)
  const [indeterminate, setIndeterminate] = useState(false)

  switch (id) {
    case 'switch':
      return <div className="extended-demo-stack">
        <Switch label="새로운 활동 알림" description="팀의 소식을 바로 받아보세요." checked={notifications} onCheckedChange={setNotifications} disabled={disabled} size={size} />
        <Switch label="매주 요약 받기" defaultChecked={false} disabled={disabled} size={size} />
        <span className="extended-demo-caption">활동 알림 · {notifications ? '켜짐' : '꺼짐'}</span>
      </div>
    case 'radio-group':
      return <div className="extended-demo-stack">
        <Field label="프로젝트 접근 권한"><RadioGroup name="demo-access" value={access} onValueChange={setAccess} disabled={disabled} size={size} items={[
          { value: 'private', label: '나만 보기' },
          { value: 'team', label: '팀과 공유', description: '초대한 팀원과 함께 작업해요.' },
          { value: 'public', label: '전체 공개' },
        ]} /></Field>
      </div>
    case 'slider':
      return <div className="extended-demo-stack">
        <Slider label="미리보기 배율" value={scale} onValueChange={setScale} min={0} max={100} step={5} showValue disabled={disabled} size={size} />
        <div className="extended-demo-range"><span>0%</span><span>100%</span></div>
        <span className="extended-demo-caption">방향키로 5씩, Home·End로 처음과 끝으로.</span>
      </div>
    case 'accordion':
      return <Accordion defaultValue={['tokens']} disabled={disabled} items={[
        { value: 'tokens', title: '내 제품에 맞게 바꿀 수 있나요?', content: '색상·글꼴·밀도를 토큰으로 조절하세요. 모든 컴포넌트에 같은 규칙이 적용됩니다.' },
        { value: 'source', title: '소스도 수정할 수 있나요?', content: '필요한 컴포넌트를 가져와 직접 다듬고, 제품에 맞게 조합하세요.' },
        { value: 'keyboard', title: '키보드로도 쓸 수 있나요?', content: 'Tab으로 이동하고, Enter나 Space로 항목을 펼쳐 보세요.' },
      ]} />
    case 'popover':
      return <div className="extended-demo-stack">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen} title="알림 설정" description="필요한 소식만 골라 받아보세요." trigger={<Button variant="secondary" size={size} disabled={disabled}><Settings2 />빠른 설정</Button>}>
          <div className="extended-demo-stack">
            <Switch label="새 댓글 알림" checked={comments} onCheckedChange={setComments} disabled={disabled} size={size} />
            <Button size={size} disabled={disabled} onClick={() => { setPopoverOpen(false); onNotice('알림 설정을 적용했어요.') }}>적용하기<ArrowRight /></Button>
          </div>
        </Popover>
        <span className="extended-demo-caption">버튼 옆에서 설정하고, 바깥을 누르거나 Esc로 닫으세요.</span>
      </div>
    case 'tooltip':
      return <div className="extended-demo-stack">
        <div className="extended-demo-row">
          <Tooltip trigger={<Button variant="secondary" size={size} disabled={disabled} aria-label="컴포넌트 도움말" onClick={() => onNotice('색상·글꼴·밀도는 디자인 편집에서 조절하세요.')}><CircleHelp /></Button>}>디자인 편집에서 스타일을 조절할 수 있어요.</Tooltip>
          <Tooltip trigger={<Button variant="secondary" size={size} disabled={disabled} onClick={() => onNotice('저장 버튼의 동작을 확인했어요.')}>저장하기</Button>}>변경한 설정을 저장합니다.</Tooltip>
        </div>
        <span className="extended-demo-caption">마우스를 올리거나 Tab으로 초점을 옮겨보세요.</span>
      </div>
    case 'badge':
      return <div className="extended-demo-stack">
        <div className="extended-demo-row"><Badge>진행 중</Badge><Badge variant="secondary">초안</Badge><Badge variant="outline">디자인</Badge></div>
        <div className="extended-demo-row"><Badge tone="success">완료</Badge><Badge tone="warning">검토 필요</Badge><Badge tone={tone}>선택한 의미 색상</Badge></div>
      </div>
    case 'alert':
      return <Alert title={{ success: '변경 사항을 저장했어요.', warning: '공개 전에 확인해 주세요.', info: '팀과 함께 작업해 보세요.', danger: '변경 사항을 저장하지 못했어요.' }[tone]} tone={tone} role="group">{{ success: '팀원에게도 새로운 설정이 적용됩니다.', warning: '링크가 있는 모든 사람이 내용을 볼 수 있어요.', info: '초대한 팀원과 같은 공간에서 작업할 수 있어요.', danger: '연결 상태를 확인하고 다시 시도해 주세요.' }[tone]}</Alert>
    case 'avatar':
      return <div className="extended-demo-stack">
        <div className="extended-demo-row"><Avatar alt="민지" fallback="MJ" size="sm" /><Avatar alt="수현" fallback="SH" size="md" /><Avatar alt="Moru 팀" src="/brand/moru-symbol.svg" fallback="M" size="lg" /></div>
        <div className="extended-demo-row"><Avatar alt="새 팀원" fallback="YO" size={size} /><span className="extended-demo-caption">이미지가 없어도 이름을 표시해요.</span></div>
      </div>
    case 'progress':
      return <div className="extended-demo-stack">
        <Progress label={indeterminate ? '프로젝트 준비 중' : '프로젝트 준비'} value={indeterminate ? null : progress} showValue />
        <div className="extended-demo-row"><Button variant="secondary" size="sm" disabled={disabled || indeterminate || progress <= 0} onClick={() => onProgressChange(Math.max(0, progress - 10))}>−10</Button><Button variant="secondary" size="sm" disabled={disabled || indeterminate || progress >= 100} onClick={() => onProgressChange(Math.min(100, progress + 10))}>+10</Button></div>
        <Switch label="완료 시점을 모르는 작업" checked={indeterminate} onCheckedChange={setIndeterminate} disabled={disabled} size="sm" />
      </div>
    case 'separator':
      return <div className="extended-demo-stack">
        <div className="extended-demo-copy"><strong>프로젝트 정보</strong><span>필요한 곳에, 적당한 간격으로.</span></div>
        <Separator />
        <div className="extended-demo-separated"><span>디자인</span><Separator orientation="vertical" /><span>개발</span><Separator orientation="vertical" /><span>배포</span></div>
      </div>
    case 'skeleton':
      return <div className="extended-demo-stack">
        <div className="extended-demo-placeholder" role="status" aria-label={loading ? '프로젝트 불러오는 중' : '프로젝트 불러오기 완료'} aria-busy={loading}>
          {loading ? <><Skeleton className="extended-skeleton-avatar" /><div className="extended-skeleton-copy"><Skeleton className="extended-skeleton-title" /><Skeleton className="extended-skeleton-line" /><Skeleton className="extended-skeleton-short" /></div></> : <><Avatar alt="Moru 프로젝트" fallback="M" /><div className="extended-demo-copy"><strong>나만의 프로젝트</strong><span>준비됐어요. 아이디어를 펼쳐보세요.</span></div></>}
        </div>
        <Button variant="secondary" size="sm" disabled={disabled} onClick={() => onLoadingChange(!loading)}>{loading ? '완료 모습 보기' : '로딩 모습 보기'}</Button>
      </div>
  }
}
