import { describe, expect, it } from 'vitest'
import { createBlankScreen, createSimNode, createStarterProject, duplicateScreen, FRAME_PRESETS, getRequiredFieldErrors, normalizeNode, parseSimProject, patchNode, removeScreen, serializeSimProject, SIM_COMPONENTS } from './simulator-model'
import { nodeTypes, type SimProject } from './simulator-types'

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}
function malformed(mutate: (project: SimProject) => void) {
  const project = createStarterProject()
  mutate(project)
  return JSON.stringify(project)
}

describe('simulator document and component registry', () => {
  it('offers every supported component once with usable frame-compatible dimensions', () => {
    expect(new Set(SIM_COMPONENTS.map((item) => item.type))).toEqual(new Set(nodeTypes))
    expect(SIM_COMPONENTS).toHaveLength(nodeTypes.length)
    for (const item of SIM_COMPONENTS) {
      const node = createSimNode(item.type, `sample-${item.type}`)
      expect(node).toMatchObject({ type: item.type, width: item.width, height: item.height })
      expect(node.x + node.width).toBeLessThanOrEqual(FRAME_PRESETS[0].width)
      expect(node.y + node.height).toBeLessThanOrEqual(FRAME_PRESETS[0].height)
    }
  })

  it('starts with a complete login to list to detail to back flow', () => {
    const project = createStarterProject()
    expect(project.screens.map((screen) => screen.id)).toEqual(['login', 'list', 'detail'])
    expect(project.startScreenId).toBe('login')
    expect(project.style).toBe('wireframe')
    const [login, list, detail] = project.screens
    expect(login.nodes.find((node) => node.type === 'button')?.action).toMatchObject({ type: 'navigate', targetScreenId: 'list', validate: true })
    expect(login.nodes.filter((node) => node.props.required).map((node) => node.props.inputType)).toEqual(['email', 'password'])
    expect(list.nodes.filter((node) => node.type === 'card').every((node) => node.action.targetScreenId === 'detail')).toBe(true)
    expect(detail.nodes.some((node) => node.action.type === 'back')).toBe(true)
    expect(detail.nodes.some((node) => node.action.type === 'toast')).toBe(true)
    expect(detail.nodes.some((node) => node.action.type === 'dialog')).toBe(true)
    expect(parseSimProject(serializeSimProject(project))).toEqual(project)
  })

  it('uses primary text content for all starter typography roles', () => {
    const project = createStarterProject()
    expect(project.screens[0].nodes.find((node) => node.id === 'login-title')?.props.text).toBe('작은 아이디어의 시작')
    expect(project.screens[1].nodes.find((node) => node.id === 'list-title')?.props.text).toBe('우리의 프로젝트')
    expect(project.screens[2].nodes.find((node) => node.id === 'detail-title')?.props.text).toBe('브랜드 가이드')
    expect(project.screens.flatMap((screen) => screen.nodes).filter((node) => node.type === 'text').every((node) => node.props.text.length > 0)).toBe(true)
  })

  it('creates fresh document and component nested references', () => {
    const first = createStarterProject()
    const second = createStarterProject()
    expect(first).toEqual(second)
    first.screens[0].nodes[0].props.options.push('다른 항목')
    first.screens[0].nodes[0].action.message = '다른 동작'
    expect(second.screens[0].nodes[0].props.options).not.toContain('다른 항목')
    expect(second.screens[0].nodes[0].action.message).not.toBe('다른 동작')
    const node = createSimNode('dialog', 'dialog')
    expect(node.action.type).toBe('dialog')
  })

  it.each(FRAME_PRESETS)('creates an independent blank $label screen', (preset) => {
    expect(createBlankScreen('blank', '  나의 화면  ', preset.id)).toEqual({ id: 'blank', name: '나의 화면', width: preset.width, height: preset.height, nodes: [] })
  })

  it('falls back to a named mobile screen for unknown presets and empty names', () => {
    expect(createBlankScreen('blank', ' ', 'missing')).toMatchObject({ name: '새 화면', width: 390, height: 844 })
  })
})

describe('safe geometry and immutable editing', () => {
  it('keeps movement and resize inside the selected frame', () => {
    const source = createSimNode('card', 'card', 800, -100)
    expect(normalizeNode({ ...source, width: 600, height: 1200 }, { width: 390, height: 844 })).toMatchObject({ x: 0, y: 0, width: 390, height: 844 })
    expect(normalizeNode({ ...source, width: 100, height: 100, x: 900, y: 800 }, { width: 390, height: 844 })).toMatchObject({ x: 290, y: 744, width: 100, height: 100 })
  })

  it('recovers finite minimum sizes and coordinates from broken pointer arithmetic', () => {
    expect(normalizeNode({ ...createSimNode('button', 'button'), x: NaN, y: Infinity, width: -1, height: 0 }, { width: 390, height: 844 })).toMatchObject({ x: 0, y: 0, width: 32, height: 16 })
    expect(normalizeNode({ ...createSimNode('separator', 'line'), height: 0 }, { width: 390, height: 844 }).height).toBe(2)
    expect(normalizeNode({ ...createSimNode('button', 'button'), width: NaN, height: Infinity }, { width: 390, height: 844 })).toMatchObject({ width: 160, height: 44 })
  })

  it('rounds fractional coordinates and fits even a very small frame', () => {
    expect(normalizeNode({ ...createSimNode('button', 'button'), x: 8.6, y: 17.2, width: 32.2, height: 20.4 }, { width: 390, height: 844 })).toMatchObject({ x: 9, y: 17, width: 32, height: 20 })
    expect(normalizeNode(createSimNode('button', 'button'), { width: 8, height: 8 })).toMatchObject({ x: 0, y: 0, width: 8, height: 8 })
    expect(normalizeNode({ ...createSimNode('button', 'button'), width: 160.5, height: 160.5 }, { width: 160.5, height: 160.5 })).toMatchObject({ x: 0, y: 0, width: 160, height: 160 })
  })

  it('patches only the selected node and preserves other props and action fields', () => {
    const original = freeze(createStarterProject())
    const changed = patchNode(original, 'login', 'login-continue', { x: 1000, props: { label: '내 작업실로' }, action: { message: '새 메시지' } })
    const updated = changed.screens[0].nodes.find((node) => node.id === 'login-continue')!
    expect(updated).toMatchObject({ x: 48, props: { label: '내 작업실로', variant: 'primary' }, action: { type: 'navigate', targetScreenId: 'list', message: '새 메시지', validate: true } })
    expect(original.screens[0].nodes.find((node) => node.id === 'login-continue')?.props.label).toBe('로그인하고 둘러보기')
    expect(changed.screens[1]).toBe(original.screens[1])
    expect(changed.screens[0].nodes[0]).toBe(original.screens[0].nodes[0])
  })

  it('copies changed option arrays so later callers cannot mutate the saved document', () => {
    const options = ['A', 'B']
    const changed = patchNode(createStarterProject(), 'list', 'list-tabs', { props: { options } })
    options.push('C')
    expect(changed.screens[1].nodes.find((node) => node.id === 'list-tabs')?.props.options).toEqual(['A', 'B'])
  })

  it('does not change a project for an unknown screen or node', () => {
    const project = createStarterProject()
    expect(patchNode(project, 'missing', 'login-title', { x: 24 })).toBe(project)
    expect(patchNode(project, 'login', 'missing', { x: 24 })).toBe(project)
  })

  it('keeps temporary passwords outside normalization, design editing and export', () => {
    const project = createStarterProject()
    const source = project.screens[0].nodes.find((node) => node.id === 'login-password')!
    expect(normalizeNode({ ...source, props: { ...source.props, value: 'secret-input' } }, project.screens[0]).props.value).toBe('')
    expect(patchNode(project, 'login', source.id, { props: { value: 'secret-input' } }).screens[0].nodes.find((node) => node.id === source.id)?.props.value).toBe('')
    source.props.value = 'secret-input'
    expect(serializeSimProject(project)).not.toContain('secret-input')
    expect(source.props.value).toBe('secret-input')
  })
})

describe('screen lifecycle preserves links', () => {
  it('removes a screen, disconnects inbound links and replaces a removed start screen', () => {
    const source = freeze(createStarterProject())
    const changed = removeScreen(source, 'login')
    expect(changed.screens.map((screen) => screen.id)).toEqual(['list', 'detail'])
    expect(changed.startScreenId).toBe('list')
    expect(changed.screens[0].nodes.find((node) => node.id === 'list-back')?.action).toMatchObject({ type: 'none', targetScreenId: '' })
    expect(parseSimProject(serializeSimProject(changed))).toEqual(changed)
    expect(source.screens).toHaveLength(3)
  })

  it('removing a destination leaves the caller usable without a dangling navigation target', () => {
    const changed = removeScreen(createStarterProject(), 'detail')
    expect(changed.screens[1].nodes.filter((node) => node.type === 'card').every((node) => node.action.type === 'none' && node.action.targetScreenId === '')).toBe(true)
    expect(changed.startScreenId).toBe('login')
  })

  it('protects the last remaining screen and ignores missing removals', () => {
    const project = createStarterProject()
    expect(removeScreen(project, 'missing')).toBe(project)
    const one: SimProject = { ...project, startScreenId: 'login', screens: [project.screens[0]] }
    expect(removeScreen(one, 'login')).toBe(one)
  })

  it('duplicates a screen with fresh IDs, independent props, and preserved external links', () => {
    const original = freeze(createStarterProject())
    const changed = duplicateScreen(original, 'login', 'login-copy')
    expect(changed.screens.map((screen) => screen.id)).toEqual(['login', 'login-copy', 'list', 'detail'])
    const copy = changed.screens[1]
    expect(copy.name).toBe('로그인 사본')
    expect(copy.nodes.every((node) => !original.screens[0].nodes.some((source) => source.id === node.id))).toBe(true)
    expect(copy.nodes.find((node) => node.type === 'button')?.action.targetScreenId).toBe('list')
    expect(copy.nodes[0].props.options).not.toBe(original.screens[0].nodes[0].props.options)
    expect(copy.nodes[0].action).not.toBe(original.screens[0].nodes[0].action)
    expect(parseSimProject(serializeSimProject(changed))).toEqual(changed)
  })

  it('remaps a copied screen’s self links to the new screen', () => {
    let project = createStarterProject()
    project = patchNode(project, 'login', 'login-continue', { action: { type: 'navigate', targetScreenId: 'login' } })
    const changed = duplicateScreen(freeze(project), 'login', 'copy')
    expect(changed.screens[1].nodes.find((node) => node.type === 'button')?.action.targetScreenId).toBe('copy')
    expect(changed.screens[0].nodes.find((node) => node.type === 'button')?.action.targetScreenId).toBe('login')
  })

  it('does not duplicate unknown IDs, existing IDs or a twenty-first screen', () => {
    const project = createStarterProject()
    expect(duplicateScreen(project, 'missing', 'copy')).toBe(project)
    expect(duplicateScreen(project, 'login', 'list')).toBe(project)
    const full: SimProject = { ...project, screens: Array.from({ length: 20 }, (_, index) => createBlankScreen(`screen-${index}`)), startScreenId: 'screen-0' }
    expect(duplicateScreen(full, 'screen-0', 'copy')).toBe(full)
  })
})

describe('strict portable project format', () => {
  it('rejects invalid JSON, unsupported schema and a missing start screen', () => {
    expect(() => parseSimProject('{')).toThrow(/JSON/)
    expect(() => parseSimProject(malformed((project) => { (project as { schemaVersion: number }).schemaVersion = 2 }))).toThrow(/버전/)
    expect(() => parseSimProject(malformed((project) => { project.startScreenId = 'missing' }))).toThrow(/시작 화면/)
  })

  it('rejects unexpected document, screen, node, prop and action fields', () => {
    for (const level of ['project', 'screen', 'node', 'props', 'action']) {
      const source = createStarterProject()
      const targets = { project: source, screen: source.screens[0], node: source.screens[0].nodes[0], props: source.screens[0].nodes[0].props, action: source.screens[0].nodes[0].action }
      Object.assign(targets[level as keyof typeof targets], { onClick: 'runArbitraryCode()' })
      expect(() => parseSimProject(JSON.stringify(source))).toThrow()
    }
  })

  it('rejects prototype keys and unsupported executable or HTML node types', () => {
    const text = serializeSimProject(createStarterProject())
    expect(() => parseSimProject(text.replace('"schemaVersion": 1,', '"__proto__": {}, "schemaVersion": 1,'))).toThrow()
    expect(() => parseSimProject(malformed((project) => { (project.screens[0].nodes[0] as { type: string }).type = 'html' }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { (project.screens[0].nodes[0].action as { type: string }).type = 'javascript' }))).toThrow()
  })

  it('rejects duplicate IDs across nodes and screens', () => {
    expect(() => parseSimProject(malformed((project) => { project.screens[1].id = 'login' }))).toThrow(/ID/)
    expect(() => parseSimProject(malformed((project) => { project.screens[1].nodes[0].id = project.screens[0].nodes[0].id }))).toThrow(/ID/)
    expect(() => parseSimProject(malformed((project) => { project.screens[1].nodes[0].id = 'detail' }))).toThrow(/ID/)
  })

  it('rejects malformed identities and missing navigation destinations', () => {
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes[0].id = '__proto__' }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { project.screens[0].id = 'not a valid id' }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes.find((node) => node.type === 'button')!.action.targetScreenId = 'missing' }))).toThrow(/연결 대상/)
  })

  it('round-trips an unfinished navigation connection without inventing a destination', () => {
    const project = patchNode(createStarterProject(), 'login', 'login-continue', { action: { type: 'navigate', targetScreenId: '' } })
    const reopened = parseSimProject(serializeSimProject(project))
    expect(reopened.screens[0].nodes.find((node) => node.id === 'login-continue')?.action).toMatchObject({ type: 'navigate', targetScreenId: '', validate: true })
  })

  it('rejects non-finite, negative and outside-frame geometry', () => {
    for (const value of [NaN, Infinity, -1]) expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes[0].x = value }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes[0].x = 380 }))).toThrow(/화면 밖/)
    expect(() => parseSimProject(malformed((project) => { project.screens[0].width = 100_000 }))).toThrow()
  })

  it('rejects unexpected enum values, wrong primitive types, and missing fields', () => {
    expect(() => parseSimProject(malformed((project) => { (project as { style: string }).style = 'unknown' }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { (project.screens[0].nodes[0].props as unknown as { checked: string }).checked = 'true' }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { delete (project.screens[0].nodes[0].props as Partial<typeof project.screens[0]['nodes'][0]['props']>).label }))).toThrow()
  })

  it('enforces UTF-8 file size rather than JavaScript character count alone', () => {
    expect(() => parseSimProject(' '.repeat(1_000_001))).toThrow(/1MB/)
    expect(() => parseSimProject(`"${'가'.repeat(334_000)}"`)).toThrow(/1MB/)
  })

  it('keeps large exported documents within their import limit when formatting would exceed it', () => {
    const project: SimProject = { schemaVersion: 1, name: '큰 기획', style: 'wireframe', startScreenId: 'screen-0', screens: Array.from({ length: 3 }, (_, index) => ({ ...createBlankScreen(`screen-${index}`), nodes: Array.from({ length: index === 2 ? 50 : 100 }, (_, item) => { const node = createSimNode('text', `node-${index}-${item}`); node.props.text = 'A'.repeat(3000); return node }) })) }
    const exported = serializeSimProject(project)
    expect(new TextEncoder().encode(exported).byteLength).toBeLessThanOrEqual(1_000_000)
    expect(parseSimProject(exported)).toEqual(project)
  })

  it('enforces screen and per-screen element bounds', () => {
    expect(() => parseSimProject(malformed((project) => { project.screens = [] }))).toThrow(/화면/)
    expect(() => parseSimProject(malformed((project) => { project.screens = Array.from({ length: 21 }, (_, index) => createBlankScreen(`screen-${index}`)) }))).toThrow(/20/)
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes = Array.from({ length: 101 }, (_, index) => createSimNode('button', `node-${index}`)) }))).toThrow(/100/)
  })

  it('enforces text and option limits without dropping the previous document', () => {
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes[0].props.options = Array.from({ length: 31 }, () => '항목') }))).toThrow(/30/)
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes[0].props.options = ['A'.repeat(501)] }))).toThrow()
    expect(() => parseSimProject(malformed((project) => { project.screens[0].nodes[0].props.text = 'A'.repeat(4001) }))).toThrow()
  })

  it('accepts literal user text as inert content and removes imported password defaults', () => {
    const parsed = parseSimProject(malformed((project) => {
      project.screens[0].nodes[0].props.text = '<script>alert("inert")</script>'
      project.screens[0].nodes.find((node) => node.id === 'login-password')!.props.value = 'never-retain'
    }))
    expect(parsed.screens[0].nodes[0].props.text).toBe('<script>alert("inert")</script>')
    expect(parsed.screens[0].nodes.find((node) => node.id === 'login-password')?.props.value).toBe('')
  })
})

describe('playback validation uses temporary runtime values', () => {
  it('blocks the starter login until both required fields have usable input', () => {
    const login = createStarterProject().screens[0]
    expect(Object.keys(getRequiredFieldErrors(login, {}))).toEqual(['login-email', 'login-password'])
    expect(getRequiredFieldErrors(login, { 'login-email': 'demo@moru.example', 'login-password': 'demo-password' })).toEqual({})
    expect(login.nodes.find((node) => node.id === 'login-password')?.props.value).toBe('')
  })

  it('rejects whitespace-only values and malformed email', () => {
    const login = createStarterProject().screens[0]
    expect(getRequiredFieldErrors(login, { 'login-email': 'invalid-email', 'login-password': ' ' })).toMatchObject({ 'login-email': '올바른 이메일 주소를 입력해 주세요.', 'login-password': '비밀번호 항목을 입력해 주세요.' })
  })

  it('uses explicit runtime empty values instead of falling back to a filled design default', () => {
    const screen = createBlankScreen('sample')
    const input = createSimNode('input', 'name')
    input.props.required = true
    input.props.value = '기본값'
    screen.nodes = [input]
    expect(getRequiredFieldErrors(screen, {})).toEqual({})
    expect(getRequiredFieldErrors(screen, { name: '' })).toHaveProperty('name')
  })

  it('validates required checkbox and switch booleans separately from text values', () => {
    const screen = createBlankScreen('sample')
    screen.nodes = ['checkbox', 'switch'].map((type) => {
      const node = createSimNode(type as 'checkbox' | 'switch', type)
      node.props.required = true
      return node
    })
    expect(Object.keys(getRequiredFieldErrors(screen, {}))).toEqual(['checkbox', 'switch'])
    expect(getRequiredFieldErrors(screen, { checkbox: true, switch: true })).toEqual({})
    expect(getRequiredFieldErrors(screen, { checkbox: false, switch: true })).toHaveProperty('checkbox')
  })

  it.each(['', '없는 옵션', '2', '-1', '1.5', '01', 'Infinity', '9007199254740993'])('rejects a required select value %j when no visible option has that value', (value) => {
    const screen = createBlankScreen('sample')
    const select = createSimNode('select', 'category')
    select.props = { ...select.props, label: '분류', required: true, options: ['', '기획', ' ', '개발'], value }
    screen.nodes = [select]
    expect(getRequiredFieldErrors(screen, {})).toEqual({ category: '분류 항목을 선택해 주세요.' })
    expect(getRequiredFieldErrors(screen, { category: value })).toEqual({ category: '분류 항목을 선택해 주세요.' })
  })

  it.each(['기획', '개발', '0', '1'])('accepts required select values by matching label or filtered option index: %j', (value) => {
    const screen = createBlankScreen('sample')
    const select = createSimNode('select', 'category')
    select.props = { ...select.props, required: true, options: ['', '기획', ' ', '개발'], value }
    screen.nodes = [select]
    expect(getRequiredFieldErrors(screen, {})).toEqual({})
    expect(getRequiredFieldErrors(screen, { category: value })).toEqual({})
  })

  it('allows numeric-looking labels while rejecting any selection in an empty option list', () => {
    const screen = createBlankScreen('sample')
    const select = createSimNode('select', 'category')
    select.props = { ...select.props, required: true, options: ['01', '99'] }
    screen.nodes = [select]
    expect(getRequiredFieldErrors(screen, { category: '01' })).toEqual({})
    expect(getRequiredFieldErrors(screen, { category: '99' })).toEqual({})
    select.props.options = ['', '  ']
    expect(getRequiredFieldErrors(screen, { category: '0' })).toHaveProperty('category')
  })

  it('skips disabled/loading inputs and non-field content', () => {
    const login = createStarterProject().screens[0]
    login.nodes.forEach((node) => { if (node.props.required) node.props.state = node.props.inputType === 'email' ? 'disabled' : 'loading' })
    login.nodes[0].props.required = true
    expect(getRequiredFieldErrors(login, {})).toEqual({})
  })
})
