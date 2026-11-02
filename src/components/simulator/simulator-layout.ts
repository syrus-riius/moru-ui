import type { SimLayout, SimLayoutItem, SimNode, SimScreen } from './simulator-types'

export const DEFAULT_SIM_LAYOUT: Readonly<SimLayout> = Object.freeze({
  mode: 'vertical', gap: 16, padding: 16, align: 'stretch', justify: 'start',
  columns: 3, tabletColumns: 2, mobileColumns: 1, stackOnMobile: true,
})

/** An absent layout keeps existing documents in free-position mode. */
export function getSimLayout(layout?: SimLayout): SimLayout {
  return { ...DEFAULT_SIM_LAYOUT, mode: 'free', ...layout }
}

export function getSimLayoutItem(node: SimNode): SimLayoutItem {
  return { width: node.type === 'avatar' || node.type === 'badge' ? 'fixed' : 'fill', height: node.type === 'container' ? 'hug' : 'fixed', ...node.layoutItem }
}

/** Includes the supplied IDs, in document order, and every nested descendant. */
export function getDescendantIds(screen: Pick<SimScreen, 'nodes'>, ids: readonly string[]): string[] {
  const found = new Set(ids)
  let changed = true
  while (changed) {
    changed = false
    for (const node of screen.nodes) if (node.parentId && found.has(node.parentId) && !found.has(node.id)) { found.add(node.id); changed = true }
  }
  return screen.nodes.filter((node) => found.has(node.id)).map((node) => node.id)
}

export function isSimNodeManaged(screen: SimScreen, node: SimNode): boolean {
  const parent = node.parentId ? screen.nodes.find((item) => item.id === node.parentId && item.type === 'container') : undefined
  return getSimLayout(parent ? parent.layout : screen.layout).mode !== 'free'
}

export function getResponsiveLayoutMode(layout: SimLayout, width: number): SimLayout['mode'] {
  return layout.mode === 'horizontal' && layout.stackOnMobile && width < 600 ? 'vertical' : layout.mode
}

export function getResponsiveColumns(layout: SimLayout, width: number): number {
  return Math.max(1, Math.min(12, Math.round(width < 600 ? layout.mobileColumns : width < 1024 ? layout.tabletColumns : layout.columns)))
}

const finite = (value: number, fallback: number) => Number.isFinite(value) ? value : fallback
const nonnegative = (value: number) => Math.max(0, finite(value, 0))
const size = (value: number) => Math.max(1, finite(value, 1))
const offset = (align: SimLayout['align'], remaining: number) => align === 'center' ? remaining / 2 : align === 'end' ? remaining : 0

interface PlacedNode { node: SimNode; children: PlacedNode[] }
interface ChildLayout { children: PlacedNode[]; height: number }

/**
 * Resolves one document for both editing and playback, without modifying intrinsic sizes.
 * Layout groups grow to contain their children. The frame remains a viewport and the
 * returned contentHeight enables scrolling when content is taller than that viewport.
 */
export function resolveSimLayout(screen: SimScreen): { nodes: SimNode[]; contentHeight: number } {
  const width = size(screen.width)
  const childrenByParent = new Map<string | undefined, SimNode[]>()
  const byId = new Map(screen.nodes.map((node) => [node.id, node]))
  for (const node of screen.nodes) {
    const parent = node.parentId && byId.get(node.parentId)?.type === 'container' ? node.parentId : undefined
    const children = childrenByParent.get(parent) ?? []
    children.push(node); childrenByParent.set(parent, children)
  }

  function measure(node: SimNode, allocatedWidth: number, path: ReadonlySet<string>, stretchHeight = 0): PlacedNode {
    const nextWidth = Math.max(.001, finite(allocatedWidth, 1))
    if (node.type !== 'container' || path.has(node.id)) return { node: { ...node, x: 0, y: 0, width: nextWidth, height: size(node.height) }, children: [] }
    const nextPath = new Set(path); nextPath.add(node.id)
    const minimumHeight = Math.max(stretchHeight, getSimLayoutItem(node).height === 'fixed' ? size(node.height) : 0)
    const result = arrange(childrenByParent.get(node.id) ?? [], getSimLayout(node.layout), nextWidth, minimumHeight, nextPath)
    // Keep empty containers usable as drop targets, while populated hug groups fit their contents.
    const height = Math.max(result.height, minimumHeight, result.children.length ? 1 : 64)
    return { node: { ...node, x: 0, y: 0, width: nextWidth, height }, children: result.children }
  }

  function arrange(nodes: SimNode[], layout: SimLayout, availableWidth: number, minimumHeight: number, path: ReadonlySet<string>): ChildLayout {
    const mode = getResponsiveLayoutMode(layout, width)
    const padding = Math.min(nonnegative(layout.padding), Math.max(0, (availableWidth - .001) / 2))
    const innerWidth = Math.max(.001, availableWidth - padding * 2)
    const gap = nonnegative(layout.gap)
    if (!nodes.length) return { children: [], height: Math.max(minimumHeight, padding * 2) }

    if (mode === 'free') {
      const children = nodes.map((node) => {
        // Root free-layout geometry is intentionally unchanged for old documents.
        const x = Math.min(nonnegative(node.x), Math.max(0, innerWidth - .001))
        const nodeWidth = Math.min(size(node.width), Math.max(.001, innerWidth - x))
        const placed = measure(node, nodeWidth, path)
        return { ...placed, node: { ...placed.node, x: padding + x, y: padding + nonnegative(node.y) } }
      })
      return { children, height: Math.max(minimumHeight, ...children.map(({ node }) => node.y + node.height + padding)) }
    }

    let children: PlacedNode[]
    let contentHeight: number
    if (mode === 'horizontal') {
      const minimumWidth = Math.min(1, innerWidth / nodes.length)
      const effectiveGap = Math.min(gap, Math.max(0, (innerWidth - minimumWidth * nodes.length) / Math.max(1, nodes.length - 1)))
      const budget = Math.max(.001, innerWidth - effectiveGap * (nodes.length - 1))
      const fixedTotal = nodes.reduce((sum, node) => sum + (getSimLayoutItem(node).width === 'fixed' ? size(node.width) : 0), 0)
      const fillCount = nodes.filter((node) => getSimLayoutItem(node).width === 'fill').length
      const fixedScale = fixedTotal > budget - fillCount * minimumWidth ? Math.max(0, (budget - fillCount * minimumWidth) / fixedTotal) : 1
      const fillWidth = Math.max(.001, (budget - fixedTotal * fixedScale) / Math.max(1, fillCount))
      children = nodes.map((node) => measure(node, getSimLayoutItem(node).width === 'fill' ? fillWidth : Math.max(.001, size(node.width) * fixedScale), path))
      const contentWidth = children.reduce((sum, child) => sum + child.node.width, 0) + effectiveGap * (children.length - 1)
      const remainingWidth = Math.max(0, innerWidth - contentWidth)
      const between = layout.justify === 'between' && children.length > 1 ? remainingWidth / (children.length - 1) : 0
      let x = padding + (layout.justify === 'center' ? remainingWidth / 2 : layout.justify === 'end' ? remainingWidth : 0)
      const rowHeight = Math.max(...children.map((child) => child.node.height), Math.max(0, minimumHeight - padding * 2))
      if (layout.align === 'stretch') children = children.map((child, index) => nodes[index].type === 'container' && getSimLayoutItem(nodes[index]).height === 'hug' ? measure(nodes[index], child.node.width, path, rowHeight) : child)
      children = children.map((child) => {
        const placed = { ...child, node: { ...child.node, x, y: padding + offset(layout.align, Math.max(0, rowHeight - child.node.height)) } }
        x += child.node.width + effectiveGap + between
        return placed
      })
      contentHeight = rowHeight + padding * 2
    } else if (mode === 'grid') {
      const columns = Math.min(nodes.length, getResponsiveColumns(layout, width), Math.max(1, Math.floor(innerWidth)))
      const effectiveGap = Math.min(gap, Math.max(0, (innerWidth - columns) / Math.max(1, columns - 1)))
      const cellWidth = Math.max(.001, (innerWidth - effectiveGap * (columns - 1)) / columns)
      children = nodes.map((node) => measure(node, getSimLayoutItem(node).width === 'fill' ? cellWidth : Math.min(size(node.width), cellWidth), path))
      const rowHeights = Array.from({ length: Math.ceil(nodes.length / columns) }, (_, index) => Math.max(...children.slice(index * columns, (index + 1) * columns).map((child) => child.node.height)))
      if (layout.align === 'stretch') children = children.map((child, index) => nodes[index].type === 'container' && getSimLayoutItem(nodes[index]).height === 'hug' ? measure(nodes[index], child.node.width, path, rowHeights[Math.floor(index / columns)]) : child)
      const rowsHeight = rowHeights.reduce((sum, row) => sum + row, 0) + gap * (rowHeights.length - 1)
      const remainingHeight = Math.max(0, minimumHeight - padding * 2 - rowsHeight)
      const between = layout.justify === 'between' && rowHeights.length > 1 ? remainingHeight / (rowHeights.length - 1) : 0
      let y = padding + (layout.justify === 'center' ? remainingHeight / 2 : layout.justify === 'end' ? remainingHeight : 0)
      children = children.map((child, index) => {
        const column = index % columns
        const row = Math.floor(index / columns)
        if (index > 0 && column === 0) y += rowHeights[row - 1] + gap + between
        return { ...child, node: { ...child.node, x: padding + column * (cellWidth + effectiveGap) + offset(layout.align, Math.max(0, cellWidth - child.node.width)), y } }
      })
      contentHeight = Math.max(minimumHeight, rowsHeight + padding * 2)
    } else {
      children = nodes.map((node) => measure(node, getSimLayoutItem(node).width === 'fill' ? innerWidth : Math.min(size(node.width), innerWidth), path))
      const nodesHeight = children.reduce((sum, child) => sum + child.node.height, 0) + gap * (children.length - 1)
      const remainingHeight = Math.max(0, minimumHeight - padding * 2 - nodesHeight)
      const between = layout.justify === 'between' && children.length > 1 ? remainingHeight / (children.length - 1) : 0
      let y = padding + (layout.justify === 'center' ? remainingHeight / 2 : layout.justify === 'end' ? remainingHeight : 0)
      children = children.map((child) => {
        const placed = { ...child, node: { ...child.node, x: padding + offset(layout.align, Math.max(0, innerWidth - child.node.width)), y } }
        y += child.node.height + gap + between
        return placed
      })
      contentHeight = Math.max(minimumHeight, nodesHeight + padding * 2)
    }
    return { children, height: contentHeight }
  }

  // Free root documents historically have no padding; an explicit free layout may set it.
  const rootLayout = screen.layout ? getSimLayout(screen.layout) : { ...getSimLayout(), padding: 0 }
  const root = arrange(childrenByParent.get(undefined) ?? [], rootLayout, width, screen.height, new Set())
  const resolved: SimNode[] = []
  const visited = new Set<string>()
  function flatten(children: PlacedNode[], parentX: number, parentY: number) {
    for (const child of children) {
      if (visited.has(child.node.id)) continue
      visited.add(child.node.id)
      const node = { ...child.node, x: child.node.x + parentX, y: child.node.y + parentY }
      resolved.push(node)
      flatten(child.children, node.x, node.y)
    }
  }
  flatten(root.children, 0, 0)
  return { nodes: resolved, contentHeight: Math.max(screen.height, root.height, ...resolved.map((node) => node.y + node.height)) }
}
