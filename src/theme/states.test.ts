import { describe, expect, it } from 'vitest';
import {
  createDarkTokens, cssForTokens, defaultTokens, getContrastRatio, getCssVariables,
  presets, semanticToneOptions, validateTokens,
  type SemanticTone, type ThemeMode,
} from './tokens';

// Keep the contrast oracle independent of the token engine's color adjustment.
function contrast(first: string, second: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((offset) => {
      const value = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const modes = ['light', 'dark'] as const;
const tones: SemanticTone[] = ['success', 'warning', 'info', 'danger'];
const extremeColors = ['#000000', '#ffffff', '#7b7b7b', '#ffff00', '#00ffff', '#ff00ff', '#12abcd'];

function theme(mode: ThemeMode) {
  return mode === 'dark' ? createDarkTokens(defaultTokens) : validateTokens(defaultTokens);
}

describe('semantic color validation and migration', () => {
  it('normalizes valid semantic edits and restores malformed or missing values from the supplied theme', () => {
    const fallback = validateTokens({ success: '#125643', warning: '#987612', info: '#123987', danger: '#982134' });
    const before = structuredClone(fallback);
    const result = validateTokens({ success: '  #AbC ', warning: 'var(--untrusted)', info: null, danger: '#DEF' }, fallback);

    expect(result).toMatchObject({ success: '#aabbcc', warning: '#987612', info: '#123987', danger: '#ddeeff' });
    expect(validateTokens({ success: '#12345', warning: '#11223344', info: 'red' }, fallback)).toEqual(fallback);
    expect(fallback).toEqual(before);
  });

  it.each(modes)('adds %s semantic defaults to legacy tokens without losing existing palette and typography edits', (mode) => {
    const fallback = theme(mode);
    const legacy = { ...fallback, primary: '#654321', danger: '#ab3456', radius: 17 } as Partial<typeof fallback>;
    delete legacy.success;
    delete legacy.warning;
    delete legacy.info;
    const restored = validateTokens(JSON.parse(JSON.stringify(legacy)), fallback);

    expect(restored).toMatchObject({ primary: '#654321', danger: '#ab3456', radius: 17,
      success: fallback.success, warning: fallback.warning, info: fallback.info });
    expect(restored.typography).toEqual(fallback.typography);
    expect(restored.typography).not.toBe(fallback.typography);
    expect(validateTokens(JSON.parse(JSON.stringify(restored)), fallback)).toEqual(restored);
  });

  it('provides all four status meanings and complete preset palettes', () => {
    expect(new Set(semanticToneOptions.map(({ value }) => value))).toEqual(new Set(tones));
    for (const preset of presets) {
      for (const tone of tones) expect(preset.tokens[tone]).toMatch(/^#[\da-f]{6}$/);
    }
  });
});

describe('readable state colors for editable themes', () => {
  it('reports known contrast ratios symmetrically', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBe(21);
    expect(getContrastRatio('#ffffff', '#000000')).toBe(21);
    expect(getContrastRatio('#7b7b7b', '#7b7b7b')).toBe(1);
    expect(getContrastRatio('#356b55', '#ffffff')).toBeCloseTo(contrast('#356b55', '#ffffff'), 8);
  });

  it.each(modes)('keeps separate semantic text readable on %s soft and surface backgrounds for saturated and extreme colors', (mode) => {
    for (const surface of [theme(mode).surface, ...extremeColors]) {
      for (const color of extremeColors) {
        const tokens = validateTokens({ ...theme(mode), surface, success: color, warning: color, info: color, danger: color, primary: color });
        const css = getCssVariables(tokens, mode);
        for (const tone of tones) {
          expect(contrast(css[`--ui-${tone}-text`], css[`--ui-${tone}-soft`]), `${mode} ${tone} on ${surface} from ${color}`).toBeGreaterThanOrEqual(4.5);
          expect(contrast(css[`--ui-${tone}-surface-text`], surface), `${mode} ${tone} directly on ${surface} from ${color}`).toBeGreaterThanOrEqual(4.5);
          expect(contrast(css[`--ui-${tone}-foreground`], color)).toBeGreaterThanOrEqual(4.5);
          expect(css[`--ui-${tone}-border`]).toMatch(/^#[\da-f]{6}$/);
        }
        expect(contrast(css['--ui-primary-soft-text'], css['--ui-primary-soft'])).toBeGreaterThanOrEqual(4.5);
        expect(contrast(css['--ui-primary-surface-text'], surface)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(modes)('uses independent %s text colors when a soft background crosses the near-gray readability threshold', (mode) => {
    const tokens = validateTokens({ ...theme(mode), surface: '#737373', primary: '#ffffff',
      success: '#ffffff', warning: '#ffffff', info: '#ffffff', danger: '#ffffff' });
    const css = getCssVariables(tokens, mode);

    for (const tone of tones) {
      const softText = css[`--ui-${tone}-text`];
      const surfaceText = css[`--ui-${tone}-surface-text`];
      expect(contrast(softText, css[`--ui-${tone}-soft`])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(surfaceText, tokens.surface)).toBeGreaterThanOrEqual(4.5);
      // One foreground cannot satisfy both contexts in this crossover case.
      expect(contrast(softText, tokens.surface)).toBeLessThan(4.5);
      expect(softText).not.toBe(surfaceText);
    }
    expect(contrast(css['--ui-primary-soft-text'], css['--ui-primary-soft'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(css['--ui-primary-surface-text'], tokens.surface)).toBeGreaterThanOrEqual(4.5);
    expect(css['--ui-primary-soft-text']).not.toBe(css['--ui-primary-surface-text']);
  });

  it.each(modes)('chooses a readable %s foreground independently for each filled interaction state', (mode) => {
    for (const color of [...presets.map(({ tokens }) => tokens.primary), ...extremeColors]) {
      const tokens = validateTokens({ ...theme(mode), primary: color, danger: color });
      const css = getCssVariables(tokens, mode);
      for (const tone of ['primary', 'danger'] as const) {
        expect(contrast(css[`--ui-${tone}-foreground`], color)).toBeGreaterThanOrEqual(4.5);
        for (const state of ['hover', 'pressed'] as const) {
          expect(contrast(css[`--ui-${tone}-${state}-foreground`], css[`--ui-${tone}-${state}`]), `${mode} ${tone} ${state} from ${color}`).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(contrast(css['--ui-loading-text'], css['--ui-loading-bg'])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(modes)('keeps focus and error rings visible on %s defaults and equal edited surfaces', (mode) => {
    for (const color of extremeColors) {
      for (const surface of [null, ...extremeColors]) {
        const tokens = validateTokens({ ...theme(mode), primary: color, danger: color,
          ...(surface ? { surface, background: surface } : {}) });
        const css = getCssVariables(tokens, mode);
        for (const name of ['--ui-focus-ring', '--ui-error-ring']) {
          expect(contrast(css[name], tokens.surface), `${name} on ${tokens.surface}`).toBeGreaterThanOrEqual(3);
          expect(contrast(css[name], tokens.background), `${name} on ${tokens.background}`).toBeGreaterThanOrEqual(3);
        }
        expect(css['--ui-ring']).toBe(css['--ui-focus-ring']);
      }
    }
  });

  it.each(modes)('exports the same %s state colors used in live previews without changing saved tokens', (mode) => {
    const tokens = validateTokens({ ...theme(mode), primary: '#ffffff', danger: '#000000', success: '#ffff00', warning: '#7b7b7b', info: '#00ffff' });
    const before = structuredClone(tokens);
    const variables = getCssVariables(tokens, mode);
    const css = cssForTokens(tokens, mode);
    const declarations = Object.fromEntries([...css.matchAll(/^  (--ui-[\w-]+): ([^\n]+);$/gm)].map((match) => [match[1], match[2]]));

    for (const name of [
      '--ui-control-hover-bg', '--ui-control-hover-border', '--ui-control-pressed-bg', '--ui-control-pressed-border',
      '--ui-focus-ring', '--ui-error-ring', '--ui-disabled-bg', '--ui-disabled-text', '--ui-disabled-border',
      '--ui-loading-bg', '--ui-loading-text',
    ]) expect(variables[name]).toMatch(/^#[\da-f]{6}$/);
    expect(declarations).toEqual(variables);
    expect(Object.values(variables).join(' ')).not.toMatch(/NaN|undefined|Infinity/);
    expect(tokens).toEqual(before);
  });
});
