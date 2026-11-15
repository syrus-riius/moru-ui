import { localizeCatalogItems } from '../catalog/catalog-search'
import { useI18n } from '../../i18n'
import { useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  Clock,
  CreditCard,
  FileUp,
  FolderOpen,
  LockKeyhole,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Target,
  UserRoundPlus,
  UsersRound,
  Volume2,
  VolumeX,
  type LucideIcon,
} from 'lucide-react'
import { validateOTPBlock } from '../blocks/OTPBlock'
import { Alert } from '../ui/alert'
import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Chart } from '../ui/chart'
import { DatePicker } from '../ui/date-picker'
import { Dialog } from '../ui/dialog'
import { Field } from '../ui/field'
import { FileInput } from '../ui/file-input'
import { Input } from '../ui/input'
import { InputOTP } from '../ui/input-otp'
import { PasswordInput } from '../ui/password-input'
import { Progress } from '../ui/progress'
import { RadioGroup } from '../ui/radio-group'
import { RingProgress } from '../ui/ring-progress'
import { Select } from '../ui/select'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { ToggleGroup } from '../ui/toggle-group'
import { useToast } from '../ui/toast'
import './moru-home-examples.css'

const memberRoles = [
  { value: '편집자', label: '편집자' },
  { value: '뷰어', label: '뷰어' },
]

const initialMembers = [
  { id: 1, name: '김하은', role: '소유자' },
  { id: 2, name: '이서준', role: '편집자' },
]

const notificationSettings = [
  { key: 'activity', label: '프로젝트 활동', description: '새 댓글과 작업 변경' },
  { key: 'review', label: '검토 요청', description: '내게 배정된 리뷰' },
] as const

const initialPreferences = { activity: true, review: false }
const meetingTimes = ['10:00', '11:30', '14:00', '16:30'].map((value) => ({ value, label: value }))

function ExampleCard({
  title,
  icon: Icon,
  detail,
  children,
}: {
  title: string
  icon: LucideIcon
  detail?: ReactNode
  children: ReactNode
}) {
  const titleId = useId()

  return (
    <Card className="moru-home-example" role="region" aria-labelledby={titleId}>
      <div className="moru-home-example__heading">
        <span className="moru-home-example__icon">
          <Icon size={16} aria-hidden="true" />
        </span>
        <h3 id={titleId}>{title}</h3>
        {detail && <div className="moru-home-example__detail">{detail}</div>}
      </div>
      {children}
    </Card>
  )
}

function TeamExample() {
  const { t } = useI18n()
  const formId = useId()
  const { toast } = useToast()
  const [members, setMembers] = useState(initialMembers)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState(memberRoles[1].value)
  const [nameError, setNameError] = useState(false)

  function changeOpen(next: boolean) {
    if (next) {
      setName('')
      setRole(memberRoles[1].value)
      setNameError(false)
    }
    setOpen(next)
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const memberName = name.trim()
    if (!memberName) {
      setNameError(true)
      return
    }

    setMembers((current) => [...current, { id: current.length + 1, name: memberName, role }])
    setOpen(false)
    toast({
      title: t('{memberName} 님을 추가했어요.', { memberName: memberName }),
      tone: 'success',
    })
  }

  return (
    <ExampleCard
      title={t('팀 구성원')}
      icon={UsersRound}
      detail={
        <Badge variant="secondary" aria-live="polite">
          {members.length} {t('명')}
        </Badge>
      }
    >
      <ul className="moru-home-example__member-list" aria-label={t('팀 구성원 목록')}>
        {members.map((member) => (
          <li key={member.id}>
            <Avatar alt="" fallback={member.name.slice(0, 2)} size="sm" />
            <span className="moru-home-example__member-name">{member.name}</span>
            <span className="moru-home-example__member-role">{t(member.role)}</span>
          </li>
        ))}
      </ul>
      <div className="moru-home-example__actions">
        <Dialog
          open={open}
          onOpenChange={changeOpen}
          title={t('팀원 추가')}
          description={t('이 예제의 팀에 이름과 권한을 추가하세요.')}
          trigger={
            <Button textWrap="wrap" variant="secondary" size="sm">
              <UserRoundPlus size={14} aria-hidden="true" />
              {t('팀원 추가')}
            </Button>
          }
          footer={
            <>
              <Button
                textWrap="wrap"
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                {t('취소')}
              </Button>
              <Button textWrap="wrap" type="submit" form={formId} size="sm">
                {t('추가')}
              </Button>
            </>
          }
        >
          <form id={formId} className="moru-home-example-member-form" onSubmit={addMember}>
            <Field label={t('이름')} error={nameError ? t('이름을 입력해 주세요.') : undefined}>
              <Input
                value={name}
                onValueChange={(value) => {
                  setName(value)
                  setNameError(false)
                }}
                placeholder={t('예: 박지윤')}
                maxLength={30}
                required
              />
            </Field>
            <Field label={t('권한')}>
              <Select
                items={localizeCatalogItems(memberRoles, t)}
                value={role}
                onValueChange={setRole}
              />
            </Field>
          </form>
        </Dialog>
      </div>
    </ExampleCard>
  )
}

function NotificationsExample() {
  const { t } = useI18n()
  const { toast } = useToast()
  const [preferences, setPreferences] = useState(initialPreferences)
  const [savedPreferences, setSavedPreferences] = useState(initialPreferences)
  const hasChanges = notificationSettings.some(
    ({ key }) => preferences[key] !== savedPreferences[key],
  )

  function savePreferences() {
    setSavedPreferences(preferences)
    toast({ title: t('알림 설정을 저장했어요.'), tone: 'success' })
  }

  return (
    <ExampleCard title={t('알림 설정')} icon={Bell}>
      <div className="moru-home-example__switch-list">
        {notificationSettings.map(({ key, label, description }) => (
          <Switch
            key={key}
            label={t(label)}
            description={t(description)}
            checked={preferences[key]}
            onCheckedChange={(checked) =>
              setPreferences((current) => ({ ...current, [key]: checked }))
            }
            size="sm"
          />
        ))}
      </div>
      <div className="moru-home-example__actions">
        <span className="moru-home-example__status" role="status">
          {hasChanges ? t('변경 사항 있음') : t('저장됨')}
        </span>
        <Button
          textWrap="wrap"
          size="sm"
          variant="secondary"
          disabled={!hasChanges}
          onClick={savePreferences}
        >
          {t('저장')}
        </Button>
      </div>
    </ExampleCard>
  )
}

function BookingExample() {
  const { t, formatLocale } = useI18n()
  const dateFormat = new Intl.DateTimeFormat(formatLocale, {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
  const [date, setDate] = useState<Date | null>(() => new Date())
  const [time, setTime] = useState(meetingTimes[2].value)
  const [reservation, setReservation] = useState<string | null>(null)
  const slot = date ? `${dateFormat.format(date)} · ${time}` : ''
  const reservationKey = date
    ? `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${time}`
    : null
  const booked = reservationKey !== null && reservationKey === reservation

  return (
    <ExampleCard title={t('디자인 리뷰 예약')} icon={CalendarDays}>
      <div className="moru-home-example__booking-fields">
        <DatePicker
          locale={formatLocale}
          value={date}
          onValueChange={setDate}
          label={t('날짜')}
          clearable={false}
          calendarOptions={{ size: 'sm' }}
        />
        <Field label={t('시간')}>
          <Select
            items={localizeCatalogItems(meetingTimes, t)}
            value={time}
            onValueChange={setTime}
          />
        </Field>
      </div>
      <Alert
        className="moru-home-example__booking-status"
        title={booked ? t('예약 완료') : t('선택한 일정')}
        tone={booked ? 'success' : 'info'}
        icon={booked ? undefined : <Clock size={15} />}
      >
        {slot || t('날짜를 선택해 주세요.')}
      </Alert>
      <div className="moru-home-example__actions">
        <Button
          textWrap="wrap"
          size="sm"
          variant="secondary"
          disabled={!reservationKey || booked}
          onClick={() => setReservation(reservationKey)}
        >
          {t('예약하기')}
        </Button>
      </div>
    </ExampleCard>
  )
}

function VerificationExample() {
  const { t } = useI18n()
  const input = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const issue = validateOTPBlock(code)
    setError(issue)
    setVerified(!issue)
    if (issue) input.current?.focus()
  }

  function updateCode(value: string) {
    setCode(value)
    setError('')
    setVerified(false)
  }

  return (
    <ExampleCard title={t('인증번호 입력')} icon={ShieldCheck}>
      <form className="moru-home-example__verification" onSubmit={verify} noValidate>
        <Field
          label={t('6자리 인증번호')}
          description={t('예제 번호 123456')}
          error={error ? t(error) : undefined}
        >
          <InputOTP
            ref={input}
            name="verificationCode"
            value={code}
            onValueChange={updateCode}
            size="sm"
          />
        </Field>
        <div className="moru-home-example__actions">
          <span className="moru-home-example__status" role="status">
            {verified ? t('인증 완료') : ''}
          </span>
          {verified ? (
            <Button
              textWrap="wrap"
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                updateCode('')
                input.current?.focus()
              }}
            >
              {t('다시 입력')}
            </Button>
          ) : (
            <Button
              textWrap="wrap"
              type="submit"
              size="sm"
              variant="secondary"
              disabled={code.length !== 6}
            >
              {t('확인')}
            </Button>
          )}
        </div>
      </form>
    </ExampleCard>
  )
}

const activityData = {
  week: [24, 36, 28, 52, 43, 69, 58].map((value, index) => ({
    day: ['월', '화', '수', '목', '금', '토', '일'][index],
    value,
  })),
  month: [135, 178, 164, 236].map((value, index) => ({ day: `${index + 1}주`, value })),
}
const activityChartConfig = { value: { label: '완료한 작업', color: 'var(--ui-primary)' } }

function ActivityExample() {
  const { t, formatLocale } = useI18n()
  const weekday = new Intl.DateTimeFormat(formatLocale, { weekday: 'long' })
  const compactWeekday = new Intl.DateTimeFormat(formatLocale, { weekday: 'narrow' })
  const [period, setPeriod] = useState('week')
  const data = activityData[period === 'month' ? 'month' : 'week'].map((row, index) => ({
    ...row,
    day:
      period === 'month'
        ? t('{count}주', { count: index + 1 })
        : weekday.format(new Date(2024, 0, index + 1)),
  }))
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ExampleCard
      title={t('팀 활동')}
      icon={ChartNoAxesCombined}
      detail={
        <Badge variant="secondary" tone="success">
          +18.6%
        </Badge>
      }
    >
      <div className="moru-home-example__metric-row">
        <div className="moru-home-example__metric">
          <strong>{total}</strong>
          <span>{t('완료한 작업')}</span>
        </div>
        <ToggleGroup
          size="sm"
          layout="segmented"
          aria-label={t('활동 집계 기간')}
          preventEmpty
          value={[period]}
          onValueChange={(value) => setPeriod(value[0])}
          items={[
            { value: 'week', label: t('주간') },
            { value: 'month', label: t('월간') },
          ]}
        />
      </div>
      <div
        className="moru-home-example__chart-scroll"
        role="region"
        aria-label={period === 'week' ? t('요일별 완료한 작업') : t('주별 완료한 작업')}
        tabIndex={0}
      >
        <Chart
          className="moru-home-example__chart"
          title={period === 'week' ? t('요일별 완료한 작업') : t('주별 완료한 작업')}
          data={data}
          config={{
            value: { ...activityChartConfig.value, label: t(activityChartConfig.value.label) },
          }}
          xKey="day"
          xAxisInterval={0}
          xAxisTickFormatter={(value, index) =>
            period === 'week' ? compactWeekday.format(new Date(2024, 0, index + 1)) : String(value)
          }
          chartHeight={134}
          showLegend={false}
          showDataTable={false}
        />
      </div>
    </ExampleCard>
  )
}

const planItems = [
  { value: 'personal', label: 'Personal', description: '개인 프로젝트 · 무료' },
  { value: 'team', label: 'Team', description: '함께 작업하는 팀 · 월 ₩19,000' },
]

function PlanExample() {
  const { t } = useI18n()
  const [plan, setPlan] = useState('team')
  const [confirmed, setConfirmed] = useState<string | null>(null)
  return (
    <ExampleCard title={t('나에게 맞는 플랜')} icon={CreditCard}>
      <RadioGroup
        size="sm"
        aria-label={t('이용 플랜')}
        className="moru-home-example__plans"
        items={localizeCatalogItems(planItems, t)}
        value={plan}
        onValueChange={setPlan}
      />
      <div className="moru-home-example__actions">
        <span className="moru-home-example__status" role="status">
          {confirmed === plan
            ? t('{value1} 선택됨', { value1: plan === 'team' ? 'Team' : 'Personal' })
            : t('플랜 선택 예제')}
        </span>
        <Button
          textWrap="wrap"
          size="sm"
          disabled={confirmed === plan}
          onClick={() => setConfirmed(plan)}
        >
          {confirmed === plan ? (
            <>
              <Check size={14} aria-hidden="true" />
              {t('선택 완료')}
            </>
          ) : (
            t('플랜 선택')
          )}
        </Button>
      </div>
    </ExampleCard>
  )
}

const libraryFiles = [
  { name: '브랜드 가이드', kind: '문서', extension: 'PDF' },
  { name: '로그인 와이어프레임', kind: '디자인', extension: 'FIG' },
  { name: '모바일 아이콘', kind: '디자인', extension: 'SVG' },
  { name: '프로젝트 체크리스트', kind: '문서', extension: 'MD' },
]

function SearchExample() {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const results = libraryFiles.filter(
    (file) =>
      (category === 'all' || file.kind === category) &&
      `${file.name} ${t(file.name)}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  )
  return (
    <ExampleCard
      title={t('라이브러리 검색')}
      icon={FolderOpen}
      detail={
        <Badge variant="secondary">
          {results.length} {t('개')}
        </Badge>
      }
    >
      <div className="moru-home-example__search">
        <Search size={15} aria-hidden="true" />
        <Input
          size="sm"
          type="search"
          aria-label={t('라이브러리 파일 검색')}
          placeholder={t('파일 이름으로 검색')}
          value={query}
          onValueChange={setQuery}
        />
      </div>
      <ToggleGroup
        size="sm"
        aria-label={t('파일 종류')}
        preventEmpty
        value={[category]}
        onValueChange={(value) => setCategory(value[0])}
        items={[
          { value: 'all', label: t('전체') },
          { value: '디자인', label: t('디자인') },
          { value: '문서', label: t('문서') },
        ]}
      />
      <ul className="moru-home-example__results" aria-label={t('검색 결과')} aria-live="polite">
        {results.length ? (
          results.map((file) => (
            <li key={file.name}>
              <span>{t(file.name)}</span>
              <span>{file.extension}</span>
            </li>
          ))
        ) : (
          <li className="moru-home-example__empty">{t('일치하는 파일이 없어요.')}</li>
        )}
      </ul>
    </ExampleCard>
  )
}

function FilesExample() {
  const { t } = useI18n()
  const [files, setFiles] = useState<File[]>([])
  return (
    <ExampleCard title={t('프로젝트 파일')} icon={FileUp}>
      <div className="moru-home-example__upload-art" aria-hidden="true">
        <FileUp size={29} strokeWidth={1.5} />
        <span>{t('다음 아이디어를 첨부하세요.')}</span>
      </div>
      <Field label={t('파일 첨부')} description={t('파일당 5MB · 최대 3개 · 이 화면에서만 보관')}>
        <FileInput
          size="sm"
          multiple
          maxFiles={3}
          maxSize={5 * 1024 * 1024}
          onFilesChange={setFiles}
        />
      </Field>
      <p className="moru-home-example__status" role="status">
        {files.length
          ? t('{length}개 파일을 선택했어요.', { length: files.length })
          : t('선택한 파일이 없습니다.')}
      </p>
    </ExampleCard>
  )
}

function SecurityExample() {
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)
  const requirements = [
    { id: 'length', label: t('8자 이상'), valid: password.length >= 8 },
    { id: 'letters', label: t('영문 포함'), valid: /[a-z]/i.test(password) },
    { id: 'digits', label: t('숫자 포함'), valid: /\d/.test(password) },
  ]
  const count = requirements.filter((item) => item.valid).length
  return (
    <ExampleCard title={t('안전한 비밀번호')} icon={LockKeyhole}>
      <form
        className="moru-home-example__form"
        onSubmit={(event) => {
          event.preventDefault()
          if (count === 3) setSaved(true)
        }}
      >
        <Field label={t('새 비밀번호')} description={t('예제용 비밀번호를 입력하세요.')}>
          <PasswordInput
            size="sm"
            value={password}
            onValueChange={(value) => {
              setPassword(value)
              setSaved(false)
            }}
            autoComplete="new-password"
            placeholder={t('8자 이상 입력')}
            maxLength={64}
          />
        </Field>
        <Progress aria-label={t('비밀번호 조건 충족')} value={count} max={3} />
        <ul className="moru-home-example__requirements" aria-label={t('비밀번호 조건')}>
          {requirements.map((item) => (
            <li key={item.id} data-valid={item.valid}>
              <Check size={12} aria-hidden="true" />
              {item.label}
              <span className="moru-home-example__sr-only">
                {item.valid ? t('충족') : t('미충족')}
              </span>
            </li>
          ))}
        </ul>
        <div className="moru-home-example__actions">
          <span className="moru-home-example__status" role="status">
            {saved ? t('설정 완료') : ''}
          </span>
          <Button textWrap="wrap" size="sm" type="submit" disabled={count !== 3 || saved}>
            {t('설정하기')}
          </Button>
        </div>
      </form>
    </ExampleCard>
  )
}

function SoundExample() {
  const { t } = useI18n()
  const [volume, setVolume] = useState(65)
  const [muted, setMuted] = useState(false)
  const currentVolume = muted ? 0 : volume
  return (
    <ExampleCard title={t('사운드 설정')} icon={Volume2}>
      <div className="moru-home-example__sound" aria-hidden="true">
        <div className="moru-home-example__sound-icon">
          {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </div>
        <div className="moru-home-example__wave">
          {[30, 48, 74, 52, 100, 67, 42, 82, 57, 36, 65, 88, 52, 28].map((height, index) => (
            <i
              key={index}
              style={{
                height: `${height}%`,
                opacity: (index / 14) * 100 < currentVolume ? 1 : 0.18,
              }}
            />
          ))}
        </div>
      </div>
      <Slider
        size="sm"
        label={t('미리보기 음량')}
        showValue
        value={volume}
        onValueChange={setVolume}
        disabled={muted}
      />
      <Switch
        size="sm"
        label={t('음소거')}
        description={t('음량 설정을 유지해요.')}
        checked={muted}
        onCheckedChange={setMuted}
      />
      <span className="moru-home-example__status">{t('음량 조절 UI 예제')}</span>
    </ExampleCard>
  )
}

function GoalExample() {
  const { t } = useI18n()
  const [minutes, setMinutes] = useState(35)
  return (
    <ExampleCard title={t('오늘의 집중 시간')} icon={Target}>
      <div className="moru-home-example__goal">
        <RingProgress
          label={t('집중 목표')}
          value={minutes}
          max={60}
          size={124}
          thickness={8}
          showLegend={false}
          centerLabel={
            <>
              <strong>
                {minutes}
                <span>{t('분')}</span>
              </strong>
              <span>{t('목표 60분')}</span>
            </>
          }
        />
        <div>
          <Badge variant="secondary" tone={minutes >= 60 ? 'success' : 'info'}>
            {minutes >= 60 ? t('목표 달성') : t('차곡차곡 쌓는 중')}
          </Badge>
          <p>
            {minutes >= 60
              ? t('오늘의 목표를 달성했어요.')
              : t('{value1}분만 더 집중해 볼까요?', { value1: 60 - minutes })}
          </p>
        </div>
      </div>
      <div className="moru-home-example__actions">
        <Button
          textWrap="wrap"
          variant="ghost"
          size="sm"
          onClick={() => setMinutes(0)}
          disabled={minutes === 0}
        >
          {t('초기화')}
        </Button>
        <Button
          textWrap="wrap"
          variant="secondary"
          size="sm"
          disabled={minutes >= 60}
          onClick={() => setMinutes((value) => Math.min(60, value + 5))}
        >
          <Plus size={14} aria-hidden="true" />
          {t('5분 기록')}
        </Button>
      </div>
    </ExampleCard>
  )
}

function MessageExample() {
  const { t } = useI18n()
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState('새로운 홈 화면, 직접 눌러 보니 어때요?')
  const [hasSent, setHasSent] = useState(false)
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!message.trim()) return
    setSent(message.trim())
    setMessage('')
    setHasSent(true)
  }
  return (
    <ExampleCard
      title={t('팀 피드백')}
      icon={MessageCircle}
      detail={<Badge variant="secondary">{t('예제')}</Badge>}
    >
      <div className="moru-home-example__chat" role="status">
        <Avatar size="sm" alt="" fallback={hasSent ? t('나') : t('하은')} />
        <p>{t(sent)}</p>
      </div>
      <form className="moru-home-example__form" onSubmit={send}>
        <Textarea
          size="sm"
          aria-label={t('피드백 작성')}
          placeholder={t('메시지를 남겨 보세요.')}
          rows={2}
          maxLength={180}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <div className="moru-home-example__actions">
          <span className="moru-home-example__status">{message.length}/180</span>
          <Button textWrap="wrap" size="sm" type="submit" disabled={!message.trim()}>
            <Send size={13} aria-hidden="true" />
            {t('보내기')}
          </Button>
        </div>
      </form>
    </ExampleCard>
  )
}

export function MoruHomeExamples() {
  const { t } = useI18n()
  return (
    <section className="moru-home-examples" aria-label={t('컴포넌트 조합 예제')}>
      <div className="moru-home-examples__grid">
        <ActivityExample />
        <VerificationExample />
        <TeamExample />
        <PlanExample />
        <BookingExample />
        <SearchExample />
        <GoalExample />
        <SoundExample />
        <NotificationsExample />
        <SecurityExample />
        <FilesExample />
        <MessageExample />
      </div>
    </section>
  )
}
