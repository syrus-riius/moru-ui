import { normalizeNode, parseSimProject } from './simulator-model'
import { getDescendantIds, getSimLayout, isSimNodeManaged, resolveSimLayout } from './simulator-layout'
import type { SimLayout, SimNode, SimScreen } from './simulator-types'

export const SIM_CLIPBOARD_MIME = 'application/x-moru-simulator-selection'
export const SIM_CLIPBOARD_KIND = 'moru-ui/simulator-selection'
export const SIM_CLIPBOARD_LIMIT = 1_000_000

export interface SimSelectionBounds { x: number; y: number; width: number; height: number }
export interface SimNodeClipboard {
  kind: typeof SIM_CLIPBOARD_KIND
  version: 1
  screen: Pick<SimScreen, 'id' | 'width' | 'height'> & { layout?: SimLayout }
  nodes: SimNode[]
}

export function getSelectedNodes(screen: Pick<SimScreen, 'nodes'>, ids: readonly string[]): SimNode[] {
  const selected = new Set(ids)
  return screen.nodes.filter((node) => selected.has(node.id))
}

export function getSelectionBounds(nodes: readonly SimNode[]): SimSelectionBounds | null {
  if (!nodes.length) return null
  const x = Math.min(...nodes.map((node) => node.x))
  const y = Math.min(...nodes.map((node) => node.y))
  return { x, y, width: Math.max(...nodes.map((node) => node.x + node.width)) - x, height: Math.max(...nodes.map((node) => node.y + node.height)) - y }
}

export const selectionBounds = getSelectionBounds

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max))

/** Clamp the entire group, rather than moving individual nodes by different amounts. */
export function clampSelectionDelta(nodes: readonly SimNode[], screen: Pick<SimScreen, 'width' | 'height'>, dx: number, dy: number) {
  const bounds = getSelectionBounds(nodes)
  if (!bounds) return { dx: 0, dy: 0 }
  return {
    dx: Math.round(clamp(Number.isFinite(dx) ? dx : 0, -bounds.x, screen.width - bounds.x - bounds.width)),
    dy: Math.round(clamp(Number.isFinite(dy) ? dy : 0, -bounds.y, screen.height - bounds.y - bounds.height)),
  }
}

export function moveSelectedNodes(screen: SimScreen, ids: readonly string[], dx: number, dy: number): SimScreen {
  const selectedIds = new Set(ids)
  const byId = new Map(screen.nodes.map((node) => [node.id, node]))
  const nodes = getSelectedNodes(screen, ids).filter((node) => {
    if (isSimNodeManaged(screen, node)) return false
    let parentId = node.parentId
    while (parentId) { if (selectedIds.has(parentId)) return false; parentId = byId.get(parentId)?.parentId }
    return true
  })
  const delta = clampSelectionDelta(nodes, screen, dx, dy)
  if (!nodes.length || (!delta.dx && !delta.dy)) return screen
  const selected = new Set(nodes.map((node) => node.id))
  return { ...screen, nodes: screen.nodes.map((node) => selected.has(node.id) ? { ...node, x: node.x + delta.dx, y: node.y + delta.dy } : node) }
}

function cloneNode(node: SimNode): SimNode {
  return { ...node, ...(node.layout ? { layout: { ...node.layout } } : {}), ...(node.layoutItem ? { layoutItem: { ...node.layoutItem } } : {}), props: { ...node.props, options: [...node.props.options], ...(node.props.inputType === 'password' ? { value: '' } : {}) }, action: { ...node.action } }
}

export function createNodeClipboard(screen: SimScreen, ids: readonly string[]): SimNodeClipboard | null {
  const selected = new Set(getDescendantIds(screen, ids))
  const resolved = new Map(resolveSimLayout(screen).nodes.map((node) => [node.id, node]))
  const nodes = screen.nodes.filter((node) => selected.has(node.id)).map((node) => {
    const copy = cloneNode(node)
    if (node.parentId && !selected.has(node.parentId)) {
      delete copy.parentId
      const placed = resolved.get(node.id)
      if (placed) Object.assign(copy, { x: placed.x, y: placed.y, width: placed.width, height: placed.height })
    }
    return copy
  })
  if (!nodes.length) return null
  const overflow = nodes.some((node) => !node.parentId && node.y + node.height > screen.height)
  const layout = screen.layout ? { ...screen.layout } : overflow ? { ...getSimLayout(), padding: 0 } : undefined
  return { kind: SIM_CLIPBOARD_KIND, version: 1, screen: { id: screen.id, width: screen.width, height: screen.height, ...(layout ? { layout } : {}) }, nodes }
}

export function serializeNodeClipboard(payload: SimNodeClipboard): string {
  const text = JSON.stringify({ ...payload, nodes: payload.nodes.map(cloneNode) })
  if (text.length > SIM_CLIPBOARD_LIMIT || new TextEncoder().encode(text).byteLength > SIM_CLIPBOARD_LIMIT) throw new Error('복사할 요소는 1MB 이하로 선택해 주세요.')
  return text
}

function exactRecord(value: unknown, keys: readonly string[], optionalKeys: readonly string[] = []): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  return keys.every((key) => Object.hasOwn(record, key)) && Object.keys(record).every((key) => keys.includes(key) || optionalKeys.includes(key)) ? record : null
}

/** Only Moru's versioned, inert node data is accepted; arbitrary clipboard text is ignored. */
export function parseNodeClipboard(text: string): SimNodeClipboard | null {
  if (typeof text !== 'string' || text.length > SIM_CLIPBOARD_LIMIT || new TextEncoder().encode(text).byteLength > SIM_CLIPBOARD_LIMIT) return null
  try {
    const input = exactRecord(JSON.parse(text), ['kind', 'version', 'screen', 'nodes'])
    if (!input || input.kind !== SIM_CLIPBOARD_KIND || input.version !== 1 || !Array.isArray(input.nodes) || !input.nodes.length || input.nodes.length > 100) return null
    const source = exactRecord(input.screen, ['id', 'width', 'height'], ['layout'])
    if (!source) return null
    const targets = new Set<string>()
    for (const value of input.nodes) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      const action = (value as Record<string, unknown>).action
      if (action && typeof action === 'object' && !Array.isArray(action)) {
        const target = (action as Record<string, unknown>).targetScreenId
        if (typeof target === 'string' && target && target !== source.id) targets.add(target)
      }
    }
    // Reuse the project's strict node/props/action validator without requiring other screen contents.
    const validated = parseSimProject(JSON.stringify({
      schemaVersion: 1, name: '복사한 요소', startScreenId: source.id, style: 'wireframe',
      screens: [
        { id: source.id, name: '원본 화면', width: source.width, height: source.height, nodes: input.nodes, ...(Object.hasOwn(source, 'layout') ? { layout: source.layout } : {}) },
        ...Array.from(targets, (id) => ({ id, name: '연결 화면', width: 160, height: 160, nodes: [] })),
      ],
    })).screens[0]
    return { kind: SIM_CLIPBOARD_KIND, version: 1, screen: { id: validated.id, width: validated.width, height: validated.height, ...(validated.layout ? { layout: validated.layout } : {}) }, nodes: validated.nodes }
  } catch { return null }
}

export interface PasteNodeOptions {
  /** Callers increment this by 16 for repeated pastes of the same clipboard. */
  offset?: number
  /** When supplied, navigation links to screens outside this project are disconnected. */
  screenIds?: readonly string[]
  /** Include all project screen/node IDs to preserve global document uniqueness. */
  existingIds?: readonly string[]
}
export interface PasteNodeResult { screen: SimScreen; ids: string[]; reason?: 'limit' | 'empty' | 'ids' }

export function pasteNodeClipboard(screen: SimScreen, payload: SimNodeClipboard, createId: () => string, options: PasteNodeOptions = {}): PasteNodeResult {
  const sourceIds = new Set(payload.nodes.map((node) => node.id))
  const roots = payload.nodes.filter((node) => !node.parentId || !sourceIds.has(node.parentId))
  const sourceResolved = new Map(resolveSimLayout({ ...payload.screen, name: '복사한 요소', nodes: payload.nodes }).nodes.map((node) => [node.id, node]))
  const bounds = getSelectionBounds(roots.map((node) => sourceResolved.get(node.id) ?? node))
  if (!bounds) return { screen, ids: [], reason: 'empty' }
  if (screen.nodes.length + payload.nodes.length > 100) return { screen, ids: [], reason: 'limit' }
  const used = new Set([screen.id, ...screen.nodes.map((node) => node.id), ...(options.screenIds ?? []), ...(options.existingIds ?? [])])
  const ids: string[] = []
  for (const _node of payload.nodes) {
    let fresh = ''
    for (let attempt = 0; attempt < 32; attempt++) {
      const candidate = createId()
      if (typeof candidate === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(candidate) && !['__proto__', 'prototype', 'constructor'].includes(candidate) && !used.has(candidate)) { fresh = candidate; break }
    }
    if (!fresh) return { screen, ids: [], reason: 'ids' }
    used.add(fresh); ids.push(fresh)
  }
  const scale = Math.min(1, screen.width / bounds.width, screen.height / bounds.height)
  const offset = Number.isFinite(options.offset) ? options.offset! : 16
  const originX = clamp(bounds.x + offset, 0, screen.width - bounds.width * scale)
  const originY = clamp(bounds.y + offset, 0, screen.height - bounds.height * scale)
  const destinations = options.screenIds ? new Set(options.screenIds) : null
  const idMap = new Map(payload.nodes.map((node, index) => [node.id, ids[index]]))
  const rootIds = new Set(roots.map((node) => node.id))
  const copies = payload.nodes.map((source, index) => {
    const node = cloneNode(source)
    if (destinations && node.action.targetScreenId && !destinations.has(node.action.targetScreenId)) {
      node.action = { ...node.action, targetScreenId: '', ...(node.action.type === 'navigate' ? { type: 'none', validate: false } : {}) }
    }
    if (node.parentId) {
      const parentId = idMap.get(node.parentId)
      if (parentId) node.parentId = parentId
      else delete node.parentId
    }
    const placed = sourceResolved.get(source.id) ?? source
    const next = rootIds.has(source.id)
      ? { ...node, id: ids[index], x: originX + (placed.x - bounds.x) * scale, y: originY + (placed.y - bounds.y) * scale, width: placed.width * scale, height: placed.height * scale }
      : { ...node, id: ids[index], x: node.x * scale, y: node.y * scale, width: node.width * scale, height: node.height * scale }
    return normalizeNode(next, screen)
  })
  return { screen: { ...screen, nodes: [...screen.nodes, ...copies] }, ids: roots.map((node) => idMap.get(node.id)!) }
}
