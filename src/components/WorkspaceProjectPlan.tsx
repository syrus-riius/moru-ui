import { useId, useRef, useState, type FormEvent } from 'react'
import { AlignLeft, CalendarDays, Check, UserRound } from 'lucide-react'
import { useWorkspaceMembers } from './WorkspaceMembersContext'
import { Alert } from './ui/alert'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import { addCalendarDays, calendarDateKey, createCalendarDate, isValidCalendarDate } from './ui/calendar-utils'
import { Card } from './ui/card'
import { Combobox } from './ui/combobox'
import { DatePicker } from './ui/date-picker'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { ToggleGroup } from './ui/toggle-group'
import { useToast } from './ui/toast'
import './workspace-project-plan.css'

export interface ProjectPlanSettings {
  name: string
  ownerId: string | null
  dueDate: string | null
  view: string[]
}

export function createProjectPlanSettings(): ProjectPlanSettings {
  return {
    name: 'Moru UI 첫 번째 릴리스',
    ownerId: 'minji',
    dueDate: calendarDateKey(addCalendarDays(new Date(), 7)) ?? null,
    view: ['summary'],
  }
}

interface WorkspaceProjectPlanProps {
  value: ProjectPlanSettings
  onChange: (next: ProjectPlanSettings) => void
}

function parseDueDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const parsed = createCalendarDate(year, month - 1, day)
  return isValidCalendarDate(parsed) && calendarDateKey(parsed) === value ? parsed : null
}

const viewItems = [
  { value: 'summary', label: '요약', icon: <AlignLeft size={14} /> },
  { value: 'calendar', label: '달력', icon: <CalendarDays size={14} /> },
]

export function WorkspaceProjectPlan({ value, onChange }: WorkspaceProjectPlanProps) {
  const id = useId()
  const { members } = useWorkspaceMembers()
  const { toast } = useToast()
  const nameRef = useRef<HTMLInputElement>(null)
  const [nameError, setNameError] = useState('')
  const [appliedSnapshot, setAppliedSnapshot] = useState(() => JSON.stringify(value))
  const [hasApplied, setHasApplied] = useState(false)
  const dirty = appliedSnapshot !== JSON.stringify(value)
  const owner = members.find((member) => member.id === value.ownerId)
  const missingOwner = Boolean(value.ownerId && !owner)
  const dueDate = parseDueDate(value.dueDate)
  const activeView = value.view[0] === 'calendar' ? 'calendar' : 'summary'
  const dateLabel = dueDate
    ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(dueDate)
    : '마감일 미정'

  function changeDueDate(next: Date | null) {
    onChange({ ...value, dueDate: calendarDateKey(next) ?? null })
  }

  function applyPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = value.name.trim()
    if (!name) {
      setNameError('프로젝트 이름을 입력해 주세요.')
      nameRef.current?.focus()
      return
    }
    const next = {
      ...value,
      name,
      ownerId: owner?.id ?? null,
      dueDate: calendarDateKey(dueDate) ?? null,
      view: [activeView],
    }
    onChange(next)
    setNameError('')
    setAppliedSnapshot(JSON.stringify(next))
    setHasApplied(true)
    toast({
      title: '프로젝트 일정을 적용했어요.',
      description: `${name}의 담당자와 마감일을 확인했습니다.`,
      tone: 'success',
    })
  }

  return (
    <section className="workspace-project-plan" aria-labelledby={`${id}-title`}>
      <header className="workspace-preview-section-heading">
        <h3 id={`${id}-title`}>다음 프로젝트의 시작</h3>
        <p>담당자를 찾고 마감일을 정해 보세요. 입력한 내용이 아래 미리보기에 함께 반영됩니다.</p>
      </header>

      <form className="workspace-project-plan-form" onSubmit={applyPlan} noValidate>
        <Field label="프로젝트 이름" description="함께할 일을 알아보기 쉬운 이름으로 적어주세요." error={nameError}>
          <Input ref={nameRef} name="projectName" value={value.name} onValueChange={(name) => { onChange({ ...value, name }); setNameError('') }} maxLength={100} required placeholder="예: Moru UI 첫 번째 릴리스" />
        </Field>
        <div className="workspace-project-plan-fields">
          <Field label="담당자" description={missingOwner ? '이전 담당자가 목록에 없어요. 새 담당자를 선택하거나 비워 둘 수 있습니다.' : '초대 중인 팀원도 담당자로 선택할 수 있어요.'}>
            <Combobox
              value={owner?.id ?? null}
              onValueChange={(ownerId) => onChange({ ...value, ownerId })}
              placeholder="이름 또는 이메일로 검색"
              items={members.map((member) => ({ value: member.id, label: member.name, description: `${member.status === 'invited' ? '초대 중 · ' : ''}${member.email}` }))}
            />
          </Field>
          <Field label="마감일" description="날짜 선택기와 아래 달력이 같은 날짜를 공유해요.">
            <DatePicker value={dueDate} onValueChange={changeDueDate} placeholder="마감일 선택" />
          </Field>
        </div>

        <Card className="workspace-project-plan-preview">
          <header className="workspace-project-plan-preview-heading">
            <div><span className="workspace-project-plan-eyebrow">PROJECT PLAN</span><h4 id={`${id}-preview-title`}>일정 미리보기</h4></div>
            <ToggleGroup type="single" items={viewItems} value={[activeView]} preventEmpty size="sm" aria-label="프로젝트 일정 미리보기 방식" onValueChange={(view) => onChange({ ...value, view })} />
          </header>
          <div className="workspace-project-plan-preview-body" aria-labelledby={`${id}-preview-title`} role="region">
            {activeView === 'summary' ? (
              <div className="workspace-project-plan-summary">
                <div className="workspace-project-plan-summary-title"><h5>{value.name.trim() || '이름 없는 프로젝트'}</h5><Badge variant="secondary" tone={hasApplied && !dirty ? 'success' : 'info'}>{hasApplied && !dirty ? '준비 완료' : '준비 중'}</Badge></div>
                <dl className="workspace-project-plan-details">
                  <div><dt><UserRound size={14} aria-hidden="true" />담당자</dt><dd className="workspace-project-plan-owner"><Avatar alt={owner ? `${owner.name} 프로필` : '담당자 미정'} fallback={owner ? owner.name.slice(0, 2) : <UserRound size={14} />} size="sm" /><span>{owner?.name ?? '담당자 미정'}</span>{owner?.status === 'invited' && <Badge variant="outline" tone="warning">초대 중</Badge>}</dd></div>
                  <div><dt><CalendarDays size={14} aria-hidden="true" />마감일</dt><dd>{dueDate ? <time dateTime={calendarDateKey(dueDate)}>{dateLabel}</time> : dateLabel}</dd></div>
                </dl>
              </div>
            ) : (
              <div className="workspace-project-plan-calendar-view">
                <div className="workspace-project-plan-calendar-copy"><strong>{value.name.trim() || '이름 없는 프로젝트'}</strong><p>날짜를 누르면 위의 마감일도 함께 바뀝니다.</p></div>
                <Calendar value={dueDate} onValueChange={changeDueDate} aria-label="프로젝트 마감일 달력" />
                <p className="workspace-project-plan-selected-date"><CalendarDays size={14} aria-hidden="true" />선택한 마감일: {dateLabel}</p>
              </div>
            )}
          </div>
        </Card>

        <Alert title={dirty ? '아직 적용하지 않은 변경 사항이 있어요.' : hasApplied ? '프로젝트 일정을 적용했어요.' : '프로젝트의 시작을 함께 정해보세요.'} tone={dirty ? 'warning' : hasApplied ? 'success' : 'info'}>
          {dirty ? '담당자와 날짜를 확인한 뒤 변경 사항을 적용해 주세요.' : hasApplied ? '확인한 일정은 화면을 오가도 유지됩니다. 새로고침하면 예제 기본값으로 돌아갑니다.' : '요약과 달력 보기를 전환하며 같은 일정이 어떻게 표현되는지 살펴보세요.'}
        </Alert>

        <footer className="workspace-project-plan-footer"><p>프로젝트 설정은 이 브라우저 예제에 반영됩니다.</p><Button type="submit">일정 적용<Check size={14} aria-hidden="true" /></Button></footer>
      </form>
    </section>
  )
}
