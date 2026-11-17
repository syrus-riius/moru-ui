import { describe, expect, it } from 'vitest'
import { harmonyOptions, hexToOklch, type ColorHarmony } from './color-scheme'
import {
  auditPaletteRecommendation,
  generatePaletteRecommendations,
  paletteRoleKeys,
  type PaletteColors,
  type PaletteRole,
} from './palette-recommendations'
import { createWheelPalette, MAX_WHEEL_CHROMA, type PaletteWheelChange } from './palette-wheel'
import { createDarkTokens, defaultTokens, type ThemeMode } from './tokens'

const modes: ThemeMode[] = ['light', 'dark']
const hueDistance = (first: number, second: number) =>
  Math.abs(((first - second + 540) % 360) - 180)
const sourcePalette = (mode: ThemeMode, harmony: ColorHarmony = 'triadic') =>
  generatePaletteRecommendations('#f05d23', mode, {}, harmony)[0].colors

describe('interactive palette wheel', () => {
  it.each(harmonyOptions)(
    'uses $value geometry when any anchor point moves',
    ({ value, angles }) => {
      const source = sourcePalette('light', value)
      for (const role of ['primary', 'accent', 'border'] as const) {
        const offset =
          role === 'primary' ? 0 : role === 'accent' ? (angles[1] ?? 0) : (angles[2] ?? 0)
        const changed = createWheelPalette(
          { role, hue: 215 + offset, chroma: role === 'border' ? 0.025 : 0.12, source },
          'light',
          value,
        )
        expect(hueDistance(hexToOklch(changed.colors.primary).h, 215)).toBeLessThan(3)
        expect(
          hueDistance(hexToOklch(changed.colors.accent).h, 215 + (angles[1] ?? 0)),
        ).toBeLessThan(3)
        expect(
          hueDistance(hexToOklch(changed.colors.border).h, 215 + (angles[2] ?? 0)),
        ).toBeLessThan(6)
      }
    },
  )

  it('lets an unlocked point move even when primary is locked', () => {
    const source = sourcePalette('light')
    const changed = createWheelPalette(
      { role: 'accent', hue: 205, chroma: 0.12, source },
      'light',
      'triadic',
      { primary: source.primary, surface: '#ffffff', text: '#171717' },
    )
    expect(changed.colors.primary).toBe(source.primary)
    expect(changed.colors.surface).toBe('#ffffff')
    expect(changed.colors.text).toBe('#171717')
    expect(changed.colors.accent).not.toBe(source.accent)
    expect(hueDistance(hexToOklch(changed.colors.accent).h, 205)).toBeLessThan(3)
  })

  it('ignores dragging locked roles without repairing or altering other colors', () => {
    const source = { ...sourcePalette('light'), text: '#ffffff', surface: '#ffffff' }
    const changed = createWheelPalette(
      { role: 'text', hue: 160, chroma: 0.2, source },
      'light',
      'split',
      { text: '#ffffff' },
    )
    expect(changed.colors).toEqual(source)
    const allLocked = createWheelPalette(
      { role: 'accent', hue: 40, chroma: 0.2, source },
      'light',
      'mono',
      source,
    )
    expect(allLocked.colors).toEqual(source)
  })

  it.each(modes)('keeps the existing contrast checks passing in %s', (mode) => {
    const base = mode === 'light' ? defaultTokens : createDarkTokens(defaultTokens)
    for (const { value } of harmonyOptions) {
      for (const role of ['primary', 'text', 'surface'] as const) {
        const changed = createWheelPalette(
          { role, hue: 180, chroma: 0.22, source: sourcePalette(mode, value) },
          mode,
          value,
        )
        expect(
          auditPaletteRecommendation({ ...base, ...changed.colors }, mode).every(
            ({ pass }) => pass,
          ),
        ).toBe(true)
      }
    }
  })

  it('preserves conflicting fixed colors and leaves their failed contrast visible', () => {
    const source = sourcePalette('light')
    const locks = { text: '#ffffff', surface: '#ffffff' }
    const changed = createWheelPalette(
      { role: 'accent', hue: 160, chroma: 0.15, source },
      'light',
      'split',
      locks,
    )
    expect(changed.colors.text).toBe(locks.text)
    expect(changed.colors.surface).toBe(locks.surface)
    expect(
      auditPaletteRecommendation({ ...defaultTokens, ...changed.colors }, 'light').find(
        ({ id }) => id === 'text-surface',
      )?.pass,
    ).toBe(false)
  })

  it('is deterministic from a fixed gesture snapshot and never mutates that snapshot', () => {
    const source = Object.freeze(sourcePalette('light'))
    const before = { ...source }
    const change: PaletteWheelChange = { role: 'accent', hue: 172, chroma: 0.16, source }
    const expected = createWheelPalette(change, 'light', 'analogous')
    for (const hue of [15, 90, 280, 359]) {
      createWheelPalette({ ...change, hue }, 'light', 'analogous')
    }
    expect(createWheelPalette(change, 'light', 'analogous')).toEqual(expected)
    expect(source).toEqual(before)
  })

  it('adds chroma to an achromatic seed without retaining zero-chroma weights', () => {
    const source = generatePaletteRecommendations('#808080', 'light', {}, 'triadic')[0].colors
    const changed = createWheelPalette(
      { role: 'primary', hue: 260, chroma: 0.15, source },
      'light',
      'triadic',
    )
    expect(hexToOklch(changed.colors.primary).c).toBeGreaterThan(0.1)
    expect(hexToOklch(changed.colors.accent).c).toBeGreaterThan(0.06)
    expect(hexToOklch(changed.colors.border).c).toBeGreaterThan(0.01)
  })

  it.each(['#000000', '#ffffff'])(
    'opens a usable gamut for an unlocked %s action color',
    (seed) => {
      for (const mode of modes) {
        const source = generatePaletteRecommendations(seed, mode, {}, 'mono')[0].colors
        const changed = createWheelPalette(
          { role: 'primary', hue: 250, chroma: 0.15, source },
          mode,
          'mono',
        )
        expect(changed.colors.primary).not.toBe(seed)
        expect(hexToOklch(changed.colors.primary).c).toBeGreaterThan(0.05)
      }
    },
  )

  it('allows a directly dragged neutral more chroma while retaining muted surrounding surfaces', () => {
    const source = sourcePalette('light')
    const changed = createWheelPalette(
      { role: 'muted', hue: 30, chroma: 0.2, source },
      'light',
      'split',
    )
    expect(hexToOklch(changed.colors.muted).c).toBeGreaterThan(0.04)
    for (const role of ['background', 'surface', 'text', 'border'] as const) {
      expect(hexToOklch(changed.colors[role]).c).toBeLessThanOrEqual(0.042)
    }
  })

  it('reaches neutral at the center without reintroducing chroma in free colors', () => {
    const source = sourcePalette('light')
    const changed = createWheelPalette(
      { role: 'primary', hue: 120, chroma: 0, source },
      'light',
      'triadic',
      { accent: source.accent },
    )
    expect(changed.colors.accent).toBe(source.accent)
    for (const role of paletteRoleKeys.filter((role) => role !== 'accent')) {
      expect(hexToOklch(changed.colors[role]).c).toBeLessThan(0.0001)
    }
  })

  it('wraps hue, clamps chroma, and rejects non-finite coordinates', () => {
    const source = sourcePalette('dark')
    const change: PaletteWheelChange = { role: 'accent', hue: -30, chroma: 2, source }
    expect(createWheelPalette(change, 'dark', 'mono')).toEqual(
      createWheelPalette({ ...change, hue: 330, chroma: MAX_WHEEL_CHROMA }, 'dark', 'mono'),
    )
    for (const invalid of [NaN, Infinity, -Infinity]) {
      expect(createWheelPalette({ ...change, hue: invalid }, 'dark', 'mono').colors).toEqual(source)
      expect(createWheelPalette({ ...change, chroma: invalid }, 'dark', 'mono').colors).toEqual(
        source,
      )
    }
    expect(
      createWheelPalette({ ...change, role: 'danger' as PaletteRole }, 'dark', 'mono').colors,
    ).toEqual(source)
  })

  it('returns only palette roles even if a caller supplies full tokens', () => {
    const source = { ...defaultTokens, ...sourcePalette('light') } as PaletteColors
    const changed = createWheelPalette(
      { role: 'primary', hue: 30, chroma: 0.1, source },
      'light',
      'mono',
    )
    expect(Object.keys(changed.colors).sort()).toEqual([...paletteRoleKeys].sort())
  })
})
