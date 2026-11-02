import { describe, expect, it } from 'vitest'
import { FRAME_PRESETS, parseSimProject, serializeSimProject } from './simulator-model'
import { resizeSimScreen } from './simulator-frame-resize'
import { resolveSimLayout } from './simulator-layout'
import { createResponsiveExampleProject } from './simulator-responsive-example'
import type { SimScreen } from './simulator-types'

function resolved(screen: SimScreen, presetId: string) {
  const preset = FRAME_PRESETS.find((item) => item.id === presetId)!
  return resolveSimLayout(resizeSimScreen(screen, preset, 'adapt'))
}

describe('responsive mobile example', () => {
  it('is a portable editable document with a connected dashboard and budget screen', () => {
    const project = createResponsiveExampleProject()
    expect(project.style).toBe('moru')
    expect(project.startScreenId).toBe('pocket-home')
    expect(project.screens.map((screen) => screen.id)).toEqual(['pocket-home', 'pocket-budget'])
    expect(parseSimProject(serializeSimProject(project))).toEqual(project)
    expect(project.screens[0].nodes.find((node) => node.id === 'pocket-all-activity')?.action).toMatchObject({ type: 'navigate', targetScreenId: 'pocket-budget' })
    expect(project.screens[1].nodes.some((node) => node.action.type === 'back')).toBe(true)
    expect(project.screens[1].nodes.some((node) => node.type === 'switch')).toBe(true)
    expect(project.screens[1].nodes.some((node) => node.action.type === 'toast')).toBe(true)
  })

  it('uses one, two, and three summary columns at mobile, tablet, and web sizes', () => {
    const screen = createResponsiveExampleProject().screens[0]
    for (const [presetId, columns] of [['mobile', 1], ['tablet', 2], ['desktop', 3]] as const) {
      const { nodes } = resolved(screen, presetId)
      const cards = ['pocket-balance', 'pocket-spend', 'pocket-saving'].map((id) => nodes.find((node) => node.id === id)!)
      expect(new Set(cards.map((node) => node.x)).size).toBe(columns)
      expect(cards[1].y).toBe(columns === 1 ? cards[0].y + cards[0].height + 12 : cards[0].y)
      expect(cards[2].y).toBe(columns === 3 ? cards[0].y : cards[1].y + cards[1].height + 12)
    }
  })

  it('stacks the chart and transactions on mobile and places them beside each other on larger frames', () => {
    const screen = createResponsiveExampleProject().screens[0]
    for (const presetId of ['mobile', 'tablet', 'desktop']) {
      const { nodes } = resolved(screen, presetId)
      const chart = nodes.find((node) => node.id === 'pocket-chart')!
      const activity = nodes.find((node) => node.id === 'pocket-activity')!
      if (presetId === 'mobile') {
        expect(activity.x).toBe(chart.x)
        expect(activity.y).toBeGreaterThanOrEqual(chart.y + chart.height + 16)
      } else {
        expect(activity.y).toBe(chart.y)
        expect(activity.x).toBeGreaterThanOrEqual(chart.x + chart.width + 16)
      }
    }
  })

  it.each(FRAME_PRESETS)('keeps every component inside the scrollable $label layout', (preset) => {
    for (const screen of createResponsiveExampleProject().screens) {
      const { nodes, contentHeight } = resolved(screen, preset.id)
      expect(nodes).toHaveLength(screen.nodes.length)
      for (const node of nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.y).toBeGreaterThanOrEqual(0)
        expect(node.x + node.width).toBeLessThanOrEqual(preset.width + .001)
        expect(node.y + node.height).toBeLessThanOrEqual(contentHeight + .001)
      }
    }
  })

  it('returns to the same mobile arrangement after larger-frame previews', () => {
    const original = createResponsiveExampleProject().screens[0]
    const desktop = resizeSimScreen(original, FRAME_PRESETS[2], 'adapt')
    const tablet = resizeSimScreen(desktop, FRAME_PRESETS[1], 'adapt')
    const mobile = resizeSimScreen(tablet, FRAME_PRESETS[0], 'adapt')
    expect(resolveSimLayout(mobile)).toEqual(resolveSimLayout(original))
  })

  it('creates independent editable nested props and layout settings', () => {
    const first = createResponsiveExampleProject()
    const second = createResponsiveExampleProject()
    first.screens[0].layout!.gap = 99
    first.screens[0].nodes.find((node) => node.id === 'pocket-summary')!.layout!.columns = 9
    first.screens[0].nodes.find((node) => node.id === 'pocket-chart')!.props.options[0] = '변경 | 1'
    expect(second.screens[0].layout!.gap).toBe(24)
    expect(second.screens[0].nodes.find((node) => node.id === 'pocket-summary')!.layout!.columns).toBe(3)
    expect(second.screens[0].nodes.find((node) => node.id === 'pocket-chart')!.props.options[0]).toBe('월 | 18000')
  })
})
