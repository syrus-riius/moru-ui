import { createSimNode, normalizeNode } from './simulator-model'
import { DEFAULT_SIM_LAYOUT, getDescendantIds, getSimLayout, resolveSimLayout } from './simulator-layout'
import type { SimLayout, SimNode, SimScreen } from './simulator-types'

export type AutoLayoutMode = Exclude<SimLayout['mode'], 'free'>

export function getSimSelectionRoots(screen: SimScreen, ids: readonly string[]) {
  const requested = new Set(ids)
  const byId = new Map(screen.nodes.map((node) => [node.id, node]))
  return screen.nodes.filter((node) => {
    if (!requested.has(node.id)) return false
    let parent = node.parentId
    const visited = new Set<string>()
    while (parent && !visited.has(parent)) {
      if (requested.has(parent)) return false
      visited.add(parent); parent = byId.get(parent)?.parentId
    }
    return true
  })
}

/** Move whole subtrees. Automatic parents use array order; free parents preserve visual position. */
export function relocateSimNodes(screen: SimScreen, ids: readonly string[], parentId?: string, beforeId?: string): SimScreen {
  const roots = getSimSelectionRoots(screen, ids)
  if (!roots.length) return screen
  const movedIds = new Set(getDescendantIds(screen, roots.map((node) => node.id)))
  const parent = parentId ? screen.nodes.find((node) => node.id === parentId && node.type === 'container') : undefined
  if (parentId && (!parent || movedIds.has(parentId))) return screen
  const resolved = new Map(resolveSimLayout(screen).nodes.map((node) => [node.id, node]))
  const origin = parent ? resolved.get(parent.id) : undefined
  const free = getSimLayout(parent ? parent.layout : screen.layout).mode === 'free'
  const padding = parent || screen.layout ? getSimLayout(parent ? parent.layout : screen.layout).padding : 0
  const rootIds = new Set(roots.map((node) => node.id))
  const group = screen.nodes.filter((node) => movedIds.has(node.id)).map((node) => {
    if (!rootIds.has(node.id)) return node
    const rect = resolved.get(node.id) ?? node
    const next = normalizeNode({ ...node, parentId, x: rect.x - (origin?.x ?? 0) - padding, y: rect.y - (origin?.y ?? 0) - padding, ...(free ? { width: rect.width, height: rect.height } : {}) }, screen)
    if (!parentId) delete next.parentId
    return next
  })
  const others = screen.nodes.filter((node) => !movedIds.has(node.id))
  let index = beforeId ? others.findIndex((node) => node.id === beforeId && node.parentId === parentId) : -1
  if (index < 0) {
    const siblings = others.filter((node) => node.parentId === parentId)
    if (siblings.length) {
      const tail = new Set(getDescendantIds({ ...screen, nodes: others }, [siblings[siblings.length - 1].id]))
      index = others.reduce((last, node, i) => tail.has(node.id) ? i + 1 : last, 0)
    } else index = parent ? others.findIndex((node) => node.id === parent.id) + 1 : others.length
  }
  return { ...screen, nodes: [...others.slice(0, index), ...group, ...others.slice(index)] }
}

export function moveSimNodeOrder(screen: SimScreen, id: string, direction: -1 | 1): SimScreen {
  const node = screen.nodes.find((item) => item.id === id)
  if (!node) return screen
  const siblings = screen.nodes.filter((item) => item.parentId === node.parentId)
  const index = siblings.findIndex((item) => item.id === id)
  if (index + direction < 0 || index + direction >= siblings.length) return screen
  return relocateSimNodes(screen, [id], node.parentId, direction === -1 ? siblings[index - 1].id : siblings[index + 2]?.id)
}

export function moveSimNodesOrder(screen: SimScreen, ids: readonly string[], direction: -1 | 1): SimScreen {
  const roots = getSimSelectionRoots(screen, ids)
  const ordered = direction === 1 ? [...roots].reverse() : roots
  return ordered.reduce((next, node) => moveSimNodeOrder(next, node.id, direction), screen)
}

export function wrapSimNodes(screen: SimScreen, ids: readonly string[], id: string, mode: AutoLayoutMode): SimScreen {
  const roots = getSimSelectionRoots(screen, ids)
  if (!roots.length || screen.nodes.length >= 100 || screen.nodes.some((node) => node.id === id)) return screen
  const sharedParent = roots.every((node) => node.parentId === roots[0].parentId) ? roots[0].parentId : undefined
  const resolved = new Map(resolveSimLayout(screen).nodes.map((node) => [node.id, node]))
  const rects = roots.map((node) => resolved.get(node.id) ?? node)
  const x = Math.min(...rects.map((node) => node.x)), y = Math.min(...rects.map((node) => node.y))
  const parentRect = sharedParent ? resolved.get(sharedParent) : undefined
  const parentLayout = sharedParent ? screen.nodes.find((node) => node.id === sharedParent)?.layout : screen.layout
  const padding = sharedParent || screen.layout ? getSimLayout(parentLayout).padding : 0
  const container = normalizeNode({
    ...createSimNode('container', id), parentId: sharedParent,
    x: x - (parentRect?.x ?? 0) - padding, y: y - (parentRect?.y ?? 0) - padding,
    width: Math.max(160, ...rects.map((node) => node.x + node.width - x)),
    height: Math.max(80, ...rects.map((node) => node.y + node.height - y)),
    layout: { ...DEFAULT_SIM_LAYOUT, mode },
  }, screen)
  const rootIds = new Set(roots.map((node) => node.id))
  const index = screen.nodes.findIndex((node) => rootIds.has(node.id))
  const nodes = screen.nodes.map((node): SimNode => rootIds.has(node.id) ? { ...node, parentId: id, x: Math.max(0, node.x - container.x), y: Math.max(0, node.y - container.y) } : node)
  return { ...screen, nodes: [...nodes.slice(0, index), container, ...nodes.slice(index)] }
}

/** Turning automatic placement off keeps the positions currently visible in the canvas. */
export function setSimParentLayout(screen: SimScreen, layout: SimLayout, parentId?: string): SimScreen {
  const parent = parentId ? screen.nodes.find((node) => node.id === parentId && node.type === 'container') : undefined
  if (parentId && !parent) return screen
  const previous = getSimLayout(parent ? parent.layout : screen.layout)
  let nodes = screen.nodes
  if (previous.mode !== 'free' && layout.mode === 'free') {
    const resolved = new Map(resolveSimLayout(screen).nodes.map((node) => [node.id, node]))
    const origin = parent ? resolved.get(parent.id) : undefined
    nodes = nodes.map((node) => {
      if (node.parentId !== parentId) return node
      const rect = resolved.get(node.id) ?? node
      return normalizeNode({ ...node, x: rect.x - (origin?.x ?? 0) - layout.padding, y: rect.y - (origin?.y ?? 0) - layout.padding, width: rect.width, height: rect.height }, screen)
    })
  }
  return parentId ? { ...screen, nodes: nodes.map((node) => node.id === parentId ? { ...node, layout } : node) } : { ...screen, layout, nodes }
}

export function getSimDropTarget(screen: SimScreen, x: number, y: number, excludeIds: readonly string[] = []) {
  const excluded = new Set(getDescendantIds(screen, excludeIds))
  const resolved = resolveSimLayout(screen).nodes
  const parents = resolved.filter((node) => node.type === 'container' && !excluded.has(node.id) && x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height)
  let parent = parents[parents.length - 1]
  // The edge of a sibling container is an insertion zone; its center accepts nesting.
  const dragged = screen.nodes.filter((node) => excludeIds.includes(node.id))
  if (parent && dragged.length && dragged.every((node) => node.parentId === parent.parentId)) {
    const edge = Math.min(20, parent.height * .2)
    if (y < parent.y + edge || y > parent.y + parent.height - edge) parent = parents[parents.length - 2]
  }
  const layout = getSimLayout(parent ? parent.layout : screen.layout)
  if (layout.mode === 'free') return { parentId: parent?.id }
  const siblings = resolved.filter((node) => node.parentId === parent?.id && !excluded.has(node.id))
  const horizontal = layout.mode === 'horizontal' && !(layout.stackOnMobile && screen.width < 600)
  const before = siblings.find((node) => horizontal ? x < node.x + node.width / 2 : layout.mode === 'grid' ? y < node.y || y <= node.y + node.height && x < node.x + node.width / 2 : y < node.y + node.height / 2)
  return { parentId: parent?.id, beforeId: before?.id }
}
