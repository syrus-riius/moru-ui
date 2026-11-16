import { useId } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n'
import {
  resolveFocus,
  type FocusStyle,
  type FocusTokens,
  type ThemeMode,
  type ThemeTokens,
} from '../../theme/tokens'
import { Button } from '../ui/button'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { ThemeScope } from '../ui/theme-scope'
import './focus-editor.css'

export type FocusEditorProps = {
  tokens: ThemeTokens
  mode: ThemeMode
  onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void
  compact?: boolean
}

const focusOptions: { value: FocusStyle; label: string; description: string }[] = [
  { value: 'slim', label: '슬림', description: '입력창에 붙는 얇은 선과 은은한 배경' },
  { value: 'surface', label: '서피스', description: '외곽선 없이 배경 명도로 강조' },
  { value: 'underline', label: '언더라인', description: '아래쪽 선과 배경으로 강조' },
  { value: 'ring', label: '링', description: '입력창 바깥에 분명한 외곽선' },
]

/** Preview states demonstrate focus without moving the user's keyboard focus. */
export function FocusEditor({ tokens, mode, onTokensChange, compact = false }: FocusEditorProps) {
  const { t } = useI18n()
  const id = useId()
  const focus = resolveFocus(tokens.focus)
  const hasOutline = focus.style === 'slim' || focus.style === 'ring'
  const option = focusOptions.find(({ value }) => value === focus.style)!

  function change(patch: Partial<FocusTokens>) {
    onTokensChange((previous) => ({
      ...previous,
      focus: { ...resolveFocus(previous.focus), ...patch },
    }))
  }

  return (
    <section
      className="moru-focus-editor"
      data-compact={compact || undefined}
      aria-labelledby={`${id}-title`}
    >
      <header className="moru-focus-heading">
        <h3 id={`${id}-title`}>{t('입력 포커스')}</h3>
        <p>{t('기본 테두리와 별도로, 입력 중인 위치를 표현하세요.')}</p>
      </header>
      <div className="moru-focus-options" role="group" aria-label={t('입력 포커스 방식')}>
        {focusOptions.map(({ value, label }) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant="secondary"
            textWrap="wrap"
            aria-pressed={focus.style === value}
            onClick={() => {
              if (focus.style === value) return
              change({
                style: value,
                width: value === 'ring' ? 2 : 1,
                offset: value === 'ring' ? 2 : 0,
              })
            }}
          >
            {t(label)}
            {focus.style === value ? <Check size={13} aria-hidden="true" /> : null}
          </Button>
        ))}
      </div>
      <p className="moru-focus-note">{t(option.description)}</p>
      {hasOutline ? (
        <div className="moru-focus-metrics">
          {(
            [
              { key: 'width', label: '포커스 선 두께', min: 1, max: 3 },
              { key: 'offset', label: '포커스 선 간격', min: 0, max: 4 },
            ] as const
          ).map(({ key, label, min, max }) => (
            <div className="moru-focus-metric" key={key}>
              <div>
                <span id={`${id}-${key}-label`}>{t(label)}</span>
                <output id={`${id}-${key}-value`}>{focus[key]}px</output>
              </div>
              <Slider
                size="sm"
                min={min}
                max={max}
                step={0.5}
                value={focus[key]}
                aria-labelledby={`${id}-${key}-label`}
                aria-describedby={`${id}-${key}-value`}
                aria-valuetext={`${focus[key]}px`}
                onValueChange={(value) => change({ [key]: value })}
              />
            </div>
          ))}
        </div>
      ) : null}
      <div className="moru-focus-color">
        <div className="moru-focus-color-heading">
          <label htmlFor={`${id}-color`}>{t('포커스 강조색')}</label>
          <span>{t(focus.color ? '직접 설정' : '프라이머리 연동')}</span>
        </div>
        <div className="moru-focus-color-controls">
          <label className="moru-focus-color-picker" htmlFor={`${id}-color`}>
            <input
              id={`${id}-color`}
              type="color"
              value={focus.color ?? tokens.primary}
              aria-label={t('포커스 강조색 선택')}
              onChange={(event) => change({ color: event.target.value })}
            />
            <code>{(focus.color ?? tokens.primary).toUpperCase()}</code>
          </label>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            disabled={!focus.color}
            onClick={() => change({ color: undefined })}
            aria-label={t('프라이머리 색상으로 되돌리기')}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t('자동')}
          </Button>
        </div>
        <p className="moru-focus-note">{t('배경과 구분되도록 강조색의 밝기를 자동 보정합니다.')}</p>
      </div>
      <ThemeScope tokens={tokens} mode={mode} className="moru-focus-preview-scope">
        <div className="moru-focus-preview" role="group" aria-label={t('입력 포커스 상태 비교')}>
          <Field label={t('기본')}>
            <Input
              size="sm"
              placeholder={t('프로젝트 이름')}
              aria-label={t('기본 입력 미리보기')}
            />
          </Field>
          <Field label={t('포커스')}>
            <Input
              size="sm"
              previewState="focus"
              placeholder={t('프로젝트 이름')}
              aria-label={t('포커스 입력 미리보기')}
            />
          </Field>
          <Field label={t('오류 · 포커스')}>
            <Input
              size="sm"
              previewState="focus"
              aria-invalid
              placeholder={t('프로젝트 이름')}
              aria-label={t('오류 포커스 입력 미리보기')}
            />
          </Field>
        </div>
      </ThemeScope>
      <p className="moru-focus-note">
        {t('입력창을 직접 눌러 보세요. 버튼과 링크의 키보드 포커스는 유지됩니다.')}
      </p>
    </section>
  )
}
