import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Moon, RotateCcw, Sun } from 'lucide-react';
import {
  fontFamilies, fontOptions, normalizeColor, presets, semanticToneOptions, tokenDefinitions, typographyDefinitions, typographyRoleOptions,
  type ColorTokenKey, type ThemeMode, type ThemeTokens, type TokenChange, type TypographyChange, type TypographyRole, type TypographyStyle,
} from '../theme/tokens';
import { TokenDensityControls } from './TokenDensityControls';
import { ComponentSpacingControls } from './ComponentSpacingControls';
import { ShapeRhythmEditor } from './ShapeRhythmEditor';
import { colorGroupLabels, colorRoleLabels } from './color-editor-labels';
import type { ComponentSpacingKey } from '../theme/component-spacing';
import './token-editor.css';
import './inspector-layout.css';

export type TokenEditorProps = {
  tokens: ThemeTokens;
  onChange: TokenChange;
  onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void;
  onTypographyChange: TypographyChange;
  mode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
  presetId: string;
  onPresetChange: (id: string) => void;
  onReset: () => void;
  onExport: () => void;
  focusRequest?: { id: string; serial: number };
  spacingTarget?: ComponentSpacingKey;
  onSpacingTargetChange?: (target: ComponentSpacingKey) => void;
};

const colorLabels: { key: ColorTokenKey; label: string; name: string }[] = [
  { key: 'primary', label: colorRoleLabels.primary, name: 'Primary' },
  { key: 'accent', label: colorRoleLabels.accent, name: 'Accent' },
  { key: 'background', label: colorRoleLabels.background, name: 'Background' },
  { key: 'surface', label: colorRoleLabels.surface, name: 'Surface' },
  { key: 'text', label: colorRoleLabels.text, name: 'Text' },
  { key: 'muted', label: colorRoleLabels.muted, name: 'Muted' },
  { key: 'border', label: colorRoleLabels.border, name: 'Border' },
];

function ColorControl({ token, label, name, value, onChange }: {
  token: ColorTokenKey;
  label: string;
  name: string;
  value: string;
  onChange: TokenChange;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const skipNextBlur = useRef(false);
  useEffect(() => { setDraft(value); setInvalid(false); }, [value]);

  function commit() {
    const normalized = normalizeColor(draft.startsWith('#') ? draft : `#${draft}`);
    if (normalized) { onChange(token, normalized); setDraft(normalized); setInvalid(false); }
    else { setInvalid(true); }
  }

  return (
    <div className="token-color-row">
      <label className="token-color-label" htmlFor={`token-${token}`}>
        <span>{label}</span><span className="token-color-name">{name}</span>
      </label>
      <div className={`token-color-value${invalid ? ' is-invalid' : ''}`}>
        <span className="token-color-swatch" style={{ backgroundColor: value }}>
          <input type="color" value={value} aria-label={`${label} 색상 선택`} onChange={(event) => onChange(token, event.target.value)} />
        </span>
        <input
          id={`token-${token}`}
          aria-label={`${label} HEX 색상`}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className="token-hex-input"
          value={draft.toUpperCase()}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          onFocus={(event) => event.target.select()}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            setInvalid(false);
            if (/^#[\da-f]{6}$/i.test(next)) onChange(token, next);
          }}
          onBlur={() => {
            if (skipNextBlur.current) { skipNextBlur.current = false; return; }
            commit();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') { skipNextBlur.current = true; setDraft(value); setInvalid(false); event.currentTarget.blur(); }
          }}
        />
      </div>
      {invalid && <span className="token-color-error" id={`${id}-error`}>#RRGGBB 형식으로 입력해 주세요.</span>}
    </div>
  );
}

function RangeControl({ token, value, onChange }: {
  token: keyof typeof tokenDefinitions;
  value: number;
  onChange: TokenChange;
}) {
  const id = useId();
  const definition = tokenDefinitions[token];
  const progress = (value - definition.min) / (definition.max - definition.min) * 100;
  return (
    <div className="token-range-control">
      <div className="token-range-label">
        <label htmlFor={id}>{definition.label}</label>
        <output htmlFor={id}>{value}<span>{definition.unit}</span></output>
      </div>
      <input
        id={id}
        className="token-range"
        type="range"
        min={definition.min}
        max={definition.max}
        step={definition.step}
        value={value}
        aria-valuetext={`${value}${definition.unit}`}
        style={{ '--range-fill': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(token, Number(event.target.value))}
      />
    </div>
  );
}

function TypographyControl({ role, property, value, onChange }: {
  role: TypographyRole;
  property: keyof TypographyStyle;
  value: number;
  onChange: TypographyChange;
}) {
  const id = useId();
  const definition = typographyDefinitions[property];
  const roleLabel = typographyRoleOptions.find((option) => option.value === role)?.label;
  const progress = (value - definition.min) / (definition.max - definition.min) * 100;
  return (
    <div className="token-range-control token-type-range">
      <div className="token-range-label">
        <label htmlFor={id}>{definition.label}</label>
        <output htmlFor={id}>{value}<span>{definition.unit}</span></output>
      </div>
      <input id={id} className="token-range" type="range" min={definition.min} max={definition.max} step={definition.step} value={value}
        aria-label={`${roleLabel} ${definition.label}`} aria-valuetext={`${value}${definition.unit}`}
        style={{ '--range-fill': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(role, { [property]: Number(event.target.value) })} />
    </div>
  );
}

const typographySamples: Record<TypographyRole, string> = {
  display: '좋은 하루의 시작', heading: '함께 만드는 공간', body: '작은 차이가 모여 읽기 편안한 화면을 만듭니다. Design for everyday.',
  label: '변경 사항 저장', caption: '설정은 자동으로 저장돼요.', code: 'const spacing = 24; // 0123456789',
};

const editorTabs = [
  { id: 'theme', label: '테마' }, { id: 'colors', label: '컬러' },
  { id: 'type', label: '타이포' }, { id: 'shape', label: '형태' }, { id: 'size', label: '크기' }, { id: 'spacing', label: '간격' }, { id: 'effects', label: '효과' },
] as const;
type EditorTab = typeof editorTabs[number]['id'];
const colorTabs = [{ id: 'foundation', label: colorGroupLabels.foundation }, { id: 'semantic', label: colorGroupLabels.semantic }] as const;
type ColorTab = typeof colorTabs[number]['id'];
const typographyTabs = typographyRoleOptions.map(({ value, label }) => ({ id: value, label }));

function CompactTabs<T extends string>({ items, value, onChange, id, label, className }: {
  items: readonly { id: T; label: string }[]; value: T; onChange: (value: T) => void;
  id: string; label: string; className: string;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return <div role="tablist" aria-label={label} className={className}>
    {items.map((item, index) => <button key={item.id} ref={(element) => { buttons.current[index] = element; }} type="button" role="tab"
      id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel-${item.id}`} aria-selected={value === item.id} tabIndex={value === item.id ? 0 : -1}
      onClick={() => onChange(item.id)} onKeyDown={(event) => {
        const next = event.key === 'ArrowRight' ? (index + 1) % items.length
          : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length
            : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
        if (next === null) return;
        event.preventDefault(); onChange(items[next].id); buttons.current[next]?.focus({ preventScroll: true });
      }}>{item.label}</button>)}
  </div>;
}

export function TokenEditor({ tokens, onChange, onTokensChange, onTypographyChange, mode, onModeChange, presetId, onPresetChange, onReset, onExport, focusRequest, spacingTarget, onSpacingTargetChange }: TokenEditorProps) {
  const id = useId();
  const colorId = `${id}-colors`;
  const fontId = useId();
  const roleId = useId();
  const [activeTab, setActiveTab] = useState<EditorTab>('theme');
  const [colorTab, setColorTab] = useState<ColorTab>('foundation');
  const [typographyRole, setTypographyRole] = useState<TypographyRole>('body');
  const roleDefinition = typographyRoleOptions.find(({ value }) => value === typographyRole)!;
  const typography = tokens.typography[typographyRole];
  const focusId = focusRequest?.id;
  const focusSerial = focusRequest?.serial;
  const pendingFocus = useRef<{ id: string; colorTab: ColorTab } | null>(null);
  useLayoutEffect(() => {
    pendingFocus.current = null;
    if (!focusId?.startsWith('token-')) return;
    const token = focusId.slice(6);
    const semantic = semanticToneOptions.some(({ value }) => value === token);
    if (!semantic && !colorLabels.some(({ key }) => key === token)) return;
    const nextColorTab = semantic ? 'semantic' : 'foundation';
    pendingFocus.current = { id: focusId, colorTab: nextColorTab };
    setActiveTab('colors'); setColorTab(nextColorTab);
  }, [focusId, focusSerial]);
  useLayoutEffect(() => {
    const request = pendingFocus.current;
    if (!request || activeTab !== 'colors' || colorTab !== request.colorTab) return;
    const target = document.getElementById(request.id);
    if (!target || target.closest('[hidden]')) return;
    // Consume only this explicit request after both tab panels are visible.
    pendingFocus.current = null;
    target.focus({ preventScroll: true });
  }, [activeTab, colorTab, focusId, focusSerial]);
  function panelProps(tab: EditorTab) {
    return { role: 'tabpanel' as const, id: `${id}-panel-${tab}`, 'aria-labelledby': `${id}-tab-${tab}`, hidden: activeTab !== tab, tabIndex: 0, className: 'token-tab-panel' };
  }
  return <aside className="token-editor" data-editor-mode={mode} aria-label="디자인 토큰 편집기">
    <div className="token-editor-heading"><div><span className="token-eyebrow">CUSTOMIZE</span><h2>디자인 토큰</h2></div><span className="token-live-badge"><span />LIVE</span></div>
    <CompactTabs items={editorTabs} value={activeTab} onChange={setActiveTab} id={id} label="디자인 토큰 카테고리" className="token-editor-tabs" />
    <div className="token-editor-body">
      <div {...panelProps('theme')}>
        <section className="token-editor-section token-theme-section" aria-label="테마 설정">
          <div className="token-section-heading"><h3>화면 모드</h3><span>APPEARANCE</span></div>
          <div className="token-mode-switch" role="group" aria-label="화면 모드"><button type="button" aria-pressed={mode === 'light'} onClick={() => onModeChange('light')}><Sun size={14} />라이트</button><button type="button" aria-pressed={mode === 'dark'} onClick={() => onModeChange('dark')}><Moon size={14} />다크</button></div>
          <div className="token-preset-label"><span>컬러 프리셋</span><span>{presetId === 'custom' ? '직접 설정' : presets.find((preset) => preset.id === presetId)?.name}</span></div>
          <div className="token-presets" role="group" aria-label="컬러 프리셋">{presets.map((preset) => <button type="button" key={preset.id} className="token-preset" aria-label={`${preset.name} 프리셋 적용`} aria-pressed={presetId === preset.id} title={preset.name} style={{ '--preset-color': preset.color } as CSSProperties} onClick={() => onPresetChange(preset.id)}><span>{presetId === preset.id && <Check size={12} strokeWidth={2.5} />}</span><small>{preset.name.split(' · ')[0]}</small></button>)}</div>
        </section>
      </div>
      <div {...panelProps('colors')}>
        <CompactTabs items={colorTabs} value={colorTab} onChange={setColorTab} id={colorId} label="색상 카테고리" className="token-color-tabs" />
        <section role="tabpanel" id={`${colorId}-panel-foundation`} aria-labelledby={`${colorId}-tab-foundation`} hidden={colorTab !== 'foundation'} className="token-editor-section token-colors-section token-color-panel">
          <div className="token-color-list">{colorLabels.map(({ key, label, name }) => <ColorControl key={key} token={key} label={label} name={name} value={tokens[key]} onChange={onChange} />)}</div>
        </section>
        <section role="tabpanel" id={`${colorId}-panel-semantic`} aria-labelledby={`${colorId}-tab-semantic`} hidden={colorTab !== 'semantic'} className="token-editor-section token-state-colors-section token-color-panel">
          <div className="token-color-list">{semanticToneOptions.map(({ value }) => <ColorControl key={value} token={value} label={colorRoleLabels[value]} name={value.charAt(0).toUpperCase() + value.slice(1)} value={tokens[value]} onChange={onChange} />)}</div>
          <p className="token-section-note">{mode === 'light' ? '라이트' : '다크'} 모드의 시맨틱 컬러입니다.</p>
        </section>
      </div>
      <div {...panelProps('type')}>
        <section className="token-editor-section" aria-label="타이포그래피">
          <div className="token-font-control"><label htmlFor={fontId}>글꼴</label><select id={fontId} value={tokens.fontFamily} onChange={(event) => onChange('fontFamily', event.target.value as ThemeTokens['fontFamily'])}>{fontOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
          <div className="token-role-picker"><span>역할</span><CompactTabs items={typographyTabs} value={typographyRole} onChange={setTypographyRole} id={roleId} label="타이포그래피 역할" className="token-role-tabs" /></div>
          {typographyTabs.map(({ id: role }) => <div key={role} role="tabpanel" id={`${roleId}-panel-${role}`} aria-labelledby={`${roleId}-tab-${role}`} hidden={typographyRole !== role} className="token-role-panel" tabIndex={0}>
            {typographyRole === role ? <>
              <div className="token-type-preview" aria-label={`${roleDefinition.label} 미리보기`} style={{ fontFamily: role === 'code' ? fontFamilies.mono : fontFamilies[tokens.fontFamily], fontSize: `${typography.size}px`, lineHeight: typography.lineHeight, fontWeight: typography.weight, letterSpacing: `${typography.letterSpacing}em` }}>{typographySamples[role]}</div>
              <div className="token-range-list token-type-controls">{(Object.keys(typographyDefinitions) as (keyof TypographyStyle)[]).map((property) => <TypographyControl key={property} role={role} property={property} value={typography[property]} onChange={onTypographyChange} />)}</div>
              <p className="token-section-note">{roleDefinition.description} · 글꼴 변경 시 조절한 차이를 유지해요.</p>
            </> : null}
          </div>)}
        </section>
      </div>
      <div {...panelProps('size')}>
        <section className="token-editor-section token-size-section" aria-label="공통 크기 · 밀도">
          <div className="token-section-heading"><h3>공통 크기 · 밀도</h3><span>DENSITY</span></div>
          <TokenDensityControls tokens={tokens} onChange={onChange} />
          <details className="token-shape-details"><summary>모서리 · 테두리</summary><div className="token-range-list token-geometry-controls"><RangeControl token="radius" value={tokens.radius} onChange={onChange} /><RangeControl token="borderWidth" value={tokens.borderWidth} onChange={onChange} /></div></details>
        </section>
      </div>
      <div {...panelProps('shape')}>
        <section className="token-editor-section token-shape-rhythm-section" aria-label="형태와 리듬 설정">
          <div className="token-section-heading"><h3>형태와 리듬</h3><span>SHAPE & RHYTHM</span></div>
          <ShapeRhythmEditor compact tokens={tokens} onChange={onChange} onTokensChange={onTokensChange} onTypographyChange={onTypographyChange} />
        </section>
      </div>
      <div {...panelProps('effects')}>
        <section className="token-editor-section" aria-label="효과"><div className="token-section-heading"><h3>효과</h3><span>EFFECTS</span></div><div className="token-range-list"><RangeControl token="shadow" value={tokens.shadow} onChange={onChange} /><RangeControl token="duration" value={tokens.duration} onChange={onChange} /></div></section>
      </div>
      <div {...panelProps('spacing')}>
        <section className="token-editor-section token-spacing-section" aria-label="컴포넌트 공통 간격">
          <div className="token-section-heading"><h3>컴포넌트 공통 간격</h3><span>SPACING</span></div>
          <ComponentSpacingControls tokens={tokens} onChange={onChange} target={spacingTarget} onTargetChange={onSpacingTargetChange} />
        </section>
      </div>
    </div>
    <div className="token-editor-footer"><div className="token-editor-actions"><button type="button" className="token-export-button" aria-label="코드 내보내기" onClick={onExport}>내보내기<ArrowUpRight size={13} /></button><button type="button" className="token-reset-button" aria-label="기본값으로 초기화" onClick={onReset}><RotateCcw size={12} />초기화</button></div><p>이 브라우저에 자동 저장</p></div>
  </aside>;
}
