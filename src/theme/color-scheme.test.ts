import { describe, expect, it } from 'vitest';
import {
  auditColorPairs, defaultColorSchemeSettings, generateColorScheme, getSchemeColorPatch,
  harmonyOptions, hexToOklch, normalizeColorSchemeSettings, oklchToHex,
  type ColorHarmony, type ColorSchemeSettings,
} from './color-scheme';
import { defaultTokens, getContrastRatio } from './tokens';

describe('OKLCH color conversion', () => {
  it.each(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ef543d', '#7a223a', '#3d42c9', '#808080'])('round-trips the sRGB color %s without a visible channel shift', (hex) => {
    const { l, c, h } = hexToOklch(hex);
    expect(Number.isFinite(l + c + h)).toBe(true);
    expect(oklchToHex(l, c, h)).toBe(hex);
  });

  it('matches reference OKLab values for sRGB primaries and endpoints', () => {
    expect(hexToOklch('#ffffff')).toMatchObject({ c: 0, h: 0 });
    expect(hexToOklch('#ffffff').l).toBeCloseTo(1, 6);
    expect(hexToOklch('#000000')).toEqual({ l: 0, c: 0, h: 0 });
    const red = hexToOklch('#ff0000');
    expect(red.l).toBeCloseTo(.627955, 5);
    expect(red.c).toBeCloseTo(.257683, 5);
    expect(red.h).toBeCloseTo(29.2339, 3);
  });

  it('reduces out-of-gamut chroma while preserving requested lightness and hue', () => {
    for (const hue of [0, 40, 80, 120, 180, 240, 300, 359]) {
      const color = oklchToHex(.7, .4, hue);
      expect(color).toMatch(/^#[\da-f]{6}$/);
      const converted = hexToOklch(color);
      expect(converted.l).toBeCloseTo(.7, 2);
      expect(converted.c).toBeLessThan(.4);
      const hueDistance = Math.abs(((converted.h - hue + 540) % 360) - 180);
      expect(hueDistance).toBeLessThan(1);
    }
  });

  it('wraps hue angles and sanitizes non-finite converter inputs', () => {
    expect(oklchToHex(.6, .1, -30)).toBe(oklchToHex(.6, .1, 330));
    expect(oklchToHex(.6, .1, 720)).toBe(oklchToHex(.6, .1, 0));
    expect(oklchToHex(-1, 10, Infinity)).toBe('#000000');
    expect(oklchToHex(2, 10, NaN)).toBe('#ffffff');
    expect(oklchToHex(NaN, Infinity, NaN)).toBe('#000000');
    expect(hexToOklch('not a color')).toEqual({ l: 0, c: 0, h: 0 });
    expect(hexToOklch('#ABC')).toEqual(hexToOklch('#aabbcc'));
  });
});

describe('saved color scheme settings', () => {
  it.each([null, undefined, false, 7, [], 'bad'])('recovers invalid payload %j as a fresh default', (value) => {
    const parsed = normalizeColorSchemeSettings(value);
    expect(parsed).toEqual(defaultColorSchemeSettings);
    expect(parsed).not.toBe(defaultColorSchemeSettings);
  });

  it('accepts supported own values, bounds chroma, and rejects malformed fields', () => {
    expect(normalizeColorSchemeSettings({ seed: ' #ABC ', harmony: 'triadic', chroma: 10, temperature: 'warm', neutralActions: false })).toEqual({
      seed: '#aabbcc', harmony: 'triadic', chroma: .3, temperature: 'warm', neutralActions: false,
    });
    const fallback: ColorSchemeSettings = { seed: '#123456', harmony: 'split', chroma: .08, temperature: 'brand', neutralActions: false };
    expect(normalizeColorSchemeSettings({ seed: 'url(evil)', harmony: 'constructor', chroma: NaN, temperature: '__proto__', neutralActions: 'true' }, fallback)).toEqual(fallback);
    expect(normalizeColorSchemeSettings({ chroma: -1 }).chroma).toBe(0);
  });

  it('ignores inherited editor settings and leaves supplied data unchanged', () => {
    const inherited = Object.create({ seed: '#00ff00', harmony: 'triadic', chroma: .3, temperature: 'warm', neutralActions: false });
    expect(normalizeColorSchemeSettings(inherited)).toEqual(defaultColorSchemeSettings);
    expect(normalizeColorSchemeSettings(undefined, inherited)).toEqual(defaultColorSchemeSettings);
    const supplied = { ...defaultColorSchemeSettings, seed: '#AABBCC' };
    const before = structuredClone(supplied);
    normalizeColorSchemeSettings(supplied);
    generateColorScheme(supplied, 'light');
    expect(supplied).toEqual(before);
  });
});

describe('coherent generated schemes', () => {
  it.each(harmonyOptions)('uses the expected hue relationships for $value', ({ value, angles }) => {
    const settings = { ...defaultColorSchemeSettings, harmony: value };
    const result = generateColorScheme(settings, 'light');
    const hue = hexToOklch(settings.seed).h;
    expect(result.harmony).toHaveLength(angles.length);
    result.harmony.forEach((color, index) => {
      expect(color.hue).toBeCloseTo(((hue + angles[index]) % 360 + 360) % 360, 7);
      expect(color.color).toMatch(/^#[\da-f]{6}$/);
    });
  });

  it('keeps monochrome actions independent from point color until deliberately colored', () => {
    const blue = generateColorScheme({ ...defaultColorSchemeSettings, seed: '#3d42c9' }, 'light');
    const red = generateColorScheme({ ...defaultColorSchemeSettings, seed: '#7a223a' }, 'light');
    expect(blue.colors.primary).toBe(red.colors.primary);
    expect(blue.colors.accent).not.toBe(red.colors.accent);
    expect(blue.colors.background).toBe(red.colors.background);
    const complementary = generateColorScheme({ ...defaultColorSchemeSettings, harmony: 'complementary', neutralActions: false }, 'light');
    expect(complementary.colors.primary).toBe(complementary.harmony[1].color);
  });

  it('preserves dark-red seed lightness in both modes instead of silently lightening the brand', () => {
    const seed = '#7a223a';
    const before = hexToOklch(seed);
    for (const mode of ['light', 'dark'] as const) {
      const result = generateColorScheme({ ...defaultColorSchemeSettings, seed, chroma: before.c, harmony: 'triadic' }, mode);
      expect(result.colors.accent).toBe(seed);
      for (const color of result.harmony) expect(hexToOklch(color.color).l).toBeCloseTo(before.l, 2);
    }
  });

  it('keeps gray seeds achromatic and creates ordered ramps in either mode', () => {
    for (const mode of ['light', 'dark'] as const) {
      const result = generateColorScheme({ ...defaultColorSchemeSettings, seed: '#808080', harmony: 'triadic' }, mode);
      expect(hexToOklch(result.colors.accent).c).toBe(0);
      for (const ramp of [result.neutralRamp, result.accentRamp]) {
        expect(ramp.map(({ step }) => step)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
        for (let index = 1; index < ramp.length; index++) expect(hexToOklch(ramp[index - 1].color).l).toBeGreaterThan(hexToOklch(ramp[index].color).l);
      }
    }
  });

  it('changes neutral undertone without adding an accidental hue to the neutral option', () => {
    const gray = generateColorScheme(defaultColorSchemeSettings, 'light');
    const warm = generateColorScheme({ ...defaultColorSchemeSettings, temperature: 'warm' }, 'light');
    const cool = generateColorScheme({ ...defaultColorSchemeSettings, temperature: 'cool' }, 'light');
    expect(hexToOklch(gray.colors.background).c).toBe(0);
    expect(warm.colors.background).not.toBe(cool.colors.background);
    expect(hexToOklch(warm.colors.background).h).toBeGreaterThan(40);
    expect(hexToOklch(cool.colors.background).h).toBeGreaterThan(200);
  });

  it('meets the measured 4.5 text-pair threshold across modes, harmonies, and extreme seeds', () => {
    for (const mode of ['light', 'dark'] as const) for (const seed of ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ef543d']) for (const harmony of ['mono', 'analogous', 'complementary', 'split', 'triadic'] satisfies ColorHarmony[]) {
      const { colors } = generateColorScheme({ ...defaultColorSchemeSettings, seed, harmony, chroma: .3, temperature: 'brand', neutralActions: false }, mode);
      for (const check of auditColorPairs(colors)) {
        if (check.id !== 'accent-surface') {
          expect(check.ratio, `${mode}/${seed}/${harmony}/${check.id}`).toBeGreaterThanOrEqual(4.5);
          expect(check.pass).toBe(true);
        } else expect(check.pass).toBe(check.ratio >= check.minimum);
        expect(check.ratio).toBeCloseTo(getContrastRatio(check.foreground, check.background), 10);
      }
      for (const foreground of [colors.text, colors.muted, colors.success, colors.warning, colors.info, colors.danger]) {
        expect(getContrastRatio(foreground, colors.background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('retains recognizable semantic hues for all palette relationships', () => {
    for (const mode of ['light', 'dark'] as const) {
      const { colors } = generateColorScheme({ ...defaultColorSchemeSettings, seed: '#ffff00', harmony: 'triadic', chroma: .3 }, mode);
      for (const [key, lower, upper] of [['success', 130, 170], ['warning', 65, 95], ['info', 240, 270], ['danger', 10, 40]] as const) {
        expect(hexToOklch(colors[key]).h).toBeGreaterThan(lower);
        expect(hexToOklch(colors[key]).h).toBeLessThan(upper);
      }
    }
  });

  it('only supplies the requested color roles and never changes structural tokens', () => {
    expect(Object.keys(getSchemeColorPatch(defaultColorSchemeSettings, 'light', 'foundation')).sort()).toEqual(['accent', 'background', 'border', 'muted', 'primary', 'surface', 'text']);
    expect(Object.keys(getSchemeColorPatch(defaultColorSchemeSettings, 'dark', 'semantic')).sort()).toEqual(['danger', 'info', 'success', 'warning']);
    expect(Object.keys(getSchemeColorPatch(defaultColorSchemeSettings, 'light', 'all'))).toHaveLength(11);
    expect(getSchemeColorPatch(defaultColorSchemeSettings, 'light', 'all')).not.toHaveProperty('radius');
  });

  it('fits semantic-only changes against the actual edited surfaces, including opposite-mode surfaces', () => {
    for (const mode of ['light', 'dark'] as const) for (const surfaces of [
      { surface: '#ffffff', background: '#eeeeee' },
      { surface: '#13162a', background: '#000000' },
      { surface: '#ffffff', background: '#000000' },
    ]) {
      const patch = getSchemeColorPatch(defaultColorSchemeSettings, mode, 'semantic', surfaces);
      expect(Object.keys(patch).sort()).toEqual(['danger', 'info', 'success', 'warning']);
      for (const color of Object.values(patch)) {
        expect(getContrastRatio(color, surfaces.surface)).toBeGreaterThanOrEqual(4.5);
        expect(getContrastRatio(color, surfaces.background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('reports individual failed text pairs truthfully for custom palettes', () => {
    const custom = { ...defaultTokens, text: '#eeeeee', surface: '#ffffff', muted: '#aaaaaa' };
    const checks = auditColorPairs(custom);
    expect(checks).toHaveLength(10);
    expect(checks.find(({ id }) => id === 'text-surface')?.pass).toBe(false);
    expect(checks.find(({ id }) => id === 'muted-surface')?.pass).toBe(false);
    expect(checks.find(({ id }) => id === 'primary')?.pass).toBe(true);
    expect(checks.every(({ minimum }) => minimum === 4.5)).toBe(true);
  });

  it('flags point text independently from the readable text on a point-color fill', () => {
    const checks = auditColorPairs({ ...defaultTokens, accent: '#ffff00', surface: '#ffffff' });
    expect(checks.find(({ id }) => id === 'accent')?.pass).toBe(true);
    expect(checks.find(({ id }) => id === 'accent-surface')?.pass).toBe(false);
  });
});
