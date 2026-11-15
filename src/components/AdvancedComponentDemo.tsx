import { localizeCatalogItems } from './catalog-search'
import { useI18n } from '../i18n'
import { useState } from 'react'
import { ArrowRight, Check, LayoutGrid, List, Plus, Search, Trash2 } from 'lucide-react'
import { AlertDialog } from './ui/alert-dialog'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { CalendarVariationsDemo } from './DateTimeComponentDemo'
import { Card } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Combobox } from './ui/combobox'
import { Command } from './ui/command'
import { DatePicker } from './ui/date-picker'
import { Empty } from './ui/empty'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Pagination } from './ui/pagination'
import { Sheet } from './ui/sheet'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { ToggleGroup } from './ui/toggle-group'
import { useToast } from './ui/toast'
import type { AdvancedComponentId } from './component-catalog'
import type { DemoSize } from './ExtendedComponentDemo'
import './advanced-component-demo.css'

interface AdvancedComponentDemoProps {
  id: AdvancedComponentId
  disabled: boolean
  size: DemoSize
}

const people = [
  { value: 'minji', label: '민지', description: '프로덕트 디자인' },
  { value: 'suhyeon', label: '수현', description: '프론트엔드 개발' },
  { value: 'jae', label: '제이', description: '브랜드 디자인' },
  { value: 'seoyeon', label: '서연', description: '프로덕트 기획' },
]

export function AdvancedComponentDemo({ id, disabled, size }: AdvancedComponentDemoProps) {
  const { t, formatLocale } = useI18n()
  const { toast } = useToast()
  const [person, setPerson] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [date, setDate] = useState<Date | null>(() => (id === 'date-picker' ? null : new Date()))
  const [submittedDate, setSubmittedDate] = useState<string | null>(null)
  const [layout, setLayout] = useState(['list'])
  const [hasProject, setHasProject] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [failConfirmation, setFailConfirmation] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [projectName, setProjectName] = useState('새로운 프로젝트')
  const [draftName, setDraftName] = useState(projectName)

  switch (id) {
    case 'toast':
      return (
        <div className="advanced-demo-stack">
          <div className="advanced-demo-row">
            <Button
              size={size}
              disabled={disabled}
              onClick={() =>
                toast({
                  title: t('변경 사항을 저장했어요.'),
                  description: t('현재 작업을 계속할 수 있어요.'),
                  tone: 'success',
                })
              }
            >
              <Check />
              {t('저장 알림')}
            </Button>
            <Button
              size={size}
              variant="secondary"
              disabled={disabled}
              onClick={() =>
                toast({
                  title: t('저장하지 못했어요.'),
                  description: t('다시 시도해 주세요.'),
                  tone: 'danger',
                  action: {
                    label: t('다시 시도'),
                    onClick: () => {
                      toast({ title: t('다시 저장했어요.'), tone: 'success' })
                    },
                  },
                })
              }
            >
              {t('오류·다시 시도')}
            </Button>
          </div>
          <span className="advanced-demo-caption">
            {t('결과를 확인하고, 알림에서 다음 동작을 이어가세요.')}
          </span>
        </div>
      )
    case 'combobox':
      return (
        <div className="advanced-demo-stack">
          <Field label={t('프로젝트 담당자')}>
            <Combobox
              items={localizeCatalogItems(people, t)}
              value={person}
              onValueChange={setPerson}
              placeholder={t('이름으로 검색')}
              disabled={disabled}
              size={size}
            />
          </Field>
          <span className="advanced-demo-caption">
            {t('선택한 담당자 ·')}
            {people.find((item) => item.value === person)?.label ?? t('아직 없어요')}
          </span>
        </div>
      )
    case 'alert-dialog':
      return (
        <div className="advanced-demo-stack">
          <AlertDialog
            trigger={
              <Button variant="danger" size={size} disabled={disabled}>
                <Trash2 />
                {t('삭제 확인')}
              </Button>
            }
            title={t('프로젝트를 삭제할까요?')}
            description={t('예제 항목을 삭제한 상태로 바꿉니다. 아래에서 다시 시작할 수 있어요.')}
            confirmLabel={t('삭제하기')}
            destructive
            onConfirm={async () => {
              if (failConfirmation) {
                setFailConfirmation(false)
                throw new Error(t('삭제하지 못했어요. 다시 시도하면 완료됩니다.'))
              }
              setConfirmed(true)
              toast({
                title: t('예제 프로젝트를 삭제했어요.'),
                action: { label: t('실행 취소'), onClick: () => setConfirmed(false) },
              })
            }}
          />
          <Checkbox
            label={t('실패 상태 확인')}
            checked={failConfirmation}
            onCheckedChange={setFailConfirmation}
            disabled={disabled}
          />
          <div className="advanced-demo-row">
            <Badge variant="secondary" tone={confirmed ? 'warning' : 'success'}>
              {confirmed ? t('삭제한 상태') : t('프로젝트 유지')}
            </Badge>
            {confirmed ? (
              <Button
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => setConfirmed(false)}
              >
                {t('다시 시작')}
              </Button>
            ) : null}
          </div>
        </div>
      )
    case 'sheet':
      return (
        <div className="advanced-demo-stack">
          <span className="advanced-demo-label">{projectName}</span>
          <Sheet
            title={t('프로젝트 편집')}
            description={t('작업하던 화면을 유지하며 내용을 다듬으세요.')}
            open={sheetOpen}
            onOpenChange={(open) => {
              if (open) setDraftName(projectName)
              setSheetOpen(open)
            }}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                {t('상세 편집')}
                <ArrowRight />
              </Button>
            }
            footer={
              <>
                <Button variant="secondary" onClick={() => setSheetOpen(false)}>
                  {t('취소')}
                </Button>
                <Button
                  onClick={() => {
                    if (!draftName.trim()) return
                    setProjectName(draftName.trim())
                    setSheetOpen(false)
                    toast({ title: t('프로젝트 이름을 바꿨어요.'), tone: 'success' })
                  }}
                  disabled={!draftName.trim()}
                >
                  {t('저장하기')}
                </Button>
              </>
            }
          >
            <Field label={t('프로젝트 이름')}>
              <Input value={draftName} onChange={(event) => setDraftName(event.target.value)} />
            </Field>
          </Sheet>
        </div>
      )
    case 'empty':
      return hasProject ? (
        <Card className="advanced-demo-stack">
          <span className="advanced-demo-label">{t('첫 번째 프로젝트')}</span>
          <Badge tone="success" variant="secondary">
            {t('시작했어요')}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => setHasProject(false)}
          >
            {t('빈 상태로 돌아가기')}
          </Button>
        </Card>
      ) : (
        <Empty
          title={t('아직 프로젝트가 없어요.')}
          description={t('첫 번째 아이디어를 시작해 보세요.')}
        >
          <Button size="sm" disabled={disabled} onClick={() => setHasProject(true)}>
            <Plus />
            {t('프로젝트 만들기')}
          </Button>
        </Empty>
      )
    case 'table':
      return (
        <Table aria-label={t('예제 팀원 목록')}>
          <TableCaption>{t('함께하는 사람과 역할')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>{t('이름')}</TableHead>
              <TableHead>{t('역할')}</TableHead>
              <TableHead>{t('상태')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{t('민지')}</TableCell>
              <TableCell>{t('디자이너')}</TableCell>
              <TableCell>
                <Badge variant="secondary" tone="success">
                  {t('활동 중')}
                </Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t('수현')}</TableCell>
              <TableCell>{t('개발자')}</TableCell>
              <TableCell>
                <Badge variant="secondary">{t('초대 대기')}</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )
    case 'pagination':
      return (
        <div className="advanced-demo-stack">
          <span className="advanced-demo-label">{t('프로젝트 목록')}</span>
          <Pagination page={page} pageCount={8} onPageChange={setPage} disabled={disabled} />
          <span className="advanced-demo-caption" role="status">
            {page}
            {t('/ 8 페이지 · 항목')}
            {(page - 1) * 10 + 1}–{page * 10}
          </span>
        </div>
      )
    case 'calendar':
      return <CalendarVariationsDemo disabled={disabled} />
    case 'date-picker':
      return (
        <form
          className="advanced-demo-stack"
          aria-label={t('마감일 제출 예제')}
          onSubmit={(event) => {
            event.preventDefault()
            if (disabled) return
            const submitted = new FormData(event.currentTarget).get('due')
            setSubmittedDate(typeof submitted === 'string' ? submitted : null)
          }}
          onReset={(event) => {
            const nativeEvent = event.nativeEvent
            queueMicrotask(() => {
              if (!nativeEvent.defaultPrevented) {
                setDate(null)
                setSubmittedDate(null)
              }
            })
          }}
        >
          <DatePicker
            locale={formatLocale}
            size={size}
            label={t('프로젝트 마감일')}
            name="due"
            required
            value={date}
            onValueChange={(next) => {
              setDate(next)
              setSubmittedDate(null)
            }}
            calendarOptions={{ variant: 'minimal', fixedWeeks: false, weekStartsOn: 1 }}
            disabled={disabled}
          />
          <div className="advanced-demo-row">
            <Button type="submit" size={size} disabled={disabled}>
              {t('날짜 제출')}
            </Button>
            <Button type="reset" variant="secondary" size={size} disabled={disabled}>
              {t('날짜 초기화')}
            </Button>
          </div>
          <span className="advanced-demo-caption" role="status">
            {submittedDate
              ? t('제출한 값 · {submittedDate}', { submittedDate: submittedDate })
              : t('제출 전 · 날짜를 선택해 주세요.')}
          </span>
          <span className="advanced-demo-caption">
            {t('미니멀 달력 · 월요일 시작 · 초기화하면 선택 날짜와 제출 결과를 비웁니다.')}
          </span>
        </form>
      )
    case 'command':
      return (
        <div className="advanced-demo-stack">
          <Command
            title={t('빠른 실행')}
            placeholder={t('동작을 검색하세요')}
            trigger={
              <Button variant="secondary" size={size} disabled={disabled}>
                <Search />
                {t('빠른 실행')}
              </Button>
            }
            items={[
              {
                id: 'new',
                label: t('새 프로젝트 만들기'),
                keywords: ['new', 'project'],
                group: '프로젝트',
                onSelect: () => {
                  toast({ title: t('새 프로젝트를 준비했어요.'), tone: 'success' })
                },
              },
              {
                id: 'invite',
                label: t('팀원 초대'),
                description: t('함께할 사람을 추가합니다.'),
                keywords: ['invite', 'team'],
                group: '워크스페이스',
                onSelect: () => {
                  toast({ title: t('팀원 초대 동작을 선택했어요.') })
                },
              },
              {
                id: 'settings',
                label: t('디자인 설정'),
                keywords: ['design', 'tokens'],
                group: '워크스페이스',
                onSelect: () => {
                  toast({ title: t('디자인 설정 동작을 선택했어요.') })
                },
              },
            ]}
          />
          <span className="advanced-demo-caption">
            {t('검색하고, 방향키와 Enter로 실행하세요.')}
          </span>
        </div>
      )
    case 'toggle-group':
      return (
        <div className="advanced-demo-stack">
          <ToggleGroup
            aria-label={t('예제 목록 보기 방식')}
            value={layout}
            onValueChange={setLayout}
            preventEmpty
            size={size}
            disabled={disabled}
            items={[
              { value: 'list', label: t('목록'), icon: <List size={14} /> },
              { value: 'grid', label: t('카드'), icon: <LayoutGrid size={14} /> },
            ]}
          />
          <div className="advanced-demo-layout" data-layout={layout[0]}>
            <span>{t('프로젝트 A')}</span>
            <span>{t('프로젝트 B')}</span>
          </div>
        </div>
      )
  }
}
