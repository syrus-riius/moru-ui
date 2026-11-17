import {
  generateColorScheme,
  hexToOklch,
  oklchToHex,
  type ColorHarmony,
  type NeutralTemperature,
} from './color-scheme'
import {
  getContrastRatio,
  getCssVariables,
  normalizeColor,
  type ThemeMode,
  type ThemeTokens,
} from './tokens'
import { resolvePaletteContrast } from './palette-constraints'

export const paletteRoleKeys = [
  'primary',
  'accent',
  'background',
  'surface',
  'text',
  'muted',
  'border',
] as const

export type PaletteRole = (typeof paletteRoleKeys)[number]
export type PaletteColors = Pick<ThemeTokens, PaletteRole>
export type PaletteLocks = Partial<PaletteColors>
export type PaletteRecommendation = {
  id: 'tonal' | 'analogous' | 'complementary'
  name: string
  description: string
  colors: PaletteColors
}

type PaletteRecipe = Omit<PaletteRecommendation, 'colors'> & {
  harmony: ColorHarmony
  temperature: NeutralTemperature
  hueOffset: number
  lightnessOffset: number
  chromaScale: number
}

const recipes: readonly PaletteRecipe[] = [
  {
    id: 'tonal',
    name: '톤 온 톤',
    description: '같은 색의 명도 차이로 차분한 위계를 만듭니다.',
    harmony: 'mono',
    temperature: 'brand',
    hueOffset: 0,
    lightnessOffset: 0,
    chromaScale: 0.75,
  },
  {
    id: 'analogous',
    name: '유사색 조합',
    description: '가까운 색의 액센트와 따뜻한 중립색을 조합합니다.',
    harmony: 'analogous',
    temperature: 'warm',
    hueOffset: 30,
    lightnessOffset: 0.06,
    chromaScale: 0.9,
  },
  {
    id: 'complementary',
    name: '보색 조합',
    description: '맞은편 색의 액센트와 차가운 중립색을 조합합니다.',
    harmony: 'complementary',
    temperature: 'cool',
    hueOffset: 180,
    lightnessOffset: -0.06,
    chromaScale: 1,
  },
]

function normalizeLocks(input: PaletteLocks): PaletteLocks {
  const locks: PaletteLocks = {}
  if (!input || typeof input !== 'object') return locks
  for (const role of paletteRoleKeys) {
    if (!Object.hasOwn(input, role)) continue
    const color = normalizeColor(input[role])
    if (color) locks[role] = color
  }
  return locks
}

function secondaryAnchorHue(locks: PaletteLocks): number | undefined {
  const anchors = paletteRoleKeys
    .filter((role) => role !== 'primary' && role !== 'accent' && locks[role])
    .map((role) => hexToOklch(locks[role]!))
    .filter(({ c }) => c >= 0.02)
  if (!anchors.length) return undefined
  const x = anchors.reduce((sum, { c, h }) => sum + c * Math.cos((h * Math.PI) / 180), 0)
  const y = anchors.reduce((sum, { c, h }) => sum + c * Math.sin((h * Math.PI) / 180), 0)
  return Math.hypot(x, y) < 0.001 ? anchors[0].h : (Math.atan2(y, x) * 180) / Math.PI
}

type PaletteVariation = { lightness: number; chroma: number; neutral: number }

/**
 * Keep the brand seed intact as the primary action color. Related hues belong
 * to accent; they never overwrite the semantic colors or structural tokens.
 * Achromatic seeds use different lightness and neutral temperatures instead.
 */
export function generatePaletteRecommendations(
  input: string,
  mode: ThemeMode,
  locks: PaletteLocks = {},
): PaletteRecommendation[] {
  const seed = normalizeColor(input)
  if (!seed) return []
  return createRecommendations(seed, mode, normalizeLocks(locks))
}

function createRecommendations(
  seed: string,
  mode: ThemeMode,
  locks: PaletteLocks,
  variation?: PaletteVariation,
): PaletteRecommendation[] {
  const source = hexToOklch(locks.primary ?? seed)
  const accentAnchor = locks.accent ? hexToOklch(locks.accent) : null
  const secondaryHue = secondaryAnchorHue(locks)
  const accentLightness = mode === 'dark' ? 0.76 : 0.58

  return recipes.map((recipe) => {
    const hue = locks.primary
      ? source.h
      : accentAnchor && accentAnchor.c >= 0.02
        ? accentAnchor.h - recipe.hueOffset
        : (secondaryHue ?? source.h)
    const primary =
      locks.primary ??
      (hue === source.h ? seed : oklchToHex(source.l, Math.max(source.c, 0.06), hue))
    const base = hexToOklch(primary)
    const chroma = Math.min(base.c * recipe.chromaScale * (variation?.chroma ?? 1), 0.2)
    const { colors } = generateColorScheme(
      {
        seed: primary,
        harmony: recipe.harmony,
        chroma,
        temperature: recipe.temperature,
        neutralActions: false,
      },
      mode,
    )
    const palette: PaletteColors = {
      primary,
      accent: oklchToHex(
        accentLightness + recipe.lightnessOffset + (variation?.lightness ?? 0),
        chroma,
        base.h + recipe.hueOffset,
      ),
      background: colors.background,
      surface: colors.surface,
      text: colors.text,
      muted: colors.muted,
      border: colors.border,
    }
    if (variation) {
      for (const role of ['background', 'surface', 'text', 'muted', 'border'] as const) {
        const neutral = hexToOklch(palette[role])
        palette[role] = oklchToHex(
          neutral.l + variation.neutral,
          neutral.c * variation.chroma,
          neutral.h,
        )
      }
    }
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      colors: resolvePaletteContrast({ ...palette, ...locks }, locks),
    }
  })
}

function randomUnit(random: () => number): number {
  const value = random()
  return Number.isFinite(value) ? Math.min(1 - Number.EPSILON, Math.max(0, value)) : 0.5
}

/**
 * Sample a new brand color, then reuse the same three role-aware recipes.
 * Excluding the previous hue's ±60° arc guarantees a visible change without
 * retries, even when an injected random source repeatedly returns one value.
 */
export function generateRandomPaletteRecommendation(
  mode: ThemeMode,
  previousSeed?: string,
  random: () => number = Math.random,
): PaletteRecommendation {
  const result = generateRandomPaletteSet(mode, previousSeed, {}, random)
  return result.recommendations.find(({ id }) => id === result.selectedId)!
}

export function generateRandomPaletteSet(
  mode: ThemeMode,
  previousSeed?: string,
  locks: PaletteLocks = {},
  random: () => number = Math.random,
): {
  seed: string
  recommendations: PaletteRecommendation[]
  selectedId: PaletteRecommendation['id']
} {
  const normalizedLocks = normalizeLocks(locks)
  const previous = normalizeColor(previousSeed)
  const previousColor = previous ? hexToOklch(previous) : null
  const hueSample = randomUnit(random)
  const hue =
    previousColor && previousColor.c >= 0.02
      ? (previousColor.h + 60 + hueSample * 240) % 360
      : hueSample * 360
  const lightnessSample = randomUnit(random)
  const chromaSample = randomUnit(random)
  const lightness = (mode === 'dark' ? 0.66 : 0.48) + lightnessSample * 0.18
  const chroma = 0.1 + chromaSample * 0.1
  const seed = oklchToHex(lightness, chroma, hue)
  const variation = Object.keys(normalizedLocks).length
    ? {
        lightness: (lightnessSample - 0.5) * 0.16,
        chroma: 0.65 + chromaSample * 0.7,
        neutral: (hueSample - 0.5) * 0.05,
      }
    : undefined
  const recommendations = createRecommendations(seed, mode, normalizedLocks, variation)
  return {
    seed,
    recommendations,
    selectedId: recommendations[Math.floor(randomUnit(random) * recommendations.length)].id,
  }
}

export type PaletteContrastCheck = {
  id: string
  label: string
  foreground: string
  background: string
  ratio: number
  minimum: number
  pass: boolean
}

/**
 * Audit the actual derived text colors against nominal opaque token surfaces.
 * Transparent materials and content behind them require a separate visual check;
 * passing these pairs does not certify the accessibility of an entire page.
 */
export function auditPaletteRecommendation(
  tokens: ThemeTokens,
  mode: ThemeMode,
): PaletteContrastCheck[] {
  const variables = getCssVariables(tokens, mode)
  const pairs = [
    {
      id: 'text-background',
      label: '텍스트 / 백그라운드',
      foreground: tokens.text,
      background: tokens.background,
    },
    {
      id: 'text-surface',
      label: '텍스트 / 서피스',
      foreground: tokens.text,
      background: tokens.surface,
    },
    {
      id: 'muted-surface',
      label: '뮤티드 / 서피스',
      foreground: tokens.muted,
      background: tokens.surface,
    },
    {
      id: 'primary-label',
      label: '버튼 글자 / 프라이머리',
      foreground: variables['--ui-primary-foreground'],
      background: tokens.primary,
    },
    {
      id: 'accent-surface-text',
      label: '액센트 글자 / 서피스',
      foreground: variables['--ui-accent-surface-text'],
      background: tokens.surface,
    },
  ]
  return pairs.map((pair) => {
    const ratio = getContrastRatio(pair.foreground, pair.background)
    return { ...pair, ratio, minimum: 4.5, pass: ratio >= 4.5 }
  })
}
