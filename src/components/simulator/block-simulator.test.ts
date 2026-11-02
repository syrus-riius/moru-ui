import { describe, expect, it } from 'vitest'
import { consumeBlockInsertion, insertSimBlock, requestBlockInsertion, type SimBlockId } from './block-simulator'
import { createStarterProject, getRequiredFieldErrors, parseSimProject, serializeSimProject } from './simulator-model'
import { resolveSimLayout } from './simulator-layout'
import { resizeSimScreen } from './simulator-frame-resize'

const blocks: SimBlockId[] = ['login', 'otp', 'search-filters', 'settings']
function ids() { let sequence = 0; return () => `block-${++sequence}` }

describe('Library blocks in editable simulator documents', () => {
  it.each(blocks)('appends %s without changing existing screens or the starting route', (id) => {
    const original = createStarterProject()
    const before = JSON.stringify(original)
    const result = insertSimBlock(original, id, 'mobile', ids())!
    expect(JSON.stringify(original)).toBe(before)
    expect(result.project.startScreenId).toBe(original.startScreenId)
    expect(result.project.style).toBe(original.style)
    expect(result.project.screens.slice(0, -1)).toEqual(original.screens)
    expect(result.project.screens.at(-1)?.id).toBe(result.screenId)
    expect(result.project.screens.at(-1)?.nodes.length).toBeGreaterThan(4)
    expect(result.project.screens.at(-1)?.nodes.every((node) => node.type !== 'image')).toBe(true)
    expect(parseSimProject(serializeSimProject(result.project))).toEqual(result.project)
  })

  it.each(blocks)('keeps every %s node within mobile/tablet/web widths', (id) => {
    const result = insertSimBlock(createStarterProject(), id, 'web', ids())!
    const screen = result.project.screens.at(-1)!
    for (const width of [320, 390, 768, 1280]) {
      const layout = resolveSimLayout(resizeSimScreen(screen, { width, height: 844 }, 'adapt'))
      expect(layout.contentHeight).toBeGreaterThanOrEqual(844)
      for (const node of layout.nodes) {
        expect(node.x).toBeGreaterThanOrEqual(0)
        expect(node.x + node.width).toBeLessThanOrEqual(width + .001)
      }
    }
  })

  it('generates unique screen and node ids even when the id source repeats', () => {
    const first = insertSimBlock(createStarterProject(), 'otp', 'mobile', () => 'login')!
    const second = insertSimBlock(first.project, 'settings', 'web', () => 'login')!
    const all = second.project.screens.flatMap((screen) => [screen.id, ...screen.nodes.map((node) => node.id)])
    expect(new Set(all).size).toBe(all.length)
    expect(parseSimProject(serializeSimProject(second.project))).toEqual(second.project)
  })

  it('rejects a twenty-first screen without modifying the existing project', () => {
    let project = createStarterProject()
    while (project.screens.length < 20) project = insertSimBlock(project, 'otp', 'mobile', ids())!.project
    const before = JSON.stringify(project)
    expect(insertSimBlock(project, 'otp', 'mobile', ids())).toBeNull()
    expect(JSON.stringify(project)).toBe(before)
  })

  it('transfers only the selected block and device, and consumes the request once', () => {
    consumeBlockInsertion()
    requestBlockInsertion('otp', 'web')
    expect(consumeBlockInsertion()).toEqual({ id: 'otp', device: 'web' })
    expect(consumeBlockInsertion()).toBeNull()
  })

  it('renders a real OTP primitive and validates six numeric digits', () => {
    const screen = insertSimBlock(createStarterProject(), 'otp', 'mobile', ids())!.project.screens.at(-1)!
    const otp = screen.nodes.find((node) => node.type === 'input-otp')!
    expect(otp).toBeDefined()
    expect(getRequiredFieldErrors(screen, {})).toHaveProperty(otp.id)
    expect(getRequiredFieldErrors(screen, { [otp.id]: '123' })).toHaveProperty(otp.id)
    expect(getRequiredFieldErrors(screen, { [otp.id]: '12abcd' })).toHaveProperty(otp.id)
    expect(getRequiredFieldErrors(screen, { [otp.id]: '123456' })).toEqual({})
  })

  it('keeps the settings and search compositions aligned with the library blocks', () => {
    const settings = insertSimBlock(createStarterProject(), 'settings', 'mobile', ids())!.project.screens.at(-1)!
    expect(settings.name).toBe('작업 공간 설정')
    expect(settings.nodes.find((node) => node.props.label === '작업 공간 이름')?.props.value).toBe('Moru Studio')
    expect(settings.nodes.find((node) => node.props.label === '연락 이메일')?.props.value).toBe('hello@moru.example')
    expect(settings.nodes.find((node) => node.props.label === '공개 범위')?.props.options).toEqual(['초대한 팀원만', '워크스페이스 전체', '링크를 가진 누구나'])
    expect(settings.nodes.some((node) => node.props.label === '변경 취소')).toBe(true)
    const search = insertSimBlock(createStarterProject(), 'search-filters', 'mobile', ids())!.project.screens.at(-1)!
    expect(search.nodes.some((node) => node.type === 'checkbox' && node.props.label === '내가 담당한 프로젝트만')).toBe(true)
    expect(search.nodes.filter((node) => node.type === 'badge')).toHaveLength(4)
    expect(search.nodes.filter((node) => node.type === 'button' && node.props.label === '선택')).toHaveLength(4)
    expect(search.nodes.some((node) => node.props.label === '담당 팀')).toBe(false)
  })

  it('never seeds a password into the appended login design', () => {
    const result = insertSimBlock(createStarterProject(), 'login', 'web', ids())!
    const password = result.project.screens.at(-1)!.nodes.find((node) => node.props.inputType === 'password')!
    expect(password.props.value).toBe('')
    expect(serializeSimProject(result.project)).not.toContain('demo-password')
  })
})
