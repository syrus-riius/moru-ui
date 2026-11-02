import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Link2, RotateCcw, Search } from 'lucide-react';
import {
  componentSpacingTargets, spacingSides, withComponentSpacing,
  type ComponentSpacingKey, type SpacingBox, type SpacingLength, type SpacingSide,
} from '../theme/component-spacing';
import { resolveDensity, type ThemeTokens, type TokenChange } from '../theme/tokens';
import './component-spacing-controls.css';

const names: Record<string, string> = {
  button: '버튼', field: '입력 항목', input: '입력창', textarea: '여러 줄 입력', checkbox: '체크박스',
  select: '선택창', dialog: '대화상자', menu: '드롭다운 메뉴', tabs: '탭', card: '카드', switch: '스위치',
  'radio-group': '라디오 그룹', slider: '슬라이더', accordion: '아코디언', popover: '팝오버', tooltip: '도움말',
  badge: '배지', alert: '알림', avatar: '아바타', progress: '진행률', separator: '구분선', skeleton: '스켈레톤',
  toast: '토스트', combobox: '콤보박스', 'alert-dialog': '확인 대화상자', sheet: '사이드 패널', empty: '빈 상태',
  table: '표', pagination: '페이지 이동', calendar: '달력', 'date-picker': '날짜 선택', command: '커맨드',
  'toggle-group': '토글 그룹', 'aspect-ratio': '화면 비율', 'button-group': '버튼 그룹', direction: '읽기 방향',
  'input-group': '입력 그룹', 'input-otp': '인증 번호', item: '목록 항목', kbd: '단축키', label: '라벨',
  'native-select': '기본 선택창', spinner: '로딩 표시', toggle: '토글', breadcrumb: '경로', collapsible: '접기',
  'context-menu': '우클릭 메뉴', drawer: '하단 패널', 'hover-card': '호버 카드', menubar: '메뉴 바',
  'navigation-menu': '탐색 메뉴', sidebar: '사이드바', carousel: '캐러셀', chart: '차트', 'data-table': '데이터 표',
  resizable: '크기 조절', 'scroll-area': '스크롤 영역', typography: '글자', attachment: '첨부 파일', bubble: '말풍선',
  'code-block': '코드 블록', marker: '상태 표시', message: '메시지', 'message-scroller': '대화 목록',
  questionnaire: '질문', trace: '실행 기록',
};
const sideNames: Record<SpacingSide, string> = { top: '위', right: '오른쪽', bottom: '아래', left: '왼쪽' };
const boxNames: Record<SpacingBox, string> = { padding: '패딩', margin: '마진' };
const quickSteps = [0, 1, 2, 3, 4, 6];
const round = (value: number) => Number(value.toFixed(3));

function displayedValue(length: SpacingLength | undefined, unit: SpacingLength['unit'], base: number) {
  if (!length) return undefined;
  const pixels = length.unit === 'space' ? length.value * base : length.value;
  return round(unit === 'space' ? pixels / base : pixels);
}

function SpacingNumber({ label, value, unit, statusId, onCommit, onFocus, onStatus }: {
  label: string; value: number | undefined; unit: SpacingLength['unit']; statusId: string;
  onCommit: (value: number | null) => void; onFocus: () => void; onStatus: (message: string) => void;
}) {
  const initial = value === undefined ? '' : String(value);
  const [draft, setDraft] = useState(initial);
  const [invalid, setInvalid] = useState(false);
  const skipBlur = useRef(false);
  const maximum = unit === 'space' ? 24 : 96;
  const step = unit === 'space' ? .25 : .5;
  useEffect(() => { setDraft(initial); setInvalid(false); }, [initial, unit]);
  function commit() {
    if (draft === initial) return;
    if (!draft.trim()) { setInvalid(false); onStatus(''); onCommit(null); return; }
    const parsed = Number(draft);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > maximum) {
      setDraft(initial); setInvalid(true);
      onStatus(`${label}: 0부터 ${maximum}${unit === 'space' ? '배' : 'px'}까지 입력해 주세요.`);
      return;
    }
    const next = round(Math.round(parsed / step) * step);
    setDraft(String(next)); setInvalid(false); onStatus(''); onCommit(next);
  }
  return <input type="number" inputMode="decimal" aria-label={label} aria-invalid={invalid || undefined}
    aria-describedby={statusId} placeholder="기본" min={0} max={maximum} step={step} value={draft}
    onFocus={(event) => { event.currentTarget.select(); onFocus(); }}
    onChange={(event) => { setDraft(event.target.value); setInvalid(false); onStatus(''); }}
    onBlur={() => { if (skipBlur.current) { skipBlur.current = false; return; } commit(); }}
    onKeyDown={(event) => {
      if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); }
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); skipBlur.current = true; setDraft(initial); setInvalid(false); onStatus(''); event.currentTarget.blur(); }
    }} />;
}

export type ComponentSpacingControlsProps = {
  tokens: ThemeTokens;
  onChange: TokenChange;
  target?: ComponentSpacingKey;
  onTargetChange?: (target: ComponentSpacingKey) => void;
};

export function ComponentSpacingControls({ tokens, onChange, target, onTargetChange }: ComponentSpacingControlsProps) {
  const id = useId();
  const [localTarget, setLocalTarget] = useState<ComponentSpacingKey>('button');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [box, setBox] = useState<SpacingBox>('padding');
  const [unit, setUnit] = useState<SpacingLength['unit']>('space');
  const [linked, setLinked] = useState(true);
  const [activeSide, setActiveSide] = useState<SpacingSide>('top');
  const [status, setStatus] = useState('');
  const picker = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const boxTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = componentSpacingTargets.find((item) => item.id === (target ?? localTarget)) ?? componentSpacingTargets[0];
  const name = names[selected.id] ?? selected.label;
  const description = 'description' in selected ? selected.description : undefined;
  const base = resolveDensity(tokens).spacing;
  const entry = tokens.componentSpacing?.[selected.id];
  const customized = Boolean(entry && Object.keys(entry).length);
  const sides = entry?.[box];
  const filtered = componentSpacingTargets.filter((item) => `${item.label} ${item.id} ${names[item.id] ?? ''}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  useEffect(() => { if (pickerOpen) search.current?.focus(); }, [pickerOpen]);
  useEffect(() => { setStatus(''); setActiveSide('top'); }, [selected.id]);

  function choose(next: ComponentSpacingKey) {
    setLocalTarget(next); onTargetChange?.(next); setPickerOpen(false); setQuery(''); setStatus('');
    picker.current?.focus({ preventScroll: true });
  }
  function change(side: SpacingSide, length: SpacingLength | null) {
    onChange('componentSpacing', withComponentSpacing(tokens, selected.id, box, side, length, linked));
  }
  function reset() {
    const next = { ...tokens.componentSpacing };
    delete next[selected.id];
    onChange('componentSpacing', next); setStatus('');
  }

  return <section className="component-spacing-controls" aria-label="컴포넌트 공통 간격">
    <div className="component-spacing-target-heading">
      <button ref={picker} type="button" className="component-spacing-target-button" aria-expanded={pickerOpen} aria-controls={`${id}-targets`} aria-label={`간격 대상 변경 · ${selected.label}`} onClick={() => setPickerOpen(!pickerOpen)}>
        <span><strong>{selected.label}</strong><small>{name} · 공통 기본값</small></span><ChevronDown size={13} aria-hidden="true" />
      </button>
      <button type="button" className="component-spacing-reset" aria-label={`${name} 공통 간격 초기화`} disabled={!customized || !selected.selector} onClick={reset} title="현재 컴포넌트의 패딩·마진 복원"><RotateCcw size={11} aria-hidden="true" />복원</button>
    </div>
    {pickerOpen ? <div className="component-spacing-picker" id={`${id}-targets`}>
      <label className="component-spacing-search"><Search size={12} aria-hidden="true" /><input ref={search} aria-label="간격 대상 컴포넌트 검색" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="버튼, Card 검색" onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setPickerOpen(false); picker.current?.focus(); } }} /></label>
      <div className="component-spacing-target-list" role="group" aria-label="공통 간격 대상 컴포넌트">{filtered.map((item) => <button type="button" key={item.id} aria-pressed={selected.id === item.id} aria-label={`간격 대상 ${item.label} 선택`} onClick={() => choose(item.id)}>{item.label}</button>)}</div>
      {!filtered.length ? <p className="component-spacing-no-results" role="status">일치하는 컴포넌트가 없어요.</p> : null}
    </div> : null}
    {!selected.selector ? <p className="component-spacing-note">{description}</p> : <>
      {description ? <p className="component-spacing-target-description">{description}</p> : null}
      <div className="component-spacing-kind-tabs" role="tablist" aria-label="간격 종류">{(['padding', 'margin'] as const).map((kind, index) => <button ref={(element) => { boxTabs.current[index] = element; }} key={kind} type="button" role="tab" id={`${id}-tab-${kind}`} aria-controls={`${id}-panel-${kind}`} aria-selected={box === kind} tabIndex={box === kind ? 0 : -1}
        onClick={() => { setBox(kind); setStatus(''); }} onKeyDown={(event) => {
          const next = event.key === 'ArrowRight' || event.key === 'ArrowLeft' ? 1 - index : event.key === 'Home' ? 0 : event.key === 'End' ? 1 : null;
          if (next === null) return;
          event.preventDefault(); setBox(next === 0 ? 'padding' : 'margin'); setStatus(''); boxTabs.current[next]?.focus({ preventScroll: true });
        }}>{boxNames[kind]}<small>{kind === 'padding' ? '안쪽' : '바깥'}</small></button>)}</div>
      {(['padding', 'margin'] as const).map((kind) => <div key={kind} role="tabpanel" id={`${id}-panel-${kind}`} aria-labelledby={`${id}-tab-${kind}`} hidden={box !== kind} className="component-spacing-box-panel">
        {box === kind ? <>
          <div className="component-spacing-unit-row"><span>1단위 = {base}px</span><div role="group" aria-label="간격 입력 단위"><button type="button" aria-pressed={unit === 'space'} onClick={() => { setUnit('space'); setStatus(''); }}>시스템 배수</button><button type="button" aria-pressed={unit === 'px'} onClick={() => { setUnit('px'); setStatus(''); }}>px</button></div></div>
          <label className="component-spacing-linked"><input type="checkbox" checked={linked} onChange={(event) => setLinked(event.target.checked)} /><Link2 size={11} aria-hidden="true" /><span>네 방향 연동</span><small>{unit === 'space' ? '배' : 'px'}</small></label>
          <div className="component-spacing-diagram" data-box={box} role="group" aria-label={`${name} ${boxNames[box]} 네 방향`}>
            <span className="component-spacing-content" aria-hidden="true"><strong>{selected.label}</strong><small>콘텐츠</small></span>
            {spacingSides.map((side) => {
              const stored = sides?.[side];
              const value = displayedValue(stored, unit, base);
              const pixels = stored ? round(stored.unit === 'space' ? stored.value * base : stored.value) : undefined;
              return <label className={`component-spacing-side component-spacing-side-${side}`} key={`${selected.id}-${box}-${unit}-${side}`}><span>{sideNames[side]}</span><SpacingNumber label={`${name} ${boxNames[box]} ${sideNames[side]}`} value={value} unit={unit} statusId={`${id}-status`} onFocus={() => setActiveSide(side)} onStatus={setStatus} onCommit={(amount) => change(side, amount === null ? null : { value: amount, unit })} /><small>{pixels === undefined ? ' ' : `${pixels}px`}</small></label>;
            })}
          </div>
          <div className="component-spacing-quick"><span>빠른 간격 · {linked ? '전체' : sideNames[activeSide]}</span><div role="group" aria-label={`${name} ${boxNames[box]} 빠른 간격`}>{quickSteps.map((amount) => <button type="button" key={amount} title={`${amount}단위 · ${round(amount * base)}px`} onClick={() => { change(activeSide, { value: unit === 'space' ? amount : round(amount * base), unit }); setStatus(''); }}>{unit === 'space' ? amount : round(amount * base)}</button>)}</div></div>
        </> : null}
      </div>)}
      <p className={`component-spacing-note${status ? ' is-error' : ''}`} id={`${id}-status`} role="status">{status || (unit === 'space' ? '시스템 배수는 공통 기본 간격에 맞춰 함께 바뀝니다. 빈 값은 기존 스타일을 사용해요.' : 'px 값은 고정됩니다. 빈 값은 기존 스타일을 사용해요.')}</p>
    </>}
  </section>;
}
