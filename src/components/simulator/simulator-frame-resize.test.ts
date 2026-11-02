import { describe, expect, it } from 'vitest'
import { FRAME_PRESETS, createBlankScreen, createSimNode, createStarterProject } from './simulator-model'
import { resizeSimScreen } from './simulator-frame-resize'
import type { SimNode, SimScreen } from './simulator-types'

function withNodes(nodes: SimNode[], width = 390, height = 844): SimScreen {
  return { ...createBlankScreen('frame'), width, height, nodes }
}

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}

describe('frame resize geometry', () => {
  it('accepts a complete preset without replacing the screen identity with the preset ID', () => {
    const screen = createBlankScreen('my-screen', '내 화면')
    const resized = resizeSimScreen(screen, FRAME_PRESETS[1], 'adapt')
    expect(resized).toMatchObject({ id: 'my-screen', name: '내 화면', width: 768, height: 1024 })
    expect(Object.keys(resized)).toEqual(Object.keys(screen))
  })
  it('keeps the same document when the dimensions do not change', () => {
    const screen = createStarterProject().screens[0]
    expect(resizeSimScreen(screen, { width: 390, height: 844 }, 'adapt')).toBe(screen)
    expect(resizeSimScreen(screen, { width: 390, height: 844 }, 'keep')).toBe(screen)
  })

  it('stretches a wide input while preserving side margins, height and vertical position', () => {
    const node = { ...createSimNode('input', 'email', 24, 256), width: 342, height: 96 }
    const changed = resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'adapt')
    expect(changed.nodes[0]).toMatchObject({ x: 24, y: 256, width: 720, height: 96 })
    expect(changed.width - changed.nodes[0].x - changed.nodes[0].width).toBe(24)
    expect(changed.nodes[0].props).toBe(node.props)
  })

  it('preserves asymmetric margins on a wide content region', () => {
    const node = { ...createSimNode('card', 'card', 40, 100), width: 280 }
    expect(resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'adapt').nodes[0])
      .toMatchObject({ x: 40, width: 658, y: 100, height: node.height })
  })

  it('roundtrips a typical login from mobile to tablet and back without drift', () => {
    const source = createStarterProject().screens[0]
    const tablet = resizeSimScreen(source, { width: 768, height: 1024 }, 'adapt')
    const mobile = resizeSimScreen(tablet, { width: 390, height: 844 }, 'adapt')
    expect(mobile).toEqual(source)
  })

  it('preserves left, center and right alignment of fixed size elements', () => {
    const nodes = [0, 151, 302].map((x, index) => ({ ...createSimNode('badge', `badge-${index}`, x, 24), width: 88 }))
    const changed = resizeSimScreen(withNodes(nodes), { width: 768, height: 1024 }, 'adapt')
    expect(changed.nodes.map(({ x, width }) => ({ x, width }))).toEqual([
      { x: 0, width: 88 }, { x: 340, width: 88 }, { x: 680, width: 88 },
    ])
  })

  it.each(['avatar', 'badge'] as const)('does not stretch a wide %s', (type) => {
    const node = { ...createSimNode(type, 'fixed', 24, 24), width: 342 }
    expect(resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'adapt').nodes[0])
      .toMatchObject({ width: 342, x: 213 })
  })

  it.each(['checkbox', 'switch'] as const)('keeps a wide %s label aligned with other fields', (type) => {
    const node = { ...createSimNode(type, 'field', 24, 24), width: 342 }
    expect(resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'adapt').nodes[0])
      .toMatchObject({ width: 720, x: 24, height: node.height })
  })

  it('retains narrow component width and relative horizontal alignment', () => {
    const node = { ...createSimNode('button', 'button', 60, 100), width: 150 }
    expect(resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'adapt').nodes[0])
      .toMatchObject({ x: 155, width: 150, y: 100, height: 44 })
  })

  it('clamps very narrow and short frames instead of producing out of bounds nodes', () => {
    const wide = { ...createSimNode('input', 'wide', 100, 800), width: 220 }
    const fixed = { ...createSimNode('badge', 'fixed', 24, 600), width: 342, height: 40 }
    const changed = resizeSimScreen(withNodes([wide, fixed]), { width: 120, height: 240 }, 'adapt')
    expect(changed.nodes[0]).toMatchObject({ x: 88, y: 144, width: 32, height: 96 })
    expect(changed.nodes[1]).toMatchObject({ x: 0, y: 200, width: 120, height: 40 })
    for (const node of changed.nodes) {
      expect(node.x).toBeGreaterThanOrEqual(0)
      expect(node.y).toBeGreaterThanOrEqual(0)
      expect(node.x + node.width).toBeLessThanOrEqual(changed.width)
      expect(node.y + node.height).toBeLessThanOrEqual(changed.height)
    }
  })

  it('keeps current positions and sizes when requested, with only boundary correction', () => {
    const node = { ...createSimNode('input', 'input', 24, 256), width: 342 }
    const expanded = resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'keep')
    expect(expanded.nodes[0]).toEqual(node)
    const shrunk = resizeSimScreen(withNodes([node]), { width: 240, height: 320 }, 'keep')
    expect(shrunk.nodes[0]).toMatchObject({ x: 0, y: 224, width: 240, height: 96 })
  })

  it('does not move horizontal geometry when only frame height changes', () => {
    const node = { ...createSimNode('card', 'card', 24, 100), width: 342 }
    expect(resizeSimScreen(withNodes([node]), { width: 390, height: 1200 }, 'adapt').nodes[0]).toEqual(node)
  })

  it('does not mutate its source or change links and content', () => {
    const source = freeze(createStarterProject().screens[0])
    const original = JSON.stringify(source)
    const changed = resizeSimScreen(source, { width: 768, height: 1024 }, 'adapt')
    expect(JSON.stringify(source)).toBe(original)
    expect(changed).not.toBe(source)
    expect(changed.nodes).not.toBe(source.nodes)
    changed.nodes.forEach((node, index) => {
      expect(node.id).toBe(source.nodes[index].id)
      expect(node.action).toEqual(source.nodes[index].action)
      expect(node.props).toEqual(source.nodes[index].props)
    })
  })

  it('clears any design password through the normal geometry safety rules', () => {
    const node = createSimNode('input', 'password')
    node.props.inputType = 'password'
    node.props.value = 'temporary-value'
    const changed = resizeSimScreen(withNodes([node]), { width: 768, height: 1024 }, 'adapt')
    expect(changed.nodes[0].props.value).toBe('')
    expect(node.props.value).toBe('temporary-value')
  })
})
