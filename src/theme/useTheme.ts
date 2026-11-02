import { useCallback, useEffect, useLayoutEffect, useRef, useState, type SetStateAction } from 'react';
import { getComponentSpacingCss } from './component-spacing';
import { getSchemeColorPatch, normalizeColorSchemeSettings, type ColorSchemeSettings } from './color-scheme';
import {
  applyDensity, applyFontFamily, colorTokenKeys, createDarkTokens, cssForTokens, defaultTokens, DEFAULT_PRESET_ID, getCssVariables, normalizeColor, presets, readableForeground, validateTokens,
  type ThemeMode, type ThemeTokens, type TokenChange, type TypographyChange,
} from './tokens';

const STORAGE_KEY = 'moru-ui-theme';
const SCHEMA_VERSION = 9;
const structuralKeys = ['radius', 'spacing', 'fontSize', 'controlHeight', 'borderWidth', 'shadow', 'fontFamily', 'density', 'densityOverrides', 'componentSpacing', 'typography', 'duration'] as const;
const sharedKeys = ['accent', ...structuralKeys] as const;

export type ThemeState = {
  schemaVersion: typeof SCHEMA_VERSION;
  mode: ThemeMode;
  presetId: string;
  themes: Record<ThemeMode, ThemeTokens>;
  colorSchemes?: Partial<Record<ThemeMode, ColorSchemeSettings>>;
};

function defaultState(): ThemeState {
  return { schemaVersion: SCHEMA_VERSION, mode: 'light', presetId: DEFAULT_PRESET_ID, themes: { light: validateTokens(defaultTokens), dark: createDarkTokens(defaultTokens) } };
}

function shareStructure(target: ThemeTokens, source: ThemeTokens): ThemeTokens {
  const next = { ...target };
  for (const key of structuralKeys) Object.assign(next, { [key]: source[key] });
  return validateTokens(next);
}

export function parseThemeState(value: unknown): ThemeState | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (![1, 2, 3, 4, 5, 6, 7, 8, SCHEMA_VERSION].includes(data.schemaVersion as number) || (data.mode !== 'light' && data.mode !== 'dark')) return null;
  if (!data.themes || typeof data.themes !== 'object') return null;
  const themes = data.themes as Record<string, unknown>;
  if (!themes.light || !themes.dark || typeof themes.light !== 'object' || typeof themes.dark !== 'object') return null;
  const light = validateTokens(themes.light);
  const dark = shareStructure(validateTokens(themes.dark, createDarkTokens(light)), light);
  const presetId = typeof data.presetId === 'string' && presets.some((preset) => preset.id === data.presetId) ? data.presetId : 'custom';
  const colorSchemes: Partial<Record<ThemeMode, ColorSchemeSettings>> = {};
  const schemes = data.colorSchemes && typeof data.colorSchemes === 'object' && !Array.isArray(data.colorSchemes) ? data.colorSchemes as Record<string, unknown> : null;
  for (const mode of ['light', 'dark'] as const) {
    if (schemes && Object.hasOwn(schemes, mode) && schemes[mode] && typeof schemes[mode] === 'object' && !Array.isArray(schemes[mode])) colorSchemes[mode] = normalizeColorSchemeSettings(schemes[mode]);
  }
  return { schemaVersion: SCHEMA_VERSION, mode: data.mode, presetId, themes: { light, dark }, ...(Object.keys(colorSchemes).length ? { colorSchemes } : {}) };
}

/** Apply the new studio design once; deliberate file imports retain their own theme. */
export function restoreThemeState(value: unknown): ThemeState {
  const parsed = parseThemeState(value);
  if (!parsed) return defaultState();
  const version = (value as Record<string, unknown>).schemaVersion as number;
  if (version < 5) return { ...defaultState(), mode: parsed.mode };
  if (version === SCHEMA_VERSION) return parsed;
  // Version 9 records the borderless studio update once. Later edits and explicit imports retain their border setting.
  return { ...parsed, themes: {
    light: { ...parsed.themes.light, borderWidth: 0 },
    dark: { ...parsed.themes.dark, borderWidth: 0 },
  } };
}

/** A palette is applied atomically to one mode, preserving all geometry and the other palette. */
export function applyColorSchemeState(previous: ThemeState, settings: ColorSchemeSettings, group: 'foundation' | 'semantic' | 'all'): ThemeState {
  const normalized = normalizeColorSchemeSettings(settings);
  const current = previous.themes[previous.mode];
  const next = validateTokens({ ...current, ...getSchemeColorPatch(normalized, previous.mode, group, current) }, current);
  return {
    ...previous, presetId: 'custom',
    themes: { ...previous.themes, [previous.mode]: next },
    colorSchemes: { ...previous.colorSchemes, [previous.mode]: normalized },
  };
}

function readState(): ThemeState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? restoreThemeState(JSON.parse(saved)) : defaultState();
  } catch {
    return defaultState();
  }
}

export function useTheme() {
  const [state, setState] = useState<ThemeState>(readState);
  const tokens = state.themes[state.mode];
  const componentSpacingStyle = useRef<HTMLStyleElement | null>(null);

  useLayoutEffect(() => () => { componentSpacingStyle.current?.remove(); }, []);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const variables = getCssVariables(tokens, state.mode);
    // A restored default must also remove the previous component's inline values.
    for (let index = root.style.length - 1; index >= 0; index--) {
      const name = root.style.item(index);
      if (name.startsWith('--ui-component-') && !Object.hasOwn(variables, name)) root.style.removeProperty(name);
    }
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
    if (!componentSpacingStyle.current?.isConnected) {
      componentSpacingStyle.current = document.createElement('style');
      componentSpacingStyle.current.id = 'moru-component-spacing-rules';
      document.head.append(componentSpacingStyle.current);
    }
    componentSpacingStyle.current.textContent = getComponentSpacingCss(tokens.componentSpacing);
    const accent = variables['--ui-accent-surface-text'];
    root.style.setProperty('--chrome-accent', accent);
    root.style.setProperty('--chrome-accent-foreground', readableForeground(accent));
    root.style.setProperty('--chrome-action-bg', tokens.primary);
    root.style.setProperty('--chrome-action-foreground', variables['--ui-primary-foreground']);
    root.dataset.theme = state.mode;
    root.style.colorScheme = state.mode;
  }, [tokens, state.mode]);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* The editor also works when storage is unavailable. */ }
  }, [state]);

  const setToken: TokenChange = useCallback(<K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
    if ((colorTokenKeys as readonly string[]).includes(key) && !normalizeColor(value)) return;
    setState((previous) => {
      const current = previous.themes[previous.mode];
      const candidate = key === 'fontFamily' ? applyFontFamily(current, value as ThemeTokens['fontFamily'])
        : key === 'density' ? applyDensity(current, value as ThemeTokens['density'])
        : key === 'fontSize' ? { ...current, typography: { ...current.typography, body: { ...current.typography.body, size: value as number } } }
        : { ...current, [key]: value };
      const next = validateTokens(candidate, current);
      const otherMode = previous.mode === 'light' ? 'dark' : 'light';
      const other = (sharedKeys as readonly string[]).includes(key)
        ? shareStructure({ ...previous.themes[otherMode], ...(key === 'accent' ? { accent: next.accent } : {}) }, next)
        : previous.themes[otherMode];
      const colorSchemes = { ...previous.colorSchemes };
      if ((colorTokenKeys as readonly string[]).includes(key)) {
        delete colorSchemes[previous.mode];
        if (key === 'accent') delete colorSchemes[otherMode];
      }
      return { ...previous, presetId: 'custom', themes: { ...previous.themes, [previous.mode]: next, [otherMode]: other }, ...(previous.colorSchemes ? { colorSchemes } : {}) };
    });
  }, []);

  const setTokens = useCallback((value: SetStateAction<ThemeTokens>) => {
    setState((previous) => {
      const current = previous.themes[previous.mode];
      const next = validateTokens(typeof value === 'function' ? value(current) : value, current);
      const otherMode = previous.mode === 'light' ? 'dark' : 'light';
      const other = shareStructure({ ...previous.themes[otherMode], ...(next.accent !== current.accent ? { accent: next.accent } : {}) }, next);
      return { ...previous, presetId: 'custom', themes: { ...previous.themes, [previous.mode]: next, [otherMode]: other } };
    });
  }, []);

  const setTypography: TypographyChange = useCallback((role, patch) => {
    setState((previous) => {
      const current = previous.themes[previous.mode];
      const next = validateTokens({ ...current, typography: { ...current.typography, [role]: { ...current.typography[role], ...patch } } }, current);
      const otherMode = previous.mode === 'light' ? 'dark' : 'light';
      const other = shareStructure(previous.themes[otherMode], next);
      return { ...previous, presetId: 'custom', themes: { ...previous.themes, [previous.mode]: next, [otherMode]: other } };
    });
  }, []);

  const applyPreset = useCallback((id: string) => {
    const preset = presets.find((candidate) => candidate.id === id);
    if (!preset) return;
    setState((previous) => {
      const light = shareStructure(preset.tokens, previous.themes[previous.mode]);
      return { ...previous, presetId: id, colorSchemes: undefined, themes: { light, dark: createDarkTokens(light) } };
    });
  }, []);

  const applyColorScheme = useCallback((settings: ColorSchemeSettings, group: 'foundation' | 'semantic' | 'all') => {
    setState((previous) => applyColorSchemeState(previous, settings, group));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    if (mode === 'light' || mode === 'dark') setState((previous) => ({ ...previous, mode }));
  }, []);

  const reset = useCallback(() => {
    setState((previous) => ({ ...defaultState(), mode: previous.mode }));
  }, []);

  const exportCss = useCallback(() => cssForTokens(tokens, state.mode), [tokens, state.mode]);
  const exportJson = useCallback(() => JSON.stringify({
    ...state,
    tokens,
    cssVariables: getCssVariables(tokens, state.mode),
  }, null, 2), [state, tokens]);

  const importJson = useCallback((text: string) => {
    let value: unknown;
    try { value = JSON.parse(text); } catch { throw new Error('JSON 형식을 확인해 주세요.'); }
    const fullState = parseThemeState(value);
    if (fullState) { setState(fullState); return; }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('올바른 디자인 토큰 파일을 선택해 주세요.');
    const record = value as Record<string, unknown>;
    if ('schemaVersion' in record && ![1, 2, 3, 4, 5, 6, 7, 8, SCHEMA_VERSION].includes(record.schemaVersion as number)) throw new Error('지원하지 않는 토큰 파일 버전입니다.');
    const candidate = record.tokens && typeof record.tokens === 'object' ? record.tokens : record;
    const input = candidate as Record<string, unknown>;
    if (!Object.keys(defaultTokens).some((key) => key in input)) throw new Error('파일에서 디자인 토큰을 찾을 수 없습니다.');
    for (const key of colorTokenKeys) {
      if (key in input && !normalizeColor(input[key])) throw new Error(`${key}: #RRGGBB 형식의 색상을 입력해 주세요.`);
    }
    setState((previous) => {
      const light = validateTokens(input);
      return { ...previous, presetId: 'custom', colorSchemes: undefined, themes: { light, dark: createDarkTokens(light) } };
    });
  }, []);

  return { tokens, themes: state.themes, setToken, setTokens, setTypography, presetId: state.presetId, applyPreset, colorSchemeSettings: state.colorSchemes?.[state.mode], applyColorScheme, mode: state.mode, setMode, reset, exportCss, exportJson, importJson };
}
