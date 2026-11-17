import { hexToOklch, oklchToHex } from './color-scheme'
import { getContrastRatio } from './tokens'
import type { PaletteColors, PaletteLocks } from './palette-recommendations'

const roles = ['background', 'surface', 'text', 'muted'] as const
type ContrastRole = (typeof roles)[number]
type Range = [number, number]
type Ranges = Record<ContrastRole, Range>
type Constraint = { darker: ContrastRole; lighter: ContrastRole }
const pairs: readonly [ContrastRole, ContrastRole][] = [
  ['text', 'background'],
  ['text', 'surface'],
  ['muted', 'surface'],
]
const minimum = 4.5
const luminance = (color: string) => (getContrastRatio(color, '#000000') - 1) / 20
const grayRamp = Array.from({ length: 256 }, (_, value) => {
  const color = `#${value.toString(16).padStart(2, '0').repeat(3)}`
  return { color, value: luminance(color) }
})
const contains = ([low, high]: Range, value: number) => value >= low && value <= high

function distance(first: string, second: string): number {
  const a = hexToOklch(first)
  const b = hexToOklch(second)
  const angle = ((a.h - b.h) * Math.PI) / 180
  return (a.l - b.l) ** 2 + a.c ** 2 + b.c ** 2 - 2 * a.c * b.c * Math.cos(angle)
}

/** Search lightness at fixed hue/chroma; test the resulting quantized HEX. */
function colorAtLuminance(color: string, target: number): string {
  const base = hexToOklch(color)
  let low = 0
  let high = 1
  for (let step = 0; step < 20; step++) {
    const middle = (low + high) / 2
    if (luminance(oklchToHex(middle, base.c, base.h)) < target) low = middle
    else high = middle
  }
  return oklchToHex((low + high) / 2, base.c, base.h)
}

function fitColor(preferred: string, range: Range): string | undefined {
  const current = luminance(preferred)
  if (contains(range, current)) return preferred
  const [low, high] = range
  const target = Math.min(high, Math.max(low, current))
  const candidates = [target, (low + high) / 2, low, high].map((value) =>
    colorAtLuminance(preferred, value),
  )
  // A narrow feasible interval can fall between two chromatic 8-bit steps.
  // Neutral gray preserves feasibility, including black/white intersections.
  for (const entry of grayRamp) {
    if (contains(range, entry.value)) candidates.push(entry.color)
  }
  let best: string | undefined
  let bestDistance = Infinity
  for (const color of candidates) {
    if (!contains(range, luminance(color))) continue
    const score = distance(preferred, color)
    if (score < bestDistance) {
      best = color
      bestDistance = score
    }
  }
  return best
}

/** A 4.5 ratio is the linear bound lighter >= 4.5 * darker + 0.175. */
function propagate(ranges: Ranges, constraints: Constraint[]): boolean {
  for (let pass = 0; pass < roles.length; pass++) {
    for (const { darker, lighter } of constraints) {
      ranges[lighter][0] = Math.max(ranges[lighter][0], minimum * ranges[darker][0] + 0.175)
      ranges[darker][1] = Math.min(ranges[darker][1], (ranges[lighter][1] - 0.175) / minimum)
      if (ranges[lighter][0] > ranges[lighter][1] || ranges[darker][0] > ranges[darker][1])
        return false
    }
  }
  return true
}

function passedPairs(colors: PaletteColors): number {
  return pairs.filter(
    ([first, second]) => getContrastRatio(colors[first], colors[second]) >= minimum,
  ).length
}

function separateSurfaces(colors: PaletteColors, locks: PaletteLocks): PaletteColors {
  if (locks.background || locks.surface) return colors
  const background = hexToOklch(colors.background)
  const surface = hexToOklch(colors.surface)
  if (Math.abs(background.l - surface.l) >= 0.015) return colors
  const darkerBackground = oklchToHex(surface.l - 0.04, background.c, background.h)
  if (getContrastRatio(colors.text, darkerBackground) >= minimum)
    return { ...colors, background: darkerBackground }
  const lighterSurface = oklchToHex(background.l + 0.04, surface.c, surface.h)
  if (
    getContrastRatio(colors.text, lighterSurface) >= minimum &&
    getContrastRatio(colors.muted, lighterSurface) >= minimum
  )
    return { ...colors, surface: lighterSurface }
  return colors
}

/**
 * Preserve locks and solve the three text/surface relationships together.
 * Each pair can be dark-on-light, light-on-dark, or left unresolved: 3³ bounded
 * cases. Prefer the most passing pairs, then the closest original palette.
 * The unresolved case keeps impossible locked combinations honest in the audit.
 */
export function resolvePaletteContrast(colors: PaletteColors, locks: PaletteLocks): PaletteColors {
  if (passedPairs(colors) === pairs.length) return separateSurfaces(colors, locks)
  let best = colors
  let bestPassed = passedPairs(colors)
  let bestDistance = 0
  for (let combination = 1; combination < 3 ** pairs.length; combination++) {
    let choices = combination
    const constraints: Constraint[] = []
    for (const [first, second] of pairs) {
      const choice = choices % 3
      choices = Math.floor(choices / 3)
      if (choice) {
        constraints.push({
          darker: choice === 1 ? first : second,
          lighter: choice === 1 ? second : first,
        })
      }
    }
    const ranges = Object.fromEntries(
      roles.map((role) => {
        const fixed = luminance(colors[role])
        return [role, locks[role] ? [fixed, fixed] : [0, 1]]
      }),
    ) as Ranges
    if (!propagate(ranges, constraints)) continue
    const candidate = { ...colors }
    let feasible = true
    for (const role of roles) {
      if (locks[role]) continue
      const color = fitColor(colors[role], ranges[role])
      if (!color) {
        feasible = false
        break
      }
      candidate[role] = color
      const value = luminance(color)
      ranges[role] = [value, value]
      if (!propagate(ranges, constraints)) {
        feasible = false
        break
      }
    }
    if (!feasible) continue
    const passed = passedPairs(candidate)
    const score = roles.reduce((sum, role) => sum + distance(colors[role], candidate[role]), 0)
    if (passed > bestPassed || (passed === bestPassed && score < bestDistance)) {
      best = candidate
      bestPassed = passed
      bestDistance = score
    }
  }
  return separateSurfaces(best, locks)
}
