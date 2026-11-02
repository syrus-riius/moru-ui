import { describe, expect, it } from 'vitest';
import { applyColorSchemeState, parseThemeState, restoreThemeState, type ThemeState } from './useTheme';
import { defaultColorSchemeSettings, getSchemeColorPatch } from './color-scheme';
import { colorTokenKeys, createDarkTokens, defaultTokens, getContrastRatio, validateTokens, withDensityMetric } from './tokens';

function currentState(): ThemeState {
  const light = withDensityMetric(validateTokens({ ...defaultTokens, radius: 17, componentSpacing: { button: { padding: { left: { value: 2, unit: 'space' } } } } }), 'cardPadding', 30);
  return { schemaVersion: 9, mode: 'light', presetId: 'custom', themes: { light, dark: createDarkTokens(light) } };
}

describe('color scheme application and saved state', () => {
  it('applies all colors atomically to the current mode without changing geometry or the other palette', () => {
    const state = currentState();
    const before = structuredClone(state);
    const settings = { ...defaultColorSchemeSettings, seed: '#3d42c9', harmony: 'triadic' as const };
    const next = applyColorSchemeState(state, settings, 'all');
    expect(state).toEqual(before);
    expect(next.themes.dark).toBe(state.themes.dark);
    const patch = getSchemeColorPatch(settings, 'light', 'all');
    for (const key of colorTokenKeys) expect(next.themes.light[key]).toBe(patch[key]);
    expect(next.themes.light.radius).toBe(17);
    expect(next.themes.light.densityOverrides).toEqual(state.themes.light.densityOverrides);
    expect(next.themes.light.componentSpacing).toEqual(state.themes.light.componentSpacing);
    expect(next.themes.light.typography).toEqual(state.themes.light.typography);
    expect(next.colorSchemes?.light).toEqual(settings);
  });

  it('can apply foundation colors while preserving deliberate semantic choices', () => {
    const state = currentState();
    const next = applyColorSchemeState(state, { ...defaultColorSchemeSettings, temperature: 'cool' }, 'foundation');
    for (const key of ['success', 'warning', 'info', 'danger'] as const) expect(next.themes.light[key]).toBe(state.themes.light[key]);
    expect(next.themes.light.background).not.toBe(state.themes.light.background);
  });

  it('fits a semantic-only palette to existing custom dark surfaces even when the selected mode is light', () => {
    const state = currentState();
    state.themes.light = validateTokens({ ...state.themes.light, background: '#151515', surface: '#202020' });
    const next = applyColorSchemeState(state, defaultColorSchemeSettings, 'semantic');
    for (const key of ['primary', 'accent', 'background', 'surface', 'text', 'muted', 'border'] as const) expect(next.themes.light[key]).toBe(state.themes.light[key]);
    for (const key of ['success', 'warning', 'info', 'danger'] as const) {
      expect(getContrastRatio(next.themes.light[key], next.themes.light.surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(next.themes.light[key], next.themes.light.background)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('round-trips separate mode settings with the saved actual colors and accepts existing v7 edits', () => {
    const state = currentState();
    const light = applyColorSchemeState(state, { ...defaultColorSchemeSettings, harmony: 'complementary' }, 'all');
    const both = applyColorSchemeState({ ...light, mode: 'dark' }, { ...defaultColorSchemeSettings, seed: '#7a223a', temperature: 'warm' }, 'all');
    expect(restoreThemeState(JSON.parse(JSON.stringify(both)))).toEqual(both);
    expect(both.colorSchemes?.light?.harmony).toBe('complementary');
    expect(both.colorSchemes?.dark?.seed).toBe('#7a223a');
    const old = { ...state, schemaVersion: 7 };
    const restored = restoreThemeState(old);
    expect(restored.schemaVersion).toBe(9);
    expect(restored.themes).toEqual(state.themes);
  });

  it('sanitizes imported generation settings and ignores unrelated or inherited modes', () => {
    const inherited = Object.create({ dark: defaultColorSchemeSettings });
    inherited.light = { seed: 'invalid', harmony: 'unsafe', chroma: Infinity, temperature: 'bad', neutralActions: 'no' };
    const parsed = parseThemeState({ ...currentState(), colorSchemes: inherited })!;
    expect(parsed.colorSchemes?.light).toEqual(defaultColorSchemeSettings);
    expect(parsed.colorSchemes).not.toHaveProperty('dark');
    expect(parsed.themes.light.radius).toBe(17);
  });
});
