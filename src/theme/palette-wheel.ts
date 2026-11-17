import { harmonyOptions, hexToOklch, oklchToHex, type ColorHarmony } from './color-scheme'
import { resolvePaletteContrast } from './palette-constraints'
import {
  getPaletteRecommendationMetadata,
  paletteRoleKeys,
  type PaletteColors,
  type PaletteLocks,
  type PaletteRecommendation,
  type PaletteRole,
} from './palette-recommendations'
import { normalizeColor, type ThemeMode } from './tokens'

export const MAX_WHEEL_CHROMA = 0.3

export type PaletteWheelChange = {
  role: PaletteRole
  hue: number
  chroma: number
  /** A pointer gesture keeps its starting colors; keyboard steps use current colors. */
  source: PaletteColors
}

const isAccent = (role: PaletteRole) => role === 'primary' || role === 'accent'
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, value))
const wrapHue = (hue: number) => ((hue % 360) + 360) % 360
const defaultWeight = (role: PaletteRole) =>
  role === 'primary' ? 1 : role === 'accent' ? 0.85 : 0.15

/** White and black have no chromatic gamut: gently open it only when adding color. */
function editableLightness(lightness: number, role: PaletteRole, mode: ThemeMode, chroma: number) {
  if (chroma === 0 || (lightness > 0.001 && lightness < 0.999)) return lightness
  if (isAccent(role)) return mode === 'dark' ? 0.75 : 0.55
  return lightness >= 0.999 ? 0.985 : 0.06
}

/**
 * Move an unlocked role and recompose other unlocked roles around that point.
 * Fixed colors remain exceptions to the selected harmony: an explicit drag must
 * not silently snap back to a locked primary. Contrast may adjust free lightness.
 */
export function createWheelPalette(
  change: PaletteWheelChange,
  mode: ThemeMode,
  harmony: ColorHarmony,
  locks: PaletteLocks = {},
): PaletteRecommendation {
  const metadata = getPaletteRecommendationMetadata(harmony)
  const normalizedLocks: PaletteLocks = {}
  for (const role of paletteRoleKeys) {
    if (!locks || !Object.hasOwn(locks, role)) continue
    const color = normalizeColor(locks[role])
    if (color) normalizedLocks[role] = color
  }
  const source = Object.fromEntries(
    paletteRoleKeys.map((role) => [role, normalizedLocks[role] ?? change.source[role]]),
  ) as PaletteColors
  if (!paletteRoleKeys.includes(change.role) || normalizedLocks[change.role]) {
    return { ...metadata, colors: source }
  }
  // Non-finite pointer coordinates must not change a palette or introduce NaN colors.
  if (!Number.isFinite(change.hue) || !Number.isFinite(change.chroma)) {
    return { ...metadata, colors: source }
  }

  const angles = (harmonyOptions.find(({ value }) => value === harmony) ?? harmonyOptions[0]).angles
  const offset = (role: PaletteRole) =>
    role === 'primary' ? 0 : role === 'accent' ? (angles[1] ?? 0) : (angles[2] ?? 0)
  const hue = wrapHue(change.hue - offset(change.role))
  const targetChroma = clamp(change.chroma, MAX_WHEEL_CHROMA)
  const starting = Object.fromEntries(
    paletteRoleKeys.map((role) => [role, hexToOklch(source[role])]),
  ) as Record<PaletteRole, ReturnType<typeof hexToOklch>>
  const originalBrandChroma = Math.max(starting.primary.c, starting.accent.c / 0.85)
  const weight = (role: PaletteRole) =>
    originalBrandChroma >= 0.002 && starting[role].c >= 0.002
      ? starting[role].c / originalBrandChroma
      : defaultWeight(role)
  const brandChroma = clamp(targetChroma / weight(change.role), MAX_WHEEL_CHROMA)
  const colors = { ...source }

  for (const role of paletteRoleKeys) {
    if (normalizedLocks[role]) continue
    const chroma =
      role === change.role
        ? targetChroma
        : clamp(brandChroma * weight(role), isAccent(role) ? MAX_WHEEL_CHROMA : 0.04)
    colors[role] = oklchToHex(
      editableLightness(starting[role].l, role, mode, chroma),
      chroma,
      hue + offset(role),
    )
  }
  return { ...metadata, colors: resolvePaletteContrast(colors, normalizedLocks) }
}
