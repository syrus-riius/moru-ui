import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { nativeNumber, nativeTypographyDefaults, nativeDensityProfiles, resolveNativeComponentSpacing, resolveNativeMetrics, resolveNativeTypography, type MoruNativeDensity, type NativeComponentSpacing, type NativeMetricOverrides, type NativeMetrics, type NativeTypography, type NativeTypographyOverrides } from './theme-values'
export type { MoruNativeDensity, NativeComponentSpacing, NativeInsets, NativeMetricOverrides, NativeMetrics, NativeTypography, NativeTypographyOverrides, NativeTypographyRole, NativeTypographyStyle } from './theme-values'

export type MoruNativeMode = 'light' | 'dark'
export type MoruNativeColors = {
  background: string
  surface: string
  mutedSurface: string
  text: string
  muted: string
  border: string
  /** Visible input/selection boundary. Optional for older exported themes. */
  controlBorder?: string
  primary: string
  primaryForeground: string
  accent: string
  success: string
  warning: string
  danger: string
  info: string
}
export type MoruNativeTheme = {
  mode: MoruNativeMode
  colors: MoruNativeColors
  space: number
  radius: number
  minTouchSize: number
  borderWidth: number
  density: MoruNativeDensity
  metrics: NativeMetrics
  typography: NativeTypography
  componentSpacing: NativeComponentSpacing
}

const lightColors: MoruNativeColors = {
  background: '#f5f5f3', surface: '#ffffff', mutedSurface: '#ededeb',
  text: '#171717', muted: '#6e6e6b', border: '#dededb', controlBorder: '#898987',
  primary: '#181818', primaryForeground: '#ffffff', accent: '#ef543d',
  success: '#287250', warning: '#91620e', danger: '#b93d37', info: '#315fa1',
}
const darkColors: MoruNativeColors = {
  background: '#0b0b0b', surface: '#171717', mutedSurface: '#242424',
  text: '#f6f6f3', muted: '#aaaaa5', border: '#333331', controlBorder: '#70706e',
  primary: '#f2f2ed', primaryForeground: '#171717', accent: '#f2654e',
  success: '#85c7a2', warning: '#e7bc72', danger: '#ed8178', info: '#9dbfea',
}

export const defaultMoruNativeTheme: MoruNativeTheme = {
  mode: 'light', colors: lightColors, space: 4, radius: 12, minTouchSize: 48, borderWidth: 0, density: 'standard', metrics: nativeDensityProfiles.standard, typography: nativeTypographyDefaults, componentSpacing: {},
}

const NativeThemeContext = createContext<MoruNativeTheme>(defaultMoruNativeTheme)

export type MoruNativeProviderProps = {
  children: ReactNode
  /** Omit to follow the operating system's appearance. */
  mode?: MoruNativeMode
  accent?: string
  /** Native overrides can be derived from exported Moru web tokens. */
  tokens?: Partial<Pick<MoruNativeTheme, 'space' | 'radius' | 'borderWidth' | 'density'>> & { colors?: Partial<MoruNativeColors>; metrics?: NativeMetricOverrides; typography?: NativeTypographyOverrides; componentSpacing?: NativeComponentSpacing; fontFamily?: string; webFontFamily?: string }
}

export function MoruNativeProvider({ children, mode, accent, tokens }: MoruNativeProviderProps) {
  const systemMode = useColorScheme()
  const appearance = mode ?? (systemMode === 'dark' ? 'dark' : 'light')
  const theme = useMemo<MoruNativeTheme>(() => {
    const density = tokens?.density === 'compact' || tokens?.density === 'comfortable' ? tokens.density : 'standard'
    const metrics = resolveNativeMetrics(density, tokens?.metrics, tokens?.space)
    return {
      mode: appearance,
      colors: { ...(appearance === 'dark' ? darkColors : lightColors), ...tokens?.colors, ...(accent ? { accent } : {}) },
      space: metrics.spacing,
      radius: nativeNumber(tokens?.radius, 12, 0, 32),
      borderWidth: nativeNumber(tokens?.borderWidth, 0, 0, 3),
      density, metrics,
      typography: resolveNativeTypography(tokens?.typography, Platform.OS === 'web' ? tokens?.webFontFamily ?? tokens?.fontFamily : tokens?.fontFamily),
      componentSpacing: resolveNativeComponentSpacing(tokens?.componentSpacing),
      // Density changes visual rhythm; the native touch target remains at least 48pt/dp.
      minTouchSize: 48,
    }
  }, [appearance, accent, tokens])
  return <NativeThemeContext.Provider value={theme}>{children}</NativeThemeContext.Provider>
}

export function useMoruNativeTheme(): MoruNativeTheme {
  return useContext(NativeThemeContext)
}
