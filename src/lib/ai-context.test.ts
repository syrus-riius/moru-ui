import { afterEach, describe, expect, it, vi } from 'vitest'
import { createNativeThemeExport } from '../theme/native-theme'
import { createDarkTokens, defaultTokens, validateTokens } from '../theme/tokens'
import { applyStylePack } from '../theme/style-packs'
import { registryRelease } from './registry-install'
import {
  aiCatalogPath,
  aiExpoPath,
  buildAiContext,
  canonicalAiItemId,
  loadAiCatalog,
  loadAiDocument,
  parseAiCatalog,
  type AiCatalog,
  type AiCatalogEntry,
  type AiSelectedItem,
} from './ai-context'

afterEach(() => vi.unstubAllGlobals())

function entry(id = 'button', overrides: Partial<AiCatalogEntry> = {}): AiCatalogEntry {
  return {
    id,
    title: id,
    description: `${id} usage`,
    kind: 'component',
    exports: [id],
    docPath: `/ai/v${registryRelease}/components/${id}.md`,
    dependencies: ['core'],
    importPath: `@/components/ui/moru/${id}`,
    ...overrides,
  }
}

function catalog(): AiCatalog {
  return {
    schemaVersion: 1,
    version: registryRelease,
    sourceHash: 'source-fixture',
    entries: [entry('core', { kind: 'foundation', dependencies: [] }), entry()],
  }
}

function selected(id: string, documentation = `# ${id}\nDOC_${id}`): AiSelectedItem {
  return { entry: entry(id), documentation }
}

function snapshot(packet: string) {
  const match = /```json\n([\s\S]*?)\n```/.exec(packet)
  expect(match, 'the copied packet includes one machine-readable theme snapshot').not.toBeNull()
  return JSON.parse(match![1])
}

function customDarkTokens() {
  return validateTokens({
    ...createDarkTokens(defaultTokens),
    primary: '#b8c7ec',
    accent: '#a23858',
    background: '#08090a',
    surface: '#18191a',
    density: 'comfortable',
    densityOverrides: { comfortable: { cardPadding: 39, formGap: 27 } },
    typography: {
      ...defaultTokens.typography,
      body: { size: 17, lineHeight: 1.7, weight: 450, letterSpacing: -0.01 },
    },
    componentSpacing: {
      card: { padding: { top: { value: 0, unit: 'px' }, bottom: { value: 3, unit: 'space' } } },
      textarea: { margin: { top: { value: 0, unit: 'space' } } },
    },
  })
}

describe('AI context snapshots', () => {
  it('resolves persisted Dialog gallery selections to the canonical Modal instructions', () => {
    const ids = [...new Set(['dialog', 'modal', 'header', 'footer'].map(canonicalAiItemId))]
    expect(ids).toEqual(['modal', 'header', 'footer'])
    const packet = buildAiContext({
      target: 'web-registry',
      mode: 'light',
      tokens: defaultTokens,
      items: ids.map((id) => selected(id)),
    })
    expect(packet).toContain('/modal.json')
    expect(packet).toContain('/components/modal.md')
    expect(packet).not.toContain('/dialog.json')
    expect(packet).not.toContain('/components/dialog.md')
  })
  it('includes the style pack with the web tokens and reports the native fallback accurately', () => {
    const tokens = applyStylePack(defaultTokens, 'neon')
    const packet = buildAiContext({ target: 'web-registry', mode: 'light', tokens, items: [] })
    expect(packet).toContain('Style pack: neon')
    expect(snapshot(packet).appearance).toEqual(tokens.appearance)
    const native = buildAiContext({ target: 'expo-starter', mode: 'light', tokens, items: [] })
    expect(snapshot(native).designIntent.appearance.preset).toBe('neon')
    expect(native).toContain('not implemented by MoruNativeProvider')
  })
  it('preserves the selected dark design including explicit zero spacing without changing the source tokens', () => {
    const tokens = customDarkTokens()
    const before = structuredClone(tokens)
    const packet = buildAiContext({
      target: 'web-registry',
      mode: 'dark',
      tokens,
      items: [selected('button')],
      goal: '  예약 화면을 만들어 주세요.  ',
    })

    expect(snapshot(packet)).toEqual(before)
    expect(snapshot(packet).componentSpacing.card.padding.top).toEqual({ value: 0, unit: 'px' })
    expect(snapshot(packet).componentSpacing.textarea.margin.top).toEqual({
      value: 0,
      unit: 'space',
    })
    expect(snapshot(packet).background).toBe('#08090a')
    expect(packet).toContain('Theme: dark')
    expect(packet).toContain('예약 화면을 만들어 주세요.')
    expect(packet).toContain('do not run createDarkTokens on an already-dark snapshot')
    expect(tokens).toEqual(before)
  })

  it('includes only selected references, deduplicates them, and limits the packet to six items', () => {
    const ids = ['button', 'input', 'field', 'card', 'select', 'checkbox', 'switch', 'dialog']
    const items = [
      ...ids.map((id) => selected(id)),
      selected('button', '# Button\nUPDATED_BUTTON_DOC'),
    ]
    const packet = buildAiContext({
      target: 'web-registry',
      mode: 'light',
      tokens: defaultTokens,
      items,
    })

    expect(packet.match(/npx shadcn@[^\n]+ add [^\n]+\.json/g)).toHaveLength(6)
    expect(packet.match(/\/r\/v[^\n]+\/button\.json/g)).toHaveLength(1)
    expect(packet).toContain('UPDATED_BUTTON_DOC')
    expect(packet).not.toContain('DOC_button')
    for (const id of ids.slice(1, 6)) expect(packet).toContain(`DOC_${id}`)
    for (const id of ids.slice(6)) expect(packet).not.toContain(`DOC_${id}`)
    expect(packet).not.toContain('/components/dialog.md')
  })

  it('uses native tokens and guidance for Expo even when web items were selected previously', () => {
    const tokens = customDarkTokens()
    const packet = buildAiContext({
      target: 'expo-starter',
      mode: 'dark',
      tokens,
      items: [selected('button', '# WEB_ONLY_BUTTON_API\nUse onClick.')],
      platformGuide: '# Expo guide\nNATIVE_GUIDE_MARKER',
    })

    expect(snapshot(packet)).toEqual(createNativeThemeExport(tokens, 'dark'))
    expect(snapshot(packet).platform).toBe('react-native')
    expect(snapshot(packet).tokens.componentSpacing.card.paddingTop).toBe(0)
    expect(snapshot(packet).tokens.componentSpacing.card.paddingBottom).toBe(15)
    expect(packet).toContain('MoruNativeProvider inside SafeAreaProvider')
    expect(packet).toContain('onPress and onChangeText')
    expect(packet).toContain('NATIVE_GUIDE_MARKER')
    expect(packet).toContain(aiExpoPath())
    expect(packet).not.toContain('WEB_ONLY_BUTTON_API')
    expect(packet).not.toContain('npx shadcn')
    expect(packet).not.toContain('@/components/ui/moru/')
    expect(packet).not.toContain('## Selected usage references')
  })

  it('adapts selected import examples to the source starter instead of installing registry APIs', () => {
    const documentation = `# Starter references
import { Button } from '@/components/ui/moru/button'
import { OTPBlock } from '@/components/ui/moru/blocks/OTPBlock'
import { defaultTokens } from '@/components/ui/moru/_theme/tokens'
`
    const packet = buildAiContext({
      target: 'web-starter',
      mode: 'light',
      tokens: defaultTokens,
      items: [selected('button', documentation)],
    })

    expect(packet).toContain("from './components/ui/button'")
    expect(packet).toContain("from './components/blocks/OTPBlock'")
    expect(packet).toContain("from './theme/tokens'")
    expect(packet).toContain('ThemeScope')
    expect(packet).toContain('/downloads/moru-web-starter.zip')
    expect(packet).not.toContain("from '@/components/ui/moru/")
    expect(packet).not.toContain('npx shadcn')
    expect(packet).not.toContain('wrap the area in MoruProvider')
  })
})

describe('AI discovery response boundaries', () => {
  it('accepts the matching version and a complete dependency graph', () => {
    const value = catalog()
    expect(parseAiCatalog(value)).toEqual(value)
  })

  it.each([
    null,
    undefined,
    [],
    42,
    {},
    { ...catalog(), schemaVersion: 2 },
    { ...catalog(), version: '0.0.0' },
  ])('rejects malformed or mismatched catalog %j', (value) => {
    expect(() => parseAiCatalog(value)).toThrow()
  })

  it('rejects duplicate identities, unresolved dependencies, and malformed entry fields', () => {
    const base = catalog()
    expect(() => parseAiCatalog({ ...base, entries: [...base.entries, entry()] })).toThrow()
    expect(() =>
      parseAiCatalog({ ...base, entries: [entry('button', { dependencies: ['missing'] })] }),
    ).toThrow()
    expect(() =>
      parseAiCatalog({ ...base, entries: [{ ...base.entries[0], exports: [123] }] }),
    ).toThrow()
    expect(() =>
      parseAiCatalog({ ...base, entries: [{ ...base.entries[0], kind: 'unknown' }] }),
    ).toThrow()
  })

  it.each([
    'https://example.com/private.md',
    '//example.com/private.md',
    '/api/private.md',
    `/ai/v${registryRelease}/../private.md`,
    `/ai/v${registryRelease}/%2e%2e/private.md`,
    '/ai/v0.0.0/components/button.md',
    `/ai/v${registryRelease}/components/button.md?token=secret`,
  ])('rejects unsafe document path %s before sending a request', async (docPath) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const base = catalog()
    expect(() =>
      parseAiCatalog({ ...base, entries: [entry('core', { dependencies: [], docPath })] }),
    ).toThrow()
    await expect(loadAiDocument(docPath)).rejects.toThrow()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('AI document loading', () => {
  it('fetches the versioned catalog and forwards cancellation', async () => {
    const value = catalog()
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(value)))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    await expect(loadAiCatalog(controller.signal)).resolves.toEqual(value)
    expect(fetchMock).toHaveBeenCalledWith(aiCatalogPath(), { signal: controller.signal })
  })

  it('loads only the requested Markdown document and forwards cancellation', async () => {
    const path = entry().docPath
    const fetchMock = vi.fn().mockResolvedValue(new Response(' \n# Button\nActual API.\n'))
    vi.stubGlobal('fetch', fetchMock)
    const controller = new AbortController()

    await expect(loadAiDocument(path, controller.signal)).resolves.toBe('# Button\nActual API.')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(path, { signal: controller.signal })
  })

  it('rejects a successful SPA HTML fallback instead of treating it as component documentation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('<!doctype html><html><div id="root"></div></html>')),
    )
    await expect(loadAiDocument(entry().docPath)).rejects.toThrow('사용 명세 형식')
  })

  it('does not return documentation or catalogs from failed HTTP responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => Promise.resolve(new Response('Not found', { status: 404 }))),
    )
    await expect(loadAiDocument(entry().docPath)).rejects.toThrow()
    await expect(loadAiCatalog()).rejects.toThrow()
  })

  it('rejects an excessively large response before it enters the context', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('# Button\n' + 'x'.repeat(120_000))),
    )
    await expect(loadAiDocument(entry().docPath)).rejects.toThrow('사용 명세 형식')
  })
})
