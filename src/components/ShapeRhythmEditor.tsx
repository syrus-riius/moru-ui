import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, Link2, Play, RotateCcw } from 'lucide-react'
import {
  densityOptions, densityOverrideDefinitions, densityProfiles, fontFamilies, fontOptions,
  readableForeground, resolveDensity, tokenDefinitions, typographyDefinitions, withDensityMetric,
  type DensityMetricKey, type ThemeTokens, type TokenChange, type TypographyChange, type TypographyStyle,
} from '../theme/tokens'
import './shape-rhythm-editor.css'

export type ShapeRhythmEditorProps = {
  tokens: ThemeTokens
  onChange: TokenChange
  onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void
  onTypographyChange: TypographyChange
  compact?: boolean
}

type NumberDefinition = { min: number; max: number; step: number; unit: string }
const tabs = [
  { value: 'shape', label: '형태', eyebrow: 'SHAPE' },
  { value: 'rhythm', label: '간격 · 밀도', eyebrow: 'RHYTHM' },
  { value: 'type', label: '타이포 · 모션', eyebrow: 'TYPE & MOTION' },
] as const
const sizes = ['sm', 'md', 'lg'] as const
const sizeLabels = { sm: 'S', md: 'M', lg: 'L' }
const densityGroups = [
  { key: 'controlHeight', label: '컨트롤 높이' },
  { key: 'controlPaddingX', label: '좌우 여백' },
  { key: 'iconSize', label: '아이콘 크기' },
] as const
const rhythmMetrics = [
  { key: 'spacing', label: '기본 간격' },
  { key: 'fieldGap', label: '라벨 ↔ 입력창' },
  { key: 'formGap', label: '입력 항목 사이' },
  { key: 'cardPadding', label: '카드 안쪽' },
  { key: 'sectionGap', label: '섹션 사이' },
  { key: 'controlGap', label: '아이콘 ↔ 문구' },
] as const

function NumberField({ label, value, definition, onCommit }: {
  label: string; value: number; definition: NumberDefinition; onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState(String(value))
  const skipBlur = useRef(false)
  useEffect(() => { setDraft(String(value)) }, [value])
  function commit() {
    const amount = draft.trim() ? Number(draft) : NaN
    if (!Number.isFinite(amount)) { setDraft(String(value)); return }
    const next = Number((Math.round(Math.min(definition.max, Math.max(definition.min, amount)) / definition.step) * definition.step).toFixed(4))
    setDraft(String(next)); if (next !== value) onCommit(next)
  }
  return <span className="shape-rhythm-number">
    <input type="number" inputMode="decimal" aria-label={label} min={definition.min} max={definition.max} step={definition.step} value={draft}
      onFocus={(event) => event.currentTarget.select()} onChange={(event) => setDraft(event.target.value)}
      onBlur={() => { if (skipBlur.current) { skipBlur.current = false; return }; commit() }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); skipBlur.current = true; setDraft(String(value)); event.currentTarget.blur() }
      }} />
    {definition.unit ? <span aria-hidden="true">{definition.unit}</span> : null}
  </span>
}

function SliderField({ label, value, definition, onChange, description }: {
  label: string; value: number; definition: NumberDefinition; onChange: (value: number) => void; description?: string
}) {
  const id = useId()
  return <div className="shape-rhythm-control">
    <div className="shape-rhythm-control-heading"><label htmlFor={id}>{label}</label><NumberField label={`${label} 값`} value={value} definition={definition} onCommit={onChange} /></div>
    <input id={id} className="shape-rhythm-slider" type="range" min={definition.min} max={definition.max} step={definition.step} value={value} aria-label={`${label} 슬라이더`} aria-valuetext={`${value}${definition.unit}`} onChange={(event) => onChange(Number(event.target.value))} />
    {description ? <p>{description}</p> : null}
  </div>
}

export function ShapeRhythmEditor({ tokens, onChange, onTokensChange, onTypographyChange, compact = false }: ShapeRhythmEditorProps) {
  const id = useId()
  const [tab, setTab] = useState<typeof tabs[number]['value']>('shape')
  const [motionActive, setMotionActive] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([])
  const density = resolveDensity(tokens)
  const base = densityProfiles[tokens.density]
  const customized = Boolean(Object.keys(tokens.densityOverrides?.[tokens.density] ?? {}).length)
  const body = tokens.typography.body
  const densityName = densityOptions.find((option) => option.value === tokens.density)?.label
  const previewStyle = {
    '--shape-radius': `${tokens.radius}px`, '--shape-card-radius': `${tokens.radius + 4}px`, '--shape-border': `${tokens.borderWidth}px`,
    '--shape-shadow': 'var(--ui-shadow)',
    '--shape-duration': `${tokens.duration}ms`, '--shape-background': tokens.background,
    '--shape-surface': tokens.surface, '--shape-text': tokens.text, '--shape-muted': tokens.muted,
    '--shape-primary': tokens.primary, '--shape-primary-foreground': readableForeground(tokens.primary),
    '--shape-accent': tokens.accent, '--shape-line': tokens.border,
    '--shape-card-padding': `${density.cardPadding}px`, '--shape-gap': `${density.formGap}px`,
    '--shape-field-gap': `${density.fieldGap}px`, '--shape-control-gap': `${density.controlGap}px`,
    '--shape-control-height': `${density.controlHeight.md}px`, '--shape-padding-x': `${density.controlPaddingX.md}px`,
    '--shape-font': fontFamilies[tokens.fontFamily], '--shape-body-size': `${body.size}px`,
    '--shape-body-weight': body.weight, '--shape-body-leading': body.lineHeight,
    '--shape-body-tracking': `${body.letterSpacing}em`,
  } as CSSProperties
  function changeMetric(key: DensityMetricKey, amount: number) {
    onTokensChange((previous) => withDensityMetric(previous, key, amount))
  }
  function resetDensity() {
    onTokensChange((previous) => {
      const next = { ...previous.densityOverrides }
      delete next[previous.density]
      return { ...previous, densityOverrides: next }
    })
  }
  function typeField(property: keyof TypographyStyle) {
    const definition = typographyDefinitions[property]
    return <SliderField key={property} label={`본문 ${definition.label}`} value={body[property]} definition={definition} onChange={(value) => onTypographyChange('body', { [property]: value })} />
  }
  const preview = <aside className="shape-rhythm-preview" style={previewStyle} aria-label="형태와 리듬 실시간 미리보기">
      <div className="shape-rhythm-preview-heading"><span><i /> LIVE PREVIEW</span><code>{densityName} · {density.spacing}px unit</code></div>
      <div className="shape-rhythm-preview-stage">
        <div className="shape-rhythm-sample-card">
          <div className="shape-rhythm-sample-copy"><span className="shape-rhythm-sample-eyebrow">MORU WORKSPACE</span><h3>작은 차이의 완성</h3><p>형태와 여백, 읽는 속도를 함께 다듬어 보세요. Your next idea starts here.</p></div>
          <div className="shape-rhythm-sample-field"><label htmlFor={`${id}-sample-input`}>프로젝트 이름</label><input id={`${id}-sample-input`} value="새로운 아이디어" readOnly tabIndex={-1} /></div>
          <button type="button" className="shape-rhythm-sample-action" onClick={() => setMotionActive((previous) => !previous)} aria-pressed={motionActive}>상태 전환<ArrowRight size={density.iconSize.md} aria-hidden="true" /></button>
          <div className="shape-rhythm-motion-track" data-active={motionActive} aria-hidden="true"><span /></div>
        </div>
        <div className="shape-rhythm-size-preview" aria-label="S M L 컨트롤 높이 미리보기">{sizes.map((size) => <span key={size} style={{ height: density.controlHeight[size], paddingInline: density.controlPaddingX[size], borderRadius: tokens.radius, borderWidth: tokens.borderWidth }}><strong>{sizeLabels[size]}</strong><code>{density.controlHeight[size]}px</code></span>)}</div>
      </div>
      <p className="shape-rhythm-preview-note">컴포넌트별로 지정한 공통 패딩·마진은 유지됩니다.</p>
    </aside>

  return <div className="shape-rhythm-editor" data-compact={compact || undefined}>
    <div className="shape-rhythm-workbench">
      <div className="shape-rhythm-tabs" role="tablist" aria-label={compact ? '사이드바 형태와 리듬 편집 항목' : '형태와 리듬 편집 항목'}>
        {tabs.map((item, index) => <button ref={(element) => { tabButtons.current[index] = element }} key={item.value} type="button" role="tab" id={`${id}-tab-${item.value}`} aria-controls={`${id}-panel-${item.value}`} aria-selected={tab === item.value} tabIndex={tab === item.value ? 0 : -1}
          onClick={() => setTab(item.value)} onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index - 1 + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
            if (next === null) return
            event.preventDefault(); setTab(tabs[next].value); tabButtons.current[next]?.focus({ preventScroll: true })
          }}><span>{item.eyebrow}</span>{item.label}</button>)}
      </div>
      {tabs.map((item) => <section key={item.value} className="shape-rhythm-panel" role="tabpanel" id={`${id}-panel-${item.value}`} aria-labelledby={`${id}-tab-${item.value}`} hidden={tab !== item.value} tabIndex={0}>
        {item.value === 'shape' ? <>
          <div className="shape-rhythm-panel-heading"><strong>표면의 성격</strong><span>변경 즉시 전체에 적용</span></div>
          <div className="shape-rhythm-field-grid">
            <SliderField label="모서리" value={tokens.radius} definition={tokenDefinitions.radius} onChange={(value) => onChange('radius', value)} description="기본 모서리에 맞춰 컨트롤과 카드가 함께 바뀝니다." />
            <SliderField label="테두리" value={tokens.borderWidth} definition={tokenDefinitions.borderWidth} onChange={(value) => onChange('borderWidth', value)} description="윤곽의 무게를 조절합니다. 0은 테두리 없음입니다." />
            <SliderField label="그림자" value={tokens.shadow} definition={tokenDefinitions.shadow} onChange={(value) => onChange('shadow', value)} description="표면 사이의 깊이를 조절합니다. 0은 평평한 표면입니다." />
          </div>
          <div className="shape-rhythm-radius-scale" aria-label="현재 모서리 크기 미리보기">{[28, 40, 56].map((size) => <span key={size} style={{ width: size, height: size, borderRadius: tokens.radius, borderWidth: tokens.borderWidth }} />)}<code>{tokens.radius}px radius / {tokens.borderWidth}px stroke</code></div>
        </> : null}
        {item.value === 'rhythm' ? <>
          <div className="shape-rhythm-density-row"><div className="shape-rhythm-density-options" role="group" aria-label="형태와 리듬 컴포넌트 밀도">{densityOptions.map((option) => <button type="button" key={option.value} aria-pressed={tokens.density === option.value} onClick={() => onChange('density', option.value)}>{option.label}</button>)}</div><button type="button" className="shape-rhythm-restore" disabled={!customized} onClick={resetDensity} aria-label="형태와 리듬 현재 밀도 복원"><RotateCcw size={12} aria-hidden="true" />복원</button></div>
          <p className="shape-rhythm-ratio-note"><Link2 size={12} aria-hidden="true" /><span>S / M / L 비율 연동 · 한 값을 바꾸면 함께 조절됩니다.</span></p>
          <div className="shape-rhythm-size-table" role="group" aria-label="형태와 리듬 크기별 수동 조절">
            <div className="shape-rhythm-size-row shape-rhythm-size-head" aria-hidden="true"><span>공통 크기</span>{sizes.map((size) => <span key={size}>{sizeLabels[size]}</span>)}</div>
            {densityGroups.map(({ key, label }) => <div className="shape-rhythm-size-row" key={key}><span>{label}</span>{sizes.map((size) => {
              const ratio = base[key][size] / base[key].md
              const definition = densityOverrideDefinitions[key]
              return <NumberField key={size} label={`형태와 리듬 ${label} ${sizeLabels[size]}`} value={density[key][size]} definition={{ ...definition, min: Number((definition.min * ratio).toFixed(4)), max: Number((definition.max * ratio).toFixed(4)) }} onCommit={(value) => changeMetric(key, value / ratio)} />
            })}</div>)}
          </div>
          <div className="shape-rhythm-scalar-grid">{rhythmMetrics.map(({ key, label }) => <label key={key}><span>{label}</span><NumberField label={`형태와 리듬 ${label}`} value={density[key]} definition={densityOverrideDefinitions[key]} onCommit={(value) => changeMetric(key, value)} /></label>)}</div>
        </> : null}
        {item.value === 'type' ? <>
          <div className="shape-rhythm-font-row"><label htmlFor={`${id}-font`}>기본 글꼴</label><select id={`${id}-font`} value={tokens.fontFamily} onChange={(event) => onChange('fontFamily', event.target.value as ThemeTokens['fontFamily'])}>{fontOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="shape-rhythm-field-grid">{(['size', 'weight', 'lineHeight', 'letterSpacing'] as const).map(typeField)}</div>
          <div className="shape-rhythm-motion-control"><SliderField label="모션 속도" value={tokens.duration} definition={tokenDefinitions.duration} onChange={(value) => onChange('duration', value)} /><button className="shape-rhythm-play" type="button" onClick={() => { setMotionActive((previous) => !previous); if (compact) setPreviewOpen(true) }} aria-label="모션 미리보기 전환"><Play size={12} aria-hidden="true" />미리보기</button></div>
          <p className="shape-rhythm-help">본문의 읽기 리듬을 조절합니다. 제목·라벨 등 다른 역할은 타이포 탭에서 편집할 수 있어요.</p>
        </> : null}
      </section>)}
    </div>
    {compact ? <details className="shape-rhythm-compact-preview" open={previewOpen} onToggle={(event) => setPreviewOpen(event.currentTarget.open)}><summary>실시간 미리보기</summary>{preview}</details> : preview}
  </div>
}
