import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import {
  BellRing,
  CalendarClock,
  CircleHelp,
  ClipboardList,
  Code2,
  Compass,
  History,
  Palette,
  RefreshCw,
  Star,
  Type,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import { MoruHomeExampleCard as ExampleCard, MoruHomeExampleCards } from '../site/MoruHomeExamples'
import { Accordion } from '../ui/accordion'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Breadcrumb } from '../ui/breadcrumb'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { calendarDateKey } from '../ui/calendar-utils'
import { Checkbox } from '../ui/checkbox'
import { CodeBlock } from '../ui/code-block'
import { Empty } from '../ui/empty'
import { Menu } from '../ui/menu'
import { Pagination } from '../ui/pagination'
import { Progress } from '../ui/progress'
import { Spinner } from '../ui/spinner'
import { StatusMessage } from '../ui/status-message'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs } from '../ui/tabs'
import { TimeRangePicker, type TimeRangeValue } from '../ui/time-range-picker'
import { getTimeRangeDuration } from '../ui/time-utils'
import { useToast } from '../ui/toast'
import { ToggleGroup } from '../ui/toggle-group'
import { Typography } from '../ui/typography'
import './playground-examples.css'

const palette = [
  { label: '페이지 배경', token: '--ui-background' },
  { label: '카드 표면', token: '--ui-surface' },
  { label: '주 강조색', token: '--ui-primary' },
  { label: '보조 강조색', token: '--ui-accent' },
  { label: '본문 색상', token: '--ui-text' },
  { label: '성공', token: '--ui-success' },
  { label: '경고', token: '--ui-warning' },
  { label: '오류', token: '--ui-danger' },
] as const

function FoundationExample() {
  const { t } = useI18n()
  return (
    <ExampleCard icon={Palette} title={t('색상과 타이포그래피')}>
      <div className="moru-playground-foundation">
        <div className="moru-playground-foundation__type">
          <Typography variant="display" as="p" className="moru-playground-foundation__display">
            {t('작은 디테일, 큰 차이')}
          </Typography>
          <Typography variant="body">
            {t('선택한 글꼴과 역할별 글자 크기가 예제 전체에 적용됩니다.')}
          </Typography>
        </div>
        <ul className="moru-playground-foundation__palette" aria-label={t('현재 색상 견본')}>
          {palette.map(({ label, token }) => (
            <li key={token}>
              <span
                className="moru-playground-foundation__swatch"
                style={{ '--moru-playground-swatch': `var(${token})` } as CSSProperties}
                aria-hidden="true"
              />
              <Typography variant="caption">{t(label)}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </ExampleCard>
  )
}

function PlanningExample() {
  const { t, formatLocale } = useI18n()
  const { toast } = useToast()
  const [date, setDate] = useState(() => new Date())
  const [range, setRange] = useState<TimeRangeValue>({ start: '10:00', end: '11:30' })
  const [savedSlot, setSavedSlot] = useState('')
  const duration = getTimeRangeDuration(range)
  const dateLabel = new Intl.DateTimeFormat(formatLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
  const validRange = duration !== null && duration > 0
  const slot = validRange ? `${dateLabel} · ${range.start}–${range.end}` : ''
  const slotKey = validRange ? `${calendarDateKey(date)}/${range.start}/${range.end}` : ''
  const saved = slotKey !== '' && slotKey === savedSlot

  return (
    <ExampleCard icon={CalendarClock} title={t('집중 시간 만들기')}>
      <Calendar
        size="sm"
        variant="minimal"
        value={date}
        onValueChange={setDate}
        fixedWeeks={false}
        locale={formatLocale}
      />
      <TimeRangePicker
        size="sm"
        value={range}
        onValueChange={setRange}
        step={15}
        clearable={false}
      />
      <div className="moru-home-example__actions">
        <Typography variant="caption" className="moru-home-example__status" role="status">
          {saved
            ? t('예제 일정에 추가됨')
            : slot || t('종료 시간을 시작 시간보다 늦게 설정하세요.')}
        </Typography>
        <Button
          size="sm"
          variant="secondary"
          textWrap="wrap"
          disabled={!slot || saved}
          onClick={() => {
            setSavedSlot(slotKey)
            toast({
              title: t('예제 일정에 집중 시간을 추가했어요.'),
              description: slot,
              tone: 'success',
            })
          }}
        >
          {t('집중 시간 추가')}
        </Button>
      </div>
    </ExampleCard>
  )
}

const projectSections = [
  { value: 'overview', label: '개요', text: '사용자 테스트를 위한 첫 번째 안을 준비 중입니다.' },
  { value: 'files', label: '파일', text: '레이아웃과 컴포넌트 초안이 정리되어 있습니다.' },
  { value: 'review', label: '리뷰', text: '다음 회의에서 피드백을 검토합니다.' },
] as const

function NavigationExample() {
  const { t } = useI18n()
  const [active, setActive] = useState<string>('overview')
  const [favorite, setFavorite] = useState(false)
  const section = projectSections.find(({ value }) => value === active) ?? projectSections[0]

  return (
    <ExampleCard icon={Compass} title={t('프로젝트 탐색')}>
      <div className="moru-playground-examples__toolbar">
        <Breadcrumb
          size="sm"
          items={[
            { label: t('프로젝트'), onClick: () => setActive('overview') },
            { label: t(section.label) },
          ]}
        />
        <Menu
          size="sm"
          trigger={
            <Button textWrap="wrap" size="sm" variant="ghost">
              {t('작업 메뉴')}
            </Button>
          }
          items={[
            {
              label: favorite ? t('즐겨찾기 해제') : t('즐겨찾기 추가'),
              onClick: () => setFavorite((value) => !value),
              icon: <Star size={14} aria-hidden="true" />,
            },
            { label: t('리뷰로 이동'), onClick: () => setActive('review') },
          ]}
        />
      </div>
      <Tabs
        size="sm"
        value={active}
        onValueChange={setActive}
        aria-label={t('프로젝트 탐색')}
        items={projectSections.map(({ value, label, text }) => ({
          value,
          label: t(label),
          content: <Typography variant="body">{t(text)}</Typography>,
        }))}
      />
      {favorite && (
        <Badge tone="success" variant="secondary">
          {t('즐겨찾기')}
        </Badge>
      )}
    </ExampleCard>
  )
}

const revisions = [
  { name: '모바일 내비게이션', version: 'v1.8' },
  { name: '접근성 검토', version: 'v1.7' },
  { name: '알림 스타일', version: 'v1.6' },
  { name: '간격 눈금', version: 'v1.5' },
  { name: '새 아이콘 세트', version: 'v1.4' },
  { name: '카드 레이아웃', version: 'v1.3' },
] as const

function HistoryExample() {
  const { t } = useI18n()
  const [page, setPage] = useState(1)
  const pageSize = 2
  const start = (page - 1) * pageSize

  return (
    <ExampleCard icon={History} title={t('변경 기록')}>
      <ul className="moru-playground-examples__revisions">
        {revisions.slice(start, start + pageSize).map(({ name, version }) => (
          <li key={version}>
            <Typography variant="label">{t(name)}</Typography>
            <Badge variant="outline">{version}</Badge>
          </li>
        ))}
      </ul>
      <Pagination
        page={page}
        pageCount={Math.ceil(revisions.length / pageSize)}
        onPageChange={setPage}
      />
    </ExampleCard>
  )
}

const answers = [
  {
    value: 'tokens',
    title: '토큰을 바꾸면 어디에 적용되나요?',
    body: '미리보기의 카드, 버튼, 입력, 팝업에 같은 규칙이 적용됩니다.',
  },
  {
    value: 'device',
    title: '좁은 화면에서도 사용할 수 있나요?',
    body: '화면이 좁아지면 카드가 세로로 쌓입니다.',
  },
  {
    value: 'data',
    title: '예제에서 입력한 내용이 전송되나요?',
    body: '예제 입력은 이 미리보기에서만 사용됩니다.',
  },
] as const

function QuestionsExample() {
  const { t } = useI18n()
  return (
    <ExampleCard icon={CircleHelp} title={t('자주 묻는 질문')}>
      <Accordion
        defaultValue={['tokens']}
        items={answers.map(({ value, title, body }) => ({
          value,
          title: t(title),
          content: <Typography variant="body">{t(body)}</Typography>,
        }))}
      />
    </ExampleCard>
  )
}

function SyncExample() {
  const { t } = useI18n()
  const [percent, setPercent] = useState(0)
  const [running, setRunning] = useState(false)
  const completed = percent === 100

  useEffect(() => {
    if (!running) return
    const start = performance.now()
    const interval = window.setInterval(() => {
      const progress = Math.min(100, Math.round((performance.now() - start) / 24))
      setPercent(progress)
      if (progress === 100) setRunning(false)
    }, 120)
    return () => window.clearInterval(interval)
  }, [running])

  return (
    <ExampleCard icon={RefreshCw} title={t('파일 동기화')}>
      {completed ? (
        <Alert tone="success" title={t('동기화 예제를 마쳤어요.')} />
      ) : running ? (
        <StatusMessage tone="info" title={t('예제 파일을 처리하고 있어요.')} />
      ) : (
        <Typography variant="body">{t('샘플 파일의 동기화 진행률을 확인합니다.')}</Typography>
      )}
      <Progress
        label={t('동기화 진행률')}
        value={percent}
        tone={completed ? 'success' : 'primary'}
        size="sm"
        striped={running}
        animated={running}
        showValue
      />
      <div className="moru-home-example__actions">
        {running && <Spinner decorative variant="dots" size="sm" />}
        <Button
          size="sm"
          textWrap="wrap"
          variant="secondary"
          onClick={() => {
            setPercent(0)
            setRunning(!running)
          }}
        >
          {running ? t('동기화 중단') : t('예제 동기화 시작')}
        </Button>
      </div>
    </ExampleCard>
  )
}

function FormattingExample() {
  const { t } = useI18n()
  const [styles, setStyles] = useState<string[]>(['bold'])
  const [highlight, setHighlight] = useState(false)
  const pristine = styles.length === 1 && styles[0] === 'bold' && !highlight

  return (
    <ExampleCard icon={Type} title={t('텍스트 강조')}>
      <ToggleGroup
        type="multiple"
        size="sm"
        layout="segmented"
        value={styles}
        onValueChange={setStyles}
        aria-label={t('텍스트 강조')}
        items={[
          { value: 'bold', label: t('굵게') },
          { value: 'italic', label: t('기울임') },
        ]}
      />
      <Typography
        variant="body"
        className="moru-playground-examples__text-sample"
        data-bold={styles.includes('bold') || undefined}
        data-italic={styles.includes('italic') || undefined}
        data-highlight={highlight || undefined}
      >
        {t('오늘의 아이디어를 팀과 나눠 보세요.')}
      </Typography>
      <div className="moru-playground-examples__toolbar">
        <Checkbox
          size="sm"
          label={t('강조 배경')}
          checked={highlight}
          onCheckedChange={setHighlight}
        />
        <Button
          size="sm"
          variant="ghost"
          textWrap="wrap"
          disabled={pristine}
          onClick={() => {
            setStyles(['bold'])
            setHighlight(false)
          }}
        >
          {t('서식 초기화')}
        </Button>
      </div>
    </ExampleCard>
  )
}

const cssSample = `.project-card {
  background: var(--ui-surface);
  color: var(--ui-text);
  border-radius: var(--ui-radius);
}`

function CodeExample() {
  const { t } = useI18n()
  return (
    <ExampleCard icon={Code2} title={t('CSS 토큰 사용')}>
      <CodeBlock
        filename="card.css"
        language="css"
        size="sm"
        value={cssSample}
        lineNumbers
        defaultWrap
      />
    </ExampleCard>
  )
}

const sampleNotices = [
  { title: '검토 일정을 예약했어요.', tone: 'info' },
  { title: '초안에 새 댓글이 달렸어요.', tone: 'info' },
  { title: '프로젝트 설정을 저장했어요.', tone: 'success' },
] as const

function ToastExample() {
  const { t } = useI18n()
  const { toast, dismiss } = useToast()
  const noticeIds = useRef<string[]>([])

  function clearNotices() {
    noticeIds.current.forEach(dismiss)
    noticeIds.current = []
  }

  function showNotices() {
    clearNotices()
    noticeIds.current = sampleNotices.map(({ title, tone }) =>
      toast({ title: t(title), tone, duration: 9000 }),
    )
  }

  return (
    <ExampleCard icon={BellRing} title={t('알림 스택')}>
      <Typography variant="body">
        {t('여러 알림을 한 번에 띄우고, 각 알림을 따로 닫아 보세요.')}
      </Typography>
      <div className="moru-home-example__actions">
        <Button size="sm" textWrap="wrap" variant="ghost" onClick={clearNotices}>
          {t('샘플 알림 닫기')}
        </Button>
        <Button size="sm" textWrap="wrap" onClick={showNotices}>
          {t('알림 3개 띄우기')}
        </Button>
      </div>
    </ExampleCard>
  )
}

const work = [
  { name: '홈 시안', state: 'done' },
  { name: '타이포그래피 검토', state: 'review' },
  { name: '배포 점검', state: 'review' },
] as const

function TableExample() {
  const { t } = useI18n()
  const filters = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState('all')
  const items = work.filter((item) => filter === 'all' || filter === item.state)

  return (
    <ExampleCard icon={ClipboardList} title={t('작업 상태 요약')}>
      <div ref={filters}>
        <ToggleGroup
          size="sm"
          layout="segmented"
          aria-label={t('작업 필터')}
          preventEmpty
          value={[filter]}
          onValueChange={(value) => setFilter(value[0])}
          items={[
            { value: 'all', label: t('전체') },
            { value: 'review', label: t('검토') },
            { value: 'blocked', label: t('차단됨') },
          ]}
        />
      </div>
      {items.length ? (
        <Table aria-label={t('작업 상태 요약')} scrollLabel={t('작업 상태 표')}>
          <TableHeader>
            <TableRow>
              <TableHead>{t('작업')}</TableHead>
              <TableHead>{t('상태')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(({ name, state }) => (
              <TableRow key={name}>
                <TableCell>{t(name)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" tone={state === 'done' ? 'success' : 'warning'}>
                    {state === 'done' ? t('완료') : t('검토 중')}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Empty title={t('차단된 작업이 없어요.')} icon={<ClipboardList size={20} />}>
          <Button
            size="sm"
            variant="secondary"
            textWrap="wrap"
            onClick={() => {
              setFilter('all')
              filters.current?.querySelector('button')?.focus()
            }}
          >
            {t('전체 작업 보기')}
          </Button>
        </Empty>
      )}
    </ExampleCard>
  )
}

export function PlaygroundExamples() {
  const { t } = useI18n()
  const titleId = useId()
  return (
    <section className="moru-home-examples moru-playground-examples" aria-labelledby={titleId}>
      <h2 id={titleId} className="moru-home-example__sr-only">
        {t('인터랙티브 구성 예제')}
      </h2>
      <FoundationExample />
      <div className="moru-playground-examples__columns">
        <PlanningExample />
        <NavigationExample />
        <TableExample />
        <HistoryExample />
        <QuestionsExample />
        <SyncExample />
        <FormattingExample />
        <CodeExample />
        <ToastExample />
        <MoruHomeExampleCards />
      </div>
    </section>
  )
}
