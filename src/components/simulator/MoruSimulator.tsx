import { useEffect, useEffectEvent, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { AlignLeft, ArrowDownToLine, ArrowLeft, ArrowRight, ChartColumn, Check, Copy, FileUp, GripVertical, Image as ImageIcon, Keyboard, Layers, LayoutTemplate, List, ListFilter, MessageSquare, Minus, Monitor, MousePointer2, PanelTop, Play, Plus, Redo2, RotateCcw, Search, Smartphone, Tablet, SquareCheckBig, SquareMousePointer, Table2, Tag, TextCursorInput, ToggleRight, Trash2, Type, Undo2, UserRound, X, ZoomIn, ZoomOut, type LucideIcon } from 'lucide-react'
import { useToast } from '../ui/toast'
import { Dialog } from '../ui/dialog'
import { FRAME_PRESETS, SIM_COMPONENTS, createBlankScreen, createSimNode, createStarterProject, duplicateScreen, getRequiredFieldErrors, normalizeNode, parseSimProject, patchNode, removeScreen, serializeSimProject } from './simulator-model'
import { getDescendantIds, getSimLayout, isSimNodeManaged, resolveSimLayout } from './simulator-layout'
import { getSimSelectionRoots, moveSimNodeOrder, moveSimNodesOrder, relocateSimNodes, setSimParentLayout, wrapSimNodes, type AutoLayoutMode } from './simulator-layout-editing'
import { consumeBlockInsertion, insertSimBlock, SIM_BLOCK_INSERT_EVENT } from './block-simulator'
import { createResponsiveExampleProject } from './simulator-responsive-example'
import type { SimAction, SimNode, SimNodePatch, SimNodeType, SimRuntimeValues, SimScreen } from './simulator-types'
import { useSimulatorProject } from './useSimulatorProject'
import { SimulatorCanvas, SIM_DRAG_TYPE, type SimSelectionMode } from './SimulatorCanvas'
import { createNodeClipboard, getSelectedNodes, moveSelectedNodes, parseNodeClipboard, pasteNodeClipboard, serializeNodeClipboard, type SimNodeClipboard } from './simulator-selection'
import { useSimulatorShortcuts } from './useSimulatorShortcuts'
import { SimulatorInspector } from './SimulatorInspector'
import { SimulatorNodeView } from './SimulatorNodeView'
import { getDeviceFrameMetrics, SimulatorDeviceFrame } from './SimulatorDeviceFrame'
import { resizeSimScreen, type SimFrameResizeMode } from './simulator-frame-resize'
import './simulator.css'
import './simulator-shortcuts.css'

const paletteIcons: Record<SimNodeType, LucideIcon> = {
  text: Type, button: SquareMousePointer, image: ImageIcon, separator: Minus,
  input: TextCursorInput, 'input-otp': Keyboard, textarea: AlignLeft, select: ListFilter, checkbox: SquareCheckBig,
  switch: ToggleRight, card: PanelTop, tabs: Layers, list: List, table: Table2,
  container: LayoutTemplate, avatar: UserRound, badge: Tag, dialog: MessageSquare, chart: ChartColumn,
}

function InlinePreviewDialog({ message, onClose }: { message: string; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    close.current?.focus({ preventScroll: true })
    return () => { if (previous?.isConnected) previous.focus({ preventScroll: true }) }
  }, [])
  return <div className="sim-preview-scrim"><section className="sim-preview-dialog" role="dialog" aria-modal="false" aria-label="미리보기 안내" onKeyDown={(event) => {
    if (event.key === 'Escape') { event.stopPropagation(); onClose() }
    if (event.key === 'Tab') { event.preventDefault(); close.current?.focus() }
  }}><span className="sim-overline">MORU / PREVIEW</span><h3>잠시 확인해 주세요.</h3><p>{message}</p><button ref={close} type="button" className="sim-primary" onClick={onClose}>확인했어요<Check size={14} /></button></section></div>
}

export function MoruSimulator() {
  const { project, commit, undo, redo, canUndo, canRedo, saveState, initialIssue } = useSimulatorProject()
  const { toast } = useToast()
  const [screenId, setScreenId] = useState(project.startScreenId)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [modifier] = useState(() => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl')
  const [tab, setTab] = useState<'components' | 'screens' | 'layers'>('components')
  const [search, setSearch] = useState('')
  const [snap, setSnap] = useState(true)
  const [zoomChoice, setZoomChoice] = useState<number | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 600 })
  const [frameResizeMode, setFrameResizeMode] = useState<SimFrameResizeMode>('adapt')
  const [playing, setPlaying] = useState(false)
  const [runtimeId, setRuntimeId] = useState(project.startScreenId)
  const [blockPreviewStartId, setBlockPreviewStartId] = useState<string | null>(null)
  const [runtimePreset, setRuntimePreset] = useState<string | null>(null)
  const [runtimeHistory, setRuntimeHistory] = useState<string[]>([])
  const [values, setValues] = useState<SimRuntimeValues>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dialog, setDialog] = useState('')
  const [runtimeNotice, setRuntimeNotice] = useState('')
  const viewport = useRef<HTMLDivElement>(null)
  const runtimeFrame = useRef<HTMLFormElement>(null)
  const runtimeHeading = useRef<HTMLHeadingElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const root = useRef<HTMLElement>(null)
  const latestImport = useRef(0)
  const pasteSequence = useRef<{ text: string; screenId: string; count: number } | null>(null)
  const screen = project.screens.find((item) => item.id === screenId) ?? project.screens[0]
  const runtimeBaseScreen = project.screens.find((item) => item.id === runtimeId) ?? project.screens[0]
  const previewPreset = FRAME_PRESETS.find((item) => item.id === runtimePreset)
  const runtimeScreen = useMemo(() => previewPreset ? resizeSimScreen(runtimeBaseScreen, previewPreset, 'adapt') : runtimeBaseScreen, [runtimeBaseScreen, previewPreset])
  const runtimeLayout = useMemo(() => resolveSimLayout(runtimeScreen), [runtimeScreen])
  const editorLayout = useMemo(() => resolveSimLayout(screen), [screen])
  const activeScreen = playing ? runtimeScreen : screen
  const selectedNodes = getSelectedNodes(screen, selectedIds)
  const selected = selectedNodes.length === 1 ? selectedNodes[0] : null
  const deviceFrame = getDeviceFrameMetrics(activeScreen)
  const fitZoom = Math.min(1, Math.max(.2, Math.min((canvasSize.width - 8) / deviceFrame.outerWidth, (canvasSize.height - 8) / deviceFrame.outerHeight)))
  const zoom = zoomChoice ?? fitZoom
  const filteredComponents = SIM_COMPONENTS.filter((item) => `${item.label} ${item.type} ${item.description}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()))

  const insertPendingBlock = useEffectEvent(() => {
    const request = consumeBlockInsertion()
    if (!request) return
    const inserted = insertSimBlock(project, request.id, request.device)
    if (!inserted) { toast({ title: '한 프로젝트에는 화면을 20개까지 만들 수 있어요. 화면을 정리한 뒤 다시 넣어 주세요.' }); return }
    commit(inserted.project)
    setPlaying(false); setScreenId(inserted.screenId); setBlockPreviewStartId(inserted.screenId); setSelectedIds(inserted.selectedIds)
    setTab('layers'); setZoomChoice(null); setValues({}); setErrors({})
    toast({ title: `${inserted.screenName} 블록을 새 화면에 넣었어요.`, description: '각 요소를 선택해 문구와 배치를 편집하고 화면 이동을 연결하세요.' })
  })
  useEffect(() => {
    const receive = () => insertPendingBlock()
    receive()
    window.addEventListener(SIM_BLOCK_INSERT_EVENT, receive)
    return () => window.removeEventListener(SIM_BLOCK_INSERT_EVENT, receive)
  }, [])

  useEffect(() => {
    const node = viewport.current?.querySelector('.sim-canvas-scroll')
    if (!node) return
    function measure() {
      if (!(node instanceof HTMLElement)) return
      const styles = getComputedStyle(node)
      const width = node.clientWidth - parseFloat(styles.paddingLeft) - parseFloat(styles.paddingRight)
      const height = node.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom)
      if (width > 0 && height > 0) setCanvasSize({ width, height })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    measure()
    return () => observer.disconnect()
  }, [playing, screen.id])
  useEffect(() => {
    if (!runtimeNotice) return
    const timer = setTimeout(() => setRuntimeNotice(''), 3500)
    return () => clearTimeout(timer)
  }, [runtimeNotice])
  useEffect(() => {
    if (playing) {
      runtimeHeading.current?.focus({ preventScroll: true })
      runtimeFrame.current?.parentElement?.scrollTo({ top: 0, left: 0 })
    }
  }, [playing, runtimeId, runtimePreset])

  function selectScreen(id: string) { setBlockPreviewStartId(null); setScreenId(id); setSelectedIds([]); setZoomChoice(null) }
  function editScreen(edit: (value: SimScreen) => SimScreen) {
    commit((current) => ({ ...current, screens: current.screens.map((item) => item.id === screen.id ? edit(item) : item) }))
  }
  function updateNode(id: string, patch: SimNodePatch) {
    commit((current) => {
      let next = current
      if (Object.hasOwn(patch, 'parentId')) next = { ...next, screens: next.screens.map((item) => item.id === screen.id ? relocateSimNodes(item, [id], patch.parentId) : item) }
      if (patch.layout) next = { ...next, screens: next.screens.map((item) => item.id === screen.id ? setSimParentLayout(item, patch.layout!, id) : item) }
      const rest = { ...patch }; delete rest.parentId; delete rest.layout
      return Object.keys(rest).length ? patchNode(next, screen.id, id, rest) : next
    })
  }
  function relocateNodes(ids: readonly string[], parentId?: string, beforeId?: string, dx = 0, dy = 0) {
    editScreen((item) => {
      const next = relocateSimNodes(item, ids, parentId, beforeId)
      return dx || dy ? moveSelectedNodes(next, ids, dx, dy) : next
    })
  }
  function wrapSelection(mode: AutoLayoutMode) {
    if (screen.nodes.length >= 100) { toast({ title: '한 화면에는 100개까지 배치할 수 있어요.' }); return }
    const id = crypto.randomUUID()
    editScreen((item) => wrapSimNodes(item, selectedIds, id, mode)); setSelectedIds([id]); setTab('layers')
  }
  function addNode(type: SimNodeType, x?: number, y?: number, parentId?: string, beforeId?: string) {
    if (screen.nodes.length >= 100) { toast({ title: '한 화면에는 100개까지 배치할 수 있어요.' }); return }
    const targetId = x === undefined ? (selected?.type === 'container' ? selected.id : selected?.parentId) : parentId
    const target = targetId ? editorLayout.nodes.find((item) => item.id === targetId) : undefined
    const padding = target || screen.layout ? getSimLayout(target ? target.layout : screen.layout).padding : 0
    const node = normalizeNode({ ...createSimNode(type, crypto.randomUUID(), x === undefined ? 24 : Math.max(0, x - (target?.x ?? 0) - padding), y === undefined ? Math.min(80 + screen.nodes.length * 32, screen.height - 100) : Math.max(0, y - (target?.y ?? 0) - padding)), ...(targetId ? { parentId: targetId } : {}) }, screen)
    editScreen((item) => {
      const next = { ...item, nodes: [...item.nodes, node] }
      return beforeId ? relocateSimNodes(next, [node.id], targetId, beforeId) : next
    })
    setSelectedIds([node.id])
    requestAnimationFrame(() => {
      const target = viewport.current?.querySelector<HTMLElement>(`[data-node-id="${node.id}"]`)
      target?.focus({ preventScroll: true })
      if (x === undefined && window.matchMedia('(max-width:560px)').matches) target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }
  function focusCanvas(id?: string) {
    requestAnimationFrame(() => {
      const node = id ? viewport.current?.querySelector<HTMLElement>(`[data-node-id="${id}"]`) : null
      const frame = viewport.current?.querySelector<HTMLElement>('.sim-edit-frame')
      if (node && frame) {
        const top = node.offsetTop, bottom = top + Math.min(node.offsetHeight, frame.clientHeight - 32)
        if (top < frame.scrollTop || bottom > frame.scrollTop + frame.clientHeight) frame.scrollTop = Math.max(0, top - 24)
      }
      ;(node ?? viewport.current?.querySelector<HTMLElement>('.sim-canvas-scroll'))?.focus({ preventScroll: true })
    })
  }
  function selectNode(id: string | null, mode: SimSelectionMode = 'replace') {
    if (!id) { setSelectedIds([]); return }
    setSelectedIds((previous) => {
      const current = previous.filter((value) => screen.nodes.some((node) => node.id === value))
      if (mode === 'toggle') return current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
      if (mode === 'extend') return current.includes(id) ? current : [...current, id]
      return [id]
    })
  }
  function selectAll() { setSelectedIds(screen.nodes.map((node) => node.id)); focusCanvas() }
  function deselect() { setSelectedIds([]); focusCanvas() }
  function removeNode() {
    if (!selectedNodes.length) return
    const ids = new Set(getDescendantIds(screen, selectedIds))
    commit((current) => ({ ...current, screens: current.screens.map((item) => item.id === screen.id ? { ...item, nodes: item.nodes.filter((node) => !ids.has(node.id)) } : item) }))
    setSelectedIds([]); focusCanvas()
  }
  function clipboardText() {
    const payload = createNodeClipboard(screen, selectedIds)
    if (!payload) return null
    const text = serializeNodeClipboard(payload)
    pasteSequence.current = { text, screenId: screen.id, count: 0 }
    return text
  }
  function pastePayload(payload: SimNodeClipboard, offset: number) {
    const result = pasteNodeClipboard(screen, payload, () => crypto.randomUUID(), {
      offset, screenIds: project.screens.map((item) => item.id),
      existingIds: project.screens.flatMap((item) => [item.id, ...item.nodes.map((node) => node.id)]),
    })
    if (result.reason) {
      toast({ title: result.reason === 'limit' ? '한 화면에는 100개까지 배치할 수 있어요.' : '요소를 붙여넣지 못했어요. 다시 복사해 주세요.', tone: 'warning' })
      return false
    }
    const existing = new Set(screen.nodes.map((node) => node.id))
    const copies = result.screen.nodes.filter((node) => !existing.has(node.id))
    commit((current) => ({ ...current, screens: current.screens.map((item) => item.id === screen.id && item.nodes.length + copies.length <= 100 ? { ...item, nodes: [...item.nodes, ...copies] } : item) }))
    setSelectedIds(result.ids); focusCanvas(result.ids[0])
    return true
  }
  function pasteSelection(text: string) {
    const payload = parseNodeClipboard(text)
    if (!payload) return false
    const previous = pasteSequence.current
    const count = previous?.text === text && previous.screenId === screen.id ? previous.count + 1 : 1
    if (pastePayload(payload, count * 16)) {
      pasteSequence.current = { text, screenId: screen.id, count }
      toast({ title: `${payload.nodes.length}개 요소를 붙여넣었어요.` })
    }
    return true
  }
  function copyNode() {
    const payload = createNodeClipboard(screen, selectedIds)
    if (payload) pastePayload(payload, 16)
  }
  function moveSelection(dx: number, dy: number, ids: readonly string[] = selectedNodes.map((node) => node.id)) {
    commit((current) => {
      const original = current.screens.find((item) => item.id === screen.id)
      if (!original) return current
      const roots = getSimSelectionRoots(original, ids)
      const managed = roots.filter((node) => isSimNodeManaged(original, node)).map((node) => node.id)
      const ordered = managed.length ? moveSimNodesOrder(original, managed, dx < 0 || dy < 0 ? -1 : 1) : original
      const moved = moveSelectedNodes(ordered, roots.filter((node) => !managed.includes(node.id)).map((node) => node.id), dx, dy)
      return moved === original ? current : { ...current, screens: current.screens.map((item) => item.id === screen.id ? moved : item) }
    })
  }
  function layer(direction: 'front' | 'back') {
    if (!selectedNodes.length) return
    const ids = new Set(selectedNodes.map((node) => node.id))
    commit((current) => ({ ...current, screens: current.screens.map((item) => {
      if (item.id !== screen.id) return item
      const others = item.nodes.filter((node) => !ids.has(node.id))
      const group = item.nodes.filter((node) => ids.has(node.id))
      return { ...item, nodes: direction === 'front' ? [...others, ...group] : [...group, ...others] }
    }) }))
  }
  useSimulatorShortcuts({
    root, enabled: !playing && !shortcutsOpen, selectionCount: selectedNodes.length,
    onSelectAll: selectAll, onDeselect: deselect, onClipboard: clipboardText,
    onCopied: (cut) => { const count = selectedNodes.length; if (cut) removeNode(); toast({ title: `${count}개 요소를 ${cut ? '잘라냈어요' : '복사했어요'}.` }) },
    onPaste: pasteSelection, onDuplicate: copyNode, onDelete: removeNode, onMove: moveSelection,
    onUndo: () => { undo(); focusCanvas() }, onRedo: () => { redo(); focusCanvas() },
    onHelp: () => setShortcutsOpen(true),
    onClipboardError: () => toast({ title: '복사하지 못했어요. 더 적은 요소를 선택해 다시 시도해 주세요.', tone: 'warning' }),
  })
  function patchScreen(patch: Partial<Pick<SimScreen, 'name' | 'width' | 'height' | 'layout'>>) {
    commit((current) => ({ ...current, screens: current.screens.map((item) => {
      if (item.id !== screen.id) return item
      const next = { ...item, ...patch }
      next.name = next.name.trim().slice(0, 80) || '이름 없는 화면'
      next.width = Math.round(Math.max(240, Math.min(1920, Number.isFinite(next.width) ? next.width : item.width)))
      next.height = Math.round(Math.max(240, Math.min(2400, Number.isFinite(next.height) ? next.height : item.height)))
      const resized = { ...resizeSimScreen(item, { width: next.width, height: next.height }, frameResizeMode), name: next.name }
      return patch.layout ? setSimParentLayout(resized, patch.layout) : resized
    }) }))
    if (patch.width !== undefined || patch.height !== undefined) setZoomChoice(null)
  }
  function addScreen() {
    if (project.screens.length >= 20) { toast({ title: '한 프로젝트에는 화면을 20개까지 만들 수 있어요.' }); return }
    const next = createBlankScreen(crypto.randomUUID(), `새 화면 ${project.screens.length + 1}`)
    commit((current) => ({ ...current, screens: [...current.screens, next] }))
    selectScreen(next.id); setTab('components')
  }
  function copyScreen() {
    if (project.screens.length >= 20) return
    const id = crypto.randomUUID()
    commit((current) => duplicateScreen(current, screen.id, id)); selectScreen(id)
  }
  function deleteScreen() {
    if (project.screens.length <= 1) return
    commit((current) => removeScreen(current, screen.id)); setSelectedIds([])
    toast({ title: '화면을 삭제했어요.', description: '연결된 이동 동작도 정리했습니다. 되돌리기로 복원할 수 있어요.' })
  }
  function restart() {
    setRuntimePreset(null); setRuntimeId(blockPreviewStartId && project.screens.some((item) => item.id === blockPreviewStartId) ? blockPreviewStartId : project.startScreenId); setRuntimeHistory([]); setValues({}); setErrors({}); setDialog(''); setRuntimeNotice(''); setZoomChoice(null)
  }
  function start() { restart(); setPlaying(true) }
  function exit() { setPlaying(false); setValues({}); setErrors({}); setDialog(''); setRuntimeNotice(''); setZoomChoice(null) }
  function back() {
    if (!runtimeHistory.length) return
    setRuntimeId(runtimeHistory[runtimeHistory.length - 1]); setRuntimeHistory((current) => current.slice(0, -1)); setErrors({}); setDialog(''); setRuntimeNotice(''); setZoomChoice(null)
  }
  function action(next: SimAction, node: SimNode) {
    if (node.props.state === 'disabled' || node.props.state === 'loading') return
    if (next.type === 'none') return
    if (next.validate) {
      const found = getRequiredFieldErrors(runtimeScreen, values)
      setErrors(found)
      if (Object.keys(found).length) {
        requestAnimationFrame(() => runtimeFrame.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
        return
      }
    }
    if (next.type === 'navigate') {
      if (!project.screens.some((item) => item.id === next.targetScreenId)) { setRuntimeNotice('이동할 화면을 먼저 연결해 주세요.'); return }
      if (next.targetScreenId !== runtimeScreen.id) setRuntimeHistory((current) => [...current, runtimeScreen.id])
      setRuntimeId(next.targetScreenId); setErrors({}); setDialog(''); setRuntimeNotice(''); setZoomChoice(null)
    } else if (next.type === 'back') {
      if (runtimeHistory.length) back()
      else setRuntimeNotice('이전 화면이 없어요. 시작 화면에서 흐름을 실행해 보세요.')
    } else if (next.type === 'dialog') setDialog(next.message || node.props.text || '동작을 확인했어요.')
    else if (next.type === 'toast') setRuntimeNotice(next.message || '동작을 확인했어요.')
  }
  function submit(event: FormEvent) {
    event.preventDefault()
    const node = runtimeScreen.nodes.find((item) => item.type === 'button' && item.action.type !== 'none' && item.props.state === 'default')
    if (node) action(node.action, node)
  }
  function exportProject() {
    try {
      const blob = new Blob([serializeSimProject(project)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'moru-simulator.json'; anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast({ title: '기획 파일을 내보냈어요.' })
    } catch (issue) { toast({ title: issue instanceof Error ? issue.message : '기획 파일을 확인해 주세요.', tone: 'danger' }) }
  }
  async function importProject(file: File) {
    const request = ++latestImport.current
    try {
      if (file.size > 1_000_000) throw new Error('1MB 이하의 기획 파일을 선택해 주세요.')
      const next = parseSimProject(await file.text())
      if (request !== latestImport.current) return
      commit(next); selectScreen(next.startScreenId); setPlaying(false); setValues({}); setErrors({}); setDialog(''); setRuntimeNotice('')
      toast({ title: '기획 파일을 불러왔어요.', description: '이전 기획은 되돌리기로 복원할 수 있어요.' })
    } catch (issue) { toast({ title: issue instanceof Error ? issue.message : '기획 파일을 읽지 못했어요.', tone: 'danger' }) }
  }
  function loadExample(responsive = false) {
    const next = responsive ? createResponsiveExampleProject() : createStarterProject(); commit(next); selectScreen(next.startScreenId)
    toast({ title: responsive ? '반응형 가계부 예제를 불러왔어요.' : '로그인부터 상세까지, 기본 예제를 불러왔어요.', description: '이전 기획은 되돌리기로 복원할 수 있어요.' })
  }
  const canvasStyle = { width: activeScreen.width, height: activeScreen.height } as CSSProperties
  const connections = project.screens.flatMap((from) => from.nodes.filter((node) => node.action.type === 'navigate').map((node) => ({ from, node, to: project.screens.find((item) => item.id === node.action.targetScreenId) })))

  return <section className={`moru-simulator ${playing ? 'sim-is-playing' : ''}`} ref={root} aria-label="Moru 시뮬레이터">
    <header className="sim-intro"><div><span className="sim-overline">MORU WORKSPACE</span><h1>시뮬레이터<span>화면 설계</span></h1><p>컴포넌트를 배치하고, 화면의 흐름을 확인하세요.</p></div><span className="sim-local-label"><span aria-hidden="true" />개인 브라우저에 보관</span></header>
    {initialIssue && saveState !== 'saved' ? <p className="sim-storage-warning" role="status">{initialIssue}</p> : null}
    <div className="sim-project-bar">
      <div className="sim-project-identity"><span className="sim-project-icon" aria-hidden="true"><LayoutTemplate size={18} /></span><div className="sim-project-name"><label htmlFor="sim-project-name">프로젝트</label><div className="sim-project-meta"><input id="sim-project-name" value={project.name} maxLength={80} disabled={playing} onChange={(event) => commit({ ...project, name: event.target.value })} onBlur={() => { if (!project.name.trim()) commit({ ...project, name: '이름 없는 프로젝트' }) }} /><span role="status" className={`sim-save-status ${saveState === 'error' ? 'sim-save-error' : ''}`}>{saveState === 'error' ? '자동 저장 실패 · 파일로 내보내 주세요' : saveState === 'saved' ? '내 브라우저에 저장됨' : '변경하면 자동 저장'}</span></div></div></div>
      <div className="sim-toolbar-group sim-file-actions" role="group" aria-label="기획 파일"><button type="button" onClick={() => loadExample(true)} disabled={playing}><Smartphone size={14} />반응형 예제</button><button type="button" onClick={() => loadExample()} disabled={playing}><LayoutTemplate size={14} />기본 예제</button><button type="button" onClick={() => fileInput.current?.click()} disabled={playing}><FileUp size={14} />불러오기</button><button type="button" onClick={exportProject}><ArrowDownToLine size={14} />내보내기</button></div>
      <input type="file" ref={fileInput} accept="application/json,.json" className="sr-only" aria-label="시뮬레이터 기획 파일 불러오기" onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; if (file) void importProject(file) }} />
    </div>
    <div className="sim-toolbar">
      <div className="sim-toolbar-group">
        <button type="button" aria-label="기획 변경 되돌리기" title={`되돌리기 (${modifier}Z)`} disabled={!canUndo || playing} onClick={undo}><Undo2 size={15} /></button><button type="button" aria-label="기획 변경 다시 실행" title={`다시 실행 (${modifier}⇧Z)`} disabled={!canRedo || playing} onClick={redo}><Redo2 size={15} /></button>
        <span className="sim-toolbar-divider" />
        <div className="sim-selection-tools" role="group" aria-label="선택 요소 편집"><button type="button" aria-label="현재 화면 전체 선택" title={`전체 선택 (${modifier}A)`} disabled={playing || !screen.nodes.length} onClick={selectAll}><Layers size={14} /></button><button type="button" aria-label="선택 요소 복제" title={`복제 (${modifier}D)`} disabled={playing || !selectedNodes.length} onClick={copyNode}><Copy size={14} /></button><button type="button" aria-label="선택 요소 삭제" title="삭제 (Delete / Backspace)" disabled={playing || !selectedNodes.length} onClick={removeNode}><Trash2 size={14} /></button></div>
        <span className="sim-toolbar-divider" />
        <div className="sim-style-picker" role="group" aria-label="시뮬레이터 표현 방식"><button type="button" aria-pressed={project.style === 'wireframe'} disabled={playing} onClick={() => commit({ ...project, style: 'wireframe' })}>와이어프레임</button><button type="button" aria-pressed={project.style === 'moru'} disabled={playing} onClick={() => commit({ ...project, style: 'moru' })}>Moru 스타일</button></div>
        <button type="button" className="sim-shortcut-help" aria-label="시뮬레이터 단축키 보기" title="단축키 (?)" disabled={playing} onClick={() => setShortcutsOpen(true)}><Keyboard size={16} /></button>
      </div>
      <div className="sim-toolbar-group">{playing ? <><button type="button" onClick={restart}><RotateCcw size={14} />다시 시작</button><button type="button" className="sim-primary" onClick={exit}><MousePointer2 size={14} />편집으로 돌아가기</button></> : <><label className="sim-snap"><input type="checkbox" checked={snap} onChange={(event) => setSnap(event.target.checked)} />8px 맞춤</label><button type="button" className="sim-primary" onClick={start}><Play size={14} />흐름 실행</button></>}</div>
    </div>
    <div className="sim-workbench">
      {!playing ? <aside className="sim-library" aria-label="화면과 컴포넌트 목록">
        <div className="sim-library-tabs" role="group" aria-label="시뮬레이터 왼쪽 패널"><button type="button" aria-pressed={tab === 'components'} onClick={() => setTab('components')}>컴포넌트</button><button type="button" aria-pressed={tab === 'layers'} onClick={() => setTab('layers')}>레이어</button><button type="button" aria-pressed={tab === 'screens'} onClick={() => setTab('screens')}>화면 <span>{project.screens.length}</span></button></div>
        {tab === 'components' ? <><label className="sim-palette-search"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="컴포넌트 찾기" aria-label="시뮬레이터 컴포넌트 검색" /></label><p className="sim-panel-note">끌어서 놓거나 눌러 추가하세요.</p>
          {(['레이아웃', '기본', '입력', '콘텐츠'] as const).map((category) => <div className="sim-palette-group" key={category}>{filteredComponents.some((item) => item.category === category) ? <h2>{category}</h2> : null}{filteredComponents.filter((item) => item.category === category).map((item) => { const Icon = paletteIcons[item.type]; return <button type="button" draggable key={item.type} className="sim-palette-item" aria-label={`${item.label} 추가`} onClick={() => addNode(item.type)} onDragStart={(event) => { event.dataTransfer.setData(SIM_DRAG_TYPE, item.type); event.dataTransfer.effectAllowed = 'copy' }}><span className="sim-palette-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.6} /></span><span><strong>{item.label}</strong><small>{item.description}</small></span><GripVertical size={12} aria-hidden="true" /></button> })}</div>)}
          {!filteredComponents.length ? <p className="sim-panel-note">일치하는 컴포넌트가 없어요.</p> : null}</> : tab === 'layers' ? <>
          <p className="sim-panel-note">컨테이너를 선택한 뒤 요소를 추가하면 안에 배치됩니다.</p>
          <button type="button" className="sim-layer-screen" onClick={() => setSelectedIds([])}><PanelTop size={14} />{screen.name}<small>{getSimLayout(screen.layout).mode === 'free' ? '자유 배치' : '자동 레이아웃'}</small></button>
          <div className="sim-layer-list" role="group" aria-label="화면 요소 계층">{editorLayout.nodes.map((node) => {
            let depth = 0, parent = node.parentId
            const seen = new Set<string>()
            while (parent && !seen.has(parent)) { seen.add(parent); depth++; parent = screen.nodes.find((item) => item.id === parent)?.parentId }
            const Icon = paletteIcons[node.type]
            return <button type="button" key={node.id} style={{ paddingInlineStart: 10 + depth * 12 }} aria-pressed={selectedIds.includes(node.id)} onClick={(event) => selectNode(node.id, event.shiftKey ? 'toggle' : 'replace')}><Icon size={14} /><span>{node.props.label || SIM_COMPONENTS.find((item) => item.type === node.type)?.label}</span>{node.type === 'container' ? <small>{screen.nodes.filter((item) => item.parentId === node.id).length}</small> : null}</button>
          })}</div>{!screen.nodes.length ? <p className="sim-panel-note">아직 배치한 요소가 없어요.</p> : null}
        </> : <><div className="sim-screen-list">{project.screens.map((item) => <button type="button" key={item.id} aria-pressed={screen.id === item.id} onClick={() => selectScreen(item.id)}><span className="sim-screen-icon">{item.width < 600 ? <Smartphone size={17} /> : <Monitor size={17} />}</span><span><strong>{item.name}</strong><small>{item.width} × {item.height} · {item.nodes.length}개 요소</small></span>{project.startScreenId === item.id ? <span className="sim-start-dot" aria-label="시작 화면" /> : null}</button>)}</div><button type="button" className="sim-add-screen" onClick={addScreen} disabled={project.screens.length >= 20}><Plus size={14} />새 화면</button><div className="sim-screen-actions"><button type="button" aria-label="현재 화면 복제" onClick={copyScreen} disabled={project.screens.length >= 20}><Copy size={14} />복제</button><button type="button" aria-label="현재 화면 삭제" onClick={deleteScreen} disabled={project.screens.length <= 1}><Trash2 size={14} />삭제</button></div><div className="sim-connections"><h2>연결한 흐름</h2>{connections.length ? connections.map(({ from, node, to }) => <button type="button" key={node.id} onClick={() => { selectScreen(from.id); setSelectedIds([node.id]) }}><span>{from.name}</span><ArrowRight size={12} /><span>{to?.name ?? '대상 선택 필요'}</span></button>) : <p className="sim-panel-note">버튼을 선택하고 이동할 화면을 연결하세요.</p>}</div></>}
      </aside> : null}
      <div className="sim-canvas-panel" ref={viewport}>
        <div className="sim-canvas-bar">{playing ? <div className="sim-runtime-path"><button type="button" aria-label="실행 이전 화면으로" disabled={!runtimeHistory.length} onClick={back}><ArrowLeft size={14} /></button><h2 ref={runtimeHeading} tabIndex={-1}>{runtimeScreen.name}</h2><span>실행 중</span></div> : <><label className="sim-screen-select"><Smartphone size={14} /><select value={screen.id} onChange={(event) => selectScreen(event.target.value)} aria-label="편집할 화면">{project.screens.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button type="button" onClick={() => setSelectedIds([])} className="sim-dimensions" aria-label="화면 크기와 속성 편집">{screen.width} × {screen.height}</button></>}
          <div className="sim-frame-presets" role="group" aria-label="반응형 프레임">{FRAME_PRESETS.map((preset) => {
            const Icon = preset.id === 'mobile' ? Smartphone : preset.id === 'tablet' ? Tablet : Monitor
            return <button type="button" key={preset.id} aria-label={`${preset.id === 'desktop' ? '웹' : preset.label} 프레임`} aria-pressed={activeScreen.width === preset.width && activeScreen.height === preset.height} onClick={() => { if (playing) setRuntimePreset(preset.id); else patchScreen({ width: preset.width, height: preset.height }); setZoomChoice(null) }}><Icon size={13} /><span>{preset.id === 'desktop' ? '웹' : preset.label}</span></button>
          })}</div><div className="sim-zoom-controls"><button type="button" aria-label="캔버스 축소" onClick={() => setZoomChoice(Math.max(.2, Math.round((zoom - .1) * 100) / 100))} disabled={zoom <= .2}><ZoomOut size={14} /></button><button type="button" aria-label="캔버스 화면에 맞추기" onClick={() => setZoomChoice(null)}>{Math.round(zoom * 100)}%</button><button type="button" aria-label="캔버스 확대" onClick={() => setZoomChoice(Math.min(1.5, Math.round((zoom + .1) * 100) / 100))} disabled={zoom >= 1.5}><ZoomIn size={14} /></button></div>
        </div>
        {playing ? <div className="sim-canvas-scroll sim-runtime-scroll"><SimulatorDeviceFrame screen={runtimeScreen} zoom={zoom}><div className="sim-frame sim-runtime-frame" style={canvasStyle} data-style={project.style}>
          <div className="sim-runtime-viewport"><form ref={runtimeFrame} noValidate onSubmit={submit} className="sim-runtime-form" style={{ height: runtimeLayout.contentHeight }} inert={Boolean(dialog)} aria-label={`${runtimeScreen.name} 실행 화면`}><button type="submit" hidden tabIndex={-1} aria-hidden="true">화면 동작 실행</button>{runtimeLayout.nodes.map((node) => <div key={node.id} className={`sim-runtime-node ${node.type === 'container' ? 'sim-runtime-container' : ''}`} data-node-id={node.id} style={{ left: node.x, top: node.y, width: node.width, height: node.height }}><SimulatorNodeView node={node} interactive value={values[node.id]} error={errors[node.id]} onValueChange={(value) => { setValues((current) => ({ ...current, [node.id]: value })); setErrors((current) => ({ ...current, [node.id]: '' })) }} onAction={action} /></div>)}</form></div>
          {dialog ? <InlinePreviewDialog message={dialog} onClose={() => setDialog('')} /> : null}
          {runtimeNotice ? <div className="sim-runtime-notice" role="status"><Check size={14} /><span>{runtimeNotice}</span><button type="button" aria-label="실행 알림 닫기" onClick={() => setRuntimeNotice('')}><X size={13} /></button></div> : null}
        </div></SimulatorDeviceFrame></div> : <SimulatorCanvas key={screen.id} screen={screen} style={project.style} zoom={zoom} snap={snap} selectedIds={selectedNodes.map((node) => node.id)} onSelect={selectNode} onPatch={updateNode} onAdd={addNode} onMoveSelection={moveSelection} onRelocate={relocateNodes} />}
        <div className="sim-canvas-footer"><span>{playing ? '입력과 동작은 이 미리보기 안에서만 실행됩니다.' : selectedNodes.length ? '드래그로 이동·순서 변경 · Shift+클릭으로 추가 선택' : '컴포넌트를 놓거나 선택해 화면을 다듬어 보세요.'}</span><span className="sim-selection-status" aria-live="polite">{playing ? `${project.screens.findIndex((item) => item.id === runtimeScreen.id) + 1} / ${project.screens.length} 화면` : `${selectedNodes.length ? `${selectedNodes.length}개 선택 · ` : ''}${screen.nodes.length}개 요소`}</span></div>
      </div>
      {!playing ? <SimulatorInspector key={selected?.id ?? screen.id} node={selected} nodes={selectedNodes} screen={screen} screens={project.screens} startScreenId={project.startScreenId} frameResizeMode={frameResizeMode} onFrameResizeModeChange={setFrameResizeMode} onPatch={(patch) => { if (selected) updateNode(selected.id, patch) }} onScreenPatch={patchScreen} onSetStart={() => commit({ ...project, startScreenId: screen.id })} onDuplicate={copyNode} onDelete={removeNode} onLayer={layer} onMoveOrder={(direction) => { if (selected) editScreen((item) => moveSimNodeOrder(item, selected.id, direction)) }} onWrapSelection={wrapSelection} /> : null}
    </div>
    <p className="sim-bottom-note"><MousePointer2 size={13} />사이트를 방문하는 다른 사람에게 내 기획은 보이지 않습니다. 기획 파일로 저장하고 다시 불러올 수 있어요.</p>
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} title="시뮬레이터 단축키" description="현재 편집하는 화면의 컴포넌트에 적용됩니다." className="sim-shortcut-dialog">
      <dl className="sim-shortcut-list">{[
        { label: '전체 선택', keys: [modifier, 'A'] }, { label: '복사', keys: [modifier, 'C'] },
        { label: '붙여넣기', keys: [modifier, 'V'] }, { label: '잘라내기', keys: [modifier, 'X'] },
        { label: '복제', keys: [modifier, 'D'] }, { label: '삭제', keys: ['Delete / ⌫'] },
        { label: '되돌리기', keys: [modifier, 'Z'] }, { label: '다시 실행', keys: [modifier, 'Shift', 'Z'] },
        { label: '자유 배치 이동 / 자동 배치 순서', keys: ['← ↑ ↓ →'] }, { label: '8px 이동', keys: ['Shift', '← ↑ ↓ →'] },
        { label: '선택 추가·해제', keys: ['Shift', '클릭'] }, { label: '선택 해제', keys: ['Esc'] },
      ].map(({ label, keys }) => <div key={label}><dt>{label}</dt><dd>{keys.map((key) => <kbd key={key}>{key}</kbd>)}</dd></div>)}</dl>
      <p className="sim-shortcut-note">여러 요소를 함께 복사·삭제할 수 있어요. 자동 배치에서는 방향키로 순서를 바꿉니다. 입력창 안에서는 글자 선택과 복사·붙여넣기가 그대로 작동합니다.</p>
    </Dialog>
  </section>
}
