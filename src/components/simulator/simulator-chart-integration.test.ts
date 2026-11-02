import { describe, expect, it } from 'vitest'
import { createBlankScreen, createSimNode, createStarterProject, parseSimProject, serializeSimProject } from './simulator-model'
import { createNodeClipboard, parseNodeClipboard, pasteNodeClipboard, serializeNodeClipboard } from './simulator-selection'
import { resizeSimScreen } from './simulator-frame-resize'

describe('simulator chart documents', () => {
  it.each(['bar', 'line', 'area', 'donut'])('roundtrips a %s chart without changing existing screens', (type) => {
    const project = createStarterProject()
    const node = createSimNode('chart', 'analytics-chart')
    node.props.value = type
    node.props.label = '방문 현황'
    node.props.options = ['검색 | 1,200', '직접 | 800', '기타 | 0']
    const chartScreen = { ...createBlankScreen('analytics', '방문 분석'), nodes: [node] }
    const updated = { ...project, screens: [...project.screens, chartScreen] }
    const restored = parseSimProject(serializeSimProject(updated))
    expect(restored.screens.slice(0, 3)).toEqual(project.screens)
    expect(restored.screens[3]).toEqual(chartScreen)
  })

  it('copies chart data and type into an independently editable node', () => {
    const node = createSimNode('chart', 'chart')
    node.props.value = 'donut'
    const source = { ...createBlankScreen('source'), nodes: [node] }
    const payload = parseNodeClipboard(serializeNodeClipboard(createNodeClipboard(source, ['chart'])!))!
    const result = pasteNodeClipboard(createBlankScreen('destination'), payload, () => 'chart-copy')
    expect(result.reason).toBeUndefined()
    expect(result.screen.nodes[0]).toMatchObject({ id: 'chart-copy', type: 'chart', props: { value: 'donut', options: node.props.options } })
    result.screen.nodes[0].props.options[0] = '새 값 | 200'
    expect(node.props.options[0]).toBe('월 | 120')
  })

  it('adapts chart width while preserving its data and height', () => {
    const chart = createSimNode('chart', 'chart')
    const screen = { ...createBlankScreen('analytics'), nodes: [chart] }
    const tablet = resizeSimScreen(screen, { width: 768, height: 1024 }, 'adapt')
    expect(tablet.nodes[0]).toMatchObject({ x: 24, y: 24, width: 698, height: 300, props: chart.props })
    expect(resizeSimScreen(tablet, { width: screen.width, height: screen.height }, 'adapt')).toEqual(screen)
  })
})
