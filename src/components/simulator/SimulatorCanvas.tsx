import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Move, Plus } from 'lucide-react'
import { SIM_COMPONENTS } from './simulator-model'
import { getDescendantIds, getSimLayout, isSimNodeManaged, resolveSimLayout } from './simulator-layout'
import { getSimDropTarget } from './simulator-layout-editing'
import { clampSelectionDelta, getSelectionBounds } from './simulator-selection'
import { nodeTypes, type SimNode, type SimNodePatch, type SimNodeType, type SimScreen, type SimStyle } from './simulator-types'
import { SimulatorNodeView } from './SimulatorNodeView'
import { SimulatorDeviceFrame } from './SimulatorDeviceFrame'

export const SIM_DRAG_TYPE = 'application/x-moru-component'
export type SimSelectionMode = 'replace' | 'toggle' | 'extend'
interface Props {
  screen: SimScreen; selectedIds: readonly string[]; style: SimStyle; zoom: number; snap: boolean
  onSelect: (id: string | null, mode?: SimSelectionMode) => void
  onPatch: (id: string, patch: SimNodePatch) => void
  onMoveSelection: (dx: number, dy: number, ids?: readonly string[]) => void
  onAdd: (type: SimNodeType, x: number, y: number, parentId?: string, beforeId?: string) => void
  onRelocate: (ids: readonly string[], parentId?: string, beforeId?: string, dx?: number, dy?: number) => void
}
interface DragState {
  pointerId: number; mode: 'move' | 'resize'; original: SimNode; originals: SimNode[]
  startX: number; startY: number; target: HTMLElement; last: SimNode
  dx: number; dy: number; moved: boolean; collapseOnClick: boolean; ids: string[]; drop?: { parentId?: string; beforeId?: string }
}

export function SimulatorCanvas({ screen, selectedIds, style, zoom, snap, onSelect, onPatch, onMoveSelection, onAdd, onRelocate }: Props) {
  const [draft, setDraft] = useState<SimNode[] | null>(null)
  const [over, setOver] = useState(false)
  const [dropParent, setDropParent] = useState<string | undefined>()
  const [dropBefore, setDropBefore] = useState<string | undefined>()
  const resolution = useMemo(() => resolveSimLayout(screen), [screen])
  const canvas = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const pointerFocus = useRef(false)
  const step = snap ? 8 : 1
  const round = (value: number) => Math.round(value / step) * step
  const selectedSet = new Set(selectedIds)
  const drafts = new Map(draft?.map((node) => [node.id, node]))
  const selectedNodes = resolution.nodes.filter((node) => selectedSet.has(node.id)).map((node) => drafts.get(node.id) ?? node)
  const selectionBounds = selectedNodes.length > 1 ? getSelectionBounds(selectedNodes) : null

  useEffect(() => {
    setDraft(null)
    setDropParent(undefined)
    setDropBefore(undefined)
    frame.current?.scrollTo({ top: 0, left: 0 })
    return () => {
      const active = drag.current
      drag.current = null
      if (active?.target.hasPointerCapture(active.pointerId)) active.target.releasePointerCapture(active.pointerId)
    }
  }, [screen.id, screen.width, screen.height])

  function focusFromPointer(element: HTMLElement) {
    pointerFocus.current = true
    element.focus({ preventScroll: true })
    pointerFocus.current = false
  }
  function clearSelection() {
    onSelect(null)
    canvas.current?.focus({ preventScroll: true })
  }
  function begin(event: PointerEvent<HTMLElement>, node: SimNode, mode: 'move' | 'resize') {
    if (event.button !== 0) return
    event.preventDefault(); event.stopPropagation()
    const toggle = mode === 'move' && (event.shiftKey || event.metaKey || event.ctrlKey)
    const wasSelected = selectedSet.has(node.id)
    const nextIds = mode === 'resize' ? [node.id] : toggle
      ? wasSelected ? selectedIds.filter((id) => id !== node.id) : [...selectedIds, node.id]
      : wasSelected ? selectedIds : [node.id]
    if (toggle) onSelect(node.id, 'toggle')
    else if (!wasSelected || mode === 'resize') onSelect(node.id)
    focusFromPointer(event.currentTarget)
    // Removing a component with a modifier click never drags the remaining selection.
    if (toggle && wasSelected) return
    const movedIds = getDescendantIds(screen, nextIds)
    const originals = resolution.nodes.filter((item) => movedIds.includes(item.id))
    const rendered = resolution.nodes.find((item) => item.id === node.id) ?? node
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      pointerId: event.pointerId, mode, original: rendered, originals, ids: [...nextIds],
      startX: event.clientX, startY: event.clientY, target: event.currentTarget, last: rendered,
      dx: 0, dy: 0, moved: false, collapseOnClick: !toggle && mode === 'move' && wasSelected && nextIds.length > 1,
    }
  }
  function move(event: PointerEvent<HTMLElement>) {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    const dx = (event.clientX - active.startX) / zoom
    const dy = (event.clientY - active.startY) / zoom
    if (Math.abs(dx) + Math.abs(dy) < 3 && !active.moved) return
    active.moved = true
    if (active.mode === 'resize') {
      const next = { ...active.original, width: Math.max(32, Math.min(screen.width, round(active.original.width + dx))), height: Math.max(16, Math.min(3200, round(active.original.height + dy))) }
      active.last = next
      setDraft([next])
      return
    }
    const bounds = getSelectionBounds(active.originals)
    if (!bounds) return
    const delta = clampSelectionDelta(active.originals, { width: screen.width, height: Math.max(screen.height, resolution.contentHeight) }, round(bounds.x + dx) - bounds.x, round(bounds.y + dy) - bounds.y)
    const rect = frame.current?.getBoundingClientRect()
    if (rect && frame.current) {
      active.drop = getSimDropTarget(screen, (event.clientX - rect.left) / zoom + frame.current.scrollLeft, (event.clientY - rect.top) / zoom + frame.current.scrollTop, active.ids)
      setDropParent(active.drop.parentId)
      setDropBefore(active.drop.beforeId)
    }
    active.dx = delta.dx; active.dy = delta.dy
    setDraft(active.originals.map((node) => ({ ...node, x: node.x + delta.dx, y: node.y + delta.dy })))
  }
  function end(event: PointerEvent<HTMLElement>, cancel = false) {
    const active = drag.current
    if (!active || active.pointerId !== event.pointerId) return
    drag.current = null
    if (active.target.hasPointerCapture(event.pointerId)) active.target.releasePointerCapture(event.pointerId)
    if (!cancel) {
      if (active.mode === 'resize' && active.last !== active.original) onPatch(active.original.id, { width: active.last.width, height: active.last.height, ...(isSimNodeManaged(screen, active.original) ? { layoutItem: { width: 'fixed', height: 'fixed' } as const } : {}) })
      else if (active.mode === 'move' && active.moved) {
        const source = screen.nodes.find((node) => node.id === active.original.id)
        const parent = active.drop?.parentId
        const target = parent ? screen.nodes.find((node) => node.id === parent) : undefined
        const automatic = getSimLayout(target ? target.layout : screen.layout).mode !== 'free'
        if (!automatic && source?.parentId === parent && !active.ids.some((id) => { const node = screen.nodes.find((entry) => entry.id === id); return node && isSimNodeManaged(screen, node) })) onMoveSelection(active.dx, active.dy, active.ids)
        else onRelocate(active.ids, parent, active.drop?.beforeId, automatic ? 0 : active.dx, automatic ? 0 : active.dy)
      }
      else if (!active.moved && active.collapseOnClick) onSelect(active.original.id)
    }
    setDraft(null); setDropParent(undefined); setDropBefore(undefined)
  }
  function keyboard(event: KeyboardEvent<HTMLElement>, node: SimNode, resize = false) {
    if (event.target !== event.currentTarget) return
    const delta = event.shiftKey ? 8 : 1
    const directions: Record<string, [number, number]> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }
    if (resize && directions[event.key]) {
      event.preventDefault(); event.stopPropagation()
      const [dx, dy] = directions[event.key]
      onPatch(node.id, { width: node.width + dx, height: node.height + dy, ...(isSimNodeManaged(screen, node) ? { layoutItem: { width: 'fixed', height: 'fixed' } as const } : {}) })
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); event.stopPropagation()
      onSelect(node.id, event.shiftKey || event.metaKey || event.ctrlKey ? 'toggle' : 'replace')
    } else if (event.key === 'Escape' && drag.current) {
      event.preventDefault(); event.stopPropagation()
      const active = drag.current
      drag.current = null
      if (active.target.hasPointerCapture(active.pointerId)) active.target.releasePointerCapture(active.pointerId)
      setDraft(null); setDropParent(undefined); setDropBefore(undefined)
    }
    // Movement, clipboard, deletion, and duplication are handled once by the editor.
  }
  return <div ref={canvas} className="sim-canvas-scroll" role="region" tabIndex={0} aria-label="와이어프레임 편집 작업 공간" onPointerDown={(event) => {
    if (event.button === 0 && event.target instanceof Element && !event.target.closest('.sim-node')) clearSelection()
  }}>
    <SimulatorDeviceFrame screen={screen} zoom={zoom}>
      <div ref={frame} className={`sim-frame sim-edit-frame ${over ? 'sim-drop-over' : ''}`} data-style={style} data-grid={snap || undefined} style={{ width: screen.width, height: screen.height }}
        onPointerDown={(event) => { if (event.button === 0 && event.target === event.currentTarget) clearSelection() }}
        onDragOver={(event) => { if (event.dataTransfer.types.includes(SIM_DRAG_TYPE)) { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setOver(true); const rect = event.currentTarget.getBoundingClientRect(); setDropParent(getSimDropTarget(screen, (event.clientX - rect.left) / zoom + event.currentTarget.scrollLeft, (event.clientY - rect.top) / zoom + event.currentTarget.scrollTop).parentId) } }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(false); setDropParent(undefined) }}
        onDrop={(event) => {
          event.preventDefault(); setOver(false); setDropParent(undefined)
          const type = event.dataTransfer.getData(SIM_DRAG_TYPE)
          if (!nodeTypes.includes(type as SimNodeType)) return
          const bounds = frame.current?.getBoundingClientRect(); if (!bounds) return
          const definition = SIM_COMPONENTS.find((item) => item.type === type)!
          const x = (event.clientX - bounds.left) / zoom + (frame.current?.scrollLeft ?? 0)
          const y = (event.clientY - bounds.top) / zoom + (frame.current?.scrollTop ?? 0)
          const target = getSimDropTarget(screen, x, y)
          onAdd(type as SimNodeType, round(x - definition.width / 2), round(y - definition.height / 2), target.parentId, target.beforeId)
        }}>
        <div className="sim-layout-content" style={{ height: resolution.contentHeight }}>
        {screen.nodes.length === 0 ? <div className="sim-empty-frame" aria-hidden="true"><Plus size={24} /><strong>첫 컴포넌트를 놓아보세요.</strong><span>왼쪽에서 드래그하거나 항목을 눌러 추가하세요.</span></div> : null}
        {resolution.nodes.map((resolved) => {
          const saved = screen.nodes.find((node) => node.id === resolved.id)!
          const node = drafts.get(resolved.id) ?? resolved
          const label = SIM_COMPONENTS.find((item) => item.type === node.type)?.label ?? node.type
          const selected = selectedSet.has(node.id)
          const single = selected && selectedNodes.length === 1
          const container = node.type === 'container'
          const managed = isSimNodeManaged(screen, node)
          return <div key={node.id} role="group" tabIndex={0} aria-label={`${node.props.label || label} ${label} 선택${selected ? '됨' : ''}`} aria-roledescription="배치한 컴포넌트" className={`sim-node ${selected ? 'sim-node-selected' : ''} ${container ? 'sim-node-container' : ''} ${dropParent === node.id ? 'sim-container-drop' : ''}`} data-node-id={node.id} data-layout-managed={managed || undefined}
            style={{ left: node.x, top: node.y, width: node.width, height: node.height }} onFocus={(event) => { if (event.target === event.currentTarget && !pointerFocus.current && !selectedSet.has(node.id)) onSelect(node.id) }}
            onClick={(event) => { if (event.detail === 0) onSelect(node.id, event.shiftKey || event.metaKey || event.ctrlKey ? 'toggle' : 'replace') }}
            onPointerDown={(event) => begin(event, saved, 'move')} onPointerMove={move} onPointerUp={(event) => end(event)} onPointerCancel={(event) => end(event, true)} onKeyDown={(event) => keyboard(event, saved)}>
            <div className="sim-node-content" inert><SimulatorNodeView node={node} /></div>
            {single ? <><span className="sim-node-tag" aria-hidden="true"><Move size={10} />{label}{managed ? ' · 자동' : ''}{draft ? ` · ${node.x}, ${node.y}` : ''}</span><span role="button" tabIndex={0} className="sim-resize-handle" aria-label={`${node.props.label || label} 크기 조절`} onPointerDown={(event) => begin(event, saved, 'resize')} onKeyDown={(event) => keyboard(event, node, true)} /></> : null}
          </div>
        })}
        {dropBefore ? resolution.nodes.filter((node) => node.id === dropBefore).map((node) => <div key={node.id} className="sim-insertion-marker" aria-hidden="true" style={{ left: node.x, top: node.y - 3, width: node.width }} />) : null}
        {selectionBounds ? <div className="sim-selection-bounds" aria-hidden="true" style={{ left: selectionBounds.x, top: selectionBounds.y, width: selectionBounds.width, height: selectionBounds.height }}><span><Move size={10} />{selectedNodes.length}개 선택됨</span></div> : null}
        </div>
      </div>
    </SimulatorDeviceFrame>
  </div>
}
