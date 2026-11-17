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

export const paletteRoleKeys = [
  'primary',
  'accent',
  'background',
  'surface',
  'text',
  'muted',
  'border',
] as const

export type PaletteColors = Pick<ThemeTokens, (typeof paletteRoleKeys)[number]>
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

/**
 * Keep the brand seed intact as the primary action color. Related hues belong
 * to accent; they never overwrite the semantic colors or structural tokens.
 * Achromatic seeds use different lightness and neutral temperatures instead.
 */
export function generatePaletteRecommendations(
  input: string,
  mode: ThemeMode,
): PaletteRecommendation[] {
  const seed = normalizeColor(input)
  if (!seed) return []
  const base = hexToOklch(seed)
  const accentLightness = mode === 'dark' ? 0.76 : 0.58

  return recipes.map((recipe) => {
    const chroma = Math.min(base.c * recipe.chromaScale, 0.2)
    const { colors } = generateColorScheme(
      {
        seed,
        harmony: recipe.harmony,
        chroma,
        temperature: recipe.temperature,
        neutralActions: false,
      },
      mode,
    )
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      colors: {
        primary: seed,
        accent: oklchToHex(
          accentLightness + recipe.lightnessOffset,
          chroma,
          base.h + recipe.hueOffset,
        ),
        background: colors.background,
        surface: colors.surface,
        text: colors.text,
        muted: colors.muted,
        border: colors.border,
      },
    }
  })
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
