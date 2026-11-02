import { useEffect, useId, useState } from 'react'
import { ArrowDown, ArrowRight, Grid2X2, Move } from 'lucide-react'
import type { SimLayout } from './simulator-types'
import { getSimLayout } from './simulator-layout'
import './simulator-layout-controls.css'

interface Props {
  layout?: SimLayout
  screenWidth: number
  scope: 'screen' | 'container'
  onChange: (layout: SimLayout) => void
}

const modes = [
  { value: 'free', label: '자유', Icon: Move },
  { value: 'vertical', label: '세로 스택', Icon: ArrowDown },
  { value: 'horizontal', label: '가로 스택', Icon: ArrowRight },
  { value: 'grid', label: '그리드', Icon: Grid2X2 },
] as const

function LayoutNumber({ label, value, min = 0, max = 128, unit = 'px', onCommit }: { label: string; value: number; min?: number; max?: number; unit?: string; onCommit: (value: number) => void }) {
  const id = useId()
  const [draft, setDraft] = useState(String(value))
  useEffect(() => { setDraft(String(value)) }, [value])
  function commit() {
    const number = draft.trim() ? Number(draft) : NaN
    if (!Number.isFinite(number)) { setDraft(String(value)); return }
    const next = Math.max(min, Math.min(max, Math.round(number)))
    setDraft(String(next))
    if (next !== value) onCommit(next)
  }
  return <div className="sim-inspector-field"><label htmlFor={id}>{label}</label><div className="sim-inspector-number"><input id={id} type="number" inputMode="numeric" min={min} max={max} step={1} aria-describedby={`${id}-unit`} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }} /><span aria-hidden="true">{unit}</span><span className="sr-only" id={`${id}-unit`}>{unit === 'px' ? '픽셀 단위' : '열 단위'}</span></div></div>
}

export function SimulatorLayoutControls({ layout, screenWidth, scope, onChange }: Props) {
  const id = useId()
  const current = getSimLayout(layout)
  const name = scope === 'screen' ? '화면' : '컨테이너'
  const breakpoint = screenWidth < 600 ? '모바일' : screenWidth < 1024 ? '태블릿' : '웹'
  const columns = screenWidth < 600 ? current.mobileColumns : screenWidth < 1024 ? current.tabletColumns : current.columns
  const vertical = current.mode !== 'horizontal' || (screenWidth < 600 && current.stackOnMobile)
  function patch(next: Partial<SimLayout>) { onChange({ ...current, ...next }) }
  return <div className="sim-layout-controls">
    <div className="sim-layout-modes" role="group" aria-label={`${name} 레이아웃 방식`}>
      {modes.map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={current.mode === value} onClick={() => patch({ mode: value })}><Icon size={14} aria-hidden="true" /><span>{label}</span></button>)}
    </div>
    {current.mode === 'free' ? <p className="sim-inspector-hint">요소를 원하는 위치에 직접 놓습니다. 스택이나 그리드를 선택하면 안쪽 요소가 순서대로 자동 배치돼요.</p> : <>
      <p className="sim-layout-active" role="status"><span aria-hidden="true" />{breakpoint} · {current.mode === 'grid' ? `최대 ${columns}열 그리드` : current.mode === 'horizontal' && !(screenWidth < 600 && current.stackOnMobile) ? '가로로 배치' : '세로로 배치'}</p>
      <div className="sim-inspector-grid"><LayoutNumber label={`${name} 요소 간격`} value={current.gap} onCommit={(gap) => patch({ gap })} /><LayoutNumber label={`${name} 안쪽 여백`} value={current.padding} onCommit={(padding) => patch({ padding })} /></div>
      <div className="sim-inspector-field"><label htmlFor={`${id}-align`}>{current.mode === 'grid' ? '셀 안 가로 정렬' : vertical ? '가로 정렬' : '세로 정렬'}</label><select id={`${id}-align`} value={current.align} aria-describedby={current.align === 'stretch' ? `${id}-align-hint` : undefined} onChange={(event) => patch({ align: event.target.value as SimLayout['align'] })}><option value="stretch">늘려 채우기</option><option value="start">시작</option><option value="center">가운데</option><option value="end">끝</option></select>{current.align === 'stretch' ? <p className="sim-inspector-hint" id={`${id}-align-hint`}>{current.mode === 'grid' || !vertical ? '콘텐츠에 맞춤 컨테이너를 같은 행의 높이에 맞춰 늘려요. 고정 크기는 유지합니다.' : '너비 채우기 요소는 가로 폭에 맞추고, 고정 너비 요소는 시작점에 맞춰요.'}</p> : null}</div>
      <div className="sim-inspector-field"><label htmlFor={`${id}-justify`}>{vertical ? '세로 배치 정렬' : '가로 배치 정렬'}</label><select id={`${id}-justify`} value={current.justify} onChange={(event) => patch({ justify: event.target.value as SimLayout['justify'] })}><option value="start">시작부터</option><option value="center">가운데</option><option value="end">끝에 맞춤</option><option value="between">남는 간격 균등 분배</option></select></div>
      {current.mode === 'grid' ? <fieldset className="sim-layout-breakpoints"><legend>프레임별 열 수</legend><div className="sim-layout-column-fields"><LayoutNumber label="모바일 열 수" value={current.mobileColumns} min={1} max={12} unit="열" onCommit={(mobileColumns) => patch({ mobileColumns })} /><LayoutNumber label="태블릿 열 수" value={current.tabletColumns} min={1} max={12} unit="열" onCommit={(tabletColumns) => patch({ tabletColumns })} /><LayoutNumber label="웹 열 수" value={current.columns} min={1} max={12} unit="열" onCommit={(columns) => patch({ columns })} /></div></fieldset> : null}
      {current.mode === 'horizontal' ? <label className="sim-inspector-check" htmlFor={`${id}-stack-mobile`}><input id={`${id}-stack-mobile`} type="checkbox" checked={current.stackOnMobile} onChange={(event) => patch({ stackOnMobile: event.target.checked })} /><span>모바일에서 세로로 쌓기</span></label> : null}
      {current.mode === 'grid' || current.mode === 'horizontal' ? <p className="sim-inspector-hint">모바일은 600px 미만, 태블릿은 1,024px 미만, 웹은 그 이상으로 구분합니다. 프레임 너비에 맞춰 배치를 다시 계산해요.</p> : <p className="sim-inspector-hint">너비 채우기를 켠 요소는 프레임에 맞춰 늘어나고, 콘텐츠가 길어지면 안쪽에서 스크롤할 수 있어요.</p>}
    </>}
  </div>
}
