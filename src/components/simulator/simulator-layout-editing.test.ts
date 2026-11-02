import { describe, expect, it } from 'vitest'
import { createBlankScreen, createSimNode, parseSimProject, serializeSimProject } from './simulator-model'
import { DEFAULT_SIM_LAYOUT, resolveSimLayout } from './simulator-layout'
import { getSimDropTarget, moveSimNodeOrder, moveSimNodesOrder, relocateSimNodes, setSimParentLayout, wrapSimNodes } from './simulator-layout-editing'
import type { SimProject, SimScreen } from './simulator-types'
import { createNodeClipboard, parseNodeClipboard, serializeNodeClipboard } from './simulator-selection'

function fixture(): SimScreen {
  return { ...createBlankScreen('screen'), layout: { ...DEFAULT_SIM_LAYOUT, padding: 24 }, nodes: [
    { ...createSimNode('container', 'group'), layout: { ...DEFAULT_SIM_LAYOUT, padding: 12 } },
    { ...createSimNode('button', 'a'), parentId: 'group' },
    { ...createSimNode('button', 'b'), parentId: 'group' },
    createSimNode('card', 'c'),
  ] }
}
function roundTrip(screen: SimScreen) {
  const project: SimProject = { schemaVersion: 1, name: 'Layout', startScreenId: screen.id, style: 'moru', screens: [screen] }
  return parseSimProject(serializeSimProject(project)).screens[0]
}

describe('simulator layout editing', () => {
  it('moves siblings in both directions without losing children', () => {
    const screen = fixture()
    const moved = moveSimNodeOrder(screen, 'a', 1)
    expect(moved.nodes.filter((node) => node.parentId === 'group').map((node) => node.id)).toEqual(['b', 'a'])
    expect(moveSimNodeOrder(moved, 'a', -1).nodes.map((node) => node.id)).toEqual(screen.nodes.map((node) => node.id))
    expect(moveSimNodeOrder(screen, 'a', -1)).toBe(screen)
  })
  it('reparents a node into a container at the requested insertion point', () => {
    const next = relocateSimNodes(fixture(), ['c'], 'group', 'b')
    expect(next.nodes.filter((node) => node.parentId === 'group').map((node) => node.id)).toEqual(['a', 'c', 'b'])
    expect(roundTrip(next).nodes.find((node) => node.id === 'c')?.parentId).toBe('group')
  })
  it('rejects self-parenting and parenting a container into its descendant', () => {
    const screen = fixture()
    const nested = { ...createSimNode('container', 'nested'), parentId: 'group' }
    screen.nodes.push(nested)
    expect(relocateSimNodes(screen, ['group'], 'group')).toBe(screen)
    expect(relocateSimNodes(screen, ['group'], 'nested')).toBe(screen)
    expect(relocateSimNodes(screen, ['group'], 'missing')).toBe(screen)
  })
  it('moves a subtree once even when both it and its child are selected', () => {
    const next = relocateSimNodes(fixture(), ['group', 'a'], undefined, 'c')
    expect(next.nodes).toHaveLength(4)
    expect(next.nodes.find((node) => node.id === 'a')?.parentId).toBe('group')
    expect(new Set(next.nodes.map((node) => node.id)).size).toBe(4)
  })
  it('wraps siblings in a nested stack and preserves a valid document', () => {
    const next = wrapSimNodes(fixture(), ['a', 'b'], 'stack', 'horizontal')
    expect(next.nodes.find((node) => node.id === 'stack')?.parentId).toBe('group')
    expect(next.nodes.filter((node) => node.parentId === 'stack').map((node) => node.id)).toEqual(['a', 'b'])
    expect(next.nodes.find((node) => node.id === 'stack')?.layout?.mode).toBe('horizontal')
    expect(roundTrip(next).nodes).toHaveLength(5)
  })
  it('detaches a child to the root without retaining an undefined parent key after serialization', () => {
    const next = relocateSimNodes(fixture(), ['a'])
    expect(Object.hasOwn(next.nodes.find((node) => node.id === 'a')!, 'parentId')).toBe(false)
    expect(roundTrip(next).nodes.find((node) => node.id === 'a')?.parentId).toBeUndefined()
  })
  it('switches a container to free layout at its current visible child positions', () => {
    const screen = fixture()
    const previous = resolveSimLayout(screen)
    const next = setSimParentLayout(screen, { ...DEFAULT_SIM_LAYOUT, mode: 'free', padding: 12 }, 'group')
    const current = resolveSimLayout(next)
    for (const id of ['a', 'b']) {
      const before = previous.nodes.find((node) => node.id === id)!
      const after = current.nodes.find((node) => node.id === id)!
      expect(after.x).toBeCloseTo(before.x)
      expect(after.y).toBeCloseTo(before.y)
    }
  })
  it('finds the deepest container and excludes dragged subtrees', () => {
    const screen = fixture()
    const group = resolveSimLayout(screen).nodes.find((node) => node.id === 'group')!
    expect(getSimDropTarget(screen, group.x + 2, group.y + 2).parentId).toBe('group')
    expect(getSimDropTarget(screen, group.x + 2, group.y + 2, ['group']).parentId).toBeUndefined()
    expect(getSimDropTarget(screen, group.x + 2, group.y + 2).beforeId).toBe('a')
  })
  it('moves multiple selected siblings as a stable ordered group', () => {
    const screen = fixture()
    screen.nodes.push({ ...createSimNode('button', 'd'), parentId: 'group' })
    const next = moveSimNodesOrder(screen, ['a', 'b'], 1)
    expect(next.nodes.filter((node) => node.parentId === 'group').map((node) => node.id)).toEqual(['d', 'a', 'b'])
    const back = moveSimNodesOrder(next, ['a', 'b'], -1)
    expect(back.nodes.filter((node) => node.parentId === 'group').map((node) => node.id)).toEqual(['a', 'b', 'd'])
  })
  it('does not independently reorder descendants of a selected group', () => {
    const screen = fixture()
    const next = moveSimNodesOrder(screen, ['group', 'a', 'b'], 1)
    expect(next.nodes.filter((node) => node.parentId === 'group').map((node) => node.id)).toEqual(['a', 'b'])
    expect(next.nodes.filter((node) => !node.parentId).map((node) => node.id)).toEqual(['c', 'group'])
  })
  it('retains visible sizes when moving an automatically sized child to a padded free parent', () => {
    const screen = fixture()
    screen.layout = { ...DEFAULT_SIM_LAYOUT, mode: 'free', padding: 8 }
    screen.nodes[0].x = 24; screen.nodes[0].y = 24
    const before = resolveSimLayout(screen).nodes.find((node) => node.id === 'b')!
    const next = relocateSimNodes(screen, ['b'])
    const after = resolveSimLayout(next).nodes.find((node) => node.id === 'b')!
    expect(after.x).toBeCloseTo(before.x)
    expect(after.y).toBeCloseTo(before.y)
    expect(after.width).toBeCloseTo(before.width)
  })
  it('can turn a long automatic screen into free placement and save it', () => {
    const screen = fixture()
    screen.nodes.push({ ...createSimNode('chart', 'long'), height: 1600 })
    const next = setSimParentLayout(screen, { ...DEFAULT_SIM_LAYOUT, mode: 'free', padding: 24 })
    expect(roundTrip(next).nodes.map((node) => node.id)).toEqual(screen.nodes.map((node) => node.id))
    expect(resolveSimLayout(next).contentHeight).toBeGreaterThan(screen.height)
  })
  it('uses sibling container edges for ordering and the center for nesting', () => {
    const screen = fixture()
    const second = { ...createSimNode('container', 'second'), parentId: 'group' }
    const first = { ...createSimNode('container', 'first'), parentId: 'group' }
    screen.nodes = [screen.nodes[0], first, second]
    const target = resolveSimLayout(screen).nodes.find((node) => node.id === 'first')!
    expect(getSimDropTarget(screen, target.x + 24, target.y + 2, ['second'])).toEqual({ parentId: 'group', beforeId: 'first' })
    expect(getSimDropTarget(screen, target.x + 24, target.y + target.height / 2, ['second']).parentId).toBe('first')
  })
  it('wraps inside padded free placement without applying its padding twice', () => {
    const screen = fixture()
    screen.layout = { ...DEFAULT_SIM_LAYOUT, mode: 'free', padding: 16 }
    const before = resolveSimLayout(screen).nodes.find((node) => node.id === 'group')!
    const next = wrapSimNodes(screen, ['group'], 'wrapper', 'vertical')
    const wrapper = resolveSimLayout(next).nodes.find((node) => node.id === 'wrapper')!
    expect(wrapper.x).toBeCloseTo(before.x)
    expect(wrapper.y).toBeCloseTo(before.y)
  })
  it('copies a child below the viewport from an automatic container in a legacy free screen', () => {
    const screen = fixture(); delete screen.layout
    screen.nodes.find((node) => node.id === 'a')!.height = 1000
    const payload = createNodeClipboard(screen, ['b'])!
    expect(payload.nodes[0].y).toBeGreaterThan(screen.height)
    expect(payload.screen.layout?.mode).toBe('free')
    expect(parseNodeClipboard(serializeNodeClipboard(payload))?.nodes[0].id).toBe('b')
  })
})
