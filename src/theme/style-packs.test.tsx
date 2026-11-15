import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeScope } from '../components/ui/theme-scope'
import { applyStylePack, getStylePackVariables, resolveAppearance } from './style-packs'
import {
  applyDensity,
  applyFontFamily,
  createDarkTokens,
  cssForTokens,
  defaultTokens,
  getCssVariables,
  validateTokens,
} from './tokens'
import {
  applyColorSchemeState,
  applyThemeTokensState,
  parseThemeState,
  restoreThemeState,
} from './useTheme'
import { normalizeColorSchemeSettings } from './color-scheme'

afterEach(() => vi.unstubAllGlobals())

describe('style pack token compatibility', () => {
  it('keeps legacy tokens and v9 border edits intact; omitted appearance means Default', () => {
    expect(validateTokens(defaultTokens)).toEqual(defaultTokens)
    expect(resolveAppearance()).toEqual({
      preset: 'default',
      surfaceOpacity: 1,
      blur: 0,
      glow: 0,
      highlight: 0,
    })
    expect(getStylePackVariables(defaultTokens, 'light')['--ui-pack-pressed-shadow']).toBe(
      'inset 0 1px 2px #00000018',
    )
    const light = { ...defaultTokens, borderWidth: 2 }
    const saved = {
      schemaVersion: 9,
      mode: 'light',
      presetId: 'custom',
      themes: { light, dark: createDarkTokens(light) },
    }
    expect(restoreThemeState(saved)).toEqual(saved)
  })

  it('sanitizes effect values and strips unrecognized fields without putting CSS in color tokens', () => {
    const source = {
      ...defaultTokens,
      appearance: {
        preset: 'glass',
        surfaceOpacity: 0.1,
        blur: Infinity,
        glow: -2,
        highlight: 'url(x)',
        css: 'bad',
      },
    }
    const actual = validateTokens(source)
    expect(actual.appearance).toEqual({
      preset: 'glass',
      surfaceOpacity: 0.55,
      blur: 16,
      glow: 0,
      highlight: 0.4,
    })
    expect(actual.surface).toBe(defaultTokens.surface)
    expect(resolveAppearance({ preset: 'javascript:alert(1)', blur: NaN })).toEqual(
      resolveAppearance(),
    )
  })

  it('changes only appearance when selecting a pack, and clears effects on Default', () => {
    const original = validateTokens({
      ...defaultTokens,
      accent: '#3456ab',
      radius: 13,
      density: 'comfortable',
    })
    const styled = applyStylePack(original, 'glass')
    const { appearance: _appearance, ...withoutAppearance } = styled
    expect(withoutAppearance).toEqual(original)
    expect(applyStylePack(styled, 'default').appearance).toEqual(resolveAppearance())
    expect(original).not.toHaveProperty('appearance')
  })

  it('preserves independent effect edits through density, font, dark mode and JSON roundtrip', () => {
    const source = validateTokens({
      ...applyStylePack(defaultTokens, 'glass'),
      appearance: { preset: 'glass', surfaceOpacity: 0.91, blur: 9, glow: 0, highlight: 0.2 },
    })
    for (const variant of [
      validateTokens(source),
      applyDensity(source, 'compact'),
      applyFontFamily(source, 'noto-sans'),
      createDarkTokens(source),
    ]) {
      expect(variant.appearance).toEqual(source.appearance)
      expect(variant.appearance).not.toBe(source.appearance)
    }
    const saved = {
      schemaVersion: 9,
      mode: 'dark',
      presetId: 'custom',
      themes: { light: source, dark: createDarkTokens(source) },
    }
    const parsed = parseThemeState(JSON.parse(JSON.stringify(saved)))!
    expect(parsed).toEqual(saved)
    expect(parsed.themes.light.appearance).not.toBe(parsed.themes.dark.appearance)
    const recolored = applyColorSchemeState(parsed, normalizeColorSchemeSettings({}), 'foundation')
    expect(recolored.themes.dark.appearance).toEqual(source.appearance)
  })

  it('keeps the selected palette and color generator when the editor changes only appearance', () => {
    const previous = parseThemeState({
      schemaVersion: 9,
      mode: 'light',
      presetId: 'graphite',
      themes: { light: defaultTokens, dark: createDarkTokens(defaultTokens) },
      colorSchemes: { light: normalizeColorSchemeSettings({}) },
    })!
    const glass = applyThemeTokensState(previous, (tokens) => applyStylePack(tokens, 'glass'))
    expect(glass.presetId).toBe('graphite')
    expect(glass.colorSchemes).toBe(previous.colorSchemes)
    expect(glass.themes.dark.appearance).toEqual(glass.themes.light.appearance)
    const modified = applyThemeTokensState(glass, {
      ...glass.themes.light,
      appearance: { ...glass.themes.light.appearance!, blur: 23 },
    })
    expect(modified.presetId).toBe('graphite')
    expect(modified.colorSchemes).toBe(previous.colorSchemes)
    const recolored = applyThemeTokensState(modified, {
      ...modified.themes.light,
      accent: '#123456',
    })
    expect(recolored.presetId).toBe('custom')
    expect(recolored.colorSchemes?.light).toBeUndefined()
    const resized = applyThemeTokensState(glass, { ...glass.themes.light, radius: 14 })
    expect(resized.presetId).toBe('custom')
  })
})

describe('style pack scope and exports', () => {
  it('resets material images and control effects when returning to Default', () => {
    const material = getStylePackVariables(applyStylePack(defaultTokens, 'glass'), 'light')
    expect(material['--ui-pack-surface-image']).not.toBe('none')
    expect(material['--ui-pack-control-image']).not.toBe('none')
    const neutral = getStylePackVariables(defaultTokens, 'light')
    for (const key of [
      '--ui-pack-surface-image',
      '--ui-pack-control-image',
      '--ui-pack-control-shadow',
      '--ui-pack-sidebar-shadow',
    ])
      expect(neutral[key]).toBe('none')
  })

  it('honors zero effects and preserves previously saved effect strengths', () => {
    const legacy = {
      ...defaultTokens,
      appearance: {
        preset: 'neon' as const,
        surfaceOpacity: 1,
        blur: 0,
        glow: 12,
        highlight: 0.35,
      },
    }
    const restored = validateTokens(JSON.parse(JSON.stringify(legacy)))
    expect(restored.appearance).toEqual(legacy.appearance)
    const active = getStylePackVariables(restored, 'dark')
    expect(active['--ui-pack-sidebar-shadow']).toContain('12px')
    expect(active['--ui-pack-control-shadow']).not.toBe('none')
    const off = getStylePackVariables(
      { ...legacy, appearance: { ...legacy.appearance, glow: 0, highlight: 0 } },
      'dark',
    )
    expect(off['--ui-pack-surface-image']).toBe('none')
    expect(off['--ui-pack-control-shadow']).toBe('none')
    expect(off['--ui-pack-active-shadow']).toBe('none')
  })

  it('uses accent for neon and preserves readable opaque foreground/background tokens', () => {
    const tokens = applyStylePack({ ...defaultTokens, accent: '#123456' }, 'neon')
    const variables = getCssVariables(tokens, 'dark')
    expect(variables['--ui-pack-action-shadow']).toContain('18 52 86')
    expect(variables['--ui-pack-surface-bg']).toBe('var(--ui-surface)')
    expect(variables['--ui-text']).toBe(tokens.text)
    expect(variables['--ui-focus-ring']).toBe(
      getCssVariables(defaultTokens, 'dark')['--ui-focus-ring'],
    )
    expect(Object.values(variables).join(' ')).not.toMatch(/NaN|undefined|Infinity/)
  })

  it.each(['default', 'glass', 'neon'] as const)(
    'includes all live %s effect variables in CSS export',
    (preset) => {
      const tokens = applyStylePack(defaultTokens, preset)
      const css = cssForTokens(tokens, 'light')
      for (const [name, value] of Object.entries(getStylePackVariables(tokens, 'light')))
        expect(css).toContain(`${name}: ${value};`)
    },
  )

  it('resets effects at a nested Default boundary without rendering popup hosts before mount', () => {
    vi.stubGlobal('document', { body: {} })
    const glass = applyStylePack(defaultTokens, 'glass')
    const markup = renderToStaticMarkup(
      <ThemeScope tokens={glass} mode="light">
        <ThemeScope tokens={defaultTokens} mode="light">
          <button>Default button</button>
        </ThemeScope>
      </ThemeScope>,
    )
    expect(markup.match(/data-style-pack="glass"/g)).toHaveLength(1)
    expect(markup.match(/data-style-pack="default"/g)).toHaveLength(1)
    expect(markup.match(/--ui-pack-surface-filter:blur\(16px\) saturate\(125%\)/g)).toHaveLength(1)
    expect(markup.match(/--ui-pack-surface-filter:none/g)).toHaveLength(1)
    expect(markup).not.toContain('class="ui-theme-scope ui-theme-portal"')
  })
})
