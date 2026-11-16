import { describe, expect, it } from 'vitest'
import { applyStylePack } from './style-packs'
import {
  applyDensity,
  applyFontFamily,
  createDarkTokens,
  cssForTokens,
  defaultTokens,
  getContrastRatio,
  getCssVariables,
  resolveFocus,
  validateTokens,
  type FocusStyle,
} from './tokens'

describe('input focus token compatibility', () => {
  it('uses slim focus without materializing optional settings in old JSON', () => {
    expect(resolveFocus()).toEqual({ style: 'slim', width: 1, offset: 0 })
    expect(validateTokens(defaultTokens)).toEqual(defaultTokens)
    expect(validateTokens(defaultTokens)).not.toHaveProperty('focus')
    const css = getCssVariables(defaultTokens, 'light')
    expect(css['--ui-field-focus-width']).toBe('1px')
    expect(css['--ui-field-focus-offset']).toBe('0px')
  })

  it('bounds imported dimensions and rejects CSS injection or unsupported styles', () => {
    expect(
      resolveFocus({ style: 'url(x)', width: Infinity, offset: NaN, color: '#fff; color:red' }),
    ).toEqual(resolveFocus())
    expect(resolveFocus({ style: 'ring', width: 99, offset: -1, color: ' #ABC ' })).toEqual({
      style: 'ring',
      width: 3,
      offset: 0,
      color: '#aabbcc',
    })
    expect(resolveFocus({ width: 0, offset: 20 })).toEqual({
      style: 'slim',
      width: 1,
      offset: 4,
    })
  })

  it('preserves independent focus settings through font, density, dark and JSON changes', () => {
    const source = validateTokens({
      ...defaultTokens,
      focus: { style: 'ring', width: 2, offset: 2.5, color: '#3268b9' },
    })
    const variants = [
      validateTokens(source),
      validateTokens({}, source),
      validateTokens(JSON.parse(JSON.stringify(source))),
      applyDensity(source, 'compact'),
      applyFontFamily(source, 'noto-sans'),
      createDarkTokens(source),
    ]
    for (const variant of variants) {
      expect(variant.focus).toEqual(source.focus)
      expect(variant.focus).not.toBe(source.focus)
    }
    expect(cssForTokens(source, 'light')).toContain('--ui-field-focus-width: 2px;')
    expect(cssForTokens(source, 'light')).toContain('--ui-field-focus-offset: 2.5px;')
  })

  it('does not change button focus or error focus when input focus color is customized', () => {
    const before = getCssVariables(defaultTokens, 'light')
    const after = getCssVariables(
      { ...defaultTokens, focus: { style: 'slim', width: 1, offset: 0, color: '#3268b9' } },
      'light',
    )
    expect(after['--ui-focus-ring']).toBe(before['--ui-focus-ring'])
    expect(after['--ui-field-focus-color']).not.toBe(before['--ui-field-focus-color'])
    for (const name of Object.keys(before).filter((name) => name.startsWith('--ui-field-error-')))
      expect(after[name]).toBe(before[name])
  })

  it.each(['light', 'dark'] as const)(
    'preserves brand and error hues in the %s surface treatment',
    (mode) => {
      const base = mode === 'light' ? defaultTokens : createDarkTokens(defaultTokens)
      const css = getCssVariables(
        { ...base, focus: { style: 'surface', width: 1, offset: 0, color: '#3268b9' } },
        mode,
      )
      const channels = (color: string) =>
        color
          .slice(1)
          .match(/.{2}/g)!
          .map((channel) => Number.parseInt(channel, 16))
      const [brandRed, , brandBlue] = channels(css['--ui-field-focus-bg'])
      const [errorRed, errorGreen, errorBlue] = channels(css['--ui-field-error-focus-bg'])
      expect(brandBlue - brandRed).toBeGreaterThan(40)
      expect(errorRed - errorGreen).toBeGreaterThan(40)
      expect(errorRed - errorBlue).toBeGreaterThan(40)
    },
  )
})

describe.each<FocusStyle>(['slim', 'surface', 'underline', 'ring'])(
  '%s input focus contrast',
  (style) => {
    it.each(['light', 'dark'] as const)(
      'keeps visible indicators and readable text in %s',
      (mode) => {
        const base = mode === 'light' ? defaultTokens : createDarkTokens(defaultTokens)
        for (const pack of ['default', 'glass', 'neon'] as const) {
          const tokens = {
            ...applyStylePack(base, pack),
            borderWidth: 0,
            focus: { style, width: 1, offset: 0, color: '#bbbbbb' },
          }
          const css = getCssVariables(tokens, mode)
          expect(css['--ui-field-focus-width']).toBe(
            style === 'surface' || style === 'underline' ? '0px' : '1px',
          )
          for (const prefix of ['--ui-field-focus', '--ui-field-error-focus']) {
            const background = css[`${prefix}-bg`]
            expect(getContrastRatio(css[`${prefix}-text`], background)).toBeGreaterThanOrEqual(4.5)
            expect(getContrastRatio(css[`${prefix}-muted`], background)).toBeGreaterThanOrEqual(4.5)
            if (style === 'surface') {
              for (const adjacent of [css['--ui-input-bg'], tokens.surface, tokens.background])
                expect(getContrastRatio(background, adjacent)).toBeGreaterThanOrEqual(3)
              expect(css[`${prefix}-border`]).toBe(background)
              expect(css['--ui-field-focus-image']).toBe('none')
            } else {
              for (const adjacent of [background, tokens.surface, tokens.background])
                expect(getContrastRatio(css[`${prefix}-color`], adjacent)).toBeGreaterThanOrEqual(3)
            }
            expect(css[`${prefix}-shadow`]).toBe(
              style === 'underline'
                ? `inset 0 -2px 0 0 ${css[`${prefix}-color`]}`
                : 'inset 0 0 0 0 transparent',
            )
          }
        }
      },
    )
  },
)
