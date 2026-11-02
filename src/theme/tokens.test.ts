import { describe, expect, it } from 'vitest';
import {
  createDarkTokens, cssForTokens, defaultTokens, getCssVariables, DEFAULT_PRESET_ID,
  normalizeColor, presets, readableForeground, validateTokens,
  type ThemeTokens,
} from './tokens';

function contrastRatio(first: string, second: string) {
  function relativeLuminance(color: string) {
    const channels = color.slice(1).match(/.{2}/g)!.map((channel) => {
      const value = Number.parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => a - b);
  return (luminances[1] + 0.05) / (luminances[0] + 0.05);
}

describe('token payload validation', () => {
  it.each([null, undefined, false, 17, 'not a theme', [], {}])('recovers safely from malformed saved token data: %j', (input) => {
    expect(validateTokens(input)).toEqual(defaultTokens);
    expect(validateTokens(input)).not.toBe(defaultTokens);
  });

  it('accepts hex shorthand and normalizes casing and whitespace', () => {
    expect(normalizeColor('  #AbC  ')).toBe('#aabbcc');
    expect(normalizeColor('  #B66A45 ')).toBe('#b66a45');
    expect(validateTokens({ primary: '#ABC' }).primary).toBe('#aabbcc');
  });

  it.each(['#12345', '#12345678', 'red', 'rgb(0 0 0)', 'var(--bad)', '#fff; color: red', 123, null])('rejects unsupported or injected color values: %j', (input) => {
    expect(normalizeColor(input)).toBeNull();
    expect(validateTokens({ primary: input }).primary).toBe(defaultTokens.primary);
  });

  it('keeps the supplied theme when individual imported values are invalid', () => {
    const fallback: ThemeTokens = { ...defaultTokens, primary: '#123456', radius: 19, fontFamily: 'serif' };
    const before = structuredClone(fallback);
    const result = validateTokens({ primary: 'url(evil)', radius: Infinity, fontFamily: 'custom', text: '#F0F' }, fallback);

    expect(result).toMatchObject({ primary: '#123456', radius: 19, fontFamily: 'serif', text: '#ff00ff' });
    expect(fallback).toEqual(before);
  });

  it('bounds extreme imported numbers before they reach CSS', () => {
    const result = validateTokens({
      radius: -1_000, spacing: 999, fontSize: 0, controlHeight: 999,
      borderWidth: -5, shadow: 999, duration: -50,
    });

    expect(result).toMatchObject({ radius: 0, density: 'comfortable', spacing: 5, fontSize: 12, controlHeight: 48, borderWidth: 0, shadow: 24, duration: 0 });
  });

  it('ignores non-finite values and numeric strings rather than producing invalid styles', () => {
    const result = validateTokens({
      radius: NaN, spacing: Infinity, fontSize: -Infinity, controlHeight: '42',
      borderWidth: null, shadow: false, duration: '200',
    });
    expect(result).toEqual(defaultTokens);
  });

  it('uses supported step sizes for fractional values', () => {
    expect(validateTokens({ radius: 9.2, borderWidth: 1.7, duration: 164 })).toMatchObject({ radius: 9, borderWidth: 1.5, duration: 160 });
  });

  it('discards unknown properties and preserves valid data through JSON serialization', () => {
    const custom = validateTokens({ ...defaultTokens, primary: '#abc', fontFamily: 'mono', radius: 17, untrusted: 'ignored' });
    const restored = validateTokens(JSON.parse(JSON.stringify(custom)));

    expect(restored).toEqual(custom);
    expect(restored).not.toHaveProperty('untrusted');
    expect(Object.keys(restored).sort()).toEqual(Object.keys(defaultTokens).sort());
  });
});

describe('monochrome brand palettes', () => {
  const neutralKeys = ['background', 'surface', 'text', 'muted', 'border'] as const;

  it('keeps the same neutral light surfaces when the accent preset changes', () => {
    expect(presets.find((preset) => preset.id === DEFAULT_PRESET_ID)?.tokens.primary).toBe(defaultTokens.primary);
    expect(new Set(presets.map((preset) => preset.tokens.accent)).size).toBe(presets.length);
    expect(new Set(presets.map((preset) => preset.tokens.primary)).size).toBe(1);
    for (const preset of presets) {
      for (const key of neutralKeys) expect(preset.tokens[key]).toBe(defaultTokens[key]);
    }
  });

  it('keeps dark surfaces independent of an edited brand accent', () => {
    const neutral = createDarkTokens(defaultTokens);
    for (const primary of ['#ff0000', '#00ff00', '#0000ff']) {
      const dark = createDarkTokens({ ...defaultTokens, primary });
      expect(dark.primary).toBe(primary);
      for (const key of neutralKeys) expect(dark[key]).toBe(neutral[key]);
    }
  });

  it.each(presets)('keeps $name readable in light and dark presentations', (preset) => {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = mode === 'dark' ? createDarkTokens(preset.tokens) : preset.tokens;
      const css = getCssVariables(tokens, mode);
      for (const surface of [tokens.background, tokens.surface]) {
        expect(contrastRatio(tokens.text, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(tokens.muted, surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(css['--ui-focus-ring'], surface)).toBeGreaterThanOrEqual(3);
      }
      expect(contrastRatio(css['--ui-primary-surface-text'], tokens.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(css['--ui-primary-foreground'], tokens.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(css['--ui-accent-foreground'], tokens.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(css['--ui-accent-surface-text'], tokens.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(css['--ui-accent-text'], css['--ui-accent-soft'])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(presets)('keeps empty $name controls identifiable without strengthening decorative dividers', (preset) => {
    for (const mode of ['light', 'dark'] as const) {
      const tokens = mode === 'dark' ? createDarkTokens(preset.tokens) : preset.tokens;
      const css = getCssVariables(tokens, mode);
      expect(css['--ui-border']).toBe(tokens.border);
      expect(css['--ui-control-border']).not.toBe(tokens.border);
      for (const surface of [tokens.surface, tokens.background, css['--ui-input-bg']]) {
        expect(contrastRatio(css['--ui-control-border'], surface)).toBeGreaterThanOrEqual(3);
      }
      for (const state of ['hover', 'pressed'] as const) {
        for (const surface of [tokens.surface, tokens.background, css[`--ui-control-${state}-bg`]]) {
          expect(contrastRatio(css[`--ui-control-${state}-border`], surface)).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it('derives a contrasting control boundary from a custom pale palette without changing the imported colors', () => {
    const tokens = validateTokens({ background: '#fffdfa', surface: '#fffffd', border: '#ffffee', text: '#322f29' });
    const before = structuredClone(tokens);
    const css = getCssVariables(tokens, 'light');
    for (const surface of [tokens.surface, tokens.background, css['--ui-input-bg']]) {
      expect(contrastRatio(css['--ui-control-border'], surface)).toBeGreaterThanOrEqual(3);
    }
    expect(tokens).toEqual(before);
    expect(css['--ui-border']).toBe('#ffffee');
  });

});

describe('mode and exported styles', () => {
  it('uses neutral actions in both modes and separates the coral detail from action colors', () => {
    const dark = createDarkTokens(defaultTokens);
    expect(defaultTokens.primary).toBe('#181818');
    expect(defaultTokens.accent).toBe('#ef543d');
    expect(dark.primary).toBe('#f2f2ed');
    expect(dark.accent).toBe('#f2654e');
    expect(getCssVariables(defaultTokens, 'light')['--ui-card-radius']).toBe('10px');
    expect(getCssVariables(defaultTokens, 'light')['--ui-input-bg']).not.toBe(defaultTokens.surface);
  });
  it('derives dark colors without losing shared geometry, font or motion settings', () => {
    const light = validateTokens({ ...defaultTokens, primary: '#4477aa', radius: 17, density: 'comfortable', fontFamily: 'mono', duration: 230 });
    const before = structuredClone(light);
    const dark = createDarkTokens(light);

    expect(dark).toMatchObject({ primary: '#4477aa', radius: 17, spacing: 5, density: 'comfortable', fontFamily: 'mono', duration: 230 });
    expect(dark.background).not.toBe(light.background);
    expect(contrastRatio(dark.text, dark.background)).toBeGreaterThanOrEqual(4.5);
    expect(light).toEqual(before);
  });

  it.each([...presets.map((preset) => preset.tokens.primary), '#7b7b7b', '#ffffff', '#000000', '#ffff00'])('chooses a readable button foreground for %s', (background) => {
    expect(contrastRatio(background, readableForeground(background))).toBeGreaterThanOrEqual(4.5);
  });

  it('exports browser-ready units and mode-dependent derived values', () => {
    const tokens = validateTokens({ ...defaultTokens, borderWidth: 1.5, duration: 230, shadow: 0 });
    const light = getCssVariables(tokens, 'light');
    const dark = getCssVariables(tokens, 'dark');

    expect(light).toMatchObject({
      '--ui-border-width': '1.5px', '--ui-duration': '230ms',
      '--ui-control-height': '40px', '--ui-font-size': '14px',
      '--ui-space': '4px', '--ui-shadow': 'none', '--ui-color-scheme': 'light',
    });
    expect(dark['--ui-color-scheme']).toBe('dark');
    expect(dark['--ui-primary-hover']).not.toBe(light['--ui-primary-hover']);
    expect(dark['--ui-primary-soft']).not.toBe(light['--ui-primary-soft']);
    expect(Object.values(light).join(' ')).not.toMatch(/undefined|NaN|Infinity/);
  });

  it.each(['light', 'dark'] as const)('keeps exported %s CSS consistent with live variables', (mode) => {
    const tokens = mode === 'dark' ? createDarkTokens(defaultTokens) : defaultTokens;
    const css = cssForTokens(tokens, mode);
    const declarations = Object.fromEntries([...css.matchAll(/^  (--ui-[\w-]+): ([^\n]+);$/gm)].map((match) => [match[1], match[2]]));

    expect(css).toContain(`:root[data-theme="${mode}"]`);
    expect(css).toContain(`color-scheme: ${mode};`);
    expect(declarations).toEqual(getCssVariables(tokens, mode));
  });
});
