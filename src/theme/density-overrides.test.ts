import { describe, expect, it } from 'vitest';
import {
  applyDensity, applyFontFamily, createComparisonTokens, createDarkTokens, cssForTokens,
  defaultTokens, densityOverrideDefinitions, densityProfiles, getCssVariables,
  resolveDensity, validateTokens, withDensityMetric, type Density, type DensityMetricKey,
} from './tokens';
import { parseThemeState, restoreThemeState } from './useTheme';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

describe('manual density profiles', () => {
  it.each(['compact', 'standard', 'comfortable'] as const)('keeps the original %s defaults and returns independent size groups', (density) => {
    const source = applyDensity(defaultTokens, density);
    const profile = resolveDensity(source);
    expect(profile).toEqual(densityProfiles[density]);
    expect(source.densityOverrides).toEqual({});
    profile.controlHeight.md = 77;
    expect(resolveDensity(source)).toEqual(densityProfiles[density]);
    expect(densityProfiles[density].controlHeight.md).not.toBe(77);
  });

  it.each(['compact', 'standard', 'comfortable'] as const)('preserves calibrated S/M/L ratios when editing %s M values', (density) => {
    let source = applyDensity(defaultTokens, density);
    for (const key of ['controlHeight', 'controlPaddingX', 'iconSize'] as const) {
      const medium = densityProfiles[density][key].md * 1.25;
      source = withDensityMetric(source, key, medium);
      const values = resolveDensity(source)[key];
      for (const size of ['sm', 'md', 'lg'] as const) {
        expect(values[size]).toBe(Number((densityProfiles[density][key][size] * 1.25).toFixed(1)));
      }
      expect(source.densityOverrides[density]?.[key]).toBe(medium);
    }
  });

  it('uses the requested standard height proportions and synchronized compatibility aliases', () => {
    const tokens = withDensityMetric(withDensityMetric(defaultTokens, 'controlHeight', 44), 'spacing', 4.5);
    expect(resolveDensity(tokens).controlHeight).toEqual({ sm: 35.2, md: 44, lg: 52.8 });
    expect(tokens).toMatchObject({ controlHeight: 44, spacing: 4.5 });
    expect(getCssVariables(tokens, 'light')).toMatchObject({
      '--ui-control-height-sm': '35.2px', '--ui-control-height-md': '44px', '--ui-control-height-lg': '52.8px',
      '--ui-control-height': '44px', '--ui-control-size': '44px', '--ui-space': '4.5px', '--ui-spacing': '4.5px',
    });
  });

  it('keeps independently edited scalar gaps and sizes when changing density', () => {
    const edits: Partial<Record<DensityMetricKey, number>> = {
      spacing: 5.5, controlGap: 12.5, checkboxSize: 22.5, fieldGap: 10.5, formGap: 28.5, sectionGap: 44.5, cardPadding: 30.5,
    };
    let standard = validateTokens(defaultTokens);
    for (const [key, value] of Object.entries(edits)) standard = withDensityMetric(standard, key as DensityMetricKey, value);
    const compact = withDensityMetric(applyDensity(standard, 'compact'), 'controlHeight', 36);
    expect(resolveDensity(compact).controlHeight).toEqual({ sm: 31.5, md: 36, lg: 40.5 });
    const restored = applyDensity(compact, 'standard');
    expect(resolveDensity(restored)).toMatchObject(edits);
    expect(restored.densityOverrides.standard).toEqual(edits);
    expect(restored.densityOverrides.compact).toEqual({ controlHeight: 36 });
    expect(getCssVariables(restored, 'dark')).toMatchObject({ '--ui-form-gap': '28.5px', '--ui-card-padding': '30.5px' });
  });

  it('resets only active-profile edits and leaves the other profiles available', () => {
    const standard = withDensityMetric(defaultTokens, 'controlHeight', 44);
    const compact = withDensityMetric(applyDensity(standard, 'compact'), 'formGap', 20);
    const overrides = { ...compact.densityOverrides };
    delete overrides.compact;
    const reset = validateTokens({ ...compact, densityOverrides: overrides }, compact);
    expect(resolveDensity(reset)).toEqual(densityProfiles.compact);
    expect(resolveDensity(reset, 'standard').controlHeight.md).toBe(44);
    expect(reset.densityOverrides).toEqual({ standard: { controlHeight: 44 } });
    expect(withDensityMetric(standard, 'controlHeight', 40).densityOverrides).toEqual({});
  });

  it('validates bounds, fractional edits, malformed groups and unsupported own keys', () => {
    const fallback = withDensityMetric(defaultTokens, 'controlHeight', 44);
    const imported = validateTokens({ densityOverrides: {
      standard: { controlHeight: NaN, controlPaddingX: 999, iconSize: -10, spacing: 4.26, fieldGap: '16', formGap: Infinity, unknown: 99 },
      compact: ['invalid'], comfortable: { cardPadding: 999 }, custom: { controlHeight: 50 },
    } }, fallback);
    expect(imported.densityOverrides).toEqual({
      standard: { controlHeight: 44, controlPaddingX: 32, iconSize: 12, spacing: 4.3 },
      comfortable: { cardPadding: 64 },
    });
    expect(resolveDensity(imported).fieldGap).toBe(densityProfiles.standard.fieldGap);
    expect(withDensityMetric(fallback, 'controlHeight', Infinity).controlHeight).toBe(44);
    for (const value of [null, [], 'bad', false]) expect(validateTokens({ densityOverrides: value }, fallback).densityOverrides).toEqual(fallback.densityOverrides);
    const hostile = JSON.parse('{"standard":{"__proto__":{"polluted":true},"constructor":55,"controlHeight":44},"__proto__":{"controlHeight":99}}');
    expect(validateTokens({ densityOverrides: hostile }).densityOverrides).toEqual({ standard: { controlHeight: 44 } });
    const inherited = Object.create({ standard: { controlHeight: 80 } });
    expect(validateTokens({ densityOverrides: inherited }).densityOverrides).toEqual({});
    expect(Object.values(getCssVariables(imported, 'light')).join(' ')).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('does not mutate the source and isolates overrides in font, mode and comparison variants', () => {
    const source = freeze(withDensityMetric(defaultTokens, 'controlHeight', 44));
    const before = JSON.stringify(source);
    const variants = [
      applyDensity(source, 'compact'), applyFontFamily(source, 'noto-sans'),
      createDarkTokens(source), createComparisonTokens(source, 'pretendard', 'comfortable'), validateTokens({}, source),
    ];
    for (const variant of variants) {
      expect(variant.densityOverrides).toEqual(source.densityOverrides);
      expect(variant.densityOverrides).not.toBe(source.densityOverrides);
      expect(variant.densityOverrides.standard).not.toBe(source.densityOverrides.standard);
      variant.densityOverrides.standard!.controlHeight = 60;
    }
    expect(JSON.stringify(source)).toBe(before);
  });

  it('exports edited geometry identically to live CSS and retains it in JSON', () => {
    const source = withDensityMetric(withDensityMetric(defaultTokens, 'controlHeight', 44), 'cardPadding', 30);
    const restored = validateTokens(JSON.parse(JSON.stringify(source)));
    expect(restored).toEqual(source);
    const css = cssForTokens(source, 'light');
    expect(css).toContain('--ui-control-height-sm: 35.2px;');
    expect(css).toContain('--ui-card-padding: 30px;');
    expect(getCssVariables(restored, 'light')).toEqual(getCssVariables(source, 'light'));
  });
});

describe('version 6 density persistence', () => {
  it('upgrades a saved v5 theme without losing custom colors, typography, or geometry', () => {
    const light = validateTokens({ ...defaultTokens, primary: '#29405a', radius: 17, fontFamily: 'noto-sans', typography: { body: { size: 17 } } });
    const legacyLight = { ...light } as Partial<typeof light>;
    delete legacyLight.densityOverrides;
    const legacyDark = { ...createDarkTokens(light), primary: '#c2d6e7' } as Partial<typeof light>;
    delete legacyDark.densityOverrides;
    const saved = freeze({ schemaVersion: 5, mode: 'dark', presetId: 'custom', themes: { light: legacyLight, dark: legacyDark } });
    const upgraded = restoreThemeState(saved);
    expect(upgraded.schemaVersion).toBe(9);
    expect(upgraded.mode).toBe('dark');
    expect(upgraded.themes.light).toEqual(light);
    expect(upgraded.themes.dark).toMatchObject({ primary: '#c2d6e7', radius: 17, fontFamily: 'noto-sans', densityOverrides: {} });
    expect(upgraded.themes.light.typography.body.size).toBe(17);
  });

  it('shares edited density geometry across modes without sharing nested mutable objects', () => {
    const light = withDensityMetric(withDensityMetric(defaultTokens, 'controlHeight', 44), 'formGap', 28);
    const dark = withDensityMetric(createDarkTokens(defaultTokens), 'controlHeight', 60);
    const parsed = parseThemeState({ schemaVersion: 6, mode: 'dark', presetId: 'oxblood', themes: { light, dark } })!;
    expect(parsed.themes.dark.densityOverrides).toEqual(light.densityOverrides);
    expect(parsed.themes.dark.controlHeight).toBe(44);
    expect(parsed.themes.dark.densityOverrides.standard).not.toBe(parsed.themes.light.densityOverrides.standard);
    expect(parsed.themes.dark.primary).toBe(dark.primary);
    const restored = parseThemeState(JSON.parse(JSON.stringify(parsed)));
    expect(restored).toEqual(parsed);
    parsed.themes.dark.densityOverrides.standard!.controlHeight = 60;
    expect(parsed.themes.light.densityOverrides.standard!.controlHeight).toBe(44);
  });

  it('keeps per-density edits in comparison modes and preserved v6 visits', () => {
    const densities: Density[] = ['compact', 'standard', 'comfortable'];
    let tokens = validateTokens(defaultTokens);
    densities.forEach((density, index) => { tokens = withDensityMetric(applyDensity(tokens, density), 'formGap', 20 + index * 4); });
    const saved = { schemaVersion: 6, mode: 'light', presetId: 'custom', themes: { light: tokens, dark: createDarkTokens(tokens) } };
    const restored = restoreThemeState(JSON.parse(JSON.stringify(saved)));
    densities.forEach((density, index) => {
      const variant = createComparisonTokens(restored.themes.dark, 'noto-sans', density);
      expect(resolveDensity(variant).formGap).toBe(20 + index * 4);
    });
    expect(Object.keys(densityOverrideDefinitions)).toHaveLength(10);
  });
});
