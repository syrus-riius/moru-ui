import { normalizeNode } from './simulator-model'
import { getSimLayout } from './simulator-layout'
import type { SimNodeType, SimScreen } from './simulator-types'

export type SimFrameResizeMode = 'adapt' | 'keep'

const fixedWidthTypes = new Set<SimNodeType>(['avatar', 'badge'])

/** Fits horizontal geometry without inferring columns, stacking, or text sizes. */
export function resizeSimScreen(screen: SimScreen, dimensions: Pick<SimScreen, 'width' | 'height'>, mode: SimFrameResizeMode): SimScreen {
  if (screen.width === dimensions.width && screen.height === dimensions.height) return screen

  const next = { ...screen, width: dimensions.width, height: dimensions.height }
  next.nodes = screen.nodes.map((node) => {
    if (node.parentId || getSimLayout(screen.layout).mode !== 'free') return normalizeNode(node, next)
    if (mode === 'keep' || screen.width === next.width) return normalizeNode(node, next)

    if (node.width >= screen.width * .5 && !fixedWidthTypes.has(node.type)) {
      const left = Math.max(0, node.x)
      const right = Math.max(0, screen.width - node.x - node.width)
      return normalizeNode({ ...node, x: left, width: Math.max(32, next.width - left - right) }, next)
    }

    const availableWidth = Math.max(0, screen.width - node.width)
    const alignment = availableWidth > 0 ? Math.min(1, Math.max(0, node.x / availableWidth)) : 0
    const x = alignment * Math.max(0, next.width - node.width)
    return normalizeNode({ ...node, x }, next)
  })
  return next
}
