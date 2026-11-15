import { useI18n } from '../i18n'
import { useId, useState } from 'react'
import { ArrowUpRight, Check, Layers3, Plus, RotateCcw, Users } from 'lucide-react'
import {
  applyStylePack,
  resolveAppearance,
  stylePackOptions,
  type StyleAppearance,
} from '../theme/style-packs'
import type { ThemeMode, ThemeTokens } from '../theme/tokens'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Dialog } from './ui/dialog'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { Popover } from './ui/popover'
import { Progress } from './ui/progress'
import { Switch } from './ui/switch'
import { Slider } from './ui/slider'
import { ThemeScope } from './ui/theme-scope'
import './style-pack-editor.css'

export interface StylePackEditorProps {
  tokens: ThemeTokens
  mode: ThemeMode
  onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void
  compact?: boolean
}

type EffectKey = 'surfaceOpacity' | 'blur' | 'glow' | 'highlight'
const effectControls: {
  key: EffectKey
  label: string
  min: number
  max: number
  unit: string
  factor: number
}[] = [
  { key: 'surfaceOpacity', label: '표면 불투명도', min: 55, max: 100, unit: '%', factor: 100 },
  { key: 'blur', label: '배경 블러', min: 0, max: 24, unit: 'px', factor: 1 },
  { key: 'glow', label: '발광 강도', min: 0, max: 24, unit: 'px', factor: 1 },
  { key: 'highlight', label: '표면 하이라이트', min: 0, max: 100, unit: '%', factor: 100 },
]

function StylePreview({ tokens, mode }: Pick<StylePackEditorProps, 'tokens' | 'mode'>) {
  const { t } = useI18n()

  const id = useId()
  const [name, setName] = useState('Moru Studio')
  const [open, setOpen] = useState(false)
  const [shared, setShared] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [feedback, setFeedback] = useState('')
  const error = submitted && !name.trim() ? t('프로젝트 이름을 입력해 주세요.') : undefined
  const appearance = resolveAppearance(tokens.appearance)
  const label =
    stylePackOptions.find((option) => option.id === appearance.preset)?.label ?? 'Default'

  return (
    <ThemeScope tokens={tokens} mode={mode} className="moru-style-preview-scope">
      <div className="moru-style-stage" data-preview-mode={mode}>
        <div className="moru-style-stage-heading">
          <span>YOUR NEXT WORKSPACE</span>
          <span>
            {t(label)} / {mode === 'dark' ? 'Dark' : 'Light'}
          </span>
        </div>
        <div className="moru-style-stage-grid">
          <Card className="moru-style-project-card">
            <div className="moru-style-card-top">
              <span className="moru-style-card-symbol">
                <Layers3 size={22} aria-hidden="true" />
              </span>
              <Badge variant="secondary">{t('새 프로젝트')}</Badge>
            </div>
            <div className="moru-style-card-copy">
              <h3>{t('아이디어를, 다음 화면으로.')}</h3>
              <p>{t('하나의 작업 공간에서 팀과 함께 만들어 보세요.')}</p>
            </div>
            <Field label={t('프로젝트 이름')} error={error}>
              <Input
                value={name}
                onValueChange={(value) => {
                  setName(value)
                  setFeedback('')
                }}
                maxLength={60}
                autoComplete="off"
                placeholder={t('프로젝트 이름을 입력하세요')}
              />
            </Field>
            <div className="moru-style-project-actions">
              <Dialog
                open={open}
                onOpenChange={(next) => {
                  setOpen(next)
                  if (next) setSubmitted(false)
                }}
                title={t('프로젝트 만들기')}
                description={t('입력과 포커스 이동도 직접 확인해 보세요.')}
                trigger={
                  <Button type="button">
                    <Plus size={15} aria-hidden="true" />
                    {t('프로젝트 만들기')}
                  </Button>
                }
                footer={
                  <Button type="submit" form={`${id}-create`}>
                    {t('만들기')}
                  </Button>
                }
              >
                <form
                  id={`${id}-create`}
                  onSubmit={(event) => {
                    event.preventDefault()
                    setSubmitted(true)
                    if (name.trim()) {
                      setOpen(false)
                      setFeedback(
                        t('{value0} 프로젝트를 만들었어요. 이 미리보기 안에서만 유지됩니다.', {
                          value0: name.trim(),
                        }),
                      )
                    }
                  }}
                >
                  <Field label={t('프로젝트 이름 확인')} error={error}>
                    <Input value={name} onValueChange={setName} maxLength={60} autoComplete="off" />
                  </Field>
                </form>
              </Dialog>
              <Popover
                title={t('공유 설정')}
                description={t('팀과 함께 사용하는 방식을 정하세요.')}
                trigger={
                  <Button type="button" variant="secondary">
                    <Users size={15} aria-hidden="true" />
                    {t('공유 설정')}
                  </Button>
                }
              >
                <Switch
                  label={t('팀에 공개')}
                  description={
                    shared
                      ? t('팀원이 프로젝트를 볼 수 있어요.')
                      : t('나만 프로젝트를 볼 수 있어요.')
                  }
                  checked={shared}
                  onCheckedChange={setShared}
                />
              </Popover>
            </div>
            <p className="moru-style-preview-status" role="status">
              {feedback || t('입력창과 버튼을 눌러 동작을 확인하세요.')}
            </p>
          </Card>
          <div className="moru-style-stage-side">
            <Card className="moru-style-progress-card">
              <div className="moru-style-card-top">
                <span>{t('이번 주 진행 상황')}</span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </div>
              <div className="moru-style-progress-value">
                <strong>
                  72<span>%</span>
                </strong>
                <Badge tone="success">{t('진행 중')}</Badge>
              </div>
              <Progress value={72} label={t('프로젝트 진행률')} />
              <p>{t('기본을 지키며, 조금씩 완성해 가요.')}</p>
            </Card>
            <Card className="moru-style-team-card">
              <div>
                <span className="moru-style-team-mark" aria-hidden="true">
                  M
                </span>
                <div>
                  <strong>{shared ? t('팀과 함께') : t('나만의 공간')}</strong>
                  <p>{shared ? t('멤버 4명 · 작업 공간') : t('비공개 · 작업 공간')}</p>
                </div>
              </div>
              <Button type="button" variant="secondary" size="sm" disabled>
                {t('보관됨')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </ThemeScope>
  )
}

export function StylePackEditor({
  tokens,
  mode,
  onTokensChange,
  compact = false,
}: StylePackEditorProps) {
  const { t } = useI18n()

  const id = useId()
  const appearance = resolveAppearance(tokens.appearance)
  const controls =
    appearance.preset === 'glass'
      ? effectControls.filter(({ key }) => key !== 'glow')
      : appearance.preset === 'neon'
        ? effectControls.filter(({ key }) => key === 'glow' || key === 'highlight')
        : []

  function changeEffect(key: EffectKey, value: number) {
    onTokensChange((previous) => ({
      ...previous,
      appearance: { ...resolveAppearance(previous.appearance), [key]: value } as StyleAppearance,
    }))
  }

  return (
    <div className="moru-style-editor" data-compact={compact || undefined}>
      <div
        className="moru-style-choices"
        data-moru-editor
        role="group"
        aria-label={t('컴포넌트 스타일 팩')}
      >
        {stylePackOptions.map((option) => (
          <Button
            variant="ghost"
            size="sm"
            textWrap="wrap"
            key={option.id}
            type="button"
            className="moru-style-choice"
            data-style={option.id}
            aria-label={t('{value0} 스타일 적용', { value0: t(option.label) })}
            aria-pressed={appearance.preset === option.id}
            onClick={() => {
              if (appearance.preset !== option.id)
                onTokensChange((previous) => applyStylePack(previous, option.id))
            }}
          >
            <span className="moru-style-choice-art" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="moru-style-choice-title">
              {t(option.label)}
              {appearance.preset === option.id ? <Check size={13} aria-hidden="true" /> : null}
            </span>
            {!compact ? <small>{t(option.description)}</small> : null}
          </Button>
        ))}
      </div>
      <p className="moru-style-editor-note">
        {t('컬러·글꼴·밀도를 유지하며 표면과 강조 표현만 바꿉니다.')}
      </p>
      {controls.length ? (
        <details className="moru-style-effects" data-moru-editor>
          <summary>
            {t('효과 세부 조정')}
            <span>{appearance.preset === 'glass' ? 'GLASS' : 'NEON'}</span>
          </summary>
          <div className="moru-style-effect-grid">
            {controls.map(({ key, label, min, max, unit, factor }) => {
              const value = Math.round(appearance[key] * factor)
              return (
                <div className="moru-style-effect-control" key={key}>
                  <div className="moru-style-effect-heading">
                    <span id={`${id}-${key}-label`}>{t(label)}</span>
                    <output htmlFor={`${id}-${key}`}>
                      {value}
                      {unit}
                    </output>
                  </div>
                  <Slider
                    id={`${id}-${key}`}
                    size="sm"
                    aria-labelledby={`${id}-${key}-label`}
                    min={min}
                    max={max}
                    step={1}
                    value={value}
                    aria-valuetext={`${value}${unit}`}
                    onValueChange={(value) => changeEffect(key, value / factor)}
                  />
                </div>
              )
            })}
          </div>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            className="moru-style-effects-reset"
            onClick={() =>
              onTokensChange((previous) =>
                applyStylePack(previous, resolveAppearance(previous.appearance).preset),
              )
            }
          >
            <RotateCcw size={12} aria-hidden="true" />
            {t('효과 기본값 복원')}
          </Button>
        </details>
      ) : null}
      {!compact ? (
        <>
          <StylePreview tokens={tokens} mode={mode} />
          <p className="moru-style-preview-note">
            {t(
              '실제 Moru 컴포넌트로 구성한 미리보기입니다. 글래스는 뒤쪽 배경까지 포함해 글자의 대비를 확인하세요. 배경 블러 미지원 환경과 현재 Expo 구현에서는 불투명한 기본 표면을 사용합니다.',
            )}
          </p>
        </>
      ) : null}
    </div>
  )
}
