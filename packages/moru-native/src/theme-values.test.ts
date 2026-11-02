import { describe, expect, it } from 'vitest'
import { nativeDensityProfiles, resolveNativeComponentSpacing, resolveNativeControlBorder, resolveNativeMetrics, resolveNativeTypography } from './theme-values'

describe('native shared token resolution', () => {
  it('accepts the optional control boundary and falls back for legacy theme colors', () => {
    const legacy = { border: '#dededb' }
    const current = { ...legacy, controlBorder: '#898987' }
    expect(resolveNativeControlBorder(legacy)).toBe('#dededb')
    expect(resolveNativeControlBorder(current)).toBe('#898987')
    expect(resolveNativeControlBorder({ ...legacy, controlBorder: '' })).toBe('#dededb')
    expect(current).toEqual({ border: '#dededb', controlBorder: '#898987' })
  })
  it('preserves unedited size metrics and does not mutate density defaults', () => {
    const before = structuredClone(nativeDensityProfiles)
    const result = resolveNativeMetrics('comfortable', { controlHeight: { md: 72 }, cardPadding: 18 }, 6)
    expect(result.controlHeight).toEqual({ sm: 40, md: 72, lg: 56 })
    expect(result.controlPaddingX).toEqual({ sm: 14, md: 18, lg: 22 })
    expect(result.cardPadding).toBe(18)
    expect(result.spacing).toBe(6)
    expect(nativeDensityProfiles).toEqual(before)
    result.controlHeight.sm = 99
    expect(nativeDensityProfiles.comfortable.controlHeight.sm).toBe(40)
  })
  it('bounds malformed numbers while keeping zero-valued borders and spacing meaningful', () => {
    const metrics = resolveNativeMetrics('standard', { cardPadding: 0, controlGap: Infinity, controlHeight: { md: -20 } })
    expect(metrics.cardPadding).toBe(0)
    expect(metrics.controlGap).toBe(8)
    expect(metrics.controlHeight.md).toBe(24)
    expect(resolveNativeMetrics('standard', undefined, NaN).spacing).toBe(4)
  })
  it('merges role styles and keeps line heights readable for large shared text', () => {
    const result = resolveNativeTypography({ body: { fontSize: 48, lineHeight: 12 }, caption: { fontSize: NaN } }, 'RegisteredFont')
    expect(result.body.fontSize).toBe(48)
    expect(result.body.lineHeight).toBe(48)
    expect(result.heading.fontSize).toBe(22)
    expect(result.caption.fontSize).toBe(12)
    expect(result.body.fontFamily).toBe('RegisteredFont')
    expect(resolveNativeTypography().body).not.toHaveProperty('fontFamily')
  })
  it('accepts only finite spacing sides and never admits arbitrary style properties', () => {
    const result = resolveNativeComponentSpacing({ button: { paddingTop: 0, paddingLeft: 900, marginTop: -900, marginRight: NaN, opacity: 0 } as never })
    expect(result.button).toEqual({ paddingTop: 0, paddingLeft: 160, marginTop: -160 })
    expect(result.button).not.toHaveProperty('opacity')
  })
})
