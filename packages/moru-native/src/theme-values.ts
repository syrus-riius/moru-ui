export type MoruNativeDensity = 'compact' | 'standard' | 'comfortable'
export type NativeSize = 'sm' | 'md' | 'lg'
export type NativeTypographyRole = 'display' | 'heading' | 'body' | 'label' | 'caption' | 'code'
export type NativeFontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
export type NativeTypographyStyle = { fontSize: number; lineHeight: number; fontWeight: NativeFontWeight; letterSpacing: number; fontFamily?: string }
export type NativeTypography = Record<NativeTypographyRole, NativeTypographyStyle>
export type NativeMetrics = {
  controlHeight: Record<NativeSize, number>
  controlPaddingX: Record<NativeSize, number>
  iconSize: Record<NativeSize, number>
  spacing: number; controlGap: number; checkboxSize: number; fieldGap: number
  formGap: number; sectionGap: number; cardPadding: number
}
export type NativeInsets = Partial<Record<'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft' | 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft', number>>
export type NativeComponentSpacing = Record<string, NativeInsets>
export type NativeMetricOverrides = Partial<Omit<NativeMetrics, 'controlHeight' | 'controlPaddingX' | 'iconSize'>> & {
  controlHeight?: Partial<Record<NativeSize, number>>; controlPaddingX?: Partial<Record<NativeSize, number>>; iconSize?: Partial<Record<NativeSize, number>>
}
export type NativeTypographyOverrides = Partial<Record<NativeTypographyRole, Partial<NativeTypographyStyle>>>
export const nativeDensityProfiles: Record<MoruNativeDensity, NativeMetrics> = {
  compact: { controlHeight: { sm: 28, md: 32, lg: 36 }, controlPaddingX: { sm: 8, md: 10, lg: 12 }, iconSize: { sm: 14, md: 16, lg: 18 }, spacing: 3, controlGap: 6, checkboxSize: 16, fieldGap: 6, formGap: 16, sectionGap: 24, cardPadding: 16 },
  standard: { controlHeight: { sm: 32, md: 40, lg: 48 }, controlPaddingX: { sm: 10, md: 14, lg: 18 }, iconSize: { sm: 14, md: 16, lg: 20 }, spacing: 4, controlGap: 8, checkboxSize: 18, fieldGap: 8, formGap: 24, sectionGap: 32, cardPadding: 24 },
  comfortable: { controlHeight: { sm: 40, md: 48, lg: 56 }, controlPaddingX: { sm: 14, md: 18, lg: 22 }, iconSize: { sm: 16, md: 18, lg: 20 }, spacing: 5, controlGap: 10, checkboxSize: 20, fieldGap: 10, formGap: 32, sectionGap: 40, cardPadding: 32 },
}
export const nativeTypographyDefaults: NativeTypography = {
  display: { fontSize: 34, lineHeight: 43, fontWeight: '600', letterSpacing: -.8 },
  heading: { fontSize: 22, lineHeight: 29, fontWeight: '600', letterSpacing: -.5 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0 },
  label: { fontSize: 14, lineHeight: 21, fontWeight: '500', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '400', letterSpacing: 0 },
  code: { fontSize: 14, lineHeight: 21, fontWeight: '500', letterSpacing: 0 },
}
export function nativeNumber(value: unknown, fallback: number, minimum: number, maximum: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback
}

/** Older theme payloads only have `border`; keep them usable without a schema reset. */
export function resolveNativeControlBorder(colors: { border: string; controlBorder?: string }): string {
  return typeof colors.controlBorder === 'string' && colors.controlBorder.trim() ? colors.controlBorder : colors.border
}
export function resolveNativeMetrics(density: MoruNativeDensity, input?: NativeMetricOverrides, space?: number): NativeMetrics {
  const profile = nativeDensityProfiles[density]
  const result: NativeMetrics = { ...profile, controlHeight: { ...profile.controlHeight }, controlPaddingX: { ...profile.controlPaddingX }, iconSize: { ...profile.iconSize } }
  for (const key of ['controlHeight', 'controlPaddingX', 'iconSize'] as const) for (const size of ['sm', 'md', 'lg'] as const) {
    result[key][size] = nativeNumber(input?.[key]?.[size], profile[key][size], key === 'controlHeight' ? 24 : 4, key === 'controlHeight' ? 120 : 64)
  }
  for (const key of ['spacing', 'controlGap', 'checkboxSize', 'fieldGap', 'formGap', 'sectionGap', 'cardPadding'] as const) {
    result[key] = nativeNumber(input?.[key], profile[key], key === 'checkboxSize' ? 12 : 0, key === 'sectionGap' ? 128 : 80)
  }
  result.spacing = nativeNumber(space, nativeNumber(result.spacing, profile.spacing, 2, 12), 2, 12)
  return result
}
export function resolveNativeTypography(input?: NativeTypographyOverrides, fontFamily?: string): NativeTypography {
  const family = typeof fontFamily === 'string' && fontFamily.trim() ? fontFamily.trim().slice(0, 500) : undefined
  const result = {} as NativeTypography
  for (const role of ['display', 'heading', 'body', 'label', 'caption', 'code'] as const) {
    const fallback = nativeTypographyDefaults[role]
    const next = input?.[role]
    const fontSize = nativeNumber(next?.fontSize, fallback.fontSize, 8, 120)
    const fontWeight = typeof next?.fontWeight === 'string' && /^(normal|bold|[1-9]00)$/.test(next.fontWeight) ? next.fontWeight as NativeFontWeight : fallback.fontWeight
    result[role] = { fontSize, lineHeight: nativeNumber(next?.lineHeight, Math.max(fontSize, fallback.lineHeight), fontSize, 240), fontWeight, letterSpacing: nativeNumber(next?.letterSpacing, fallback.letterSpacing, -12, 24), ...(family ? { fontFamily: family } : {}) }
  }
  return result
}
export function resolveNativeComponentSpacing(input?: NativeComponentSpacing): NativeComponentSpacing {
  const result: NativeComponentSpacing = {}
  if (!input || typeof input !== 'object') return result
  for (const [key, insets] of Object.entries(input)) {
    if (!insets || typeof insets !== 'object' || !/^[a-z][a-z0-9-]{0,63}$/.test(key)) continue
    const resolved: NativeInsets = {}
    for (const side of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as const) {
      const value = insets[side]
      if (typeof value === 'number' && Number.isFinite(value)) resolved[side] = Math.max(side.startsWith('margin') ? -160 : 0, Math.min(160, value))
    }
    if (Object.keys(resolved).length) result[key] = resolved
  }
  return result
}
