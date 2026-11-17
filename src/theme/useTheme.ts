import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type SetStateAction,
} from 'react'
import { getComponentSpacingCss } from './component-spacing'
import {
  getSchemeColorPatch,
  normalizeColorSchemeSettings,
  type ColorSchemeSettings,
} from './color-scheme'
import { resolveAppearance } from './style-packs'
import {
  paletteRoleKeys,
  type PaletteColors,
  type PaletteRecommendation,
  type PaletteRole,
} from './palette-recommendations'
import {
  applyDensity,
  applyFontFamily,
  colorTokenKeys,
  createDarkTokens,
  cssForTokens,
  defaultTokens,
  DEFAULT_PRESET_ID,
  getCssVariables,
  normalizeColor,
  presets,
  readableForeground,
  validateTokens,
  type ThemeMode,
  type ThemeTokens,
  type TokenChange,
  type TypographyChange,
} from './tokens'

const STORAGE_KEY = 'moru-ui-theme'
const SCHEMA_VERSION = 9
const structuralKeys = [
  'radius',
  'spacing',
  'fontSize',
  'controlHeight',
  'borderWidth',
  'shadow',
  'fontFamily',
  'density',
  'densityOverrides',
  'componentSpacing',
  'typography',
  'duration',
  'appearance',
  'focus',
] as const
const sharedKeys = ['accent', ...structuralKeys] as const

export type ThemeState = {
  schemaVersion: typeof SCHEMA_VERSION
  mode: ThemeMode
  presetId: string
  themes: Record<ThemeMode, ThemeTokens>
  colorSchemes?: Partial<Record<ThemeMode, ColorSchemeSettings>>
}

export type PalettePreview = {
  id: PaletteRecommendation['id']
  name: string
  colors: PaletteColors
  mode: ThemeMode
}

export type ThemeSession = {
  saved: ThemeState
  preview: PalettePreview | null
  lockedRoles: Record<ThemeMode, PaletteRole[]>
}

type ThemeSessionAction =
  | { type: 'update'; update: SetStateAction<ThemeState>; resetLocks?: 'all' }
  | { type: 'set-mode'; mode: ThemeMode }
  | { type: 'preview'; candidate: PaletteRecommendation }
  | { type: 'save-preview' }
  | { type: 'cancel-preview' }
  | { type: 'toggle-role-lock'; role: PaletteRole }
  | { type: 'clear-role-locks' }

/** Preview is never part of the serializable theme; queued actions resolve against one session. */
export function reduceThemeSession(
  session: ThemeSession,
  action: ThemeSessionAction,
): ThemeSession {
  switch (action.type) {
    case 'update': {
      const saved =
        typeof action.update === 'function' ? action.update(session.saved) : action.update
      const lockedRoles = { ...session.lockedRoles }
      for (const mode of ['light', 'dark'] as const) {
        // Color edits release constraints only in the affected modes. Structural
        // changes preserve role locks; explicit theme replacements clear both.
        if (
          action.resetLocks === 'all' ||
          paletteRoleKeys.some((key) => saved.themes[mode][key] !== session.saved.themes[mode][key])
        )
          lockedRoles[mode] = []
      }
      return {
        saved,
        preview: null,
        lockedRoles,
      }
    }
    case 'set-mode':
      return { ...session, saved: { ...session.saved, mode: action.mode }, preview: null }
    case 'preview': {
      const colors = {} as PaletteColors
      const { mode } = session.saved
      const currentColors =
        session.preview?.mode === mode ? session.preview.colors : session.saved.themes[mode]
      for (const key of paletteRoleKeys) {
        const color = normalizeColor(
          session.lockedRoles[mode].includes(key)
            ? currentColors[key]
            : action.candidate.colors[key],
        )
        if (!color) return session
        colors[key] = color
      }
      return {
        ...session,
        preview: {
          id: action.candidate.id,
          name: action.candidate.name,
          colors,
          mode: session.saved.mode,
        },
      }
    }
    case 'save-preview': {
      const { saved, preview } = session
      if (!preview || preview.mode !== saved.mode) return session
      const current = saved.themes[preview.mode]
      const colorSchemes = { ...saved.colorSchemes }
      delete colorSchemes[preview.mode]
      return {
        ...session,
        saved: {
          ...saved,
          presetId: 'custom',
          themes: {
            ...saved.themes,
            [preview.mode]: validateTokens({ ...current, ...preview.colors }, current),
          },
          ...(saved.colorSchemes ? { colorSchemes } : {}),
        },
        preview: null,
      }
    }
    case 'cancel-preview':
      return session.preview ? { ...session, preview: null } : session
    case 'toggle-role-lock': {
      if (!paletteRoleKeys.includes(action.role)) return session
      const { mode } = session.saved
      const current = session.lockedRoles[mode]
      const roles = current.includes(action.role)
        ? current.filter((role) => role !== action.role)
        : paletteRoleKeys.filter((role) => role === action.role || current.includes(role))
      return { ...session, lockedRoles: { ...session.lockedRoles, [mode]: roles } }
    }
    case 'clear-role-locks': {
      const { mode } = session.saved
      return session.lockedRoles[mode].length
        ? { ...session, lockedRoles: { ...session.lockedRoles, [mode]: [] } }
        : session
    }
  }
}

function defaultState(): ThemeState {
  return {
    schemaVersion: SCHEMA_VERSION,
    mode: 'light',
    presetId: DEFAULT_PRESET_ID,
    themes: { light: validateTokens(defaultTokens), dark: createDarkTokens(defaultTokens) },
  }
}

function shareStructure(target: ThemeTokens, source: ThemeTokens): ThemeTokens {
  const next = { ...target }
  for (const key of structuralKeys) {
    if ((key === 'appearance' || key === 'focus') && source[key] === undefined) delete next[key]
    else Object.assign(next, { [key]: source[key] })
  }
  return validateTokens(next)
}

export function parseThemeState(value: unknown): ThemeState | null {
  if (!value || typeof value !== 'object') return null
  const data = value as Record<string, unknown>
  if (
    ![1, 2, 3, 4, 5, 6, 7, 8, SCHEMA_VERSION].includes(data.schemaVersion as number) ||
    (data.mode !== 'light' && data.mode !== 'dark')
  )
    return null
  if (!data.themes || typeof data.themes !== 'object') return null
  const themes = data.themes as Record<string, unknown>
  if (
    !themes.light ||
    !themes.dark ||
    typeof themes.light !== 'object' ||
    typeof themes.dark !== 'object'
  )
    return null
  const light = validateTokens(themes.light)
  const dark = shareStructure(validateTokens(themes.dark, createDarkTokens(light)), light)
  const presetId =
    typeof data.presetId === 'string' && presets.some((preset) => preset.id === data.presetId)
      ? data.presetId
      : 'custom'
  const colorSchemes: Partial<Record<ThemeMode, ColorSchemeSettings>> = {}
  const schemes =
    data.colorSchemes && typeof data.colorSchemes === 'object' && !Array.isArray(data.colorSchemes)
      ? (data.colorSchemes as Record<string, unknown>)
      : null
  for (const mode of ['light', 'dark'] as const) {
    if (
      schemes &&
      Object.hasOwn(schemes, mode) &&
      schemes[mode] &&
      typeof schemes[mode] === 'object' &&
      !Array.isArray(schemes[mode])
    )
      colorSchemes[mode] = normalizeColorSchemeSettings(schemes[mode])
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    mode: data.mode,
    presetId,
    themes: { light, dark },
    ...(Object.keys(colorSchemes).length ? { colorSchemes } : {}),
  }
}

/** Apply the new studio design once; deliberate file imports retain their own theme. */
export function restoreThemeState(value: unknown): ThemeState {
  const parsed = parseThemeState(value)
  if (!parsed) return defaultState()
  const version = (value as Record<string, unknown>).schemaVersion as number
  if (version < 5) return { ...defaultState(), mode: parsed.mode }
  if (version === SCHEMA_VERSION) return parsed
  // Version 9 records the borderless studio update once. Later edits and explicit imports retain their border setting.
  return {
    ...parsed,
    themes: {
      light: { ...parsed.themes.light, borderWidth: 0 },
      dark: { ...parsed.themes.dark, borderWidth: 0 },
    },
  }
}

/** A palette is applied atomically to one mode, preserving all geometry and the other palette. */
export function applyColorSchemeState(
  previous: ThemeState,
  settings: ColorSchemeSettings,
  group: 'foundation' | 'semantic' | 'all',
): ThemeState {
  const normalized = normalizeColorSchemeSettings(settings)
  const current = previous.themes[previous.mode]
  const next = validateTokens(
    { ...current, ...getSchemeColorPatch(normalized, previous.mode, group, current) },
    current,
  )
  return {
    ...previous,
    presetId: 'custom',
    themes: { ...previous.themes, [previous.mode]: next },
    colorSchemes: { ...previous.colorSchemes, [previous.mode]: normalized },
  }
}

/** Shared atomic update used by the editor; a style recipe does not rename its palette. */
export function applyThemeTokensState(
  previous: ThemeState,
  value: SetStateAction<ThemeTokens>,
): ThemeState {
  const current = previous.themes[previous.mode]
  const next = validateTokens(typeof value === 'function' ? value(current) : value, current)
  const recipeOnly =
    (next.appearance !== undefined ||
      current.appearance !== undefined ||
      next.focus !== undefined ||
      current.focus !== undefined) &&
    (Object.keys(defaultTokens) as (keyof ThemeTokens)[])
      .filter((key) => key !== 'appearance' && key !== 'focus')
      .every(
        (key) =>
          current[key] === next[key] || JSON.stringify(current[key]) === JSON.stringify(next[key]),
      )
  const otherMode = previous.mode === 'light' ? 'dark' : 'light'
  const other = shareStructure(
    {
      ...previous.themes[otherMode],
      ...(next.accent !== current.accent ? { accent: next.accent } : {}),
    },
    next,
  )
  // A new palette must not keep an earlier color generator's seed/settings.
  const colorSchemes = { ...previous.colorSchemes }
  if (colorTokenKeys.some((key) => next[key] !== current[key])) delete colorSchemes[previous.mode]
  if (next.accent !== current.accent) delete colorSchemes[otherMode]
  return {
    ...previous,
    presetId: recipeOnly ? previous.presetId : 'custom',
    themes: { ...previous.themes, [previous.mode]: next, [otherMode]: other },
    ...(!recipeOnly && previous.colorSchemes ? { colorSchemes } : {}),
  }
}

function readState(): ThemeState {
  if (typeof window === 'undefined') return defaultState()
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved ? restoreThemeState(JSON.parse(saved)) : defaultState()
  } catch {
    return defaultState()
  }
}

export function useTheme() {
  const [session, dispatch] = useReducer(reduceThemeSession, undefined, () => ({
    saved: readState(),
    preview: null,
    lockedRoles: { light: [], dark: [] },
  }))
  const state = session.saved
  const savedTokens = state.themes[state.mode]
  const palettePreview = session.preview
  const tokens = useMemo(
    () =>
      palettePreview?.mode === state.mode
        ? { ...savedTokens, ...palettePreview.colors }
        : savedTokens,
    [savedTokens, palettePreview, state.mode],
  )
  const setState = useCallback((update: SetStateAction<ThemeState>, resetLocks?: 'all') => {
    dispatch({ type: 'update', update, resetLocks })
  }, [])
  const previewPalette = useCallback((candidate: PaletteRecommendation) => {
    dispatch({ type: 'preview', candidate })
  }, [])
  const savePalettePreview = useCallback(() => dispatch({ type: 'save-preview' }), [])
  const cancelPalettePreview = useCallback(() => dispatch({ type: 'cancel-preview' }), [])
  const togglePaletteRoleLock = useCallback((role: PaletteRole) => {
    dispatch({ type: 'toggle-role-lock', role })
  }, [])
  const clearPaletteLocks = useCallback(() => dispatch({ type: 'clear-role-locks' }), [])
  const componentSpacingStyle = useRef<HTMLStyleElement | null>(null)

  useLayoutEffect(
    () => () => {
      componentSpacingStyle.current?.remove()
    },
    [],
  )

  useLayoutEffect(() => {
    const root = document.documentElement
    const variables = getCssVariables(tokens, state.mode)
    // A restored default must also remove the previous component's inline values.
    for (let index = root.style.length - 1; index >= 0; index--) {
      const name = root.style.item(index)
      if (name.startsWith('--ui-component-') && !Object.hasOwn(variables, name))
        root.style.removeProperty(name)
    }
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value)
    if (!componentSpacingStyle.current?.isConnected) {
      componentSpacingStyle.current = document.createElement('style')
      componentSpacingStyle.current.id = 'moru-component-spacing-rules'
      document.head.append(componentSpacingStyle.current)
    }
    componentSpacingStyle.current.textContent = getComponentSpacingCss(tokens.componentSpacing)
    const accent = variables['--ui-accent-surface-text']
    root.style.setProperty('--chrome-accent', accent)
    root.style.setProperty('--chrome-accent-foreground', readableForeground(accent))
    root.style.setProperty('--chrome-action-bg', tokens.primary)
    root.style.setProperty('--chrome-action-foreground', variables['--ui-primary-foreground'])
    root.dataset.theme = state.mode
    root.dataset.stylePack = resolveAppearance(tokens.appearance).preset
    root.style.colorScheme = state.mode
  }, [tokens, state.mode])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* The editor also works when storage is unavailable. */
    }
  }, [state])

  const setToken: TokenChange = useCallback(
    <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
      if ((colorTokenKeys as readonly string[]).includes(key) && !normalizeColor(value)) return
      setState((previous) => {
        const current = previous.themes[previous.mode]
        if (key === 'appearance')
          return applyThemeTokensState(previous, {
            ...current,
            appearance: value as ThemeTokens['appearance'],
          })
        const candidate =
          key === 'fontFamily'
            ? applyFontFamily(current, value as ThemeTokens['fontFamily'])
            : key === 'density'
              ? applyDensity(current, value as ThemeTokens['density'])
              : key === 'fontSize'
                ? {
                    ...current,
                    typography: {
                      ...current.typography,
                      body: { ...current.typography.body, size: value as number },
                    },
                  }
                : { ...current, [key]: value }
        const next = validateTokens(candidate, current)
        const otherMode = previous.mode === 'light' ? 'dark' : 'light'
        const other = (sharedKeys as readonly string[]).includes(key)
          ? shareStructure(
              {
                ...previous.themes[otherMode],
                ...(key === 'accent' ? { accent: next.accent } : {}),
              },
              next,
            )
          : previous.themes[otherMode]
        const colorSchemes = { ...previous.colorSchemes }
        if ((colorTokenKeys as readonly string[]).includes(key)) {
          delete colorSchemes[previous.mode]
          if (key === 'accent') delete colorSchemes[otherMode]
        }
        return {
          ...previous,
          presetId: 'custom',
          themes: { ...previous.themes, [previous.mode]: next, [otherMode]: other },
          ...(previous.colorSchemes ? { colorSchemes } : {}),
        }
      })
    },
    [],
  )

  const setTokens = useCallback((value: SetStateAction<ThemeTokens>) => {
    setState((previous) => applyThemeTokensState(previous, value))
  }, [])

  const setTypography: TypographyChange = useCallback((role, patch) => {
    setState((previous) => {
      const current = previous.themes[previous.mode]
      const next = validateTokens(
        {
          ...current,
          typography: { ...current.typography, [role]: { ...current.typography[role], ...patch } },
        },
        current,
      )
      const otherMode = previous.mode === 'light' ? 'dark' : 'light'
      const other = shareStructure(previous.themes[otherMode], next)
      return {
        ...previous,
        presetId: 'custom',
        themes: { ...previous.themes, [previous.mode]: next, [otherMode]: other },
      }
    })
  }, [])

  const applyPreset = useCallback((id: string) => {
    const preset = presets.find((candidate) => candidate.id === id)
    if (!preset) return
    setState((previous) => {
      const light = shareStructure(preset.tokens, previous.themes[previous.mode])
      return {
        ...previous,
        presetId: id,
        colorSchemes: undefined,
        themes: { light, dark: createDarkTokens(light) },
      }
    }, 'all')
  }, [])

  const applyColorScheme = useCallback(
    (settings: ColorSchemeSettings, group: 'foundation' | 'semantic' | 'all') => {
      setState((previous) => applyColorSchemeState(previous, settings, group))
    },
    [],
  )

  const setMode = useCallback((mode: ThemeMode) => {
    if (mode === 'light' || mode === 'dark') dispatch({ type: 'set-mode', mode })
  }, [])

  const reset = useCallback(() => {
    setState((previous) => ({ ...defaultState(), mode: previous.mode }), 'all')
  }, [])

  const exportCss = useCallback(
    () => cssForTokens(savedTokens, state.mode),
    [savedTokens, state.mode],
  )
  const exportJson = useCallback(
    () =>
      JSON.stringify(
        {
          ...state,
          tokens: savedTokens,
          cssVariables: getCssVariables(savedTokens, state.mode),
        },
        null,
        2,
      ),
    [state, savedTokens],
  )

  const importJson = useCallback((text: string) => {
    let value: unknown
    try {
      value = JSON.parse(text)
    } catch {
      throw new Error('JSON 형식을 확인해 주세요.')
    }
    const fullState = parseThemeState(value)
    if (fullState) {
      setState(fullState, 'all')
      return
    }
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error('올바른 디자인 토큰 파일을 선택해 주세요.')
    const record = value as Record<string, unknown>
    if (
      'schemaVersion' in record &&
      ![1, 2, 3, 4, 5, 6, 7, 8, SCHEMA_VERSION].includes(record.schemaVersion as number)
    )
      throw new Error('지원하지 않는 토큰 파일 버전입니다.')
    const candidate = record.tokens && typeof record.tokens === 'object' ? record.tokens : record
    const input = candidate as Record<string, unknown>
    if (!Object.keys(defaultTokens).some((key) => key in input))
      throw new Error('파일에서 디자인 토큰을 찾을 수 없습니다.')
    for (const key of colorTokenKeys) {
      if (key in input && !normalizeColor(input[key]))
        throw new Error(`${key}: #RRGGBB 형식의 색상을 입력해 주세요.`)
    }
    setState((previous) => {
      const light = validateTokens(input)
      return {
        ...previous,
        presetId: 'custom',
        colorSchemes: undefined,
        themes: { light, dark: createDarkTokens(light) },
      }
    }, 'all')
  }, [])

  return {
    tokens,
    savedTokens,
    palettePreview,
    previewPalette,
    savePalettePreview,
    cancelPalettePreview,
    paletteLockedRoles: session.lockedRoles[state.mode],
    togglePaletteRoleLock,
    clearPaletteLocks,
    themes: state.themes,
    setToken,
    setTokens,
    setTypography,
    presetId: state.presetId,
    applyPreset,
    colorSchemeSettings: state.colorSchemes?.[state.mode],
    applyColorScheme,
    mode: state.mode,
    setMode,
    reset,
    exportCss,
    exportJson,
    importJson,
  }
}
