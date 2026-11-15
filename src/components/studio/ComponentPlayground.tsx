import { createContext, lazy, Suspense, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  CheckCheck,
  Copy,
  LayoutPanelTop,
  MoreHorizontal,
  Plus,
  Settings2,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useI18n } from '../../i18n'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Menu } from '../ui/menu'
import { NativeSelect } from '../ui/native-select'
import { Select } from '../ui/select'
import { Slider } from '../ui/slider'
import { Tabs } from '../ui/tabs'
import { Textarea } from '../ui/textarea'
import type { SemanticTone } from '../ui'
import { AdvancedComponentDemo } from '../demos/AdvancedComponentDemo'
import { components, type ComponentId } from '../catalog/component-catalog'
import { ExtendedComponentDemo, type DemoSize } from '../demos/ExtendedComponentDemo'
import { InputVariationsDemo } from '../demos/InputVariationsDemo'

const ModalVariationsDemo = lazy(() =>
  import('../demos/ModalVariationsDemo').then((module) => ({
    default: module.ModalVariationsDemo,
  })),
)

const CompletionComponentDemo = lazy(() =>
  import('../demos/CompletionComponentDemo').then((module) => ({
    default: module.CompletionComponentDemo,
  })),
)

/**
 * Values the gallery specimens and the inspector's "component details" share.
 * They live in their own provider so that typing into a demo field re-renders the
 * specimens and their controls, not the whole studio shell.
 */
function usePlaygroundState() {
  const [demoSize, setDemoSize] = useState<DemoSize>('md')
  const [demoTone, setDemoTone] = useState<SemanticTone>('info')
  const [demoProgress, setDemoProgress] = useState(60)
  const [demoLoading, setDemoLoading] = useState(true)
  const [buttonLabel, setButtonLabel] = useState('시작하기')
  const [buttonSize, setButtonSize] = useState<'sm' | 'md' | 'lg'>('md')
  const [disabled, setDisabled] = useState(false)
  const [fieldError, setFieldError] = useState(false)
  const [description, setDescription] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(true)
  const [updatesOptIn, setUpdatesOptIn] = useState(false)
  const [visibility, setVisibility] = useState('private')
  const [tab, setTab] = useState('overview')
  return useMemo(
    () => ({
      demoSize,
      setDemoSize,
      demoTone,
      setDemoTone,
      demoProgress,
      setDemoProgress,
      demoLoading,
      setDemoLoading,
      buttonLabel,
      setButtonLabel,
      buttonSize,
      setButtonSize,
      disabled,
      setDisabled,
      fieldError,
      setFieldError,
      description,
      setDescription,
      emailOptIn,
      setEmailOptIn,
      updatesOptIn,
      setUpdatesOptIn,
      visibility,
      setVisibility,
      tab,
      setTab,
    }),
    [
      demoSize,
      demoTone,
      demoProgress,
      demoLoading,
      buttonLabel,
      buttonSize,
      disabled,
      fieldError,
      description,
      emailOptIn,
      updatesOptIn,
      visibility,
      tab,
    ],
  )
}

const PlaygroundContext = createContext<ReturnType<typeof usePlaygroundState> | null>(null)

export function ComponentPlaygroundProvider({ children }: { children: ReactNode }) {
  return (
    <PlaygroundContext.Provider value={usePlaygroundState()}>{children}</PlaygroundContext.Provider>
  )
}

function usePlayground() {
  const value = useContext(PlaygroundContext)
  if (!value) throw new Error('ComponentPlaygroundProvider is missing')
  return value
}

interface ComponentDemoProps {
  id: ComponentId
  onNotice: (title: string) => void
  onOpenExamples: () => void
}

/** The live preview shown inside a gallery specimen. */
export function ComponentDemo({ id, onNotice, onOpenExamples }: ComponentDemoProps) {
  const { t } = useI18n()
  const {
    disabled,
    demoSize,
    demoTone,
    demoProgress,
    setDemoProgress,
    demoLoading,
    setDemoLoading,
  } = usePlayground()
  const item = components.find((component) => component.id === id)!
  if (item.generation === 'completion')
    return (
      <Suspense
        fallback={
          <p className="completion-demo-caption" role="status">
            {t('미리보기를 준비하고 있어요.')}
          </p>
        }
      >
        <CompletionComponentDemo
          id={item.id}
          disabled={disabled}
          size={demoSize}
          onNotice={onNotice}
        />
      </Suspense>
    )
  if (item.generation === 'advanced')
    return <AdvancedComponentDemo id={item.id} disabled={disabled} size={demoSize} />
  if (item.generation === 'foundation')
    return (
      <ExtendedComponentDemo
        id={item.id}
        disabled={disabled}
        size={demoSize}
        tone={demoTone}
        progress={demoProgress}
        onProgressChange={setDemoProgress}
        loading={demoLoading}
        onLoadingChange={setDemoLoading}
        onNotice={onNotice}
      />
    )
  return <CoreDemo id={id} onNotice={onNotice} onOpenExamples={onOpenExamples} />
}

/** The first ten hand-written previews. Only the requested one is built. */
function CoreDemo({ id, onNotice, onOpenExamples }: ComponentDemoProps) {
  const { t } = useI18n()
  const {
    demoSize,
    buttonLabel,
    buttonSize,
    disabled,
    fieldError,
    setFieldError,
    description,
    setDescription,
    emailOptIn,
    setEmailOptIn,
    updatesOptIn,
    setUpdatesOptIn,
    visibility,
    setVisibility,
    tab,
    setTab,
  } = usePlayground()
  const demos: Record<string, () => ReactNode> = {
    button: () => (
      <>
        <div className="demo-row">
          <Button
            size={buttonSize}
            disabled={disabled}
            onClick={() => onNotice(t('첫 번째 인터랙션, 잘 작동해요.'))}
          >
            {buttonLabel || t('시작하기')} <ArrowRight size={14} />
          </Button>
          <Button
            variant="secondary"
            size={buttonSize}
            disabled={disabled}
            onClick={() => onNotice(t('보조 버튼을 눌렀어요.'))}
          >
            {t('보조 버튼')}
          </Button>
          <Button
            variant="ghost"
            size={buttonSize}
            disabled={disabled}
            onClick={() => onNotice(t('다음 단계를 열었어요.'))}
          >
            {t('더 알아보기 ')}
            <ArrowUpRight size={14} />
          </Button>
        </div>
        <div className="demo-row demo-row-secondary">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNotice(t('새 항목을 추가했어요.'))}
          >
            <Plus size={13} />
            {t(' 새로 만들기')}
          </Button>
          <Button size="sm" disabled>
            {t('비활성 버튼')}
          </Button>
          <span className="demo-annotation">{t('하나의 규칙, 다양한 역할')}</span>
        </div>
      </>
    ),
    field: () => (
      <div className="demo-form">
        <Field
          label={t('프로젝트 이름')}
          description={t('나중에 언제든 변경할 수 있어요.')}
          error={fieldError ? t('프로젝트 이름을 입력해 주세요.') : undefined}
        >
          <Input placeholder={t('새로운 프로젝트')} disabled={disabled} />
        </Field>
        <button className="text-action" onClick={() => setFieldError((current) => !current)}>
          {fieldError ? t('기본 상태 보기') : t('오류 상태 확인하기')} <ArrowRight size={12} />
        </button>
      </div>
    ),
    input: () => <InputVariationsDemo compact size={buttonSize} disabled={disabled} />,
    textarea: () => (
      <div className="demo-form">
        <Textarea
          aria-label={t('프로젝트 소개')}
          placeholder={t('어떤 프로젝트를 만들고 있나요?')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={200}
          disabled={disabled}
          rows={3}
        />
        <div className="textarea-caption">
          <span>{t('좋은 이야기는 작은 한 줄에서 시작돼요.')}</span>
          <span>{description.length}/200</span>
        </div>
      </div>
    ),
    checkbox: () => (
      <div className="demo-checklist">
        <Checkbox
          label={t('이메일 알림 받기')}
          description={t('프로젝트의 새로운 소식을 알려드려요.')}
          checked={emailOptIn}
          onCheckedChange={setEmailOptIn}
          disabled={disabled}
        />
        <Checkbox
          label={t('제품 업데이트 소식 받기')}
          checked={updatesOptIn}
          onCheckedChange={setUpdatesOptIn}
          disabled={disabled}
        />
        <Checkbox label={t('사용할 수 없는 옵션')} disabled />
      </div>
    ),
    select: () => (
      <div className="demo-form">
        <span className="demo-label">{t('프로젝트 공개 범위')}</span>
        <Select
          aria-label={t('프로젝트 공개 범위')}
          value={visibility}
          onValueChange={setVisibility}
          disabled={disabled}
          items={[
            { value: 'private', label: t('나만 볼 수 있어요') },
            { value: 'team', label: t('팀과 공유해요') },
            { value: 'public', label: t('모두에게 공개해요') },
          ]}
        />
        <span className="demo-annotation">
          {t('선택한 값 · ')}
          {visibility}
        </span>
      </div>
    ),
    dialog: () => (
      <Suspense fallback={<p role="status">{t('모달 예제를 준비하고 있어요.')}</p>}>
        <ModalVariationsDemo disabled={disabled} size={demoSize} />
      </Suspense>
    ),
    menu: () => (
      <div className="demo-menu-layout">
        <div className="project-icon">
          <LayoutPanelTop size={20} />
        </div>
        <div className="demo-project-meta">
          <strong>{t('새로운 프로젝트')}</strong>
          <span>{t('방금 수정됨 · 비공개')}</span>
        </div>
        <Menu
          trigger={
            <Button variant="ghost" size="sm" aria-label={t('프로젝트 메뉴')}>
              <MoreHorizontal size={19} />
            </Button>
          }
          items={[
            {
              label: t('이름 변경'),
              icon: <Settings2 size={14} />,
              onClick: () => onNotice(t('이름 변경 동작을 확인했어요.')),
            },
            {
              label: t('복제하기'),
              icon: <Copy size={14} />,
              onClick: () => onNotice(t('프로젝트를 복제했어요. (예제)')),
            },
            {
              label: t('삭제하기'),
              icon: <Trash2 size={14} />,
              destructive: true,
              onClick: () => onNotice(t('프로젝트 삭제 동작을 확인했어요. (예제)')),
            },
          ]}
        />
      </div>
    ),
    tabs: () => (
      <Tabs
        value={tab}
        onValueChange={setTab}
        items={[
          {
            value: 'overview',
            label: t('개요'),
            content: (
              <div className="tab-demo-content">
                <span className="small-leaf">
                  <Sparkles size={16} />
                </span>
                <div>
                  <strong>{t('시작하기 좋은 상태예요.')}</strong>
                  <p>{t('프로젝트에 필요한 모든 것을 한곳에서.')}</p>
                </div>
              </div>
            ),
          },
          {
            value: 'activity',
            label: t('활동'),
            content: (
              <div className="tab-demo-content">
                <span className="small-leaf">
                  <CheckCheck size={16} />
                </span>
                <div>
                  <strong>{t('첫 번째 컴포넌트를 만들었어요.')}</strong>
                  <p>{t('오늘 · 디자인 시스템을 향한 작은 시작')}</p>
                </div>
              </div>
            ),
          },
          {
            value: 'settings',
            label: t('설정'),
            content: (
              <div className="tab-demo-content">
                <span className="small-leaf">
                  <Settings2 size={16} />
                </span>
                <div>
                  <strong>{t('우리에게 맞게 조절해 보세요.')}</strong>
                  <p>{t('오른쪽 패널의 변경 사항이 바로 반영돼요.')}</p>
                </div>
              </div>
            ),
          },
        ]}
      />
    ),
    card: () => (
      <Card className="project-demo-card">
        <div className="card-demo-top">
          <span className="card-demo-icon">
            <Box size={17} />
          </span>
          <span className="demo-pill">{t('개인 프로젝트')}</span>
        </div>
        <h3>{t('아이디어를 모으는 공간')}</h3>
        <p>{t('작은 시작을 위한 새로운 프로젝트.')}</p>
        <button className="card-demo-link" onClick={onOpenExamples}>
          {t('프로젝트 열기 ')}
          <ArrowUpRight size={14} />
        </button>
      </Card>
    ),
  }
  return demos[id]?.() ?? null
}

/** Inspector controls for the selected component; they drive the specimen above. */
export function ComponentDetailControls({
  selected,
  subtitle,
}: {
  selected: ComponentId
  subtitle: string
}) {
  const { t } = useI18n()
  const {
    buttonLabel,
    setButtonLabel,
    buttonSize,
    setButtonSize,
    demoSize,
    setDemoSize,
    demoTone,
    setDemoTone,
    demoProgress,
    setDemoProgress,
    demoLoading,
    setDemoLoading,
    disabled,
    setDisabled,
  } = usePlayground()
  return (
    <>
      {selected === 'button' ? (
        <>
          <label htmlFor="button-label">{t('버튼 텍스트')}</label>
          <Input
            size="sm"
            id="button-label"
            value={buttonLabel}
            maxLength={30}
            onChange={(event) => setButtonLabel(event.target.value)}
          />
          <label htmlFor="button-size">{t('크기')}</label>
          <NativeSelect
            size="sm"
            id="button-size"
            value={buttonSize}
            onChange={(event) => setButtonSize(event.target.value as 'sm' | 'md' | 'lg')}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </NativeSelect>
        </>
      ) : (
        <p>
          {t(subtitle)}
          {t('. 예제에서 직접 조작해 보세요.')}
        </p>
      )}
      {[
        'switch',
        'radio-group',
        'slider',
        'popover',
        'tooltip',
        'avatar',
        'combobox',
        'toggle-group',
        'button-group',
        'input-group',
        'input-otp',
        'item',
        'native-select',
        'spinner',
        'toggle',
        'breadcrumb',
        'collapsible',
        'context-menu',
        'drawer',
        'hover-card',
        'menubar',
        'navigation-menu',
        'sidebar',
        'attachment',
        'questionnaire',
      ].includes(selected) ? (
        <>
          <label htmlFor="demo-size">{t('컴포넌트 크기')}</label>
          <NativeSelect
            size="sm"
            id="demo-size"
            value={demoSize}
            onChange={(event) => setDemoSize(event.target.value as DemoSize)}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </NativeSelect>
        </>
      ) : null}
      {selected === 'badge' || selected === 'alert' ? (
        <>
          <label htmlFor="demo-tone">{t('의미 색상')}</label>
          <NativeSelect
            size="sm"
            id="demo-tone"
            value={demoTone}
            onChange={(event) => setDemoTone(event.target.value as SemanticTone)}
          >
            <option value="info">{t('정보 · Info')}</option>
            <option value="success">{t('성공 · Success')}</option>
            <option value="warning">{t('경고 · Warning')}</option>
            <option value="danger">{t('오류 · Danger')}</option>
          </NativeSelect>
        </>
      ) : null}
      {selected === 'progress' ? (
        <>
          <label htmlFor="demo-progress">
            {t('진행률 · ')}
            {demoProgress}%
          </label>
          <Slider
            id="demo-progress"
            size="sm"
            aria-label={t('진행률')}
            aria-valuetext={`${demoProgress}%`}
            min={0}
            max={100}
            step={10}
            value={demoProgress}
            onValueChange={setDemoProgress}
          />
        </>
      ) : null}
      {selected === 'skeleton' ? (
        <Checkbox
          size="sm"
          label={t('로딩 모습 표시')}
          checked={demoLoading}
          onCheckedChange={setDemoLoading}
        />
      ) : null}
      <Checkbox
        size="sm"
        label={t('입력·버튼 비활성 상태')}
        checked={disabled}
        onCheckedChange={setDisabled}
      />
    </>
  )
}
