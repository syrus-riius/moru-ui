import { describe, expect, it } from 'vitest'
import { hexToOklch } from './color-scheme'
import {
  auditPaletteRecommendation,
  generatePaletteRecommendations,
  generateRandomPaletteRecommendation,
  paletteRoleKeys,
} from './palette-recommendations'
import {
  createDarkTokens,
  defaultTokens,
  getContrastRatio,
  getCssVariables,
  type ThemeMode,
} from './tokens'

const modes: ThemeMode[] = ['light', 'dark']
const seeds = ['#000000', '#ffffff', '#808080', '#c5d86d', '#f05d23', '#0000ff', '#00ff00']

describe('palette recommendations', () => {
  it.each(modes)(
    'keeps the seed, offers distinct usable candidates, and changes only base colors in %s',
    (mode) => {
      const base = mode === 'dark' ? createDarkTokens(defaultTokens) : defaultTokens
      for (const seed of seeds) {
        const recommendations = generatePaletteRecommendations(seed, mode)
        expect(recommendations).toHaveLength(3)
        expect(new Set(recommendations.map(({ colors }) => colors.accent)).size).toBe(3)
        for (const { colors } of recommendations) {
          expect(colors.primary).toBe(seed)
          expect(Object.keys(colors).sort()).toEqual([...paletteRoleKeys].sort())
          for (const color of Object.values(colors)) expect(color).toMatch(/^#[\da-f]{6}$/)
          const tokens = { ...base, ...colors }
          expect(auditPaletteRecommendation(tokens, mode).every(({ pass }) => pass)).toBe(true)
          expect(tokens.success).toBe(base.success)
          expect(tokens.danger).toBe(base.danger)
          expect(tokens.radius).toBe(base.radius)
        }
      }
    },
  )

  it('normalizes shorthand seeds and returns no invented palette for malformed input', () => {
    expect(
      generatePaletteRecommendations(' #ABC ', 'light').map(({ colors }) => colors.primary),
    ).toEqual(['#aabbcc', '#aabbcc', '#aabbcc'])
    for (const seed of ['', 'red', '#abcd', '#000000ff', 'rgb(0,0,0)']) {
      expect(generatePaletteRecommendations(seed, 'light')).toEqual([])
    }
  })

  it('is deterministic and adapts neutral surfaces to the selected mode', () => {
    const light = generatePaletteRecommendations('#c5d86d', 'light')
    const dark = generatePaletteRecommendations('#c5d86d', 'dark')
    expect(generatePaletteRecommendations('#c5d86d', 'light')).toEqual(light)
    light.forEach(({ colors }, index) => {
      expect(colors.primary).toBe(dark[index].colors.primary)
      expect(colors.background).not.toBe(dark[index].colors.background)
      expect(colors.text).not.toBe(dark[index].colors.text)
    })
  })

  it('carries the selected hue relationships into actual accent tokens', () => {
    const seed = '#f05d23'
    const origin = hexToOklch(seed).h
    const palettes = generatePaletteRecommendations(seed, 'light')
    for (const [index, offset] of [0, 30, 180].entries()) {
      const accentHue = hexToOklch(palettes[index].colors.accent).h
      const distance = Math.abs(((accentHue - origin - offset + 540) % 360) - 180)
      expect(distance).toBeLessThan(2)
    }
  })
})

describe('random palette recommendations', () => {
  it.each(modes)('reuses all three recipes with valid, readable colors in %s', (mode) => {
    const base = mode === 'dark' ? createDarkTokens(defaultTokens) : defaultTokens
    const ids = new Set<string>()
    for (let sample = 0; sample <= 12; sample++) {
      const candidate = generateRandomPaletteRecommendation(mode, undefined, () => sample / 12)
      ids.add(candidate.id)
      expect(Object.keys(candidate.colors).sort()).toEqual([...paletteRoleKeys].sort())
      for (const color of Object.values(candidate.colors)) expect(color).toMatch(/^#[\da-f]{6}$/)
      expect(candidate).toEqual(
        generatePaletteRecommendations(candidate.colors.primary, mode).find(
          ({ id }) => id === candidate.id,
        ),
      )
      const primary = hexToOklch(candidate.colors.primary)
      expect(primary.l).toBeGreaterThanOrEqual(mode === 'dark' ? 0.658 : 0.478)
      expect(primary.l).toBeLessThanOrEqual(mode === 'dark' ? 0.842 : 0.662)
      expect(primary.c).toBeGreaterThan(0.02)
      expect(
        auditPaletteRecommendation({ ...base, ...candidate.colors }, mode).every(
          ({ pass }) => pass,
        ),
      ).toBe(true)
    }
    expect([...ids].sort()).toEqual(['analogous', 'complementary', 'tonal'])
  })

  it('is deterministic with injected randomness and normalizes the previous seed', () => {
    const first = generateRandomPaletteRecommendation('light', '#aabbcc', () => 0.35)
    expect(generateRandomPaletteRecommendation('light', ' #ABC ', () => 0.35)).toEqual(first)
    expect(generateRandomPaletteRecommendation('light', '#aabbcc', () => 0.35)).toEqual(first)
    expect(generateRandomPaletteRecommendation('dark', '#aabbcc', () => 0.35)).not.toEqual(first)
    expect(generateRandomPaletteRecommendation('light', 'invalid', () => 0.35)).toEqual(
      generateRandomPaletteRecommendation('light', undefined, () => 0.35),
    )
  })

  it.each(modes)('keeps changing hue with a constant random source in %s', (mode) => {
    for (const value of [0, 0.5, 1]) {
      let previous = '#f05d23'
      for (let index = 0; index < 8; index++) {
        const candidate = generateRandomPaletteRecommendation(mode, previous, () => value)
        const current = candidate.colors.primary
        const distance = Math.abs(
          ((hexToOklch(current).h - hexToOklch(previous).h + 540) % 360) - 180,
        )
        expect(current).not.toBe(previous)
        // The 60° minimum permits small rounding error after 8-bit sRGB conversion.
        expect(distance).toBeGreaterThan(58)
        previous = current
      }
    }
  })

  it('handles neutral previous colors and bounds malformed random values without retrying', () => {
    for (const previous of ['#000000', '#ffffff', '#808080']) {
      expect(
        generateRandomPaletteRecommendation('light', previous, () => 0).colors.primary,
      ).not.toBe(previous)
    }
    for (const value of [-1, 2, NaN, Infinity]) {
      let calls = 0
      const candidate = generateRandomPaletteRecommendation('dark', '#f05d23', () => {
        calls++
        return value
      })
      expect(calls).toBe(4)
      for (const color of Object.values(candidate.colors)) expect(color).toMatch(/^#[\da-f]{6}$/)
    }
  })
})

describe('palette contrast inspection', () => {
  it('checks the derived button label instead of assuming white text', () => {
    const tokens = { ...defaultTokens, primary: '#c5d86d' }
    const check = auditPaletteRecommendation(tokens, 'light').find(
      ({ id }) => id === 'primary-label',
    )!
    expect(check.foreground).toBe('#000000')
    expect(check.background).toBe('#c5d86d')
    expect(check.ratio).toBe(getContrastRatio(check.foreground, check.background))
    expect(check.pass).toBe(true)
    expect(getContrastRatio('#ffffff', check.background)).toBeLessThan(4.5)
  })

  it('uses the corrected accent text and reports custom failing text pairs individually', () => {
    const tokens = {
      ...defaultTokens,
      surface: '#ffffff',
      background: '#ffffff',
      text: '#cccccc',
      muted: '#dddddd',
      accent: '#c5d86d',
    }
    const checks = auditPaletteRecommendation(tokens, 'light')
    expect(checks).toHaveLength(5)
    expect(checks.filter(({ pass }) => !pass).map(({ id }) => id)).toEqual([
      'text-background',
      'text-surface',
      'muted-surface',
    ])
    const accent = checks.find(({ id }) => id === 'accent-surface-text')!
    expect(accent.foreground).toBe(getCssVariables(tokens, 'light')['--ui-accent-surface-text'])
    expect(accent.foreground).not.toBe(tokens.accent)
    expect(accent.pass).toBe(true)
  })

  it('does not round a failing ratio up into a pass', () => {
    const tokens = { ...defaultTokens, text: '#777777', surface: '#ffffff' }
    const check = auditPaletteRecommendation(tokens, 'light').find(
      ({ id }) => id === 'text-surface',
    )!
    expect(check.ratio).toBeGreaterThan(4.47)
    expect(check.ratio).toBeLessThan(4.5)
    expect(check.minimum).toBe(4.5)
    expect(check.pass).toBe(false)
  })
})
