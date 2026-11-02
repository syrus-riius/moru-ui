import { describe, expect, it } from 'vitest';
import {
  applyDensity, applyFontFamily, createComparisonTokens, createDarkTokens,
  defaultTokens, fontFamilies, getCssVariables, getTypographyProfile, validateTokens,
  type Density, type FontFamily, type ThemeMode,
} from './tokens';

describe('role typography validation and migration', () => {
  it('merges a partial role payload without discarding other edited roles or sharing nested state', () => {
    const fallback = validateTokens({ typography: { heading: { size: 26 }, body: { lineHeight: 1.85 } } });
    const before = structuredClone(fallback);
    const result = validateTokens({
      typography: { body: { size: 16, weight: 600 }, caption: null, heading: ['invalid'], unknown: { size: 99 } },
    }, fallback);

    expect(result.typography.body).toEqual({ ...before.typography.body, size: 16, weight: 600 });
    expect(result.typography.heading).toEqual(before.typography.heading);
    expect(result.typography.caption).toEqual(before.typography.caption);
    expect(result.typography).not.toHaveProperty('unknown');
    result.typography.heading.size = 40;
    result.typography.caption.lineHeight = 2;
    expect(fallback).toEqual(before);
  });

  it('rejects numeric strings, non-finite numbers and CSS fragments inside imported roles', () => {
    const result = validateTokens({
      typography: {
        body: { size: '16', weight: NaN, lineHeight: Infinity, letterSpacing: '0; color: red' },
        label: { size: null, weight: false, lineHeight: -Infinity },
      },
    });

    expect(result.typography).toEqual(defaultTokens.typography);
    expect(result.typography).not.toBe(defaultTokens.typography);
    expect(result.typography.body).not.toBe(defaultTokens.typography.body);
    expect(Object.values(getCssVariables(result, 'light')).join(' ')).not.toMatch(/NaN|Infinity|undefined|color: red/);
  });

  it('clamps extreme role values and rounds fractional edits to stable CSS values', () => {
    const result = validateTokens({ typography: {
      display: { size: 999, weight: 999, lineHeight: 999, letterSpacing: 999 },
      caption: { size: -999, weight: -999, lineHeight: -999, letterSpacing: -999 },
      body: { size: 15.3, weight: 576, lineHeight: 1.67, letterSpacing: -0.012 },
    } });

    expect(result.typography.display).toEqual({ size: 64, weight: 800, lineHeight: 2.2, letterSpacing: 0.12 });
    expect(result.typography.caption).toEqual({ size: 12, weight: 300, lineHeight: 1.1, letterSpacing: -0.06 });
    expect(result.typography.body).toEqual({ size: 15, weight: 600, lineHeight: 1.65, letterSpacing: -0.01 });
  });

  it.each([
    [30, 'compact', 32, 3], [38, 'standard', 40, 4], [52, 'comfortable', 48, 5],
  ] as const)('migrates v1 height %i to a coherent %s density', (oldHeight, density, height, spacing) => {
    const result = validateTokens({ controlHeight: oldHeight, spacing: 7, fontSize: 16, fontFamily: 'noto-sans', primary: '#abc' });

    expect(result).toMatchObject({ density, controlHeight: height, spacing, fontSize: 16, fontFamily: 'noto-sans', primary: '#aabbcc' });
    expect(result.typography.body).toMatchObject({ size: 16, lineHeight: 1.7 });
  });

  it('prefers explicit new roles and density over compatibility aliases', () => {
    const result = validateTokens({
      fontSize: 18, controlHeight: 56, spacing: 8, density: 'compact',
      typography: { body: { size: 15 } },
    });
    expect(result).toMatchObject({ fontSize: 15, density: 'compact', controlHeight: 32, spacing: 3 });
  });

  it('validates font and density names against own supported keys', () => {
    const fallback = applyDensity(applyFontFamily(defaultTokens, 'pretendard'), 'comfortable');
    for (const invalid of ['custom', '__proto__', 'constructor', 1, null]) {
      expect(validateTokens({ fontFamily: invalid, density: invalid, controlHeight: 30 }, fallback)).toMatchObject({
        fontFamily: 'pretendard', density: 'comfortable', controlHeight: 48,
      });
    }
    for (const fontFamily of ['sans', 'serif', 'mono', 'noto-sans', 'pretendard'] as const) {
      expect(validateTokens({ fontFamily }).fontFamily).toBe(fontFamily);
    }
  });
});

describe('independent font, density and mode composition', () => {
  it('recalibrates fonts while retaining manual role adjustments and allowing a round trip', () => {
    const source = validateTokens({
      typography: { body: { size: 16, lineHeight: 1.8 }, heading: { weight: 650 } },
    }, applyFontFamily(defaultTokens, 'pretendard'));
    const before = structuredClone(source);
    const noto = applyFontFamily(source, 'noto-sans');

    expect(noto.typography.body).toMatchObject({ size: 16, lineHeight: 1.9 });
    expect(noto.typography.heading.weight).toBe(650);
    expect(applyFontFamily(noto, 'pretendard')).toEqual(before);
    expect(source).toEqual(before);
    const profile = getTypographyProfile('noto-sans');
    profile.body.lineHeight = 2;
    expect(getTypographyProfile('noto-sans').body.lineHeight).toBe(1.7);
  });

  it('changes coherent geometry without altering typography or linking its editable objects', () => {
    const source = validateTokens({ typography: { heading: { size: 24 }, body: { size: 16 } } });
    const before = structuredClone(source);
    const compact = applyDensity(source, 'compact');
    const comfortable = applyDensity(source, 'comfortable');

    expect(compact.typography).toEqual(source.typography);
    expect(comfortable.typography).toEqual(source.typography);
    expect(compact.controlHeight).toBeLessThan(comfortable.controlHeight);
    expect(compact.spacing).toBeLessThan(comfortable.spacing);
    compact.typography.heading.size = 64;
    expect(source).toEqual(before);
    expect(comfortable.typography.heading.size).toBe(24);
  });

  it('serializes typography units and coherent size, icon and form geometry', () => {
    const tokens = applyDensity(validateTokens({ typography: { body: { size: 16, lineHeight: 1.75, weight: 450, letterSpacing: 0.015 } } }), 'comfortable');
    const css = getCssVariables(tokens, 'light');

    expect(css).toMatchObject({
      '--ui-type-body-size': '16px', '--ui-type-body-line-height': '1.75',
      '--ui-type-body-weight': '450', '--ui-type-body-letter-spacing': '0.015em',
      '--ui-font-size': '16px', '--ui-font-family-code': fontFamilies.mono,
      '--ui-density': 'comfortable', '--ui-control-height-sm': '40px',
      '--ui-control-height-md': '48px', '--ui-control-height-lg': '56px',
      '--ui-control-height': '48px', '--ui-control-padding-x-md': '18px',
      '--ui-icon-size-md': '18px', '--ui-field-gap': '10px', '--ui-form-gap': '32px',
    });
  });

  it('builds all 12 comparison variants without changing the source or sibling variants', () => {
    const source = validateTokens({ primary: '#6c4b91', typography: { body: { size: 16 } } });
    const before = structuredClone(source);
    const variants: { tokens: typeof source; css: Record<string, string>; font: FontFamily; density: Density; mode: ThemeMode }[] = [];
    for (const font of ['pretendard', 'noto-sans'] as const) {
      for (const density of ['compact', 'standard', 'comfortable'] as const) {
        for (const mode of ['light', 'dark'] as const) {
          const base = mode === 'dark' ? createDarkTokens(source) : source;
          const tokens = createComparisonTokens(base, font, density);
          variants.push({ tokens, css: getCssVariables(tokens, mode), font, density, mode });
        }
      }
    }

    expect(new Set(variants.map(({ css }) => JSON.stringify(css))).size).toBe(12);
    for (const { tokens, css, font, density, mode } of variants) {
      expect(tokens).toMatchObject({ fontFamily: font, density, primary: '#6c4b91' });
      expect(tokens.typography.body.size).toBe(16);
      expect(css['--ui-font-family']).toBe(fontFamilies[font]);
      expect(css['--ui-color-scheme']).toBe(mode);
    }
    variants[0].tokens.typography.body.size = 32;
    expect(variants.slice(1).every(({ tokens }) => tokens.typography.body.size === 16)).toBe(true);
    expect(source).toEqual(before);
  });
});
