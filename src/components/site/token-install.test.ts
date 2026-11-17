import { parse } from '@babel/parser'
import { describe, expect, it } from 'vitest'
import { locales } from '../../lib/locale'
import { createTokenInstallGuide, moruNpmVersion, type TokenInstallGuide } from './token-install'
import {
  applyDensity,
  createDarkTokens,
  defaultTokens,
  densityOptions,
  getCssVariables,
  presets,
  validateTokens,
  type FontFamily,
  type ThemeMode,
} from '../../theme/tokens'
import { applyStylePack, stylePackOptions } from '../../theme/style-packs'

function snapshot(mode: ThemeMode = 'dark', fontFamily: FontFamily = 'pretendard') {
  const light = validateTokens({
    ...defaultTokens,
    primary: '#6b41b2',
    radius: 12,
    borderWidth: 0.5,
    fontFamily,
    density: 'compact',
    densityOverrides: { compact: { controlHeight: 36, formGap: 20, spacing: 3.5 } },
    typography: {
      ...defaultTokens.typography,
      body: { size: 15, lineHeight: 1.7, weight: 450, letterSpacing: 0.01 },
      heading: { size: 26, lineHeight: 1.35, weight: 650, letterSpacing: -0.03 },
    },
    componentSpacing: {
      button: { padding: { left: { value: 2.5, unit: 'space' } } },
      card: { padding: { top: { value: 22, unit: 'px' } } },
    },
  })
  const dark = validateTokens({
    ...light,
    ...createDarkTokens(light),
    primary: '#ca9eff',
    background: '#120e1a',
    surface: '#231c30',
    appearance: { preset: 'glass', surfaceOpacity: 0.88, blur: 18, glow: 0, highlight: 0.3 },
  })
  const themes = { light, dark }
  return {
    schemaVersion: 9,
    presetId: 'custom-palette',
    mode,
    themes,
    tokens: themes[mode],
    cssVariables: getCssVariables(themes[mode], mode),
    colorSchemes: { presetId: 'my-palette', editor: { color: 'primary' } },
  }
}

function file(guide: TokenInstallGuide, path: string) {
  const result = guide.files.find((entry) => entry.path === path)
  if (!result) throw new Error(`Missing generated file: ${path}`)
  return result.code
}

function imports(code: string) {
  return parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] })
    .program.body.filter((node) => node.type === 'ImportDeclaration')
    .map((node) => node.source.value)
}

describe('token installation export', () => {
  it.each(locales)(
    'preserves primary text overrides through copied JSON and explains npm compatibility in %s',
    (locale) => {
      const saved = snapshot()
      saved.themes.light.primaryForeground = '#FFF'
      saved.themes.dark.primaryForeground = 'auto'
      const guide = createTokenInstallGuide(JSON.stringify(saved), 'vite', locale)
      const copied = JSON.parse(file(guide, 'src/moru-tokens.json'))
      expect(copied.themes.light.primaryForeground).toBe('#FFF')
      expect(copied.themes.dark.primaryForeground).toBe('auto')
      expect(validateTokens(copied.themes.light).primaryForeground).toBe('#ffffff')
      expect(validateTokens(copied.themes.dark).primaryForeground).toBe('auto')
      expect(guide.compatibilityNote).toContain('primaryForeground')
      expect(guide.compatibilityNote).toContain('0.5.0-beta.3')
      expect(guide.text).toContain(guide.compatibilityNote)
    },
  )

  it('does not show the custom foreground limitation for automatic or legacy primary text', () => {
    const saved = snapshot()
    saved.themes.light.primaryForeground = 'auto'
    const guide = createTokenInstallGuide(JSON.stringify(saved), 'next')
    expect(guide.compatibilityNote).not.toContain('primaryForeground')
  })

  it.each(locales)(
    'preserves focus settings and states the published package limit in %s',
    (locale) => {
      const saved = snapshot()
      const focus = { style: 'surface' as const, width: 1, offset: 0, color: '#5577cc' }
      saved.themes.light.focus = focus
      saved.themes.dark.focus = { ...focus }
      const guide = createTokenInstallGuide(JSON.stringify(saved), 'vite', locale)
      const copied = JSON.parse(file(guide, 'src/moru-tokens.json'))
      expect(copied.themes.light.focus).toEqual(focus)
      expect(copied.themes.dark.focus).toEqual(focus)
      expect(guide.compatibilityNote).toContain('0.5.0-beta.3')
      expect(guide.text).toContain(guide.compatibilityNote)
      expect(guide.command).toContain(`moru-ui@${moruNpmVersion}`)
    },
  )

  it.each(['light', 'dark'] as const)(
    'preserves both exact saved themes and editor metadata when exporting %s mode',
    (mode) => {
      const saved = snapshot(mode)
      const serialized = JSON.stringify(saved)
      const guide = createTokenInstallGuide(serialized, 'vite')
      const copied = JSON.parse(file(guide, 'src/moru-tokens.json'))

      expect(copied).toEqual(saved)
      expect(guide.mode).toBe(mode)
      expect(guide.fontFamily).toBe(saved.themes[mode].fontFamily)
      // Match the generated provider's public runtime API, including non-color settings.
      for (const themeMode of ['light', 'dark'] as const) {
        expect(validateTokens(copied.themes[themeMode])).toEqual(saved.themes[themeMode])
      }
      expect(copied.themes.light.controlHeight).toBe(36)
      expect(copied.themes.dark.background).toBe('#120e1a')
      expect(copied.themes.dark.typography.body.size).toBe(15)
      expect(copied.themes.dark.componentSpacing.card.padding.top.value).toBe(22)
      expect(copied.themes.dark.appearance.surfaceOpacity).toBe(0.88)
      expect(serialized).toBe(JSON.stringify(saved))
    },
  )

  it('accepts every current preset, density and material from the studio', () => {
    for (const preset of presets) {
      for (const { value: density } of densityOptions) {
        for (const { id: material } of stylePackOptions) {
          const light = applyStylePack(applyDensity(preset.tokens, density), material)
          const dark = createDarkTokens(light)
          const saved = { ...snapshot(), themes: { light, dark } }
          expect(() => createTokenInstallGuide(JSON.stringify(saved), 'next')).not.toThrow()
        }
      }
    }
  })

  it('keeps metadata as JSON data without interpolating it into executable source', () => {
    const marker = '"; throw new Error("metadata must stay data"); // <script>\n`'
    const saved = { ...snapshot(), presetId: marker, editorNotes: [marker] }
    const guide = createTokenInstallGuide(JSON.stringify(saved), 'vite')
    expect(JSON.parse(file(guide, 'src/moru-tokens.json'))).toEqual(saved)
    for (const generated of guide.files.filter((entry) => entry.language === 'tsx')) {
      expect(generated.code).not.toContain('metadata must stay data')
      expect(() =>
        parse(generated.code, { sourceType: 'module', plugins: ['typescript', 'jsx'] }),
      ).not.toThrow()
    }
  })
})

describe('copyable project integration', () => {
  it('creates a complete Vite import graph with one stylesheet and a mode-aware provider', () => {
    const guide = createTokenInstallGuide(JSON.stringify(snapshot()), 'vite')
    expect(guide.files.map((entry) => entry.path)).toEqual([
      'src/moru-tokens.json',
      'src/MoruProvider.tsx',
      'src/App.tsx',
    ])
    const app = file(guide, 'src/App.tsx')
    const provider = file(guide, 'src/MoruProvider.tsx')
    expect(imports(app)).toContain('./MoruProvider')
    expect(imports(provider)).toContain('./moru-tokens.json')
    expect(
      guide.files
        .flatMap((entry) => (entry.language === 'tsx' ? imports(entry.code) : []))
        .filter((entry) => entry === 'moru-ui/styles.css'),
    ).toHaveLength(1)
    expect(app).toContain('useState<ThemeMode>(defaultMoruMode)')
    expect(app).toContain('<AppMoruProvider mode={mode}>')
    expect(provider).toContain('tokens={themes[mode]}')
    expect(provider.indexOf('validateTokens(design.themes.dark)')).toBeLessThan(
      provider.indexOf('export function AppMoruProvider'),
    )
    expect(provider).not.toContain('createDarkTokens')
    expect(provider).not.toContain(' as ')
    expect(guide.command).toContain(`npm install moru-ui@${moruNpmVersion}`)
    expect(guide.text).not.toContain('npx shadcn')
    for (const entry of guide.files) {
      expect(guide.text).toContain(`## ${entry.path}`)
      expect(guide.text).toContain(`\`\`\`${entry.language}\n${entry.code.trimEnd()}\n\`\`\``)
    }
  })

  it('keeps Next client code in providers and imports global styles from the root layout only', () => {
    const guide = createTokenInstallGuide(JSON.stringify(snapshot()), 'next', 'ja')
    expect(guide.files.map((entry) => entry.path)).toEqual([
      'app/moru-tokens.json',
      'app/providers.tsx',
      'app/layout.tsx',
      'app/page.tsx',
    ])
    const provider = file(guide, 'app/providers.tsx')
    const layout = file(guide, 'app/layout.tsx')
    const page = file(guide, 'app/page.tsx')
    expect(provider).toMatch(/^'use client'/)
    expect(imports(provider)).toContain('./moru-tokens.json')
    expect(imports(provider)).not.toContain('moru-ui/styles.css')
    expect(imports(layout)).toContain('./providers')
    expect(imports(layout)).toContain('moru-ui/styles.css')
    expect(layout).toContain('<AppMoruProvider>{children}</AppMoruProvider>')
    expect(layout).toContain('<html lang="ja">')
    expect(layout).not.toContain('use client')
    expect(page).not.toContain('onClick')
    expect(page).not.toContain('use client')
    expect(imports(page)).toEqual(['moru-ui'])
    expect(provider).toContain('locale="ja"')
  })

  it.each(locales)('emits valid localized source and instructions for %s', (locale) => {
    const guide = createTokenInstallGuide(JSON.stringify(snapshot()), 'next', locale)
    for (const entry of guide.files) {
      if (entry.language === 'tsx') {
        expect(() =>
          parse(entry.code, { sourceType: 'module', plugins: ['typescript', 'jsx'] }),
        ).not.toThrow()
      }
    }
    expect(file(guide, 'app/layout.tsx')).toContain(`<html lang="${locale}">`)
    expect(file(guide, 'app/providers.tsx')).toContain(`locale="${locale}"`)
    expect(guide.text).toContain(guide.command)
    expect(guide.text).toContain('resolveJsonModule')
    expect(guide.text).toContain('src/app/')
  })
})

describe('font dependencies', () => {
  it.each(['pretendard', 'sans'] as const)(
    'includes the actual %s font file and package',
    (family) => {
      const guide = createTokenInstallGuide(JSON.stringify(snapshot('light', family)), 'vite')
      expect(guide.command).toBe(`npm install moru-ui@${moruNpmVersion} pretendard@1.3.9`)
      expect(imports(file(guide, 'src/App.tsx'))).toContain(
        'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css',
      )
    },
  )

  it('includes both Latin and Korean Noto Sans files and no unrelated font packages', () => {
    const guide = createTokenInstallGuide(JSON.stringify(snapshot('dark', 'noto-sans')), 'next')
    expect(guide.command).toContain('@fontsource-variable/noto-sans@5.3.0')
    expect(guide.command).toContain('@fontsource-variable/noto-sans-kr@5.3.1')
    expect(guide.command).not.toContain('pretendard')
    expect(imports(file(guide, 'app/layout.tsx'))).toEqual(
      expect.arrayContaining([
        '@fontsource-variable/noto-sans',
        '@fontsource-variable/noto-sans-kr',
      ]),
    )
  })

  it.each(['mono', 'serif'] as const)('uses system %s without extra downloads', (family) => {
    const guide = createTokenInstallGuide(JSON.stringify(snapshot('dark', family)), 'vite')
    expect(guide.command).toBe(`npm install moru-ui@${moruNpmVersion}`)
    expect(imports(file(guide, 'src/App.tsx'))).toEqual([
      'react',
      'moru-ui',
      './MoruProvider',
      'moru-ui/styles.css',
    ])
  })

  it('loads both selected fonts if saved modes use different families', () => {
    const saved = snapshot('dark', 'noto-sans')
    saved.themes.light = validateTokens({ ...saved.themes.light, fontFamily: 'pretendard' })
    const guide = createTokenInstallGuide(JSON.stringify(saved), 'vite')
    expect(guide.fontFamily).toBe('noto-sans')
    expect(guide.command.match(/pretendard@/g)).toHaveLength(1)
    expect(guide.command.match(/noto-sans@/g)).toHaveLength(1)
  })
})

describe('invalid token exports', () => {
  it.each(['not JSON', '', '{'])(
    'rejects broken JSON instead of replacing the design: %s',
    (json) => {
      expect(() => createTokenInstallGuide(json, 'vite')).toThrow('JSON')
    },
  )

  it.each([null, [], {}, { ...snapshot(), mode: 'automatic' }, { ...snapshot(), themes: {} }])(
    'rejects an incomplete saved state: %j',
    (saved) => {
      expect(() => createTokenInstallGuide(JSON.stringify(saved), 'vite')).toThrow()
    },
  )

  it('requires a supported schema and two full themes', () => {
    const saved = snapshot()
    expect(() =>
      createTokenInstallGuide(JSON.stringify({ ...saved, schemaVersion: 10 }), 'vite'),
    ).toThrow('버전')
    expect(() =>
      createTokenInstallGuide(
        JSON.stringify({ ...saved, themes: { light: saved.themes.light } }),
        'vite',
      ),
    ).toThrow('스튜디오')
  })

  it.each([
    { primary: 'url(javascript:alert(1))' },
    { primaryForeground: 'var(--ui-text)' },
    { primaryForeground: null },
    { radius: 9000 },
    { fontFamily: 'unknown-font' },
    { typography: { body: { size: '16' } } },
    { densityOverrides: { compact: { controlHeight: '36' } } },
    { componentSpacing: { button: { padding: { left: { value: 4, unit: 'rem' } } } } },
    { appearance: { preset: 'unsupported-material' } },
  ])('rejects theme values that runtime validation would silently repair: %j', (change) => {
    const saved = snapshot()
    const json = JSON.stringify({
      ...saved,
      themes: { ...saved.themes, light: { ...saved.themes.light, ...change } },
    })
    expect(() => createTokenInstallGuide(json, 'vite')).toThrow('스튜디오')
  })
})
