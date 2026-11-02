import { describe, expect, it } from 'vitest';
import { applyDensity, colorTokenKeys, createDarkTokens, defaultTokens, DEFAULT_PRESET_ID, validateTokens, type ThemeMode } from './tokens';
import { parseThemeState, restoreThemeState } from './useTheme';

function savedState(schemaVersion: number, mode: ThemeMode = 'dark') {
  const light = validateTokens({
    ...applyDensity(defaultTokens, 'compact'),
    primary: '#356b55', accent: '#7343bc', background: '#f5f6f3', surface: '#fdfefc', text: '#202920', muted: '#778078', border: '#e1e5df',
    success: '#1c6b45', warning: '#946015', danger: '#a33545', info: '#246ca3',
    fontFamily: 'noto-sans', radius: 17, borderWidth: 1.5, shadow: 15, duration: 230,
    typography: { ...defaultTokens.typography, body: { size: 23, lineHeight: 1.9, weight: 450, letterSpacing: -.02 } },
  });
  const dark = validateTokens({
    ...createDarkTokens(light),
    primary: '#badcfe', accent: '#c3a7ea', background: '#151a1b', surface: '#1f2827', text: '#edf1ec', muted: '#a1afa4', border: '#354139',
    success: '#89d4aa', warning: '#ebbd69', danger: '#ef8191', info: '#a9c7eb',
  });
  return { schemaVersion, mode, presetId: 'custom', themes: { light, dark } };
}

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

describe('stored studio design migration', () => {
  for (const version of [1, 2, 3, 4] as const) {
    it.each(['light', 'dark'] as const)(`applies the complete new design once to v${version}, retaining %s mode`, (mode) => {
      const saved = savedState(version, mode);
      const before = structuredClone(saved);
      freeze(saved);
      const migrated = restoreThemeState(saved);

      expect(migrated).toEqual({
        schemaVersion: 9, mode, presetId: DEFAULT_PRESET_ID,
        themes: { light: defaultTokens, dark: createDarkTokens(defaultTokens) },
      });
      expect(saved).toEqual(before);
      expect(migrated.themes.light.typography).not.toBe(defaultTokens.typography);
    });
  }

  it('keeps a current-version custom theme without applying defaults again', () => {
    const saved = freeze(savedState(9));
    const restored = restoreThemeState(saved);
    expect(restored).toEqual(saved);
    expect(restored).not.toBe(saved);
    expect(restored.themes.light).not.toBe(saved.themes.light);
    expect(restored.themes.dark.typography.body).not.toBe(saved.themes.dark.typography.body);
  });

  it.each([5, 6, 7, 8])('migrates only the border width of a v%s stored theme, retaining both palettes and layout', (version) => {
    const saved = savedState(version);
    saved.themes.light.densityOverrides = { compact: { cardPadding: 30, formGap: 23 } };
    saved.themes.dark.densityOverrides = saved.themes.light.densityOverrides;
    saved.themes.light.componentSpacing = { button: { margin: { top: { unit: 'px', value: 7 } } } };
    saved.themes.dark.componentSpacing = saved.themes.light.componentSpacing;
    const before = structuredClone(saved);
    freeze(saved);
    const migrated = restoreThemeState(saved);

    expect(migrated).toEqual({
      ...saved, schemaVersion: 9,
      themes: {
        light: { ...saved.themes.light, borderWidth: 0 },
        dark: { ...saved.themes.dark, borderWidth: 0 },
      },
    });
    expect(saved).toEqual(before);
  });

  it('retains a border width edited after migration on every subsequent visit', () => {
    const migrated = restoreThemeState(savedState(8));
    migrated.themes.light.borderWidth = 2;
    migrated.themes.dark.borderWidth = 2;
    const restored = restoreThemeState(JSON.parse(JSON.stringify(migrated)));
    expect(restored).toEqual(migrated);
    expect(restored.themes.light.borderWidth).toBe(2);
    expect(restored.themes.dark.borderWidth).toBe(2);
  });

  it('retains edits made after the one-time design update on subsequent visits', () => {
    const migrated = restoreThemeState(savedState(4));
    migrated.presetId = 'oxblood';
    migrated.themes.light.accent = '#7a223a';
    migrated.themes.dark.accent = '#7a223a';
    migrated.themes.light.radius = 12;
    migrated.themes.dark.radius = 12;
    const restored = restoreThemeState(JSON.parse(JSON.stringify(migrated)));
    expect(restored).toEqual(migrated);
    expect(restored.presetId).toBe('oxblood');
  });
});

describe('explicit theme file parsing', () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9])('retains a v%s file palette and geometry instead of applying the stored-design migration', (version) => {
    const saved = freeze(savedState(version));
    const parsed = parseThemeState(saved)!;
    expect(parsed).toEqual({ ...saved, schemaVersion: 9 });
    expect(parsed.themes.light.typography).not.toBe(saved.themes.light.typography);
  });

  it('keeps an explicitly imported v8 border when the imported state is stored and restored', () => {
    const imported = parseThemeState(freeze(savedState(8)))!;
    expect(imported.schemaVersion).toBe(9);
    expect(imported.themes.light.borderWidth).toBe(1.5);
    expect(imported.themes.dark.borderWidth).toBe(1.5);
    expect(restoreThemeState(JSON.parse(JSON.stringify(imported)))).toEqual(imported);
  });

  it('supplies the new accent for a legacy file without changing existing color and shape choices', () => {
    const saved = savedState(4, 'light');
    const light = { ...saved.themes.light } as Partial<typeof saved.themes.light>;
    const dark = { ...saved.themes.dark } as Partial<typeof saved.themes.dark>;
    delete light.accent;
    delete dark.accent;
    const imported = parseThemeState({ ...saved, themes: { light, dark } })!;
    for (const mode of ['light', 'dark'] as const) {
      for (const key of colorTokenKeys.filter((key) => key !== 'accent')) expect(imported.themes[mode][key]).toBe(saved.themes[mode][key]);
      expect(imported.themes[mode].radius).toBe(saved.themes[mode].radius);
      expect(imported.themes[mode].typography).toEqual(saved.themes[mode].typography);
    }
    expect(imported.themes.light.accent).toBe(defaultTokens.accent);
    expect(imported.themes.dark.accent).toBe(createDarkTokens(defaultTokens).accent);
  });

  it.each([
    null, undefined, false, 'invalid', [], {},
    { schemaVersion: 8, mode: 'light', themes: {} },
    { schemaVersion: 3, mode: 'sepia', themes: {} },
    { schemaVersion: 3, mode: 'light', themes: { light: defaultTokens } },
  ])('rejects an invalid envelope and restores a fresh current default for %j', (value) => {
    expect(parseThemeState(value)).toBeNull();
    const restored = restoreThemeState(value);
    expect(restored).toEqual({ schemaVersion: 9, mode: 'light', presetId: DEFAULT_PRESET_ID, themes: { light: defaultTokens, dark: createDarkTokens(defaultTokens) } });
    expect(restored.themes.light).not.toBe(defaultTokens);
    expect(restored.themes.light.typography).not.toBe(defaultTokens.typography);
  });

  it('sanitizes invalid individual token values while keeping valid imported edits', () => {
    const saved = savedState(5);
    const parsed = parseThemeState({ ...saved, themes: { ...saved.themes, light: { ...saved.themes.light, primary: 'url(unsafe)', accent: 'url(unsafe)', radius: Infinity, text: '#123456' } } })!;
    expect(parsed.themes.light.primary).toBe(defaultTokens.primary);
    expect(parsed.themes.light.accent).toBe(defaultTokens.accent);
    expect(parsed.themes.light.radius).toBe(defaultTokens.radius);
    expect(parsed.themes.light.text).toBe('#123456');
    expect(parsed.themes.light.success).toBe(saved.themes.light.success);
  });
});
