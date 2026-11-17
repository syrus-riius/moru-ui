import { useI18n } from '../../i18n'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { ArrowUpRight, Check, Moon, RotateCcw, Sun } from 'lucide-react'
import {
  fontFamilies,
  fontOptions,
  normalizeColor,
  presets,
  semanticToneOptions,
  tokenDefinitions,
  typographyDefinitions,
  typographyRoleOptions,
  type ColorTokenKey,
  type ThemeMode,
  type ThemeTokens,
  type TokenChange,
  type TypographyChange,
  type TypographyRole,
  type TypographyStyle,
} from '../../theme/tokens'
import { TokenDensityControls } from './TokenDensityControls'
import { ComponentSpacingControls } from './ComponentSpacingControls'
import { ShapeRhythmEditor } from './ShapeRhythmEditor'
import { StylePackEditor } from './StylePackEditor'
import { FocusEditor } from './FocusEditor'
import { PaletteRecommendations, type PaletteRecommendationsProps } from './PaletteRecommendations'
import { colorGroupLabels, colorRoleLabels } from './color-editor-labels'
import { Button } from '../ui/button'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'
import { NativeSelect } from '../ui/native-select'
import { Slider } from '../ui/slider'
import { Tabs } from '../ui/tabs'
import { ToggleGroup } from '../ui/toggle-group'
import type { ComponentSpacingKey } from '../../theme/component-spacing'
import './token-editor.css'
import './inspector-layout.css'

export type TokenEditorProps = {
  tokens: ThemeTokens
  onChange: TokenChange
  onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void
  onTypographyChange: TypographyChange
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  presetId: string
  onPresetChange: (id: string) => void
  onReset: () => void
  onExport: () => void
  focusRequest?: { id: string; serial: number }
  spacingTarget?: ComponentSpacingKey
  onSpacingTargetChange?: (target: ComponentSpacingKey) => void
  palette?: Omit<PaletteRecommendationsProps, 'tokens' | 'mode'> & { savedTokens: ThemeTokens }
  children?: ReactNode
}

const colorLabels: { key: ColorTokenKey; label: string; name: string }[] = [
  { key: 'primary', label: colorRoleLabels.primary, name: 'Primary' },
  { key: 'accent', label: colorRoleLabels.accent, name: 'Accent' },
  { key: 'background', label: colorRoleLabels.background, name: 'Background' },
  { key: 'surface', label: colorRoleLabels.surface, name: 'Surface' },
  { key: 'text', label: colorRoleLabels.text, name: 'Text' },
  { key: 'muted', label: colorRoleLabels.muted, name: 'Muted' },
  { key: 'border', label: colorRoleLabels.border, name: 'Border' },
]

function ColorControl({
  token,
  label,
  name,
  value,
  onChange,
}: {
  token: ColorTokenKey
  label: string
  name: string
  value: string
  onChange: TokenChange
}) {
  const { t } = useI18n()

  const id = useId()
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)
  const skipNextBlur = useRef(false)
  useEffect(() => {
    setDraft(value)
    setInvalid(false)
  }, [value])

  function commit() {
    const normalized = normalizeColor(draft.startsWith('#') ? draft : `#${draft}`)
    if (normalized) {
      onChange(token, normalized)
      setDraft(normalized)
      setInvalid(false)
    } else {
      setInvalid(true)
    }
  }

  return (
    <div className="token-color-row">
      <label className="token-color-label" htmlFor={`token-${token}`}>
        <span>{t(label)}</span>
        <span className="token-color-name">{t(name)}</span>
      </label>
      <InputGroup className={`token-color-value${invalid ? ' is-invalid' : ''}`}>
        <InputGroupAddon>
          <span className="token-color-swatch" style={{ backgroundColor: value }}>
            <input
              type="color"
              value={value}
              aria-label={t('{value0} 색상 선택', { value0: t(label) })}
              onChange={(event) => onChange(token, event.target.value)}
            />
          </span>
        </InputGroupAddon>
        <InputGroupInput
          size="sm"
          id={`token-${token}`}
          aria-label={t('{value0} HEX 색상', { value0: t(label) })}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className="token-hex-input"
          value={draft.toUpperCase()}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            const next = event.target.value
            setDraft(next)
            setInvalid(false)
            if (/^#[\da-f]{6}$/i.test(next)) onChange(token, next)
          }}
          onBlur={() => {
            if (skipNextBlur.current) {
              skipNextBlur.current = false
              return
            }
            commit()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit()
            if (event.key === 'Escape') {
              event.stopPropagation()
              skipNextBlur.current = true
              setDraft(value)
              setInvalid(false)
              event.currentTarget.blur()
            }
          }}
        />
      </InputGroup>
      {invalid && (
        <span className="token-color-error" id={`${id}-error`}>
          {t('#RRGGBB 형식으로 입력해 주세요.')}
        </span>
      )}
    </div>
  )
}

/** A common label/value row above the library's keyboard-accessible slider. */
function TokenSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}) {
  const id = useId()
  return (
    <div className="token-range-control">
      <div className="token-range-label">
        <span id={`${id}-label`}>{label}</span>
        <output id={`${id}-value`}>
          {value}
          <span>{unit}</span>
        </output>
      </div>
      <Slider
        size="sm"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-value`}
        aria-valuetext={`${value}${unit}`}
        onValueChange={onChange}
      />
    </div>
  )
}

function RangeControl({
  token,
  value,
  onChange,
}: {
  token: keyof typeof tokenDefinitions
  value: number
  onChange: TokenChange
}) {
  const { t } = useI18n()
  const definition = tokenDefinitions[token]
  return (
    <TokenSlider
      {...definition}
      label={t(definition.label)}
      value={value}
      onChange={(next) => onChange(token, next)}
    />
  )
}

function TypographyControl({
  role,
  property,
  value,
  onChange,
}: {
  role: TypographyRole
  property: keyof TypographyStyle
  value: number
  onChange: TypographyChange
}) {
  const { t } = useI18n()
  const definition = typographyDefinitions[property]
  return (
    <TokenSlider
      {...definition}
      label={t(definition.label)}
      value={value}
      onChange={(next) => onChange(role, { [property]: next })}
    />
  )
}

const typographySamples: Record<TypographyRole, string> = {
  display: '좋은 하루의 시작',
  heading: '함께 만드는 공간',
  body: '작은 차이가 모여 읽기 편안한 화면을 만듭니다. Design for everyday.',
  label: '변경 사항 저장',
  caption: '설정은 자동으로 저장돼요.',
  code: 'const spacing = 24; // 0123456789',
}

const editorTabs = [
  { id: 'theme', label: '테마' },
  { id: 'colors', label: '컬러' },
  { id: 'type', label: '타이포' },
  { id: 'shape', label: '형태' },
  { id: 'size', label: '크기' },
  { id: 'spacing', label: '간격' },
  { id: 'effects', label: '효과' },
] as const
type EditorTab = (typeof editorTabs)[number]['id']
const colorTabs = [
  { id: 'foundation', label: colorGroupLabels.foundation },
  { id: 'semantic', label: colorGroupLabels.semantic },
] as const
type ColorTab = (typeof colorTabs)[number]['id']
const typographyTabs = typographyRoleOptions.map(({ value, label }) => ({ id: value, label }))

export function TokenEditor({
  tokens,
  onChange,
  onTokensChange,
  onTypographyChange,
  mode,
  onModeChange,
  presetId,
  onPresetChange,
  onReset,
  onExport,
  focusRequest,
  spacingTarget,
  onSpacingTargetChange,
  palette,
  children,
}: TokenEditorProps) {
  const { t } = useI18n()

  const fontId = useId()
  const [activeTab, setActiveTab] = useState<EditorTab>('theme')
  const [colorTab, setColorTab] = useState<ColorTab>('foundation')
  const [typographyRole, setTypographyRole] = useState<TypographyRole>('body')
  const focusId = focusRequest?.id
  const focusSerial = focusRequest?.serial
  const pendingFocus = useRef<{ id: string; colorTab: ColorTab } | null>(null)
  useLayoutEffect(() => {
    pendingFocus.current = null
    if (!focusId?.startsWith('token-')) return
    const token = focusId.slice(6)
    const semantic = semanticToneOptions.some(({ value }) => value === token)
    if (!semantic && !colorLabels.some(({ key }) => key === token)) return
    const nextColorTab = semantic ? 'semantic' : 'foundation'
    pendingFocus.current = { id: focusId, colorTab: nextColorTab }
    setActiveTab('colors')
    setColorTab(nextColorTab)
  }, [focusId, focusSerial])
  useLayoutEffect(() => {
    const request = pendingFocus.current
    if (!request || activeTab !== 'colors' || colorTab !== request.colorTab) return
    const target = document.getElementById(request.id)
    if (!target || target.closest('[hidden]')) return
    // Consume only this explicit request after both tab panels are visible.
    pendingFocus.current = null
    target.focus({ preventScroll: true })
  }, [activeTab, colorTab, focusId, focusSerial])
  const colorsContent = (
    <>
      {palette ? (
        <PaletteRecommendations
          tokens={palette.savedTokens}
          mode={mode}
          preview={palette.preview}
          onPreview={palette.onPreview}
          onSave={palette.onSave}
          onCancel={palette.onCancel}
        />
      ) : null}
      <Tabs
        className="token-color-tabs"
        size="sm"
        activateOnFocus
        value={colorTab}
        onValueChange={(next) => setColorTab(next as ColorTab)}
        aria-label={t('색상 카테고리')}
        items={colorTabs.map(({ id: group, label }) => ({
          value: group,
          label: t(label),
          content: (
            <section className="token-editor-section token-color-panel">
              <div className="token-color-list">
                {(group === 'foundation'
                  ? colorLabels
                  : semanticToneOptions.map(({ value }) => ({
                      key: value,
                      label: colorRoleLabels[value],
                      name: value.charAt(0).toUpperCase() + value.slice(1),
                    }))
                ).map(({ key, label: colorLabel, name }) => (
                  <ColorControl
                    key={key}
                    token={key}
                    label={colorLabel}
                    name={name}
                    value={tokens[key]}
                    onChange={onChange}
                  />
                ))}
              </div>
              {group === 'semantic' ? (
                <p className="token-section-note">
                  {t('{mode} 모드의 시맨틱 컬러입니다.', {
                    mode: t(mode === 'light' ? '라이트' : '다크'),
                  })}
                </p>
              ) : null}
            </section>
          ),
        }))}
      />
    </>
  )

  const typographyContent = (
    <section className="token-editor-section" aria-label={t('타이포그래피')}>
      <div className="token-font-control">
        <label htmlFor={fontId}>{t('글꼴')}</label>
        <NativeSelect
          id={fontId}
          size="sm"
          value={tokens.fontFamily}
          onValueChange={(next) => onChange('fontFamily', next as ThemeTokens['fontFamily'])}
          items={fontOptions.map(({ value, label }) => ({ value, label: t(label) }))}
        />
      </div>
      <div className="token-role-picker">
        <span>{t('역할')}</span>
        <Tabs
          className="token-role-tabs"
          size="sm"
          activateOnFocus
          value={typographyRole}
          onValueChange={(next) => setTypographyRole(next as TypographyRole)}
          aria-label={t('타이포그래피 역할')}
          items={typographyTabs.map(({ id: role, label }) => {
            const typography = tokens.typography[role]
            const definition = typographyRoleOptions.find(({ value }) => value === role)!
            return {
              value: role,
              label: t(label),
              content: (
                <div className="token-role-panel">
                  <div
                    className="token-type-preview"
                    aria-label={t('{value0} 미리보기', { value0: t(label) })}
                    style={{
                      fontFamily:
                        role === 'code' ? fontFamilies.mono : fontFamilies[tokens.fontFamily],
                      fontSize: `${typography.size}px`,
                      lineHeight: typography.lineHeight,
                      fontWeight: typography.weight,
                      letterSpacing: `${typography.letterSpacing}em`,
                    }}
                  >
                    {t(typographySamples[role])}
                  </div>
                  <div className="token-range-list token-type-controls">
                    {(Object.keys(typographyDefinitions) as (keyof TypographyStyle)[]).map(
                      (property) => (
                        <TypographyControl
                          key={property}
                          role={role}
                          property={property}
                          value={typography[property]}
                          onChange={onTypographyChange}
                        />
                      ),
                    )}
                  </div>
                  <p className="token-section-note">
                    {t(definition.description)} {t('· 글꼴 변경 시 조절한 차이를 유지해요.')}
                  </p>
                </div>
              ),
            }
          })}
        />
      </div>
    </section>
  )

  const panelContent = {
    theme: (
      <section className="token-editor-section token-theme-section" aria-label={t('테마 설정')}>
        <div className="token-section-heading">
          <h3>{t('화면 모드')}</h3>
          <span>APPEARANCE</span>
        </div>
        <ToggleGroup
          className="token-mode-switch"
          size="sm"
          layout="segmented"
          preventEmpty
          value={[mode]}
          onValueChange={([next]) => {
            if (next === 'light' || next === 'dark') onModeChange(next)
          }}
          aria-label={t('화면 모드')}
          items={[
            { value: 'light', label: t('라이트'), icon: <Sun size={14} /> },
            { value: 'dark', label: t('다크'), icon: <Moon size={14} /> },
          ]}
        />
        <div className="token-preset-label">
          <span>{t('컬러 프리셋')}</span>
          <span>
            {presetId === 'custom'
              ? t('직접 설정')
              : t(presets.find((preset) => preset.id === presetId)?.name ?? '')}
          </span>
        </div>
        <div className="token-presets" role="group" aria-label={t('컬러 프리셋')}>
          {presets.map((preset) => (
            <Button
              size="sm"
              variant="ghost"
              textWrap="wrap"
              key={preset.id}
              className="token-preset"
              aria-label={t('{value0} 프리셋 적용', { value0: t(preset.name) })}
              aria-pressed={presetId === preset.id}
              title={t(preset.name)}
              style={{ '--preset-color': preset.color } as CSSProperties}
              onClick={() => onPresetChange(preset.id)}
            >
              <span>{presetId === preset.id && <Check size={12} strokeWidth={2.5} />}</span>
              <small>{t(preset.name).split(' · ')[0]}</small>
            </Button>
          ))}
        </div>
        <StylePackEditor compact tokens={tokens} mode={mode} onTokensChange={onTokensChange} />
      </section>
    ),
    colors: colorsContent,
    type: typographyContent,
    shape: (
      <section
        className="token-editor-section token-shape-rhythm-section"
        aria-label={t('형태와 리듬 설정')}
      >
        <div className="token-section-heading">
          <h3>{t('형태와 리듬')}</h3>
          <span>SHAPE & RHYTHM</span>
        </div>
        <ShapeRhythmEditor
          compact
          tokens={tokens}
          onChange={onChange}
          onTokensChange={onTokensChange}
          onTypographyChange={onTypographyChange}
        />
      </section>
    ),
    size: (
      <section
        className="token-editor-section token-size-section"
        aria-label={t('공통 크기 · 밀도')}
      >
        <div className="token-section-heading">
          <h3>{t('공통 크기 · 밀도')}</h3>
          <span>DENSITY</span>
        </div>
        <TokenDensityControls tokens={tokens} onChange={onChange} />
        <details className="token-shape-details">
          <summary>{t('모서리 · 테두리')}</summary>
          <div className="token-range-list token-geometry-controls">
            <RangeControl token="radius" value={tokens.radius} onChange={onChange} />
            <RangeControl token="borderWidth" value={tokens.borderWidth} onChange={onChange} />
          </div>
        </details>
      </section>
    ),
    spacing: (
      <section
        className="token-editor-section token-spacing-section"
        aria-label={t('컴포넌트 공통 간격')}
      >
        <div className="token-section-heading">
          <h3>{t('컴포넌트 공통 간격')}</h3>
          <span>SPACING</span>
        </div>
        <ComponentSpacingControls
          tokens={tokens}
          onChange={onChange}
          target={spacingTarget}
          onTargetChange={onSpacingTargetChange}
        />
      </section>
    ),
    effects: (
      <section className="token-editor-section" aria-label={t('효과')}>
        <div className="token-section-heading">
          <h3>{t('효과')}</h3>
          <span>EFFECTS</span>
        </div>
        <FocusEditor compact tokens={tokens} mode={mode} onTokensChange={onTokensChange} />
        <div className="token-range-list">
          <RangeControl token="shadow" value={tokens.shadow} onChange={onChange} />
          <RangeControl token="duration" value={tokens.duration} onChange={onChange} />
        </div>
      </section>
    ),
  }

  return (
    <aside
      className="token-editor"
      data-moru-editor
      data-editor-mode={mode}
      aria-label={t('디자인 토큰 편집기')}
    >
      <div className="token-editor-heading">
        <div>
          <span className="token-eyebrow">CUSTOMIZE</span>
          <h2>{t('디자인 토큰')}</h2>
        </div>
        <span className="token-live-badge">
          <span />
          LIVE
        </span>
      </div>
      <Tabs
        className="token-editor-tabs"
        size="sm"
        activateOnFocus
        value={activeTab}
        onValueChange={(next) => setActiveTab(next as EditorTab)}
        aria-label={t('디자인 토큰 카테고리')}
        items={editorTabs.map(({ id: tab, label }) => ({
          value: tab,
          label: t(label),
          content: (
            <>
              <div className="token-editor-body">{panelContent[tab]}</div>
              <div className="token-editor-footer">
                <div className="token-editor-actions">
                  <Button
                    size="sm"
                    variant="primary"
                    className="token-export-button"
                    aria-label={t('코드 내보내기')}
                    onClick={onExport}
                    disabled={Boolean(palette?.preview)}
                  >
                    {t('내보내기')}
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="token-reset-button"
                    aria-label={t('기본값으로 초기화')}
                    onClick={onReset}
                  >
                    <RotateCcw size={12} aria-hidden="true" />
                    {t('초기화')}
                  </Button>
                </div>
                <p>
                  {t(
                    palette?.preview
                      ? '팔레트 미리보기는 아직 저장되지 않았습니다.'
                      : '이 브라우저에 자동 저장',
                  )}
                </p>
              </div>
              {children}
            </>
          ),
        }))}
      />
    </aside>
  )
}
