import type { ColorTokenKey, ThemeMode, ThemeTokens } from './tokens';

export type ColorHarmony = 'mono' | 'analogous' | 'complementary' | 'split' | 'triadic';
export type NeutralTemperature = 'neutral' | 'warm' | 'cool' | 'brand';
export type ColorSchemeSettings = {
  seed: string;
  harmony: ColorHarmony;
  /** OKLCH chroma, rather than an HSL saturation percentage. */
  chroma: number;
  temperature: NeutralTemperature;
  neutralActions: boolean;
};

export const defaultColorSchemeSettings: ColorSchemeSettings = {
  seed: '#ef543d', harmony: 'mono', chroma: .14, temperature: 'neutral', neutralActions: true,
};

export const harmonyOptions: readonly { value: ColorHarmony; label: string; description: string; angles: readonly number[] }[] = [
  { value: 'mono', label: '단색', description: '하나의 색상에 명도 차이를 더해 차분하게 구성합니다.', angles: [0] },
  { value: 'analogous', label: '유사색', description: '기준색 양옆 30°의 색을 조합합니다.', angles: [0, -30, 30] },
  { value: 'complementary', label: '보색', description: '180° 맞은편의 색으로 대비를 만듭니다.', angles: [0, 180] },
  { value: 'split', label: '분할 보색', description: '맞은편 양옆 150°·210°의 색을 조합합니다.', angles: [0, 150, 210] },
  { value: 'triadic', label: '삼각 배색', description: '120° 간격의 세 색을 균형 있게 배치합니다.', angles: [0, 120, 240] },
];

export const neutralTemperatureOptions: readonly { value: NeutralTemperature; label: string }[] = [
  { value: 'neutral', label: '중립' }, { value: 'warm', label: '따뜻하게' },
  { value: 'cool', label: '차갑게' }, { value: 'brand', label: '기준색 기운' },
];

const own = (value: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(value, key);
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const wrapHue = (hue: number) => ((hue % 360) + 360) % 360;
const finite = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;

function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const color = value.trim().toLowerCase();
  if (/^#[\da-f]{6}$/.test(color)) return color;
  if (/^#[\da-f]{3}$/.test(color)) return `#${color.slice(1).split('').map((channel) => channel + channel).join('')}`;
  return null;
}

/** Saved editor settings accept only own fields and always return a fresh object. */
export function normalizeColorSchemeSettings(value: unknown, fallback: ColorSchemeSettings = defaultColorSchemeSettings): ColorSchemeSettings {
  const old: Record<string, unknown> = record(fallback) ? fallback : {};
  const safeFallback = {
    seed: own(old, 'seed') ? normalizeHex(old.seed) ?? defaultColorSchemeSettings.seed : defaultColorSchemeSettings.seed,
    harmony: own(old, 'harmony') && harmonyOptions.some(({ value }) => value === old.harmony) ? old.harmony as ColorHarmony : defaultColorSchemeSettings.harmony,
    chroma: own(old, 'chroma') ? clamp(finite(old.chroma, defaultColorSchemeSettings.chroma), 0, .3) : defaultColorSchemeSettings.chroma,
    temperature: own(old, 'temperature') && neutralTemperatureOptions.some(({ value }) => value === old.temperature) ? old.temperature as NeutralTemperature : defaultColorSchemeSettings.temperature,
    neutralActions: own(old, 'neutralActions') && typeof old.neutralActions === 'boolean' ? old.neutralActions : defaultColorSchemeSettings.neutralActions,
  };
  if (!record(value)) return safeFallback;
  return {
    seed: own(value, 'seed') ? normalizeHex(value.seed) ?? safeFallback.seed : safeFallback.seed,
    harmony: own(value, 'harmony') && harmonyOptions.some(({ value: harmony }) => harmony === value.harmony) ? value.harmony as ColorHarmony : safeFallback.harmony,
    chroma: own(value, 'chroma') ? clamp(finite(value.chroma, safeFallback.chroma), 0, .3) : safeFallback.chroma,
    temperature: own(value, 'temperature') && neutralTemperatureOptions.some(({ value: temperature }) => temperature === value.temperature) ? value.temperature as NeutralTemperature : safeFallback.temperature,
    neutralActions: own(value, 'neutralActions') && typeof value.neutralActions === 'boolean' ? value.neutralActions : safeFallback.neutralActions,
  };
}

type Oklch = { l: number; c: number; h: number };
type Channels = [number, number, number];
const decodeSrgb = (value: number) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
const encodeSrgb = (value: number) => value <= .0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - .055;

function hexChannels(hex: string): Channels {
  const safe = normalizeHex(hex) ?? '#000000';
  return [1, 3, 5].map((index) => Number.parseInt(safe.slice(index, index + 2), 16) / 255) as Channels;
}

/** D65 sRGB → OKLab → cylindrical OKLCH. Achromatic inputs use hue zero. */
export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = hexChannels(hex).map(decodeSrgb);
  const l = Math.cbrt(.4122214708 * r + .5363325363 * g + .0514459929 * b);
  const m = Math.cbrt(.2119034982 * r + .6806995451 * g + .1073969566 * b);
  const s = Math.cbrt(.0883024619 * r + .2817188376 * g + .6299787005 * b);
  const lightness = .2104542553 * l + .793617785 * m - .0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + .4505937099 * s;
  const labB = .0259040371 * l + .7827717662 * m - .808675766 * s;
  const chroma = Math.hypot(a, labB);
  return { l: clamp(lightness, 0, 1), c: chroma < 1e-7 ? 0 : chroma, h: chroma < 1e-7 ? 0 : wrapHue(Math.atan2(labB, a) * 180 / Math.PI) };
}

function linearSrgb(l: number, c: number, h: number): Channels {
  const a = c * Math.cos(h * Math.PI / 180);
  const b = c * Math.sin(h * Math.PI / 180);
  const ll = (l + .3963377774 * a + .2158037573 * b) ** 3;
  const mm = (l - .1055613458 * a - .0638541728 * b) ** 3;
  const ss = (l - .0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * ll - 3.3077115913 * mm + .2309699292 * ss,
    -1.2684380046 * ll + 2.6097574011 * mm - .3413193965 * ss,
    -.0041960863 * ll - .7034186147 * mm + 1.707614701 * ss,
  ];
}

/** Constant-lightness/hue chroma reduction into sRGB, then rounded 8-bit HEX. */
export function oklchToHex(lightness: number, chroma: number, hue: number): string {
  const l = clamp(finite(lightness, 0), 0, 1);
  const c = clamp(finite(chroma, 0), 0, .4);
  const h = wrapHue(finite(hue, 0));
  const inGamut = (values: Channels) => values.every((channel) => channel >= -1e-7 && channel <= 1.0000001);
  let channels = linearSrgb(l, c, h);
  if (!inGamut(channels)) {
    let lower = 0;
    let upper = c;
    for (let step = 0; step < 24; step++) {
      const middle = (lower + upper) / 2;
      if (inGamut(linearSrgb(l, middle, h))) lower = middle;
      else upper = middle;
    }
    channels = linearSrgb(l, lower, h);
  }
  return `#${channels.map((channel) => Math.round(clamp(encodeSrgb(clamp(channel, 0, 1)), 0, 1) * 255).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(color: string): number {
  const [r, g, b] = hexChannels(color).map(decodeSrgb);
  return .2126 * r + .7152 * g + .0722 * b;
}

function contrast(first: string, second: string): number {
  const firstLight = luminance(first);
  const secondLight = luminance(second);
  return (Math.max(firstLight, secondLight) + .05) / (Math.min(firstLight, secondLight) + .05);
}

function readableText(background: string): string {
  return contrast('#ffffff', background) >= contrast('#000000', background) ? '#ffffff' : '#000000';
}

/** Check the final HEX after gamut mapping and quantization, not the requested L. */
function withContrast(l: number, c: number, h: number, backgrounds: string[], mode: ThemeMode): string {
  const initial = oklchToHex(l, c, h);
  const score = (color: string) => Math.min(...backgrounds.map((background) => contrast(color, background)));
  let best = initial;
  let bestScore = score(initial);
  if (bestScore >= 4.5) return initial;
  const endpoints = mode === 'light' ? [0, 1] : [1, 0];
  for (let step = 1; step <= 512; step++) {
    const candidates = endpoints.map((endpoint) => ({ l: l + (endpoint - l) * step / 512, color: oklchToHex(l + (endpoint - l) * step / 512, c, h) }));
    const valid = candidates.filter(({ color }) => score(color) >= 4.5);
    if (valid.length) return valid.sort((first, second) => Math.abs(first.l - l) - Math.abs(second.l - l))[0].color;
    for (const { color } of candidates) {
      const nextScore = score(color);
      if (nextScore > bestScore) { best = color; bestScore = nextScore; }
    }
  }
  return best;
}

const rampSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const rampLightness = [.985, .955, .9, .82, .73, .64, .54, .44, .35, .27, .18];
const rampChroma = [.08, .18, .35, .6, .85, 1, 1, .9, .75, .6, .4];
const foundationKeys = ['primary', 'accent', 'background', 'surface', 'text', 'muted', 'border'] as const;
const semanticKeys = ['success', 'warning', 'info', 'danger'] as const;

export function generateColorScheme(input: ColorSchemeSettings, mode: ThemeMode) {
  const settings = normalizeColorSchemeSettings(input);
  const selectedMode = mode === 'dark' ? 'dark' : 'light';
  const seed = hexToOklch(settings.seed);
  const seedChroma = seed.c < .0001 ? 0 : settings.chroma;
  // Keep the selected brand color's lightness; the audit can flag unreadable uses.
  const accentLightness = seed.l;
  const harmony = harmonyOptions.find(({ value }) => value === settings.harmony)!;
  const colors = harmony.angles.map((angle, index) => ({
    color: oklchToHex(accentLightness, seedChroma, seed.h + angle),
    hue: wrapHue(seed.h + angle),
    label: index === 0 ? '기준색' : `조합색 ${index}`,
  }));
  const neutralHue = settings.temperature === 'warm' ? 85 : settings.temperature === 'cool' ? 260 : seed.h;
  const neutralChroma = settings.temperature === 'neutral' ? 0 : settings.temperature === 'brand' ? Math.min(.018, seedChroma * .1) : .012;
  const neutral = (lightness: number) => oklchToHex(lightness, neutralChroma, neutralHue);
  const dark = selectedMode === 'dark';
  const background = neutral(dark ? .14 : .975);
  const surface = neutral(dark ? .19 : 1);
  const backgrounds = [background, surface];
  const neutralPrimary = neutral(dark ? .95 : .2);
  const semanticChroma = .08 + settings.chroma * .4;
  const semantic = (hue: number) => withContrast(dark ? .77 : .48, semanticChroma, hue, backgrounds, selectedMode);
  const tokens: Pick<ThemeTokens, ColorTokenKey> = {
    primary: settings.neutralActions ? neutralPrimary : colors[1]?.color ?? colors[0].color,
    accent: colors[0].color,
    background,
    surface,
    text: withContrast(dark ? .96 : .18, neutralChroma, neutralHue, backgrounds, selectedMode),
    muted: withContrast(dark ? .73 : .48, neutralChroma, neutralHue, backgrounds, selectedMode),
    border: neutral(dark ? .32 : .88),
    success: semantic(150), warning: semantic(80), info: semantic(255), danger: semantic(25),
  };
  return {
    colors: tokens,
    harmony: colors,
    neutralRamp: rampSteps.map((step, index) => ({ step, color: neutral(rampLightness[index]) })),
    accentRamp: rampSteps.map((step, index) => ({ step, color: oklchToHex(rampLightness[index], seedChroma * rampChroma[index], seed.h) })),
  };
}

export function getSchemeColorPatch(settings: ColorSchemeSettings, mode: ThemeMode, group: 'foundation' | 'semantic' | 'all', currentTokens?: Pick<ThemeTokens, 'surface' | 'background'>): Partial<Record<ColorTokenKey, string>> {
  const { colors } = generateColorScheme(settings, mode);
  if (group === 'semantic' && currentTokens) {
    const { chroma } = normalizeColorSchemeSettings(settings);
    const backgrounds = [normalizeHex(currentTokens.surface) ?? colors.surface, normalizeHex(currentTokens.background) ?? colors.background];
    const dark = mode === 'dark';
    const hues = { success: 150, warning: 80, info: 255, danger: 25 };
    for (const key of semanticKeys) colors[key] = withContrast(dark ? .77 : .48, .08 + chroma * .4, hues[key], backgrounds, mode);
  }
  const keys = group === 'foundation' ? foundationKeys : group === 'semantic' ? semanticKeys : [...foundationKeys, ...semanticKeys];
  return Object.fromEntries(keys.map((key) => [key, colors[key]]));
}

export type ColorPairAudit = {
  id: string; label: string; foreground: string; background: string; ratio: number; minimum: number; pass: boolean;
};

/** Individual color-pair checks; these do not certify an entire UI's accessibility. */
export function auditColorPairs(tokens: Pick<ThemeTokens, ColorTokenKey>): ColorPairAudit[] {
  const pairs: { id: string; label: string; foreground: string; background: string }[] = [
    { id: 'text-surface', label: '본문 / 표면', foreground: tokens.text, background: tokens.surface },
    { id: 'muted-surface', label: '보조 글자 / 표면', foreground: tokens.muted, background: tokens.surface },
    { id: 'text-background', label: '본문 / 배경', foreground: tokens.text, background: tokens.background },
    { id: 'primary', label: '주요 동작 / 버튼 글자', foreground: readableText(tokens.primary), background: tokens.primary },
    { id: 'accent', label: '포인트 / 글자', foreground: readableText(tokens.accent), background: tokens.accent },
    { id: 'accent-surface', label: '포인트 글자 / 표면', foreground: tokens.accent, background: tokens.surface },
    ...semanticKeys.map((key) => ({ id: key, label: `${({ success: '성공', warning: '경고', info: '정보', danger: '오류' } as const)[key]} / 표면`, foreground: tokens[key], background: tokens.surface })),
  ];
  return pairs.map((pair) => {
    const ratio = contrast(pair.foreground, pair.background);
    return { ...pair, ratio, minimum: 4.5, pass: ratio >= 4.5 };
  });
}
