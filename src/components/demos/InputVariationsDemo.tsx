import { useId, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  Check,
  CreditCard,
  Globe,
  KeyRound,
  Link,
  LockKeyhole,
  Mail,
  MapPin,
  Network,
  Phone,
  RotateCcw,
  Search,
  Sparkles,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import { Button } from '../ui/button'
import { Field } from '../ui/field'
import { FormattedInput } from '../ui/formatted-input'
import { validateFormattedInput, type InputFormat } from '../ui/formatted-input-utils'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { NumberInput } from '../ui/number-input'
import { PasswordInput } from '../ui/password-input'
import './input-variations-demo.css'

type Variation = {
  format: InputFormat
  title: string
  group: string
  description: string
  placeholder: string
  icon: LucideIcon
}

const variations: readonly Variation[] = [
  {
    format: 'card-number',
    title: '카드번호',
    group: 'PAYMENT',
    description: '카드 유형에 맞춰 숫자를 묶고, 번호의 체크섬을 확인해요.',
    placeholder: '4242 4242 4242 4242',
    icon: CreditCard,
  },
  {
    format: 'card-expiry',
    title: '카드 유효기간',
    group: 'PAYMENT',
    description: '월과 연도를 나누고, 이미 지난 유효기간을 확인해요.',
    placeholder: 'MM/YY',
    icon: CalendarDays,
  },
  {
    format: 'card-cvc',
    title: '카드 보안코드',
    group: 'PAYMENT',
    description: '카드에 표시된 3~4자리 숫자를 입력해요.',
    placeholder: '123',
    icon: KeyRound,
  },
  {
    format: 'phone',
    title: '전화번호',
    group: 'CONTACT',
    description: '한국 전화번호를 구분해 표시해요. 국제번호는 +로 시작하세요.',
    placeholder: '010-1234-5678',
    icon: Phone,
  },
  {
    format: 'email',
    title: '이메일 주소',
    group: 'CONTACT',
    description: '+가 포함된 주소와 대소문자를 유지하며 형식을 확인해요.',
    placeholder: 'alex+team@example.com',
    icon: Mail,
  },
  {
    format: 'url',
    title: '웹사이트 주소',
    group: 'CONTACT',
    description: 'https:// 또는 http://로 시작하는 웹 주소를 입력해요.',
    placeholder: 'https://example.com',
    icon: Link,
  },
  {
    format: 'ipv4',
    title: 'IPv4 주소',
    group: 'NETWORK',
    description: '점으로 구분한 네 숫자가 각각 0~255인지 확인해요.',
    placeholder: '192.168.0.1',
    icon: Network,
  },
  {
    format: 'ipv6',
    title: 'IPv6 주소',
    group: 'NETWORK',
    description: '콜론으로 구분한 주소와 ::로 줄인 주소를 입력해요.',
    placeholder: '2001:db8::1',
    icon: Globe,
  },
  {
    format: 'postal-code',
    title: '우편번호',
    group: 'ADDRESS',
    description: '한국의 5자리 우편번호예요. 앞자리 0도 그대로 유지해요.',
    placeholder: '04524',
    icon: MapPin,
  },
]

const emptyValues = () =>
  Object.fromEntries(variations.map(({ format }) => [format, ''])) as Record<InputFormat, string>

function sampleValues(): Record<InputFormat, string> {
  return {
    'card-number': '4242 4242 4242 4242',
    'card-expiry': `12/${String(new Date().getFullYear() + 2).slice(-2)}`,
    'card-cvc': '123',
    phone: '010-1234-5678',
    email: 'alex+team@example.com',
    url: 'https://example.com',
    ipv4: '192.168.0.1',
    ipv6: '2001:db8::1',
    'postal-code': '04524',
  }
}

function VariationCard({
  index,
  title,
  group,
  icon: Icon,
  children,
}: {
  index: number
  title: string
  group: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <article className="input-variations-card" aria-label={title}>
      <div className="input-variations-card__eyebrow" aria-hidden="true">
        <span>
          {String(index).padStart(2, '0')} / {group}
        </span>
        <Icon />
      </div>
      <div className="input-variations-card__preview">{children}</div>
    </article>
  )
}

const searchItems = ['브랜드 가이드', '모바일 디자인', '프로젝트 체크리스트'] as const

/** Real, editable input patterns; values stay in this mounted preview only. */
export function InputVariationsDemo({
  compact = false,
  size = 'md',
  disabled = false,
}: {
  compact?: boolean
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}) {
  const { t, formatLocale } = useI18n()
  const statusId = useId()
  const [values, setValues] = useState(emptyValues)
  const [touched, setTouched] = useState<Partial<Record<InputFormat, boolean>>>({})
  const [query, setQuery] = useState('')
  const [amount, setAmount] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const passwordError =
    passwordTouched && password && password.length < 8 ? t('8자 이상 입력해 주세요.') : undefined
  const results = searchItems.filter((label) =>
    t(label).toLocaleLowerCase(formatLocale).includes(query.trim().toLocaleLowerCase(formatLocale)),
  )

  function fillExamples() {
    setValues(sampleValues())
    setTouched({})
    setQuery('')
    setAmount(49000)
    setPassword('Moru-demo-2026')
    setPasswordTouched(false)
    setAnnouncement(t('예시를 채웠어요. 값을 수정하고 입력 보조를 확인해 보세요.'))
  }

  function reset() {
    setValues(emptyValues())
    setTouched({})
    setQuery('')
    setAmount(null)
    setPassword('')
    setPasswordTouched(false)
    setAnnouncement(t('입력 예시를 초기화했어요.'))
  }

  function validate() {
    setTouched(Object.fromEntries(variations.map(({ format }) => [format, true])))
    setPasswordTouched(true)
    const filled = variations.filter(({ format }) => values[format].trim())
    const errors = filled.filter(({ format }) => validateFormattedInput(format, values[format]))
    const errorCount = errors.length + (password && password.length < 8 ? 1 : 0)
    const count = filled.length + (password ? 1 : 0) + (amount !== null ? 1 : 0)
    setAnnouncement(
      errorCount
        ? t('형식을 다시 확인할 항목이 {count}개 있어요.', { count: errorCount })
        : count
          ? t('입력한 {count}개 항목의 형식을 확인했어요.', { count })
          : t('예시를 채우거나 값을 입력해 보세요.'),
    )
  }

  return (
    <section
      className="input-variations"
      data-compact={compact || undefined}
      aria-label={t('입력 유형 미리보기')}
    >
      <header className="input-variations__header">
        {!compact && (
          <div className="input-variations__intro">
            <p className="input-variations__title">{t('입력 목적에 맞는 디테일')}</p>
            <p className="input-variations__description">
              {t('붙여넣기부터 형식 확인까지, 실제로 입력하며 비교해 보세요.')}
            </p>
          </div>
        )}
        <div className="input-variations__actions" aria-label={t('입력 예시 조작')}>
          <Button size="sm" variant="secondary" disabled={disabled} onClick={fillExamples}>
            <Sparkles aria-hidden="true" />
            {t('예시 채우기')}
          </Button>
          <Button size="sm" variant="ghost" disabled={disabled} onClick={reset}>
            <RotateCcw aria-hidden="true" />
            {t('초기화')}
          </Button>
          <Button size="sm" disabled={disabled} onClick={validate} aria-describedby={statusId}>
            <Check aria-hidden="true" />
            {t('입력 확인')}
          </Button>
        </div>
      </header>

      <div className="input-variations__grid">
        {variations.map(({ format, title, group, description, placeholder, icon: Icon }, index) => {
          const issue = touched[format] ? validateFormattedInput(format, values[format]) : null
          return (
            <VariationCard
              key={format}
              index={index + 1}
              title={t(title)}
              group={group}
              icon={Icon}
            >
              <Field
                label={t(title)}
                description={t(description)}
                error={issue ? t(issue) : undefined}
              >
                <InputGroup>
                  <InputGroupAddon aria-hidden="true">
                    <Icon />
                  </InputGroupAddon>
                  <FormattedInput
                    format={format}
                    value={values[format]}
                    placeholder={placeholder}
                    size={size}
                    disabled={disabled}
                    className="ui-input-group-input"
                    onValueChange={(value) => {
                      setValues((current) => ({ ...current, [format]: value }))
                      setAnnouncement('')
                    }}
                    onBlur={() => setTouched((current) => ({ ...current, [format]: true }))}
                  />
                </InputGroup>
              </Field>
              {touched[format] && values[format] && !issue && (
                <p className="input-variations-card__valid">
                  <Check aria-hidden="true" />
                  {t('형식 확인됨')}
                </p>
              )}
            </VariationCard>
          )
        })}

        <VariationCard index={10} title={t('검색')} group="DISCOVERY" icon={Search}>
          <Field label={t('검색')} description={t('입력한 단어로 아래 예제 목록을 바로 좁혀요.')}>
            <InputGroup>
              <InputGroupAddon aria-hidden="true">
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                value={query}
                onValueChange={setQuery}
                placeholder={t('문서 이름 검색')}
                size={size}
                disabled={disabled}
                autoComplete="off"
              />
            </InputGroup>
          </Field>
          <ul className="input-variations-card__results" aria-label={t('검색 결과')}>
            {results.length ? (
              results.map((label) => <li key={label}>{t(label)}</li>)
            ) : (
              <li>{t('검색 결과가 없어요.')}</li>
            )}
          </ul>
        </VariationCard>

        <VariationCard index={11} title={t('금액')} group="AMOUNT" icon={Wallet}>
          <Field
            label={t('금액')}
            description={t('숫자를 입력하면 원화 기호와 천 단위 구분을 적용해요.')}
          >
            <NumberInput
              value={amount}
              onValueChange={(value) => {
                setAmount(value)
                setAnnouncement('')
              }}
              locale={formatLocale}
              format={{ style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }}
              min={0}
              precision={0}
              step={1000}
              placeholder="₩49,000"
              size={size}
              disabled={disabled}
              hideControls
            />
          </Field>
        </VariationCard>

        <VariationCard index={12} title={t('비밀번호')} group="SECURITY" icon={LockKeyhole}>
          <Field
            label={t('비밀번호')}
            description={t('표시 버튼으로 입력값을 확인해요. 예제는 8자 이상을 사용해요.')}
            error={passwordError}
          >
            <PasswordInput
              value={password}
              onValueChange={(value) => {
                setPassword(value)
                setAnnouncement('')
              }}
              onBlur={() => setPasswordTouched(true)}
              placeholder={t('8자 이상 입력')}
              autoComplete="new-password"
              size={size}
              disabled={disabled}
            />
          </Field>
        </VariationCard>
      </div>
      <div className="input-variations__footer">
        <p className="input-variations__description">
          {t('카드번호 검사는 형식 확인용이며 결제 승인이나 카드 존재 여부를 확인하지 않아요.')}
        </p>
        <p id={statusId} className="input-variations__status" role="status">
          {announcement}
        </p>
      </div>
    </section>
  )
}
