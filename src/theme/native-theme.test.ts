import { describe, expect, it } from 'vitest'
import { createNativeThemeExport } from './native-theme'
import { createDarkTokens, defaultTokens, getContrastRatio, getCssVariables, withDensityMetric } from './tokens'

describe('native theme bridge', () => {
  it('exports provider-ready JSON with current density, shape and readable action text', () => {
    const source = withDensityMetric({ ...defaultTokens, radius: 14 }, 'spacing', 6)
    const before = structuredClone(source)
    const output = createNativeThemeExport(source, 'light')
    expect(output.tokens.space).toBe(6)
    expect(output.tokens.radius).toBe(14)
    expect(output.tokens.colors.primaryForeground).toBe('#ffffff')
    expect(output.accessibility.minTouchSize).toBe(48)
    expect(JSON.parse(JSON.stringify(output))).toEqual(output)
    expect(source).toEqual(before)
    expect(Object.keys(output.tokens.colors)).toHaveLength(14)
  })
  it('keeps mode-specific colors and excludes browser-only implementation values', () => {
    const dark = createDarkTokens(defaultTokens)
    const output = createNativeThemeExport(dark, 'dark')
    expect(output.mode).toBe('dark')
    expect(output.tokens.colors.background).toBe(dark.background)
    expect(output.tokens.colors.primaryForeground).toBe('#000000')
    expect(JSON.stringify(output)).not.toContain('var(--')
    expect(output.tokens).not.toHaveProperty('fontFamily')
    expect(output.tokens.webFontFamily).toContain('Pretendard')
    expect(output.compatibility.nativeFont).toBe('system-until-registered')
  })
  it.each(['light', 'dark'] as const)('exports the same visible %s control boundary as the web without changing decorative borders', (mode) => {
    const source = mode === 'dark' ? createDarkTokens(defaultTokens) : defaultTokens
    const output = createNativeThemeExport(source, mode)
    const css = getCssVariables(source, mode)
    expect(output.tokens.colors.controlBorder).toBe(css['--ui-control-border'])
    expect(output.tokens.colors.border).toBe(source.border)
    expect(output.tokens.colors.controlBorder).not.toBe(source.border)
    expect(getContrastRatio(output.tokens.colors.controlBorder, source.surface)).toBeGreaterThanOrEqual(3)
    expect(output.accessibility.minTouchSize).toBe(48)
  })
})


describe('native shared typography and spacing contract', () => {
  it('converts unitless typography and em tracking to native numbers', () => {
    const output = createNativeThemeExport({ ...defaultTokens, borderWidth: 2, typography: { ...defaultTokens.typography, body: { size: 18, lineHeight: 1.5, weight: 550, letterSpacing: -.02 } } }, 'light')
    expect(output.schemaVersion).toBe(2)
    expect(output.tokens.typography.body).toEqual({ fontSize: 18, lineHeight: 27, fontWeight: '600', letterSpacing: -.36 })
    expect(output.tokens.borderWidth).toBe(2)
    expect(output.tokens.metrics.controlHeight).toEqual({ sm: 32, md: 40, lg: 48 })
  })
  it('resolves shared component padding and margin with the active space unit, preserving zero', () => {
    const tokens = withDensityMetric({ ...defaultTokens, componentSpacing: { button: { padding: { top: { unit: 'space' as const, value: 3 }, bottom: { unit: 'px' as const, value: 0 } }, margin: { left: { unit: 'px' as const, value: 7 } } } } }, 'spacing', 5)
    const output = createNativeThemeExport(tokens, 'light')
    expect(output.tokens.componentSpacing.button).toEqual({ paddingTop: 15, paddingBottom: 0, marginLeft: 7 })
    expect(output.tokens.metrics.spacing).toBe(5)
    expect(output.tokens.space).toBe(5)
  })
})
