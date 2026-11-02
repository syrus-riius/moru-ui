import { describe, expect, it, vi } from 'vitest'
import { createBlankScreen, createSimNode, createStarterProject } from './simulator-model'
import {
  SIM_CLIPBOARD_KIND, SIM_CLIPBOARD_LIMIT, clampSelectionDelta, createNodeClipboard,
  getSelectedNodes, getSelectionBounds, moveSelectedNodes, parseNodeClipboard,
  pasteNodeClipboard, serializeNodeClipboard, type SimNodeClipboard,
} from './simulator-selection'
import type { SimScreen } from './simulator-types'

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child)
    Object.freeze(value)
  }
  return value
}

function sampleScreen(): SimScreen {
  return { ...createBlankScreen('source'), nodes: [
    { ...createSimNode('card', 'first', 40, 100), width: 100, height: 100 },
    { ...createSimNode('card', 'second', 160, 220), width: 100, height: 100 },
    { ...createSimNode('badge', 'third', 10, 400), width: 80, height: 24 },
  ] }
}
function clipboard() { return createNodeClipboard(sampleScreen(), ['first', 'second'])! }
function freshIds(prefix = 'copy') { let count = 0; return () => `${prefix}-${++count}` }
function changedClipboard(change: (payload: SimNodeClipboard) => void) {
  const payload = clipboard()
  change(payload)
  return JSON.stringify(payload)
}

describe('selection geometry keeps the arrangement intact', () => {
  it('returns existing selected nodes in layer order, ignoring duplicates and removed IDs', () => {
    const screen = sampleScreen()
    expect(getSelectedNodes(screen, ['third', 'missing', 'first', 'third']).map((node) => node.id)).toEqual(['first', 'third'])
  })

  it('calculates the union including node dimensions and handles an empty selection', () => {
    expect(getSelectionBounds(sampleScreen().nodes.slice(0, 2))).toEqual({ x: 40, y: 100, width: 220, height: 220 })
    expect(getSelectionBounds([])).toBeNull()
  })

  it('uses one common clamped delta at all four screen edges', () => {
    const screen = sampleScreen()
    const selected = screen.nodes.slice(0, 2)
    expect(clampSelectionDelta(selected, screen, 999, 999)).toEqual({ dx: 130, dy: 524 })
    expect(clampSelectionDelta(selected, screen, -999, -999)).toEqual({ dx: -40, dy: -100 })
    expect(clampSelectionDelta([], screen, 5, 5)).toEqual({ dx: 0, dy: 0 })
  })

  it('ignores non-finite input and rounds pointer movement to whole pixels', () => {
    const screen = sampleScreen()
    expect(clampSelectionDelta(screen.nodes, screen, NaN, Infinity)).toEqual({ dx: 0, dy: 0 })
    expect(clampSelectionDelta(screen.nodes, screen, 4.7, -3.2)).toEqual({ dx: 5, dy: -3 })
  })

  it('moves the selected group once without changing spacing or other node references', () => {
    const screen = freeze(sampleScreen())
    const changed = moveSelectedNodes(screen, ['second', 'first'], 999, 999)
    expect(changed.nodes.slice(0, 2).map(({ x, y }) => ({ x, y }))).toEqual([{ x: 170, y: 624 }, { x: 290, y: 744 }])
    expect(changed.nodes[2]).toBe(screen.nodes[2])
    expect(changed.nodes[0].props).toBe(screen.nodes[0].props)
    expect(changed.nodes[1].x - changed.nodes[0].x).toBe(120)
    expect(screen.nodes[0]).toMatchObject({ x: 40, y: 100 })
  })

  it('does not create a history change for an absent selection or a zero movement', () => {
    const screen = sampleScreen()
    expect(moveSelectedNodes(screen, ['unknown'], 10, 10)).toBe(screen)
    expect(moveSelectedNodes(screen, ['first'], 0, 0)).toBe(screen)
  })
})

describe('portable component clipboard', () => {
  it('copies an independent selection without mutating the design', () => {
    const screen = freeze(sampleScreen())
    const payload = createNodeClipboard(screen, ['second', 'first'])!
    expect(payload).toMatchObject({ kind: SIM_CLIPBOARD_KIND, version: 1, screen: { id: 'source', width: 390, height: 844 } })
    expect(payload.nodes.map((node) => node.id)).toEqual(['first', 'second'])
    expect(payload.nodes[0]).toEqual(screen.nodes[0])
    expect(payload.nodes[0]).not.toBe(screen.nodes[0])
    expect(payload.nodes[0].props.options).not.toBe(screen.nodes[0].props.options)
    expect(payload.nodes[0].action).not.toBe(screen.nodes[0].action)
    expect(createNodeClipboard(screen, ['removed'])).toBeNull()
  })

  it('round-trips all node kinds, props and valid navigation connections as inert data', () => {
    const source = createStarterProject().screens[0]
    const payload = createNodeClipboard(source, source.nodes.map((node) => node.id))!
    expect(parseNodeClipboard(serializeNodeClipboard(payload))).toEqual(payload)
    expect(payload.nodes.find((node) => node.action.type === 'navigate')?.action.targetScreenId).toBe('list')
  })

  it('removes password defaults during copy, serialization and parsing', () => {
    const screen = createBlankScreen('login')
    const password = createSimNode('input', 'password')
    password.props = { ...password.props, inputType: 'password', value: 'do-not-copy-this' }
    screen.nodes = [password]
    const payload = createNodeClipboard(screen, ['password'])!
    expect(payload.nodes[0].props.value).toBe('')
    expect(screen.nodes[0].props.value).toBe('do-not-copy-this')
    payload.nodes[0].props.value = 'do-not-serialize-this'
    expect(serializeNodeClipboard(payload)).not.toContain('do-not-serialize-this')
    expect(parseNodeClipboard(JSON.stringify(payload))!.nodes[0].props.value).toBe('')
  })

  it('validates a source selection with connections to all twenty project screens', () => {
    const screen = { ...createBlankScreen('screen-0', '원본', 'desktop'), nodes: Array.from({ length: 20 }, (_, index) => ({ ...createSimNode('button', `node-${index}`, index * 40, 24), width: 32, action: { type: 'navigate' as const, targetScreenId: `screen-${index}`, message: '', validate: false } })) }
    const payload = createNodeClipboard(screen, screen.nodes.map((node) => node.id))!
    expect(parseNodeClipboard(serializeNodeClipboard(payload))).toEqual(payload)
  })

  it.each(['ordinary text', '<script>alert(1)</script>', '{}', '[]', '{', 'null', '42'])( 'ignores unrelated clipboard content: %s', (text) => {
    expect(parseNodeClipboard(text)).toBeNull()
  })

  it('rejects unsupported versions, extra executable metadata, and empty or oversized selections', () => {
    expect(parseNodeClipboard(changedClipboard((p) => { (p as { version: number }).version = 2 }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { Object.assign(p, { onPaste: 'runCode()' }) }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { p.nodes = [] }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { p.nodes = Array.from({ length: 101 }, (_, index) => ({ ...p.nodes[0], id: `node-${index}` })) }))).toBeNull()
  })

  it('rejects duplicate identities, unknown component types, and executable actions', () => {
    expect(parseNodeClipboard(changedClipboard((p) => { p.nodes[1].id = p.nodes[0].id }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { p.nodes[0].id = '__proto__' }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { (p.nodes[0] as { type: string }).type = 'html' }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { (p.nodes[0].action as { type: string }).type = 'javascript' }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { Object.assign(p.nodes[0].props, { onclick: 'runCode()' }) }))).toBeNull()
  })

  it('rejects invalid geometry and incompatible source metadata', () => {
    expect(parseNodeClipboard(changedClipboard((p) => { p.nodes[0].x = -1 }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { p.nodes[0].width = 500 }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { p.screen.width = 100_000 }))).toBeNull()
    expect(parseNodeClipboard(changedClipboard((p) => { p.screen.id = 'first' }))).toBeNull()
  })

  it('enforces the clipboard size limit using UTF-8 bytes', () => {
    expect(parseNodeClipboard(' '.repeat(SIM_CLIPBOARD_LIMIT + 1))).toBeNull()
    const payload = clipboard()
    payload.nodes[0].props.text = '가'.repeat(334_000)
    const text = JSON.stringify(payload)
    expect(text.length).toBeLessThan(SIM_CLIPBOARD_LIMIT)
    expect(new TextEncoder().encode(text).byteLength).toBeGreaterThan(SIM_CLIPBOARD_LIMIT)
    expect(parseNodeClipboard(text)).toBeNull()
    expect(() => serializeNodeClipboard(payload)).toThrow(/1MB/)
  })
})

describe('group duplication and paste', () => {
  it('uses fresh IDs and one repeated-paste offset while preserving relative placement and layer order', () => {
    const payload = freeze(clipboard())
    const screen = freeze(createBlankScreen('destination'))
    const first = pasteNodeClipboard(screen, payload, freshIds())
    expect(first.ids).toEqual(['copy-1', 'copy-2'])
    expect(first.screen.nodes.map(({ id, x, y, width, height }) => ({ id, x, y, width, height }))).toEqual([
      { id: 'copy-1', x: 56, y: 116, width: 100, height: 100 },
      { id: 'copy-2', x: 176, y: 236, width: 100, height: 100 },
    ])
    const second = pasteNodeClipboard(first.screen, payload, freshIds('again'), { offset: 32 })
    expect(second.screen.nodes.slice(2).map(({ x, y }) => ({ x, y }))).toEqual([{ x: 72, y: 132 }, { x: 192, y: 252 }])
    expect(screen.nodes).toEqual([])
  })

  it('clamps a group against the edge without collapsing the distance between its nodes', () => {
    const pasted = pasteNodeClipboard(createBlankScreen('destination'), clipboard(), freshIds(), { offset: 1000 })
    const [first, second] = pasted.screen.nodes
    expect(first).toMatchObject({ x: 170, y: 624 })
    expect(second).toMatchObject({ x: 290, y: 744 })
    expect(second.x - first.x).toBe(120)
    expect(second.y - first.y).toBe(120)
  })

  it('fits a desktop group into a narrow destination while retaining its proportional arrangement', () => {
    const source = { ...createBlankScreen('desktop', '데스크톱', 'desktop'), nodes: [
      { ...createSimNode('card', 'left', 100, 100), width: 400, height: 200 },
      { ...createSimNode('card', 'right', 800, 300), width: 300, height: 200 },
    ] }
    const pasted = pasteNodeClipboard(createBlankScreen('mobile'), createNodeClipboard(source, ['left', 'right'])!, freshIds())
    expect(pasted.screen.nodes[0]).toMatchObject({ x: 0, y: 116, width: 156, height: 78 })
    expect(pasted.screen.nodes[1]).toMatchObject({ x: 273, y: 194, width: 117, height: 78 })
    expect(pasted.screen.nodes.every((node) => node.x >= 0 && node.y >= 0 && node.x + node.width <= 390 && node.y + node.height <= 844)).toBe(true)
  })

  it('copies nested props and actions so later edits cannot affect the source clipboard', () => {
    const payload = freeze(clipboard())
    const pasted = pasteNodeClipboard(createBlankScreen('destination'), payload, freshIds())
    pasted.screen.nodes[0].props.options.push('새 선택지')
    pasted.screen.nodes[0].action.message = '새 동작'
    expect(payload.nodes[0].props.options).not.toContain('새 선택지')
    expect(payload.nodes[0].action.message).not.toBe('새 동작')
  })

  it('keeps valid navigation connections and disconnects only destinations missing from the current project', () => {
    const payload = clipboard()
    payload.nodes[0].action = { type: 'navigate', targetScreenId: 'valid', validate: true, message: '이동' }
    payload.nodes[1].action = { type: 'navigate', targetScreenId: 'missing', validate: true, message: '보존 문구' }
    const pasted = pasteNodeClipboard(createBlankScreen('destination'), payload, freshIds(), { screenIds: ['destination', 'valid'] })
    expect(pasted.screen.nodes[0].action).toEqual(payload.nodes[0].action)
    expect(pasted.screen.nodes[1].action).toEqual({ type: 'none', targetScreenId: '', validate: false, message: '보존 문구' })
    expect(payload.nodes[1].action.type).toBe('navigate')
  })

  it('rejects an overflowing group atomically before consuming IDs and accepts exactly one hundred nodes', () => {
    const screen = { ...createBlankScreen('full'), nodes: Array.from({ length: 99 }, (_, index) => createSimNode('badge', `existing-${index}`)) }
    const generate = vi.fn(freshIds())
    expect(pasteNodeClipboard(screen, clipboard(), generate)).toEqual({ screen, ids: [], reason: 'limit' })
    expect(generate).not.toHaveBeenCalled()
    const one = { ...clipboard(), nodes: [clipboard().nodes[0]] }
    expect(pasteNodeClipboard(screen, one, generate).screen.nodes).toHaveLength(100)
  })

  it('retries IDs that collide with any screen, node, or another new copy', () => {
    const candidates = ['destination', 'other-screen', 'foreign-node', 'new-1', 'new-1', 'new-2']
    let index = 0
    const pasted = pasteNodeClipboard(createBlankScreen('destination'), clipboard(), () => candidates[index++], { existingIds: ['foreign-node'], screenIds: ['destination', 'other-screen'] })
    expect(pasted.ids).toEqual(['new-1', 'new-2'])
  })

  it('does not append a partial group when an ID generator cannot produce distinct safe IDs', () => {
    const screen = createBlankScreen('destination')
    expect(pasteNodeClipboard(screen, clipboard(), () => 'duplicate')).toEqual({ screen, ids: [], reason: 'ids' })
    expect(pasteNodeClipboard(screen, clipboard(), () => '__proto__')).toEqual({ screen, ids: [], reason: 'ids' })
  })
})
