import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowUpRight, Check, CheckCircle2, CircleAlert, Info, RotateCcw, TriangleAlert } from 'lucide-react'
import {
  auditColorPairs, defaultColorSchemeSettings, generateColorScheme, getSchemeColorPatch, harmonyOptions, hexToOklch,
  neutralTemperatureOptions, oklchToHex, type ColorSchemeSettings,
} from '../theme/color-scheme'
import { normalizeColor, readableForeground, type ColorTokenKey, type ThemeMode, type ThemeTokens } from '../theme/tokens'
import { colorAuditLabels, colorGroupLabels, colorRoleLabels } from './color-editor-labels'
import './color-scheme-editor.css'

type ColorGroup = 'foundation' | 'semantic'
type ApplyGroup = ColorGroup | 'all'

export type ColorSchemeEditorProps = {
  tokens: ThemeTokens
  mode: ThemeMode
  settings?: ColorSchemeSettings
  onApply: (settings: ColorSchemeSettings, group: ApplyGroup) => void
  onEditColor: (key: ColorTokenKey) => void
}

const foundationRoles: { key: ColorTokenKey; label: string }[] = [
  ...(['primary', 'accent', 'background', 'surface', 'text', 'muted', 'border'] as const).map((key) => ({ key, label: colorRoleLabels[key] })),
]
const semanticRoles = [
  { key: 'success', label: colorRoleLabels.success, icon: CheckCircle2, message: '변경 사항을 저장했습니다.' },
  { key: 'warning', label: colorRoleLabels.warning, icon: TriangleAlert, message: '저장하기 전에 확인해 주세요.' },
  { key: 'info', label: colorRoleLabels.info, icon: Info, message: '새로운 안내가 도착했습니다.' },
  { key: 'danger', label: colorRoleLabels.danger, icon: CircleAlert, message: '입력한 내용을 확인해 주세요.' },
] as const
const wheelBackground = `conic-gradient(${Array.from({ length: 25 }, (_, index) => `${oklchToHex(.7, .14, index * 15)} ${index * 15}deg`).join(', ')})`

function initialSettings(tokens: ThemeTokens, settings?: ColorSchemeSettings): ColorSchemeSettings {
  return settings ? { ...settings } : { ...defaultColorSchemeSettings, seed: tokens.accent, chroma: Math.min(.3, hexToOklch(tokens.accent).c) }
}

function SeedInput({ value, onChange, onValidityChange }: { value: string; onChange: (value: string) => void; onValidityChange: (valid: boolean) => void }) {
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)
  const skipBlur = useRef(false)
  useEffect(() => { setDraft(value); setInvalid(false); onValidityChange(true) }, [value, onValidityChange])
  function commit() {
    const normalized = normalizeColor(draft.startsWith('#') ? draft : `#${draft}`)
    if (!normalized) { setInvalid(true); onValidityChange(false); return }
    setDraft(normalized); setInvalid(false); onValidityChange(true); onChange(normalized)
  }
  return <div className="scheme-seed-field">
    <span className="scheme-seed-swatch" style={{ background: value }}><input type="color" aria-label="컬러 스키마 시드 컬러 선택" value={value} onChange={(event) => onChange(event.target.value)} /></span>
    <input type="text" aria-label="컬러 스키마 시드 컬러 HEX" value={draft.toUpperCase()} maxLength={7} spellCheck={false} autoComplete="off" aria-invalid={invalid || undefined}
      onFocus={(event) => event.currentTarget.select()} onChange={(event) => { const next = event.target.value; setDraft(next); setInvalid(false); onValidityChange(Boolean(normalizeColor(next.startsWith('#') ? next : `#${next}`))) }}
      onBlur={() => { if (skipBlur.current) { skipBlur.current = false; return } commit() }}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); commit() } if (event.key === 'Escape') { event.preventDefault(); skipBlur.current = true; setDraft(value); setInvalid(false); onValidityChange(true); event.currentTarget.blur() } }} />
    {invalid ? <span className="scheme-input-error" role="status">#RRGGBB 형식으로 입력해 주세요.</span> : null}
  </div>
}

function SchemePreview({ colors, radius }: { colors: ThemeTokens; radius: number }) {
  return <div className="scheme-sample" style={{ background: colors.background, color: colors.text, '--scheme-sample-radius': `${radius}px`, '--scheme-sample-border': colors.border } as CSSProperties} aria-label="생성할 베이스 컬러 미리보기">
    <div className="scheme-sample-top"><span className="scheme-sample-mark" style={{ background: colors.primary, color: readableForeground(colors.primary) }}>M</span><strong>새로운 작업실</strong><span className="scheme-sample-dot" style={{ background: colors.accent }} /></div>
    <div className="scheme-sample-card" style={{ background: colors.surface }}>
      <span className="scheme-sample-eyebrow" style={{ color: colors.accent }}>YOUR NEXT IDEA</span><strong>아이디어를 다듬는 공간</strong>
      <p style={{ color: colors.muted }}>좋은 기본 위에 나만의 화면을 만들어 보세요.</p>
      <div className="scheme-sample-input" style={{ borderColor: colors.border, color: colors.muted }}>프로젝트 이름</div>
      <span className="scheme-sample-action" style={{ background: colors.primary, color: readableForeground(colors.primary) }}>새 프로젝트 만들기 <ArrowUpRight size={12} aria-hidden="true" /></span>
    </div>
    <div className="scheme-sample-footer" style={{ color: colors.muted }}><span style={{ background: colors.accent }} />액센트는 작은 강조에, 뉴트럴은 화면의 바탕에.</div>
  </div>
}

export function ColorSchemeEditor({ tokens, mode, settings, onApply, onEditColor }: ColorSchemeEditorProps) {
  const id = useId()
  const [draft, setDraft] = useState(() => initialSettings(tokens, settings))
  const [group, setGroup] = useState<ColorGroup>('foundation')
  const [ramp, setRamp] = useState<'accent' | 'neutral'>('accent')
  const [auditSource, setAuditSource] = useState<'current' | 'draft'>('draft')
  const [applyTogether, setApplyTogether] = useState(false)
  const [seedValid, setSeedValid] = useState(true)
  const [seedResetKey, setSeedResetKey] = useState(0)
  const [status, setStatus] = useState('')
  const groupTabs = useRef<(HTMLButtonElement | null)[]>([])
  const settingsSeed = settings?.seed
  const settingsHarmony = settings?.harmony
  const settingsChroma = settings?.chroma
  const settingsTemperature = settings?.temperature
  const settingsNeutral = settings?.neutralActions
  const currentAccent = tokens.accent
  useEffect(() => {
    const next = settingsSeed === undefined || settingsHarmony === undefined || settingsChroma === undefined || settingsTemperature === undefined || settingsNeutral === undefined
      ? { ...defaultColorSchemeSettings, seed: currentAccent, chroma: Math.min(.3, hexToOklch(currentAccent).c) }
      : { seed: settingsSeed, harmony: settingsHarmony, chroma: settingsChroma, temperature: settingsTemperature, neutralActions: settingsNeutral }
    setDraft(next)
    setSeedValid(true)
    setSeedResetKey((previous) => previous + 1)
  }, [settingsSeed, settingsHarmony, settingsChroma, settingsTemperature, settingsNeutral, currentAccent])

  const generated = useMemo(() => generateColorScheme(draft, mode), [draft, mode])
  const applyGroup = applyTogether ? 'all' : group
  const background = tokens.background
  const surface = tokens.surface
  const patch = useMemo(() => getSchemeColorPatch(draft, mode, applyGroup, { background, surface }), [draft, mode, applyGroup, background, surface])
  const preview = { ...tokens, ...patch }
  const seed = hexToOklch(draft.seed)
  const harmony = harmonyOptions.find((option) => option.value === draft.harmony) ?? harmonyOptions[0]
  const audits = auditColorPairs(auditSource === 'draft' ? preview : tokens)
  const lowAccentContrast = auditColorPairs(preview).some((pair) => pair.id === 'accent-surface' && !pair.pass)
  const passes = audits.filter((pair) => pair.pass).length
  const rampColors = ramp === 'accent' ? generated.accentRamp : generated.neutralRamp
  const modeName = mode === 'light' ? '라이트' : '다크'

  function change(patch: Partial<ColorSchemeSettings>) { setDraft((previous) => ({ ...previous, ...patch })); setStatus('') }
  function apply(which: ApplyGroup) {
    if (!seedValid) return
    onApply({ ...draft }, which)
    setStatus(`${modeName} 모드에 ${which === 'all' ? '베이스·시맨틱 컬러를' : which === 'foundation' ? '베이스 컬러를' : '시맨틱 컬러를'} 적용했습니다.`)
  }
  function resetDraft() { setDraft(initialSettings(tokens)); setSeedResetKey((previous) => previous + 1); setSeedValid(true); setStatus('현재 액센트 컬러로 생성 설정을 되돌렸습니다.') }

  return <section className="color-scheme-editor" aria-label="컬러 스키마 편집기">
    <div className="scheme-workbench">
      <div className="scheme-topbar"><div className="scheme-group-tabs" role="tablist" aria-label="컬러 스키마 편집 대상">
        {(['foundation', 'semantic'] as const).map((value, index) => <button key={value} ref={(element) => { groupTabs.current[index] = element }} type="button" role="tab" id={`${id}-tab-${value}`} aria-controls={`${id}-panel-${value}`} aria-selected={group === value} tabIndex={group === value ? 0 : -1}
          onClick={() => setGroup(value)} onKeyDown={(event) => {
            const next = event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? 1 - index : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : null
            if (next === null) return
            event.preventDefault(); setGroup(next === 0 ? 'foundation' : 'semantic'); groupTabs.current[next]?.focus({ preventScroll: true })
          }}>{colorGroupLabels[value]}</button>)}
      </div><span className="scheme-draft-label"><i />적용 전 미리보기 · {modeName}</span></div>
      <div className="scheme-builder">
        <div className="scheme-settings">
          <div className="scheme-control-heading"><label>시드 컬러</label><button type="button" className="scheme-reset" onClick={resetDraft} aria-label="현재 액센트 컬러로 컬러 생성 설정 복원"><RotateCcw size={11} aria-hidden="true" />현재 컬러</button></div>
          <SeedInput key={seedResetKey} value={draft.seed} onValidityChange={setSeedValid} onChange={(value) => change({ seed: value, chroma: Math.min(.3, hexToOklch(value).c) })} />
          <div className="scheme-hue-control"><label htmlFor={`${id}-hue`}>색상 <span>{Math.round(seed.h)}°</span></label><input id={`${id}-hue`} type="range" min={0} max={359} step={1} value={Math.round(seed.h) % 360} aria-label="시드 컬러 색상각" aria-valuetext={`${Math.round(seed.h)}도`} onChange={(event) => change({ seed: oklchToHex(seed.c < .001 ? .62 : seed.l, Math.max(seed.c, .04), Number(event.target.value)) })} /></div>
          <div className="scheme-lightness-control"><label htmlFor={`${id}-lightness`}>명도 <span>{Math.round(seed.l * 100)}%</span></label><input id={`${id}-lightness`} type="range" min={.05} max={.95} step={.01} value={Math.min(.95, Math.max(.05, seed.l))} aria-label="시드 컬러 명도" aria-valuetext={`${Math.round(seed.l * 100)}퍼센트`} onChange={(event) => change({ seed: oklchToHex(Number(event.target.value), seed.c, seed.h) })} /></div>
          <div className="scheme-chroma-control"><label htmlFor={`${id}-chroma`}>색의 선명도 <span>{draft.chroma.toFixed(3)}</span></label><input id={`${id}-chroma`} type="range" min={0} max={.3} step={.005} value={draft.chroma} aria-label="컬러 스키마 선명도" onChange={(event) => change({ chroma: Number(event.target.value) })} /></div>
          <div className="scheme-setting-block"><span className="scheme-field-label">색상 조화</span><div className="scheme-harmony-options" role="group" aria-label="색상 조화 규칙">{harmonyOptions.map((option) => <button type="button" key={option.value} aria-pressed={draft.harmony === option.value} onClick={() => change({ harmony: option.value })}>{option.label}</button>)}</div><p className="scheme-help">{harmony.description}</p></div>
          <div className="scheme-setting-block"><span className="scheme-field-label">중립색 온도</span><div className="scheme-temperature" role="group" aria-label="중립색 온도">{neutralTemperatureOptions.map((option) => <button type="button" key={option.value} aria-pressed={draft.temperature === option.value} onClick={() => change({ temperature: option.value })}>{option.label}</button>)}</div></div>
          <label className="scheme-neutral-actions"><input type="checkbox" checked={draft.neutralActions} onChange={(event) => change({ neutralActions: event.target.checked })} /><span>프라이머리는 모노톤 유지<small>액센트 컬러를 작은 강조에 사용합니다.</small></span></label>
        </div>
        <div className="scheme-preview-column">
          <div className="scheme-harmony-preview"><div className="scheme-wheel" style={{ background: wheelBackground }} aria-hidden="true"><span className="scheme-wheel-center" />{generated.harmony.map((color, index) => <i key={`${index}-${color.hue}`} style={{ left: `${50 + Math.sin(color.hue * Math.PI / 180) * 38}%`, top: `${50 - Math.cos(color.hue * Math.PI / 180) * 38}%`, background: color.color }} />)}</div><div className="scheme-harmony-swatches"><span>선택한 색의 관계</span><div>{generated.harmony.map((color, index) => <span key={index} style={{ background: color.color, color: readableForeground(color.color) }} title={`${index === 0 ? '시드 컬러' : `하모니 컬러 ${index}`} · ${color.color.toUpperCase()}`}><small>{Math.round(color.hue)}°</small></span>)}</div><small>OKLCH · 명도와 선명도를 분리해 조절</small></div></div>
          {group === 'foundation' ? <SchemePreview colors={preview} radius={tokens.radius} /> : <div className="scheme-semantic-preview" style={{ background: preview.surface, borderColor: preview.border }} aria-label="생성할 시맨틱 컬러 미리보기">{semanticRoles.map(({ key, label, icon: Icon, message }) => <div key={key} style={{ color: preview[key] }}><Icon size={17} aria-hidden="true" /><span><strong>{label}</strong><small>{message}</small></span><code>{preview[key].toUpperCase()}</code></div>)}</div>}
          {lowAccentContrast ? <p className="scheme-preview-note">액센트와 서피스의 대비가 낮습니다. 작은 글자에 사용하려면 명도를 조정해 주세요.</p> : null}
        </div>
      </div>
      {(['foundation', 'semantic'] as const).map((value) => <div key={value} className="scheme-role-panel" role="tabpanel" id={`${id}-panel-${value}`} aria-labelledby={`${id}-tab-${value}`} hidden={group !== value}>
        {value === group ? <>
          <div className="scheme-role-heading"><strong>현재 {colorGroupLabels[value]}</strong><span>색상을 누르면 개별 값을 편집할 수 있어요.</span></div>
          <div className={`scheme-current-roles scheme-current-roles-${value}`}>{(value === 'foundation' ? foundationRoles : semanticRoles).map(({ key, label }) => <button key={key} type="button" aria-label={`${label} 색상 편집`} onClick={() => onEditColor(key)}><span className="scheme-role-color" style={{ background: tokens[key] }} /><span><strong>{label}</strong><code>{tokens[key].toUpperCase()}</code></span><ArrowUpRight size={11} aria-hidden="true" /></button>)}</div>
          {value === 'semantic' ? <p className="scheme-help scheme-semantic-note">성공·경고·정보·오류는 각 의미에 맞는 색상 계열을 유지합니다. 조화 규칙과 별도로, 선명도와 명도를 맞춰 구성해요.</p> : null}
        </> : null}
      </div>)}
      <div className="scheme-ramp-section"><div className="scheme-ramp-heading"><strong>명도 스케일</strong><div role="group" aria-label="명도 스케일 종류"><button type="button" aria-pressed={ramp === 'accent'} onClick={() => setRamp('accent')}>액센트</button><button type="button" aria-pressed={ramp === 'neutral'} onClick={() => setRamp('neutral')}>뉴트럴</button></div><small>적용 전 팔레트</small></div><div className="scheme-ramp">{rampColors.map(({ step, color }) => <span key={step} style={{ background: color, color: readableForeground(color) }} title={`${step} · ${color.toUpperCase()}`}><strong>{step}</strong><code>{color.toUpperCase()}</code></span>)}</div></div>
      <div className="scheme-apply-row"><p>미리보기의 {applyTogether ? '베이스·시맨틱 컬러를' : group === 'foundation' ? '베이스 컬러를' : '시맨틱 컬러를'} <strong>현재 {modeName} 모드</strong>에 적용합니다.</p><div><label className="scheme-apply-together"><input type="checkbox" checked={applyTogether} onChange={(event) => { setApplyTogether(event.target.checked); setStatus('') }} />베이스·시맨틱 함께 적용</label><button type="button" className="scheme-apply-primary" disabled={!seedValid} onClick={() => apply(applyGroup)}><Check size={13} aria-hidden="true" />{applyTogether ? '전체 컬러 적용' : `${colorGroupLabels[group]} 적용`}</button></div></div>
      <p className="scheme-status" role="status" aria-live="polite">{status}</p>
    </div>
    <details className="scheme-contrast"><summary><span>명도 대비 확인 <small>일반 텍스트 기준</small></span><span>{passes} / {audits.length} 쌍 충족</span></summary><div className="scheme-contrast-body"><div className="scheme-audit-source" role="group" aria-label="대비 검사 대상"><button type="button" aria-pressed={auditSource === 'draft'} onClick={() => setAuditSource('draft')}>생성할 색상</button><button type="button" aria-pressed={auditSource === 'current'} onClick={() => setAuditSource('current')}>현재 컬러</button></div><ul>{audits.map((pair) => <li key={pair.id}><span className="scheme-contrast-sample" style={{ color: pair.foreground, background: pair.background }}>Aa</span><span className="scheme-contrast-name">{colorAuditLabels[pair.id] ?? pair.label}</span><code>{pair.ratio.toFixed(2)}:1</code><span className="scheme-contrast-result" data-pass={pair.pass}>{pair.pass ? <Check size={11} aria-hidden="true" /> : <CircleAlert size={11} aria-hidden="true" />}{pair.pass ? '충족' : '조정 필요'}</span></li>)}</ul><p>표시된 글자·배경 쌍을 4.5:1 기준으로 확인합니다. 전체 화면의 접근성 검사를 대신하지 않습니다. <a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" target="_blank" rel="noreferrer">대비 기준 보기 <ArrowUpRight size={10} aria-hidden="true" /></a></p></div></details>
  </section>
}
