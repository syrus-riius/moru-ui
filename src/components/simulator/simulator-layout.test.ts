import { describe, expect, it } from 'vitest'
import { createBlankScreen, createSimNode, duplicateScreen, parseSimProject, serializeSimProject } from './simulator-model'
import { DEFAULT_SIM_LAYOUT, getDescendantIds, getSimLayout, isSimNodeManaged, resolveSimLayout } from './simulator-layout'
import { resizeSimScreen } from './simulator-frame-resize'
import { createNodeClipboard, getSelectedNodes, moveSelectedNodes, parseNodeClipboard, pasteNodeClipboard, serializeNodeClipboard } from './simulator-selection'
import type { SimLayout, SimNode, SimProject, SimScreen } from './simulator-types'

const layout = (patch: Partial<SimLayout> = {}): SimLayout => ({ ...DEFAULT_SIM_LAYOUT, ...patch })
const card = (id: string, parentId?: string): SimNode => ({ ...createSimNode('card', id, 0, 0), height: 100, ...(parentId ? { parentId } : {}) })
const project = (screen: SimScreen): SimProject => ({ schemaVersion: 1, name: '레이아웃', startScreenId: screen.id, style: 'moru', screens: [screen] })
function screen(nodes: SimNode[], options: Partial<SimScreen> = {}): SimScreen { return { ...createBlankScreen('layout'), nodes, ...options } }
function freeze<T>(value: T): T { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) } return value }

describe('responsive layout resolution', () => {
  it('keeps legacy positions and dimensions when there is no layout', () => {
    const source = screen([{ ...card('a'), x: 24, y: 100 }, { ...card('b'), x: 24, y: 250 }])
    expect(getSimLayout().mode).toBe('free')
    expect(resolveSimLayout(source)).toEqual({ nodes: source.nodes, contentHeight: 844 })
  })

  it('stacks children using padding, gap and full width without changing the document', () => {
    const source = freeze(screen([card('a'), card('b')], { layout: layout({ padding: 24, gap: 12 }) }))
    const result = resolveSimLayout(source)
    expect(result.nodes.map(({ x, y, width, height }) => ({ x, y, width, height }))).toEqual([
      { x: 24, y: 24, width: 342, height: 100 }, { x: 24, y: 136, width: 342, height: 100 },
    ])
    expect(source.nodes[0].width).toBe(320)
    expect(source.nodes[1].y).toBe(0)
  })

  it.each([[390, 1, 358], [768, 2, 360], [1280, 3, 405.3333333333333]])('uses the configured grid columns at %ipx', (width, columns, expectedWidth) => {
    const source = screen(Array.from({ length: 6 }, (_, index) => card(`card-${index}`)), { width, layout: layout({ mode: 'grid' }) })
    const result = resolveSimLayout(source)
    expect(result.nodes.filter((node) => node.y === 16)).toHaveLength(columns)
    expect(result.nodes[0].width).toBeCloseTo(expectedWidth)
    expect(result.nodes[columns].y).toBe(132)
    expect(result.nodes.every((node) => node.x >= 0 && node.x + node.width <= width + .001)).toBe(true)
  })

  it('switches horizontal groups to vertical on mobile and honors the setting to keep a row', () => {
    const source = screen([card('a'), card('b')], { layout: layout({ mode: 'horizontal' }) })
    expect(resolveSimLayout(source).nodes.map((node) => node.y)).toEqual([16, 132])
    const row = resolveSimLayout({ ...source, layout: layout({ mode: 'horizontal', stackOnMobile: false }) }).nodes
    expect(row[1].y).toBe(row[0].y)
    expect(row[0].width).toBe(171)
    expect(row[1].x).toBe(203)
  })

  it('keeps fixed controls at their natural width and shares the remaining row width', () => {
    const badge = createSimNode('badge', 'badge', 0, 0)
    const row = resolveSimLayout(screen([badge, card('a')], { width: 768, layout: layout({ mode: 'horizontal' }) })).nodes
    expect(row[0].width).toBe(88)
    expect(row[1].width).toBe(632)
    expect(row[1].x).toBe(120)
  })

  it('aligns fixed width children and distributes spare vertical space', () => {
    const source = screen([{ ...card('a'), width: 100, layoutItem: { width: 'fixed', height: 'fixed' } }, { ...card('b'), width: 100, layoutItem: { width: 'fixed', height: 'fixed' } }], { layout: layout({ align: 'center', justify: 'between', padding: 20 }) })
    const result = resolveSimLayout(source)
    expect(result.nodes.map(({ x, y }) => ({ x, y }))).toEqual([{ x: 145, y: 20 }, { x: 145, y: 724 }])
  })

  it('fits a nested container to its children and resolves parent before descendants', () => {
    const group = { ...createSimNode('container', 'group', 0, 0), layout: layout({ padding: 12, gap: 8 }) }
    const source = screen([card('child-2', 'group'), group, card('child-1', 'group'), card('after')], { layout: layout({ padding: 24, gap: 20 }) })
    const result = resolveSimLayout(source)
    expect(result.nodes.map((node) => node.id)).toEqual(['group', 'child-2', 'child-1', 'after'])
    expect(result.nodes.find((node) => node.id === 'group')).toMatchObject({ x: 24, y: 24, width: 342, height: 232 })
    expect(result.nodes.find((node) => node.id === 'child-2')).toMatchObject({ x: 36, y: 36, width: 318, height: 100 })
    expect(result.nodes.find((node) => node.id === 'after')?.y).toBe(276)
  })

  it('reports scrollable content height instead of compressing or overlapping tall layouts', () => {
    const source = screen(Array.from({ length: 10 }, (_, index) => card(`card-${index}`)), { height: 500, layout: layout() })
    const result = resolveSimLayout(source)
    expect(result.contentHeight).toBe(1176)
    expect(result.nodes[9].y).toBe(1060)
    expect(result.nodes.every((node, index) => !index || node.y >= result.nodes[index - 1].y + result.nodes[index - 1].height)).toBe(true)
  })

  it('stretches hug containers to equal row heights and keeps fixed controls at their chosen height', () => {
    const left = { ...createSimNode('container', 'left', 0, 0), layout: layout({ padding: 12, justify: 'end' }) }
    const right = { ...createSimNode('container', 'right', 0, 0), layout: layout({ padding: 12 }) }
    const source = screen([left, card('small', 'left'), right, { ...card('large', 'right'), height: 180 }, { ...card('fixed'), height: 50 }], { width: 1280, height: 240, layout: layout({ mode: 'horizontal', align: 'stretch' }) })
    const result = resolveSimLayout(source).nodes
    expect(result.find((node) => node.id === 'left')?.height).toBe(208)
    expect(result.find((node) => node.id === 'right')?.height).toBe(208)
    expect(result.find((node) => node.id === 'fixed')?.height).toBe(50)
    expect(result.find((node) => node.id === 'small')?.y).toBe(112)
  })

  it('keeps even a crowded horizontal group inside a very narrow padded parent', () => {
    const source = screen(Array.from({ length: 100 }, (_, index) => card(`card-${index}`)), { width: 160, layout: layout({ mode: 'horizontal', padding: 128, stackOnMobile: false }) })
    const result = resolveSimLayout(source)
    expect(result.nodes.every((node) => Number.isFinite(node.width) && node.width > 0 && node.x + node.width <= 160 + .001)).toBe(true)
  })

  it('preserves intrinsic geometry across a complete frame roundtrip', () => {
    const source = freeze(screen([card('a'), card('b')], { layout: layout({ mode: 'grid' }) }))
    const desktop = resizeSimScreen(source, { width: 1280, height: 800 }, 'adapt')
    const restored = resizeSimScreen(desktop, { width: 390, height: 844 }, 'adapt')
    expect(restored).toEqual(source)
    expect(resolveSimLayout(desktop).nodes[1].x).toBeGreaterThan(resolveSimLayout(desktop).nodes[0].x)
    expect(resolveSimLayout(restored).nodes[1].y).toBeGreaterThan(resolveSimLayout(restored).nodes[0].y)
  })

  it('treats children as managed only when their direct layout owner uses an automatic mode', () => {
    const group = createSimNode('container', 'group', 0, 0)
    const source = screen([group, card('child', 'group'), card('free')])
    expect(isSimNodeManaged(source, source.nodes[0])).toBe(false)
    expect(isSimNodeManaged(source, source.nodes[1])).toBe(true)
    expect(isSimNodeManaged(source, source.nodes[2])).toBe(false)
    expect(moveSelectedNodes(source, ['child'], 10, 10)).toBe(source)
  })
})

describe('layout documents are portable and strictly validated', () => {
  const grouped = () => screen([createSimNode('container', 'group', 0, 0), card('child', 'group')], { layout: layout() })
  it('roundtrips layout settings, parents and sizing alongside legacy schema version 1', () => {
    const source = project(grouped())
    expect(parseSimProject(serializeSimProject(source))).toEqual(source)
  })

  it('accepts managed intrinsic sizes larger than the current frame without shrinking them', () => {
    const source = project(screen([{ ...card('wide'), width: 1200, height: 1500 }], { layout: layout() }))
    expect(parseSimProject(serializeSimProject(source)).screens[0].nodes[0]).toMatchObject({ width: 1200, height: 1500 })
  })

  it('roundtrips explicit free-layout scroll content while retaining horizontal frame bounds', () => {
    const source = project(screen([{ ...card('below'), x: 20, y: 10_000, width: 350, height: 1000 }], { layout: layout({ mode: 'free', padding: 0 }) }))
    expect(parseSimProject(serializeSimProject(source))).toEqual(source)
    expect(resolveSimLayout(source.screens[0]).contentHeight).toBe(11_000)
    source.screens[0].nodes[0].x = 100
    expect(() => parseSimProject(JSON.stringify(source))).toThrow(/화면 밖/)
  })

  it.each(['missing', 'child', 'group'])('rejects an invalid parent reference %s', (parentId) => {
    const source = grouped(); source.nodes[0].parentId = parentId
    expect(() => parseSimProject(JSON.stringify(project(source)))).toThrow(/컨테이너/)
  })

  it('rejects indirect cycles, leaf layouts, unexpected fields and invalid layout values', () => {
    const source = grouped(); source.nodes.push({ ...createSimNode('container', 'nested', 0, 0), parentId: 'group' }); source.nodes[0].parentId = 'nested'
    expect(() => parseSimProject(JSON.stringify(project(source)))).toThrow(/컨테이너/)
    const leaf = grouped(); leaf.nodes[1].layout = layout()
    expect(() => parseSimProject(JSON.stringify(project(leaf)))).toThrow(/컨테이너/)
    for (const patch of [{ gap: -1 }, { padding: 129 }, { columns: 1.5 }, { mobileColumns: 0 }, { mode: 'script' }, { css: 'arbitrary' }]) {
      const invalid = grouped(); Object.assign(invalid.layout!, patch)
      expect(() => parseSimProject(JSON.stringify(project(invalid)))).toThrow()
    }
  })

  it('duplicates the complete hierarchy with fresh parent references and independent settings', () => {
    const original = freeze(project(grouped()))
    const duplicate = duplicateScreen(original, original.startScreenId, 'copy').screens[1]
    expect(duplicate.nodes[1].parentId).toBe(duplicate.nodes[0].id)
    expect(duplicate.nodes[0].layout).not.toBe(original.screens[0].nodes[0].layout)
    expect(duplicate.layout).not.toBe(original.screens[0].layout)
    expect(parseSimProject(serializeSimProject({ ...original, screens: [...original.screens, duplicate] })).screens[1]).toEqual(duplicate)
  })
})

describe('selection and clipboard preserve groups', () => {
  const grouped = () => screen([createSimNode('container', 'group', 24, 24), card('child', 'group'), { ...createSimNode('container', 'nested', 0, 0), parentId: 'group' }, card('nested-child', 'nested'), card('other')])
  it('keeps inspector selection explicit while tree operations include every descendant', () => {
    const source = grouped()
    expect(getSelectedNodes(source, ['group']).map((node) => node.id)).toEqual(['group'])
    expect(getDescendantIds(source, ['group'])).toEqual(['group', 'child', 'nested', 'nested-child'])
  })

  it('roundtrips copied containers, remaps all parents and selects only copied roots', () => {
    const payload = createNodeClipboard(grouped(), ['group'])!
    expect(payload.nodes).toHaveLength(4)
    expect(parseNodeClipboard(serializeNodeClipboard(payload))).toEqual(payload)
    let id = 0
    const pasted = pasteNodeClipboard(createBlankScreen('destination'), payload, () => `copy-${++id}`)
    expect(pasted.ids).toEqual(['copy-1'])
    expect(pasted.screen.nodes[1].parentId).toBe('copy-1')
    expect(pasted.screen.nodes[2].parentId).toBe('copy-1')
    expect(pasted.screen.nodes[3].parentId).toBe('copy-3')
    expect(parseSimProject(serializeSimProject(project(pasted.screen)))).toEqual(project(pasted.screen))
  })

  it('detaches a child copied without its parent and uses its visible absolute position', () => {
    const source = grouped()
    const payload = createNodeClipboard(source, ['child'])!
    expect(payload.nodes[0].parentId).toBeUndefined()
    expect(payload.nodes[0]).toMatchObject({ x: 40, y: 40, width: 288 })
    expect(parseNodeClipboard(serializeNodeClipboard(payload))).toEqual(payload)
  })

  it('moves a free container once when both it and a descendant are explicitly selected', () => {
    const source = grouped()
    const moved = moveSelectedNodes(source, ['group', 'child'], 10, 10)
    expect(moved.nodes[0]).toMatchObject({ x: 34, y: 34 })
    expect(moved.nodes[1]).toBe(source.nodes[1])
  })
})
