import { useEffect, useId, useRef, useState } from 'react';
import { Link2, RotateCcw } from 'lucide-react';
import {
  densityOptions, densityOverrideDefinitions, densityProfiles, resolveDensity, withDensityMetric,
  type DensityMetricKey, type ThemeTokens, type TokenChange,
} from '../theme/tokens';

const sizes = ['sm', 'md', 'lg'] as const;
const sizeLabels = { sm: 'S', md: 'M', lg: 'L' };
const groups = [
  { key: 'controlHeight', label: '높이', accessible: '컨트롤 높이' },
  { key: 'controlPaddingX', label: '좌우 여백', accessible: '컨트롤 좌우 여백' },
  { key: 'iconSize', label: '아이콘', accessible: '아이콘 크기' },
] as const;
const mainMetrics: { key: DensityMetricKey; label: string }[] = [
  { key: 'spacing', label: '기본 간격' }, { key: 'fieldGap', label: '라벨 ↔ 입력창' },
  { key: 'formGap', label: '입력 항목 사이' }, { key: 'cardPadding', label: '카드 안쪽' },
];
const extraMetrics: { key: DensityMetricKey; label: string }[] = [
  { key: 'controlGap', label: '컨트롤 내부' }, { key: 'checkboxSize', label: '체크박스' },
  { key: 'sectionGap', label: '섹션 사이' },
];

function DensityNumber({ label, value, min, max, step, onCommit }: {
  label: string; value: number; min: number; max: number; step: number;
  onCommit: (value: number) => number;
}) {
  const [draft, setDraft] = useState(String(value));
  const skipBlur = useRef(false);
  useEffect(() => { setDraft(String(value)); }, [value]);
  function commit() {
    const parsed = draft.trim() ? Number(draft) : NaN;
    if (!Number.isFinite(parsed)) { setDraft(String(value)); return; }
    const next = Math.min(max, Math.max(min, parsed));
    setDraft(String(onCommit(next)));
  }
  return <input type="number" inputMode="decimal" aria-label={label} min={min} max={max} step={step} value={draft}
    onFocus={(event) => event.currentTarget.select()}
    onChange={(event) => setDraft(event.target.value)}
    onBlur={() => { if (skipBlur.current) { skipBlur.current = false; return; } commit(); }}
    onKeyDown={(event) => {
      if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); skipBlur.current = true; setDraft(String(value)); event.currentTarget.blur(); }
    }} />;
}

export function TokenDensityControls({ tokens, onChange }: { tokens: ThemeTokens; onChange: TokenChange }) {
  const id = useId();
  const density = resolveDensity(tokens);
  const base = densityProfiles[tokens.density];
  const customized = Object.keys(tokens.densityOverrides?.[tokens.density] ?? {}).length > 0;
  function changeMetric(metric: DensityMetricKey, value: number) {
    const next = withDensityMetric(tokens, metric, value);
    onChange('densityOverrides', next.densityOverrides);
    return resolveDensity(next);
  }
  function resetCurrent() {
    const next = { ...tokens.densityOverrides };
    delete next[tokens.density];
    onChange('densityOverrides', next);
  }
  function scalarControls(metrics: typeof mainMetrics) {
    return metrics.map(({ key, label }) => {
      const definition = densityOverrideDefinitions[key];
      return <label className="token-density-scalar" key={key}><span>{label}</span><span className="token-density-number-unit"><DensityNumber label={label} value={density[key] as number} min={definition.min} max={definition.max} step={definition.step} onCommit={(value) => changeMetric(key, value)[key] as number} /><span aria-hidden="true">px</span></span></label>;
    });
  }
  return <div className="token-density-controls">
    <div className="token-density-switch" role="group" aria-label="컴포넌트 밀도">
      {densityOptions.map((option) => <button type="button" key={option.value} aria-pressed={tokens.density === option.value} onClick={() => onChange('density', option.value)}>{option.label}</button>)}
    </div>
    <div className="token-density-status"><span>{densityOptions.find(({ value }) => value === tokens.density)?.description}{customized ? ' · 직접 조절' : ''}</span><button type="button" disabled={!customized} onClick={resetCurrent} aria-label="현재 밀도 수동 설정 초기화" title="현재 밀도의 수동 설정 초기화"><RotateCcw size={11} aria-hidden="true" />복원</button></div>
    <div className="token-density-ratio-note" id={`${id}-ratio`}><Link2 size={11} aria-hidden="true" /><span>S/M/L 비율 연동 · 한 값을 바꾸면 함께 조절돼요.</span><span>px</span></div>
    <div className="token-density-size-table" role="group" aria-label="크기별 수동 조절" aria-describedby={`${id}-ratio`}>
      <div className="token-density-size-row token-density-size-head" aria-hidden="true"><span />{sizes.map((size) => <span key={size}>{sizeLabels[size]}</span>)}</div>
      {groups.map(({ key, label, accessible }) => {
        const definition = densityOverrideDefinitions[key];
        return <div className="token-density-size-row" key={key}><span>{label}</span>{sizes.map((size) => {
          const ratio = base[key][size] / base[key].md;
          return <DensityNumber key={size} label={`${accessible} ${sizeLabels[size]}`} value={density[key][size]} min={Number((definition.min * ratio).toFixed(4))} max={Number((definition.max * ratio).toFixed(4))} step={.1} onCommit={(value) => changeMetric(key, value / ratio)[key][size]} />;
        })}</div>;
      })}
    </div>
    <div className="token-density-scalar-grid">{scalarControls(mainMetrics)}</div>
    <details className="token-density-extra"><summary>간격 세부 조정</summary><div className="token-density-scalar-grid">{scalarControls(extraMetrics)}</div></details>
  </div>;
}
