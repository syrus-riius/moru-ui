import { harmonyOptions, hexToOklch, oklchToHex, type ColorHarmony } from './color-scheme'
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
export type PaletteHarmony = ColorHarmony | 'all'
export type PaletteRecommendation = {
  id: 'tonal' | 'analogous' | 'complementary' | 'split' | 'triadic'
  name: string
  description: string
  colors: PaletteColors
}

type PaletteRecipe = Omit<PaletteRecommendation, 'colors'> & {
  harmony: ColorHarmony
  lightnessOffset: number
  chromaScale: number
}

const recipes: readonly PaletteRecipe[] = [
  {
    id: 'tonal',
    name: '단색',
    description: '같은 색의 명도 차이로 차분한 위계를 만듭니다.',
    harmony: 'mono',
    lightnessOffset: 0,
    chromaScale: 0.75,
  },
  {
    id: 'analogous',
    name: '유사색',
    description: '기준색 양옆의 색을 액센트와 중립색에 나누어 적용합니다.',
    harmony: 'analogous',
    lightnessOffset: 0.06,
    chromaScale: 0.9,
  },
  {
    id: 'complementary',
    name: '보색',
    description: '맞은편 색을 액센트로, 기준색을 중립색으로 사용합니다.',
    harmony: 'complementary',
    lightnessOffset: -0.06,
    chromaScale: 1,
  },
  {
    id: 'split',
    name: '분할 보색',
    description: '150°·210°의 두 색을 액센트와 중립색에 나누어 적용합니다.',
    harmony: 'split',
    lightnessOffset: 0.03,
    chromaScale: 0.95,
  },
  {
    id: 'triadic',
    name: '삼각 배색',
    description: '120° 간격의 세 색을 프라이머리·액센트·중립색에 적용합니다.',
    harmony: 'triadic',
    lightnessOffset: -0.03,
    chromaScale: 0.85,
  },
]

/** Shared labels for generated and directly edited palettes. */
export function getPaletteRecommendationMetadata(
  harmony: ColorHarmony,
): Pick<PaletteRecommendation, 'id' | 'name' | 'description'> {
  const { id, name, description } =
    recipes.find((recipe) => recipe.harmony === harmony) ?? recipes[0]
  return { id, name, description }
}

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
 * to accent and tinted neutral surfaces, never to semantic or structural tokens.
 * Achromatic seeds use lightness variations instead of inventing a hue.
 */
export function generatePaletteRecommendations(
  input: string,
  mode: ThemeMode,
  locks: PaletteLocks = {},
  harmony: PaletteHarmony = 'all',
): PaletteRecommendation[] {
  const seed = normalizeColor(input)
  if (!seed) return []
  return createRecommendations(seed, mode, normalizeLocks(locks), harmony)
}

function createRecommendations(
  seed: string,
  mode: ThemeMode,
  locks: PaletteLocks,
  harmony: PaletteHarmony,
  variation?: PaletteVariation,
): PaletteRecommendation[] {
  const source = hexToOklch(locks.primary ?? seed)
  const accentAnchor = locks.accent ? hexToOklch(locks.accent) : null
  const secondaryHue = secondaryAnchorHue(locks)
  const accentLightness = mode === 'dark' ? 0.76 : 0.58

  // Keep all five as the default, including when untrusted JS supplies a bad option.
  const matching = recipes.filter((recipe) => recipe.harmony === harmony)
  const selectedRecipes = matching.length ? matching : recipes
  return selectedRecipes.map((recipe) => {
    const angles = harmonyOptions.find(({ value }) => value === recipe.harmony)!.angles
    const accentOffset = angles[1] ?? 0
    const neutralOffset = angles[2] ?? 0
    const hue = locks.primary
      ? source.h
      : accentAnchor && accentAnchor.c >= 0.02
        ? accentAnchor.h - accentOffset
        : secondaryHue === undefined
          ? source.h
          : secondaryHue - neutralOffset
    const primary =
      locks.primary ??
      (hue === source.h ? seed : oklchToHex(source.l, Math.max(source.c, 0.06), hue))
    const base = hexToOklch(primary)
    const chroma = Math.min(base.c * recipe.chromaScale * (variation?.chroma ?? 1), 0.2)
    // The third harmony arm has a real token role: it softly tints the surfaces,
    // text, and border. A single accent alone cannot represent a three-hue rule.
    const neutralChroma = Math.min(0.026, chroma * 0.18)
    const neutral = (lightness: number) =>
      oklchToHex(lightness + (variation?.neutral ?? 0), neutralChroma, base.h + neutralOffset)
    const dark = mode === 'dark'
    const palette: PaletteColors = {
      primary,
      accent: oklchToHex(
        accentLightness + recipe.lightnessOffset + (variation?.lightness ?? 0),
        chroma,
        base.h + accentOffset,
      ),
      background: neutral(dark ? 0.14 : 0.955),
      surface: neutral(dark ? 0.19 : 0.99),
      text: neutral(dark ? 0.96 : 0.18),
      muted: neutral(dark ? 0.73 : 0.48),
      border: neutral(dark ? 0.32 : 0.88),
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
 * Sample a new brand color, then reuse the selected role-aware harmony recipes.
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
  harmony: PaletteHarmony = 'all',
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
  const recommendations = createRecommendations(seed, mode, normalizedLocks, harmony, variation)
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
