import { useEffect, useId, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUp, ArrowUpToLine, Copy, Flag, Grid2X2, MousePointer2, Trash2 } from 'lucide-react'
import { FRAME_PRESETS, SIM_COMPONENTS } from './simulator-model'
import type { SimAction, SimLayout, SimNode, SimNodePatch, SimNodeType, SimProps, SimScreen } from './simulator-types'
import type { SimFrameResizeMode } from './simulator-frame-resize'
import { getSimChartType, parseSimChartData } from './simulator-chart-data'
import { getDescendantIds, isSimNodeManaged } from './simulator-layout'
import { SimulatorLayoutControls } from './SimulatorLayoutControls'
import './simulator-inspector.css'

interface SimulatorInspectorProps {
  node: SimNode | null
  nodes?: SimNode[]
  screen: SimScreen
  screens: SimScreen[]
  startScreenId: string
  frameResizeMode: SimFrameResizeMode
  onFrameResizeModeChange: (mode: SimFrameResizeMode) => void
  onPatch: (patch: SimNodePatch) => void
  onScreenPatch: (patch: Partial<Pick<SimScreen, 'name' | 'width' | 'height' | 'layout'>>) => void
  onSetStart: () => void
  onDuplicate: () => void
  onDelete: () => void
  onLayer: (direction: 'front' | 'back') => void
  onMoveOrder?: (direction: -1 | 1) => void
  onWrapSelection?: (mode: Exclude<SimLayout['mode'], 'free'>) => void
}

const actionable = new Set<SimNodeType>(['button', 'card', 'list', 'dialog', 'image'])
const withText = new Set<SimNodeType>(['text', 'card', 'dialog', 'image', 'avatar', 'chart'])
const withOptions = new Set<SimNodeType>(['select', 'tabs', 'list', 'table'])
const withPlaceholder = new Set<SimNodeType>(['input', 'textarea', 'select'])
const withValue = new Set<SimNodeType>(['input', 'input-otp', 'textarea', 'select'])
const withState = new Set<SimNodeType>(['button', 'input', 'input-otp', 'textarea', 'select', 'checkbox', 'switch', 'dialog'])
const withVariant = new Set<SimNodeType>(['button', 'card', 'badge', 'dialog'])
const withTone = new Set<SimNodeType>(['badge', 'card'])

function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return <div className="sim-inspector-section"><h3>{title}</h3>{children}</div>
}

function NumberField({ label, value, min = 0, max = 2400, onCommit }: { label: string; value: number; min?: number; max?: number; onCommit: (value: number) => void }) {
  const id = useId()
  const upper = Math.max(min, Number.isFinite(max) ? max : min)
  const [draft, setDraft] = useState(String(value))
  useEffect(() => { setDraft(String(value)) }, [value])
  function commit() {
    const parsed = draft.trim() ? Number(draft) : NaN
    if (!Number.isFinite(parsed) || parsed === value) { setDraft(String(value)); return }
    const normalized = Math.min(Math.max(min, Math.round(parsed)), upper)
    setDraft(String(normalized))
    if (normalized !== value) onCommit(normalized)
  }
  return <div className="sim-inspector-field"><label htmlFor={id}>{label}</label><div className="sim-inspector-number"><input id={id} type="number" inputMode="numeric" min={min} max={upper} step={1} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={commit} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() } }} /><span aria-hidden="true">px</span></div></div>
}

function OptionsField({ id, options, table, onChange }: { id: string; options: string[]; table: boolean; onChange: (options: string[]) => void }) {
  const incoming = options.join('\n')
  const [draft, setDraft] = useState(incoming)
  useEffect(() => { setDraft(incoming) }, [incoming])
  return <div className="sim-inspector-field"><label htmlFor={id}>목록 항목</label><textarea id={id} rows={5} maxLength={4000} value={draft} onChange={(event) => setDraft(event.target.value)} onBlur={() => { const next = draft.split('\n').map((line) => line.trim().slice(0, 500)).filter(Boolean).slice(0, 20); setDraft(next.join('\n')); if (next.join('\n') !== incoming) onChange(next) }} aria-describedby={`${id}-hint`} /><p className="sim-inspector-hint" id={`${id}-hint`}>{table ? '한 줄에 한 행을 적고, 열은 | 로 구분해요. 첫 줄은 열 제목입니다.' : '한 줄에 하나씩 적어 주세요. 다른 곳을 누르면 화면에 반영됩니다.'}</p></div>
}

function ChartDataField({ id, node, onChange }: { id: string; node: SimNode; onChange: (options: string[]) => void }) {
  const incoming = node.props.options.join('\n')
  const [draft, setDraft] = useState(incoming)
  useEffect(() => { setDraft(incoming) }, [incoming])
  const parsed = parseSimChartData(draft.split('\n'), getSimChartType(node.props.value))
  return <div className="sim-inspector-field"><label htmlFor={id}>차트 데이터</label><textarea id={id} rows={7} maxLength={6000} value={draft} aria-invalid={parsed.invalidRows.length > 0 || undefined} aria-describedby={`${id}-hint${parsed.invalidRows.length ? ` ${id}-error` : ''}`} onChange={(event) => setDraft(event.target.value)} onBlur={() => {
    const next = draft.split('\n').map((line) => line.trim().slice(0, 500)).filter(Boolean).slice(0, 30)
    setDraft(next.join('\n'))
    if (next.join('\n') !== incoming) onChange(next)
  }} /><p className="sim-inspector-hint" id={`${id}-hint`}>한 줄에 항목 | 숫자를 입력하세요. 예: 월 | 120. 최대 30개 항목을 사용할 수 있어요. 도넛은 0 이상의 값으로 비중을 표시합니다.</p>{parsed.invalidRows.length ? <p className="sim-inspector-warning" id={`${id}-error`} role="status">{parsed.invalidRows.join(', ')}번째 줄을 확인해 주세요. 올바른 항목만 차트에 표시됩니다.</p> : null}</div>
}

export function SimulatorInspector({ node: selectedNode, nodes, screen, screens, startScreenId, frameResizeMode, onFrameResizeModeChange, onPatch, onScreenPatch, onSetStart, onDuplicate, onDelete, onLayer, onMoveOrder, onWrapSelection }: SimulatorInspectorProps) {
  const id = useId()
  const selection = nodes ?? (selectedNode ? [selectedNode] : [])
  const multiple = selection.length > 1
  const node = selection.length === 1 ? selection[0] : null
  const component = node ? SIM_COMPONENTS.find((item) => item.type === node.type) : null
  const bounds = multiple ? {
    x: Math.min(...selection.map((item) => item.x)),
    y: Math.min(...selection.map((item) => item.y)),
    right: Math.max(...selection.map((item) => item.x + item.width)),
    bottom: Math.max(...selection.map((item) => item.y + item.height)),
  } : null
  const isStart = startScreenId === screen.id
  const preset = FRAME_PRESETS.find((item) => item.width === screen.width && item.height === screen.height)?.id ?? 'custom'
  const targetExists = node ? screens.some((item) => item.id === node.action.targetScreenId) : false
  const managed = node ? isSimNodeManaged(screen, node) : false
  const scrollingGeometry = Boolean(screen.layout || node?.parentId)
  const descendants = new Set(node ? getDescendantIds(screen, [node.id]) : [])
  const parentOptions = screen.nodes.filter((item) => item.type === 'container' && !descendants.has(item.id))
  const siblings = node ? screen.nodes.filter((item) => item.parentId === node.parentId) : []
  const siblingIndex = node ? siblings.findIndex((item) => item.id === node.id) : -1
  const itemWidth = node?.layoutItem?.width ?? (node?.type === 'avatar' || node?.type === 'badge' ? 'fixed' : 'fill')
  const itemHeight = node?.layoutItem?.height ?? (node?.type === 'container' ? 'hug' : 'fixed')
  function props(patch: Partial<SimProps>) { onPatch({ props: patch }) }
  function action(patch: Partial<SimAction>) { onPatch({ action: patch }) }

  return <section className="sim-inspector" aria-label="시뮬레이터 속성">
    <header className="sim-inspector-heading"><span>PROPERTIES</span><h2>{multiple ? `${selection.length}개 요소 선택` : node ? component?.label ?? '컴포넌트' : '화면 설정'}</h2><p>{screen.name}{multiple ? ' · 다중 선택' : node ? ` / ${component?.type ?? node.type}` : ` · ${screen.width} × ${screen.height}`}</p></header>
    {multiple && bounds ? <>
      <InspectorSection title="선택한 요소">
        <ul className="sim-inspector-selection-list">
          {selection.slice(0, 12).map((item) => {
            const label = SIM_COMPONENTS.find((entry) => entry.type === item.type)?.label ?? item.type
            const name = item.props.label.trim() || item.props.text.trim() || label
            return <li key={item.id}><span>{label}</span><strong title={name}>{name}</strong></li>
          })}
        </ul>
        {selection.length > 12 ? <p className="sim-inspector-hint">외 {selection.length - 12}개 요소가 함께 선택되어 있어요.</p> : null}
        <p className="sim-inspector-hint">Shift+클릭으로 선택을 더하거나 빼세요. 개별 속성을 수정하려면 요소 하나만 선택하세요.</p>
      </InspectorSection>
      {onWrapSelection ? <InspectorSection title="컨테이너로 묶기"><div className="sim-layout-wrap-actions"><button type="button" onClick={() => onWrapSelection('vertical')}><ArrowDown size={15} aria-hidden="true" />세로 스택</button><button type="button" onClick={() => onWrapSelection('horizontal')}><ArrowRight size={15} aria-hidden="true" />가로 스택</button><button type="button" onClick={() => onWrapSelection('grid')}><Grid2X2 size={15} aria-hidden="true" />그리드</button></div><p className="sim-inspector-hint">선택한 요소를 하나로 묶고, 간격과 반응형 규칙을 함께 조정해요.</p></InspectorSection> : null}
      <InspectorSection title="선택 영역">
        <dl className="sim-inspector-selection-summary" aria-label="선택 영역 위치와 크기">
          <div><dt>가로 위치 X</dt><dd>{bounds.x}<span>px</span></dd></div>
          <div><dt>세로 위치 Y</dt><dd>{bounds.y}<span>px</span></dd></div>
          <div><dt>전체 너비</dt><dd>{bounds.right - bounds.x}<span>px</span></dd></div>
          <div><dt>전체 높이</dt><dd>{bounds.bottom - bounds.y}<span>px</span></dd></div>
        </dl>
        <p className="sim-inspector-hint">드래그나 방향키로 함께 이동할 수 있어요. 복사·붙여넣기 단축키도 사용할 수 있습니다.</p>
      </InspectorSection>
      <InspectorSection title="선택한 요소 관리">
        <div className="sim-inspector-actions"><button type="button" onClick={onDuplicate} aria-label="선택한 요소 복제"><Copy size={14} aria-hidden="true" />모두 복제</button><button type="button" className="sim-inspector-delete" onClick={onDelete} aria-label="선택한 요소 삭제"><Trash2 size={14} aria-hidden="true" />모두 삭제</button></div>
        <div className="sim-inspector-actions"><button type="button" onClick={() => onLayer('front')} aria-label="선택한 요소 맨 앞으로"><ArrowUpToLine size={14} aria-hidden="true" />맨 앞으로</button><button type="button" onClick={() => onLayer('back')} aria-label="선택한 요소 맨 뒤로"><ArrowDownToLine size={14} aria-hidden="true" />맨 뒤로</button></div>
        <p className="sim-inspector-hint">삭제하거나 바꾼 내용은 되돌리기로 복원할 수 있어요.</p>
      </InspectorSection>
    </> : node ? <>
      <InspectorSection title="내용">
        {node.type !== 'separator' && node.type !== 'text' ? <div className="sim-inspector-field"><label htmlFor={`${id}-label`}>{node.type === 'avatar' ? '이름' : node.type === 'image' ? '이미지 설명' : '이름 · 문구'}</label><input id={`${id}-label`} value={node.props.label} maxLength={100} onChange={(event) => props({ label: event.target.value })} /></div> : null}
        {withText.has(node.type) ? <div className="sim-inspector-field"><label htmlFor={`${id}-text`}>{node.type === 'text' ? '텍스트 내용' : node.type === 'avatar' ? '보조 설명' : '설명'}</label><textarea id={`${id}-text`} rows={node.type === 'text' ? 4 : 3} value={node.props.text} maxLength={2000} onChange={(event) => props({ text: event.target.value })} /></div> : null}
        {node.type === 'chart' ? <><div className="sim-inspector-field"><label htmlFor={`${id}-chart-type`}>차트 종류</label><select id={`${id}-chart-type`} value={getSimChartType(node.props.value)} onChange={(event) => props({ value: event.target.value })}><option value="bar">막대 · 항목 비교</option><option value="line">선 · 변화 추이</option><option value="area">영역 · 규모와 흐름</option><option value="donut">도넛 · 전체 중 비중</option></select></div><ChartDataField key={node.id} id={`${id}-chart-data`} node={node} onChange={(options) => props({ options })} /></> : null}
        {node.type === 'text' ? <div className="sim-inspector-field"><label htmlFor={`${id}-role`}>글자 역할</label><select id={`${id}-role`} value={node.props.textRole} onChange={(event) => props({ textRole: event.target.value as SimProps['textRole'] })}><option value="heading">제목</option><option value="body">본문</option><option value="caption">보조 설명</option></select></div> : null}
        {withPlaceholder.has(node.type) ? <div className="sim-inspector-field"><label htmlFor={`${id}-placeholder`}>입력 안내 문구</label><input id={`${id}-placeholder`} value={node.props.placeholder} maxLength={200} onChange={(event) => props({ placeholder: event.target.value })} /></div> : null}
        {withValue.has(node.type) && !(node.type === 'input' && node.props.inputType === 'password') ? <div className="sim-inspector-field"><label htmlFor={`${id}-value`}>초기 값</label><input id={`${id}-value`} value={node.props.value} maxLength={node.type === 'input-otp' ? 6 : 500} inputMode={node.type === 'input-otp' ? 'numeric' : undefined} onChange={(event) => props({ value: node.type === 'input-otp' ? event.target.value.replace(/[^0-9]/g, '').slice(0, 6) : event.target.value })} /></div> : null}
        {node.type === 'input' ? <div className="sim-inspector-field"><label htmlFor={`${id}-input-type`}>입력 형식</label><select id={`${id}-input-type`} value={node.props.inputType} onChange={(event) => props({ inputType: event.target.value as SimProps['inputType'], ...(event.target.value === 'password' ? { value: '' } : {}) })}><option value="text">일반 텍스트</option><option value="email">이메일</option><option value="password">비밀번호</option></select>{node.props.inputType === 'password' ? <p className="sim-inspector-hint">비밀번호는 실행 중에만 입력하며 기획 파일에 저장하지 않습니다.</p> : null}</div> : null}
        {withOptions.has(node.type) ? <OptionsField id={`${id}-options`} options={node.props.options} table={node.type === 'table'} onChange={(options) => props({ options })} /> : null}
        {node.type === 'checkbox' || node.type === 'switch' ? <label className="sim-inspector-check" htmlFor={`${id}-checked`}><input id={`${id}-checked`} type="checkbox" checked={node.props.checked} onChange={(event) => props({ checked: event.target.checked })} /><span>처음부터 선택됨</span></label> : null}
        {node.type === 'input' || node.type === 'input-otp' || node.type === 'textarea' || node.type === 'select' || node.type === 'checkbox' ? <label className="sim-inspector-check" htmlFor={`${id}-required`}><input id={`${id}-required`} type="checkbox" checked={node.props.required} onChange={(event) => props({ required: event.target.checked })} /><span>필수 입력</span></label> : null}
        {node.type === 'separator' ? <p className="sim-inspector-hint">콘텐츠를 구분하는 선입니다. 위치와 크기로 길이를 조절하세요.</p> : null}
      </InspectorSection>

      <InspectorSection title="배치 구조">
        <div className="sim-inspector-field"><label htmlFor={`${id}-parent`}>소속 컨테이너</label><select id={`${id}-parent`} value={node.parentId ?? ''} onChange={(event) => onPatch({ parentId: event.target.value || undefined })}><option value="">화면 바로 아래</option>{parentOptions.map((item) => <option key={item.id} value={item.id}>{item.props.label || '이름 없는 컨테이너'}</option>)}</select></div>
        {managed ? <><div className="sim-inspector-field"><label htmlFor={`${id}-item-width`}>요소 너비</label><select id={`${id}-item-width`} value={itemWidth} onChange={(event) => onPatch({ layoutItem: { width: event.target.value as 'fill' | 'fixed', height: itemHeight } })}><option value="fill">남는 너비 채우기</option><option value="fixed">고정 너비</option></select></div><p className="sim-inspector-hint">위치는 소속 레이아웃이 정해요. 드래그하거나 아래 순서 버튼으로 같은 그룹 안에서 순서를 바꿀 수 있습니다.</p></> : null}
        {node.type === 'container' ? <div className="sim-inspector-field"><label htmlFor={`${id}-item-height`}>컨테이너 높이</label><select id={`${id}-item-height`} value={itemHeight} onChange={(event) => onPatch({ layoutItem: { width: itemWidth, height: event.target.value as 'hug' | 'fixed' } })}><option value="hug">콘텐츠에 맞추기</option><option value="fixed">최소 높이 지정</option></select><p className="sim-inspector-hint">{itemHeight === 'fixed' ? '지정한 높이보다 작아지지 않아요. 콘텐츠가 많아지면 자동으로 더 늘어납니다.' : '안쪽 요소와 여백에 맞춰 높이를 자동으로 정해요.'}</p></div> : null}
        {onMoveOrder ? <div className="sim-inspector-actions"><button type="button" onClick={() => onMoveOrder(-1)} disabled={siblingIndex <= 0} aria-label="레이아웃 순서 앞으로"><ArrowUp size={14} aria-hidden="true" />앞 순서</button><button type="button" onClick={() => onMoveOrder(1)} disabled={siblingIndex < 0 || siblingIndex >= siblings.length - 1} aria-label="레이아웃 순서 뒤로"><ArrowDown size={14} aria-hidden="true" />뒤 순서</button></div> : null}
      </InspectorSection>
      {node.type === 'container' ? <InspectorSection title="컨테이너 배경"><div className="sim-inspector-field"><label htmlFor={`${id}-container-fill`}>배경 채우기</label><select id={`${id}-container-fill`} value={node.props.variant === 'secondary' ? 'secondary' : 'ghost'} onChange={(event) => props({ variant: event.target.value as 'secondary' | 'ghost' })}><option value="ghost">투명</option><option value="secondary">은은한 배경</option></select></div></InspectorSection> : null}
      {node.type === 'container' ? <InspectorSection title="컨테이너 자동 레이아웃"><SimulatorLayoutControls layout={node.layout} screenWidth={screen.width} scope="container" onChange={(layout) => onPatch({ layout })} /></InspectorSection> : null}
      <InspectorSection title="위치와 크기"><div className="sim-inspector-grid">
        {!managed ? <><NumberField label="가로 위치 X" value={node.x} max={Math.max(0, screen.width - node.width)} onCommit={(x) => onPatch({ x })} /><NumberField label="세로 위치 Y" value={node.y} max={scrollingGeometry ? 320000 : Math.max(0, screen.height - node.height)} onCommit={(y) => onPatch({ y })} /></> : null}
        {!managed || itemWidth === 'fixed' ? <NumberField label="너비" value={node.width} min={32} max={managed ? screen.width : Math.max(32, screen.width - node.x)} onCommit={(width) => onPatch({ width })} /> : null}
        {node.type !== 'container' || itemHeight === 'fixed' ? <NumberField label={node.type === 'container' ? '최소 높이' : '높이'} value={node.height} min={node.type === 'separator' ? 2 : 16} max={managed || scrollingGeometry ? 3200 : Math.max(node.type === 'separator' ? 2 : 16, screen.height - node.y)} onCommit={(height) => onPatch({ height })} /> : null}
      </div><p className="sim-inspector-hint">{managed ? '요소의 고정 크기와 컨테이너의 최소 높이만 직접 조절해요. 채우기 너비와 콘텐츠 높이는 자동으로 계산합니다.' : '캔버스에서 방향키로 이동하고, Shift와 함께 누르면 더 크게 이동해요.'}</p></InspectorSection>

      {withState.has(node.type) || withVariant.has(node.type) || withTone.has(node.type) ? <InspectorSection title="표현">
        {withVariant.has(node.type) ? <div className="sim-inspector-field"><label htmlFor={`${id}-variant`}>스타일</label><select id={`${id}-variant`} value={node.props.variant} onChange={(event) => props({ variant: event.target.value as SimProps['variant'] })}><option value="primary">강조</option><option value="secondary">보조</option><option value="outline">외곽선</option><option value="ghost">배경 없음</option></select></div> : null}
        {withState.has(node.type) ? <div className="sim-inspector-field"><label htmlFor={`${id}-state`}>상태</label><select id={`${id}-state`} value={node.props.state} onChange={(event) => props({ state: event.target.value as SimProps['state'] })}><option value="default">기본</option><option value="disabled">비활성</option><option value="error">오류</option><option value="loading">로딩</option></select></div> : null}
        {withTone.has(node.type) ? <div className="sim-inspector-field"><label htmlFor={`${id}-tone`}>의미 색상</label><select id={`${id}-tone`} value={node.props.tone} onChange={(event) => props({ tone: event.target.value as SimProps['tone'] })}><option value="info">정보</option><option value="success">성공</option><option value="warning">경고</option><option value="danger">오류</option></select></div> : null}
      </InspectorSection> : null}

      {actionable.has(node.type) ? <InspectorSection title="클릭했을 때">
        <div className="sim-inspector-field"><label htmlFor={`${id}-action`}>동작</label><select id={`${id}-action`} value={node.action.type} onChange={(event) => { const type = event.target.value as SimAction['type']; action({ type, ...(type !== 'navigate' ? { validate: false } : {}), ...(type === 'navigate' && !targetExists ? { targetScreenId: screens.find((item) => item.id !== screen.id)?.id ?? '' } : {}) }) }}><option value="none">동작 없음</option><option value="navigate">다른 화면으로 이동</option><option value="back">이전 화면으로 돌아가기</option><option value="dialog">대화상자 열기</option><option value="toast">알림 표시</option></select></div>
        {node.action.type === 'navigate' ? <><div className="sim-inspector-field"><label htmlFor={`${id}-target`}>이동할 화면</label><select id={`${id}-target`} value={targetExists ? node.action.targetScreenId : ''} onChange={(event) => action({ targetScreenId: event.target.value })} aria-invalid={!targetExists} aria-describedby={!targetExists ? `${id}-target-hint` : undefined}><option value="">화면을 선택해 주세요.</option>{screens.map((item) => <option key={item.id} value={item.id}>{item.name}{item.id === screen.id ? ' (현재 화면)' : ''}</option>)}</select>{!targetExists ? <p id={`${id}-target-hint`} className="sim-inspector-warning">연결할 화면을 선택하면 실행 중에 이동할 수 있어요.</p> : null}</div><label className="sim-inspector-check" htmlFor={`${id}-validate`}><input id={`${id}-validate`} type="checkbox" checked={node.action.validate} onChange={(event) => action({ validate: event.target.checked })} /><span>필수 입력을 확인한 뒤 이동</span></label></> : null}
        {node.action.type === 'dialog' || node.action.type === 'toast' ? <div className="sim-inspector-field"><label htmlFor={`${id}-message`}>{node.action.type === 'dialog' ? '대화상자 내용' : '알림 문구'}</label><textarea id={`${id}-message`} rows={3} value={node.action.message} maxLength={1000} onChange={(event) => action({ message: event.target.value })} /></div> : null}
        <p className="sim-inspector-hint">상단의 실행 버튼을 누르면 연결한 동작을 시험할 수 있어요.</p>
      </InspectorSection> : null}

      <InspectorSection title="요소 관리"><div className="sim-inspector-actions"><button type="button" onClick={onDuplicate}><Copy size={14} aria-hidden="true" />복제</button><button type="button" className="sim-inspector-delete" onClick={onDelete}><Trash2 size={14} aria-hidden="true" />삭제</button></div><div className="sim-inspector-actions"><button type="button" onClick={() => onLayer('front')}><ArrowUpToLine size={14} aria-hidden="true" />맨 앞으로</button><button type="button" onClick={() => onLayer('back')}><ArrowDownToLine size={14} aria-hidden="true" />맨 뒤로</button></div><p className="sim-inspector-hint">삭제하거나 바꾼 내용은 되돌리기로 복원할 수 있어요.</p></InspectorSection>
    </> : <>
      <InspectorSection title="화면 정보"><div className="sim-inspector-field"><label htmlFor={`${id}-screen-name`}>화면 이름</label><input id={`${id}-screen-name`} value={screen.name} maxLength={80} onChange={(event) => onScreenPatch({ name: event.target.value })} /></div><div className="sim-inspector-field"><label htmlFor={`${id}-resize-mode`}>자유 배치 요소의 크기</label><select id={`${id}-resize-mode`} value={frameResizeMode} onChange={(event) => onFrameResizeModeChange(event.target.value as SimFrameResizeMode)} aria-describedby={`${id}-resize-hint`}><option value="adapt">가로 폭에 맞춤</option><option value="keep">배치 유지</option></select><p className="sim-inspector-hint" id={`${id}-resize-hint`}>{frameResizeMode === 'adapt' ? '자유 배치 요소만 가로 폭에 맞춥니다. 자동 레이아웃 안의 요소는 해당 스택·그리드 규칙을 따라요.' : '자유 배치 요소의 위치와 크기를 유지합니다. 자동 레이아웃 안의 요소는 계속 반응형으로 배치돼요.'}</p></div><div className="sim-inspector-field"><label htmlFor={`${id}-preset`}>프레임 크기</label><select id={`${id}-preset`} value={preset} onChange={(event) => { const next = FRAME_PRESETS.find((item) => item.id === event.target.value); if (next) onScreenPatch({ width: next.width, height: next.height }) }}>{FRAME_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.width} × {item.height}</option>)}<option value="custom">직접 설정</option></select></div><div className="sim-inspector-grid"><NumberField label="화면 너비" value={screen.width} min={240} max={1920} onCommit={(width) => onScreenPatch({ width })} /><NumberField label="화면 높이" value={screen.height} min={320} max={2400} onCommit={(height) => onScreenPatch({ height })} /></div><p className="sim-inspector-hint">모바일·태블릿은 기기 테두리와 함께 보여요. 자동 레이아웃의 열 수와 쌓기 규칙은 프레임 너비에 맞춰 바뀝니다. 프레임 변경도 되돌릴 수 있어요.</p></InspectorSection>
      <InspectorSection title="화면 자동 레이아웃"><SimulatorLayoutControls layout={screen.layout} screenWidth={screen.width} scope="screen" onChange={(layout) => onScreenPatch({ layout })} /><p className="sim-inspector-hint">화면 바로 아래 요소에 적용해요. 컨테이너 내부의 배치는 컨테이너를 선택해 따로 조정할 수 있습니다.</p></InspectorSection>
      <InspectorSection title="시작 화면"><button type="button" className="sim-inspector-start" onClick={onSetStart} disabled={isStart}><Flag size={14} aria-hidden="true" />{isStart ? '이 화면에서 실행 시작' : '시작 화면으로 지정'}</button><p className="sim-inspector-hint">실행을 누르면 지정한 시작 화면부터 연결된 흐름을 확인합니다.</p></InspectorSection>
      <div className="sim-inspector-empty"><MousePointer2 size={20} aria-hidden="true" /><strong>요소를 선택해 보세요.</strong><p>문구와 크기를 다듬고, 클릭했을 때 이동할 화면을 연결할 수 있어요.</p></div>
    </>}
  </section>
}
