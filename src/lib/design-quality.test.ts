import { describe, expect, it } from 'vitest'
import { auditDesignQuality } from './design-quality'
import { createDarkTokens, defaultTokens } from '../theme/tokens'

describe('token quality checks', () => {
  it('calculates both background pairs instead of treating one color check as full conformance', () => {
    const checks = auditDesignQuality({ ...defaultTokens, surface: '#ffffff', background: '#171717' }, 'light')
    expect(checks.find((item) => item.id === 'body-surface')?.passes).toBe(true)
    expect(checks.find((item) => item.id === 'body-background')?.passes).toBe(false)
  })
  it('flags low-contrast helper text and tightly packed or reversed groups', () => {
    const checks = auditDesignQuality({ ...defaultTokens, muted: '#dddddd', densityOverrides: { standard: { fieldGap: 24, formGap: 8, sectionGap: 8 } } }, 'light')
    expect(checks.find((item) => item.id === 'muted-surface')?.passes).toBe(false)
    expect(checks.find((item) => item.id === 'group-rhythm')?.passes).toBe(false)
  })
  it('keeps readability recommendations separate from WCAG color thresholds', () => {
    const checks = auditDesignQuality({ ...defaultTokens, typography: { ...defaultTokens.typography, body: { ...defaultTokens.typography.body, lineHeight: 1.2, letterSpacing: -0.04 } } }, 'light')
    expect(checks.find((item) => item.id === 'body-rhythm')).toMatchObject({ passes: false, kind: 'guidance' })
    expect(checks.find((item) => item.id === 'primary')).toMatchObject({ passes: true, kind: 'contrast' })
  })
  it('provides finite color ratios in both modes', () => {
    for (const [tokens, mode] of [[defaultTokens, 'light'], [createDarkTokens(defaultTokens), 'dark']] as const) {
      expect(auditDesignQuality(tokens, mode).filter((item) => item.kind === 'contrast').every((item) => !item.value.includes('NaN'))).toBe(true)
    }
  })
  it('does not claim a visible boundary when its border has been removed', () => {
    expect(auditDesignQuality({ ...defaultTokens, borderWidth: 0 }, 'light').find((item) => item.id === 'field-boundary')).toMatchObject({ passes: false, value: '테두리 없음' })
  })
})
