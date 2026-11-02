// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import { getComponentSpacingCss, getComponentSpacingVariables, validateComponentSpacing, type ComponentSpacingOverrides } from './component-spacing';

export type ThemeMode = 'light' | 'dark';
export type Density = 'compact' | 'standard' | 'comfortable';
export type FontFamily = 'sans' | 'serif' | 'mono' | 'noto-sans' | 'pretendard';
export type SemanticTone = 'success' | 'warning' | 'info' | 'danger';
export type TypographyRole = 'display' | 'heading' | 'body' | 'label' | 'caption' | 'code';
export type TypographyStyle = { size: number; lineHeight: number; weight: number; letterSpacing: number };
export type TypographyTokens = Record<TypographyRole, TypographyStyle>;
export type DensityMetricKey = 'controlHeight' | 'controlPaddingX' | 'iconSize' | 'spacing' | 'controlGap' | 'checkboxSize' | 'fieldGap' | 'formGap' | 'sectionGap' | 'cardPadding';
/** Size groups store their M value; their S/L values retain the selected profile's ratios. */
export type DensityOverrides = Partial<Record<Density, Partial<Record<DensityMetricKey, number>>>>;
export type DensityMetrics = {
  controlHeight: Record<'sm' | 'md' | 'lg', number>;
  controlPaddingX: Record<'sm' | 'md' | 'lg', number>;
  iconSize: Record<'sm' | 'md' | 'lg', number>;
} & Record<Exclude<DensityMetricKey, 'controlHeight' | 'controlPaddingX' | 'iconSize'>, number>;

export type ThemeTokens = {
  primary: string;
  /** A restrained brand detail, independent from the neutral action color. */
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
  radius: number;
  /** Compatibility aliases. Density and body typography are the source of truth. */
  spacing: number;
  fontSize: number;
  controlHeight: number;
  borderWidth: number;
  shadow: number;
  fontFamily: FontFamily;
  density: Density;
  densityOverrides: DensityOverrides;
  componentSpacing: ComponentSpacingOverrides;
  typography: TypographyTokens;
  duration: number;
};

export type TokenChange = <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => void;
export type TypographyChange = (role: TypographyRole, patch: Partial<TypographyStyle>) => void;

export const fontFamilies: Record<FontFamily, string> = {
  sans: '"Pretendard Variable", Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: '"Noto Serif KR", "Iowan Old Style", Georgia, serif',
  mono: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
  'noto-sans': '"Noto Sans Variable", "Noto Sans KR Variable", "Noto Sans KR", sans-serif',
  pretendard: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export const fontOptions: { value: FontFamily; label: string }[] = [
  { value: 'pretendard', label: 'Pretendard' }, { value: 'noto-sans', label: 'Noto Sans' },
  { value: 'sans', label: 'Sans Serif' }, { value: 'serif', label: 'Serif' }, { value: 'mono', label: 'Monospace' },
];

export const typographyRoleOptions: { value: TypographyRole; label: string; description: string }[] = [
  { value: 'display', label: '대표 제목', description: '페이지의 주제와 첫인상' },
  { value: 'heading', label: '섹션 제목', description: '내용을 묶는 제목' },
  { value: 'body', label: '본문', description: '설명과 여러 줄의 읽기' },
  { value: 'label', label: '라벨', description: '입력 항목과 버튼의 이름' },
  { value: 'caption', label: '보조 설명', description: '도움말과 작은 상태 정보' },
  { value: 'code', label: '코드 · 숫자', description: '코드와 정렬이 필요한 값' },
];

export const densityOptions: { value: Density; label: string; description: string }[] = [
  { value: 'compact', label: '촘촘하게', description: '많은 정보를 한 화면에' },
  { value: 'standard', label: '기본', description: '읽기와 조작의 균형' },
  { value: 'comfortable', label: '여유롭게', description: '넓은 간격과 편안한 조작' },
];

export const semanticToneOptions: { value: SemanticTone; label: string; description: string }[] = [
  { value: 'success', label: '성공', description: '완료와 정상적인 상태' },
  { value: 'warning', label: '경고', description: '주의와 확인이 필요한 상태' },
  { value: 'info', label: '정보', description: '안내와 진행에 도움이 되는 정보' },
  { value: 'danger', label: '오류 · 위험', description: '오류와 되돌리기 어려운 작업' },
];

export const densityProfiles = {
  compact: {
    controlHeight: { sm: 28, md: 32, lg: 36 }, controlPaddingX: { sm: 8, md: 10, lg: 12 },
    iconSize: { sm: 14, md: 16, lg: 18 }, spacing: 3, controlGap: 6, checkboxSize: 16,
    fieldGap: 6, formGap: 16, sectionGap: 24, cardPadding: 16,
  },
  standard: {
    controlHeight: { sm: 32, md: 40, lg: 48 }, controlPaddingX: { sm: 10, md: 14, lg: 18 },
    iconSize: { sm: 14, md: 16, lg: 20 }, spacing: 4, controlGap: 8, checkboxSize: 18,
    fieldGap: 8, formGap: 24, sectionGap: 32, cardPadding: 24,
  },
  comfortable: {
    controlHeight: { sm: 40, md: 48, lg: 56 }, controlPaddingX: { sm: 14, md: 18, lg: 22 },
    iconSize: { sm: 16, md: 18, lg: 20 }, spacing: 5, controlGap: 10, checkboxSize: 20,
    fieldGap: 10, formGap: 32, sectionGap: 40, cardPadding: 32,
  },
} as const;

export const densityOverrideDefinitions = {
  controlHeight: { label: '컨트롤 높이', min: 28, max: 80, step: 0.1, unit: 'px' },
  controlPaddingX: { label: '컨트롤 좌우 여백', min: 4, max: 32, step: 0.1, unit: 'px' },
  iconSize: { label: '아이콘 크기', min: 12, max: 32, step: 0.1, unit: 'px' },
  spacing: { label: '기본 간격', min: 2, max: 8, step: 0.1, unit: 'px' },
  controlGap: { label: '아이콘과 문구', min: 0, max: 24, step: 0.1, unit: 'px' },
  checkboxSize: { label: '체크박스 크기', min: 12, max: 32, step: 0.1, unit: 'px' },
  fieldGap: { label: '라벨과 입력창', min: 0, max: 24, step: 0.1, unit: 'px' },
  formGap: { label: '입력 항목 사이', min: 4, max: 64, step: 0.1, unit: 'px' },
  sectionGap: { label: '섹션 사이', min: 8, max: 96, step: 0.1, unit: 'px' },
  cardPadding: { label: '카드 안쪽 여백', min: 4, max: 64, step: 0.1, unit: 'px' },
} as const satisfies Record<DensityMetricKey, { label: string; min: number; max: number; step: number; unit: 'px' }>;

/** Unitless line heights and em tracking keep roles independent of density. */
export function getTypographyProfile(fontFamily: FontFamily): TypographyTokens {
  const isNoto = fontFamily === 'noto-sans';
  return {
    display: { size: 32, lineHeight: isNoto ? 1.35 : 1.25, weight: 600, letterSpacing: isNoto ? -0.03 : -0.035 },
    heading: { size: 20, lineHeight: isNoto ? 1.5 : 1.4, weight: 600, letterSpacing: isNoto ? -0.02 : -0.025 },
    // Reading copy and labels keep natural glyph spacing. Tight tracking belongs
    // to headings, where the larger size supports the denser brand treatment.
    body: { size: 14, lineHeight: isNoto ? 1.7 : 1.6, weight: 400, letterSpacing: 0 },
    label: { size: 13, lineHeight: isNoto ? 1.55 : 1.5, weight: 500, letterSpacing: 0 },
    caption: { size: 12, lineHeight: isNoto ? 1.6 : 1.5, weight: 400, letterSpacing: 0 },
    code: { size: 12, lineHeight: 1.6, weight: 450, letterSpacing: 0 },
  };
}

function cloneTypography(typography: TypographyTokens): TypographyTokens {
  return Object.fromEntries(typographyRoleOptions.map(({ value }) => [value, { ...typography[value] }])) as TypographyTokens;
}

export const DEFAULT_PRESET_ID = 'graphite';

export const defaultTokens: ThemeTokens = {
  primary: '#181818', accent: '#ef543d', background: '#f5f5f3', surface: '#ffffff', text: '#171717',
  muted: '#6e6e6b', border: '#e8e8e4', danger: '#b93d37',
  success: '#287250', warning: '#91620e', info: '#50504d', radius: 6,
  spacing: 4, fontSize: 14, controlHeight: 40, borderWidth: 0, shadow: 0,
  fontFamily: 'pretendard', density: 'standard', densityOverrides: {}, componentSpacing: {}, typography: getTypographyProfile('pretendard'), duration: 160,
};

export const presets: { id: string; name: string; color: string; tokens: ThemeTokens }[] = [
  { id: DEFAULT_PRESET_ID, name: '그래파이트 · 코럴', color: '#ef543d', tokens: { ...defaultTokens, densityOverrides: {}, componentSpacing: {}, typography: cloneTypography(defaultTokens.typography) } },
  { id: 'midnight-blue', name: '미드나이트 블루', color: '#3d42c9', tokens: { ...defaultTokens, densityOverrides: {}, componentSpacing: {}, typography: cloneTypography(defaultTokens.typography), accent: '#3d42c9' } },
  { id: 'oxblood', name: '검붉은 레드', color: '#7a223a', tokens: { ...defaultTokens, densityOverrides: {}, componentSpacing: {}, typography: cloneTypography(defaultTokens.typography), accent: '#7a223a' } },
];

export const colorTokenKeys = ['primary', 'accent', 'background', 'surface', 'text', 'muted', 'border', 'danger', 'success', 'warning', 'info'] as const;
export type ColorTokenKey = typeof colorTokenKeys[number];

export const tokenDefinitions = {
  radius: { label: '모서리', min: 0, max: 24, step: 1, unit: 'px' },
  spacing: { label: '기본 간격', min: 2, max: 8, step: 1, unit: 'px' },
  controlHeight: { label: '컨트롤 높이', min: 28, max: 56, step: 1, unit: 'px' },
  fontSize: { label: '글자 크기', min: 12, max: 18, step: 1, unit: 'px' },
  borderWidth: { label: '테두리', min: 0, max: 3, step: 0.5, unit: 'px' },
  shadow: { label: '그림자', min: 0, max: 24, step: 1, unit: 'px' },
  duration: { label: '모션 속도', min: 0, max: 500, step: 10, unit: 'ms' },
} as const;

export const typographyDefinitions = {
  size: { label: '크기', min: 12, max: 64, step: 1, unit: 'px' },
  weight: { label: '굵기', min: 300, max: 800, step: 50, unit: '' },
  lineHeight: { label: '줄높이', min: 1.1, max: 2.2, step: 0.05, unit: '×' },
  letterSpacing: { label: '자간', min: -0.06, max: 0.12, step: 0.005, unit: 'em' },
} as const;

export function normalizeColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const color = value.trim().toLowerCase();
  if (/^#[\da-f]{6}$/.test(color)) return color;
  if (/^#[\da-f]{3}$/.test(color)) return `#${color.slice(1).split('').map((char) => char + char).join('')}`;
  return null;
}

function boundedNumber(value: unknown, fallback: number, definition: { min: number; max: number; step: number }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Number((Math.round(Math.min(definition.max, Math.max(definition.min, value)) / definition.step) * definition.step).toFixed(4));
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function validateDensityOverrides(value: unknown, fallback: DensityOverrides = {}): DensityOverrides {
  const input = objectRecord(value);
  if (!input) return validateDensityOverrides(fallback);
  const result: DensityOverrides = {};
  for (const { value: density } of densityOptions) {
    if (!Object.hasOwn(input, density)) continue;
    const group = objectRecord(input[density]);
    const fallbackGroup = Object.hasOwn(fallback, density) ? objectRecord(fallback[density]) : null;
    if (!group) {
      if (fallbackGroup) result[density] = { ...validateDensityOverrides({ [density]: fallbackGroup })[density] };
      continue;
    }
    const next: Partial<Record<DensityMetricKey, number>> = {};
    for (const key of Object.keys(densityOverrideDefinitions) as DensityMetricKey[]) {
      if (!Object.hasOwn(group, key)) continue;
      const raw = group[key];
      const old = fallbackGroup && Object.hasOwn(fallbackGroup, key) ? fallbackGroup[key] : undefined;
      if (typeof raw === 'number' && Number.isFinite(raw)) next[key] = boundedNumber(raw, 0, densityOverrideDefinitions[key]);
      else if (typeof old === 'number' && Number.isFinite(old)) next[key] = boundedNumber(old, 0, densityOverrideDefinitions[key]);
    }
    if (Object.keys(next).length) result[density] = next;
  }
  return result;
}

/** Resolve a fresh, editable profile without changing calibrated default S/M/L ratios. */
export function resolveDensity(tokens: Pick<ThemeTokens, 'density'> & Partial<Pick<ThemeTokens, 'densityOverrides'>>, density: Density = tokens.density): DensityMetrics {
  const selected = Object.hasOwn(densityProfiles, density) ? density : 'standard';
  const profile = densityProfiles[selected];
  const overrides = validateDensityOverrides(tokens.densityOverrides)[selected] ?? {};
  const result: DensityMetrics = {
    ...profile,
    controlHeight: { ...profile.controlHeight },
    controlPaddingX: { ...profile.controlPaddingX },
    iconSize: { ...profile.iconSize },
  };
  for (const key of ['controlHeight', 'controlPaddingX', 'iconSize'] as const) {
    const medium = overrides[key] ?? profile[key].md;
    for (const size of ['sm', 'md', 'lg'] as const) result[key][size] = Number((profile[key][size] * medium / profile[key].md).toFixed(1));
  }
  for (const key of ['spacing', 'controlGap', 'checkboxSize', 'fieldGap', 'formGap', 'sectionGap', 'cardPadding'] as const) result[key] = overrides[key] ?? profile[key];
  return result;
}

/** Edit one M-based group or scalar in the active profile, preserving sibling profiles. */
export function withDensityMetric(tokens: ThemeTokens, key: DensityMetricKey, value: number): ThemeTokens {
  const densityOverrides = validateDensityOverrides(tokens.densityOverrides);
  if (!Object.hasOwn(densityOverrideDefinitions, key) || !Number.isFinite(value)) return applyDensity(tokens, tokens.density);
  const profile = densityProfiles[tokens.density];
  const normalized = boundedNumber(value, 0, densityOverrideDefinitions[key]);
  const base = typeof profile[key] === 'number' ? profile[key] : profile[key].md;
  const next = { ...densityOverrides[tokens.density], [key]: normalized };
  if (normalized === base) delete next[key];
  if (Object.keys(next).length) densityOverrides[tokens.density] = next;
  else delete densityOverrides[tokens.density];
  return applyDensity({ ...tokens, densityOverrides }, tokens.density);
}

function validateTypography(value: unknown, fallback: TypographyTokens): TypographyTokens {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const result = cloneTypography(fallback);
  for (const { value: role } of typographyRoleOptions) {
    const roleInput = input[role] && typeof input[role] === 'object' && !Array.isArray(input[role]) ? input[role] as Record<string, unknown> : {};
    for (const property of Object.keys(typographyDefinitions) as (keyof TypographyStyle)[]) {
      result[role][property] = boundedNumber(roleInput[property], fallback[role][property], typographyDefinitions[property]);
    }
  }
  return result;
}

export function applyDensity(tokens: ThemeTokens, density: Density): ThemeTokens {
  const densityOverrides = validateDensityOverrides(tokens.densityOverrides);
  const profile = resolveDensity({ density, densityOverrides });
  return { ...tokens, typography: cloneTypography(tokens.typography), componentSpacing: validateComponentSpacing(tokens.componentSpacing), density, densityOverrides, spacing: profile.spacing, controlHeight: profile.controlHeight.md };
}

/** Keep manual edits as offsets when moving between calibrated font profiles. */
export function applyFontFamily(tokens: ThemeTokens, fontFamily: FontFamily): ThemeTokens {
  const before = getTypographyProfile(tokens.fontFamily);
  const after = getTypographyProfile(fontFamily);
  for (const { value: role } of typographyRoleOptions) {
    for (const property of Object.keys(typographyDefinitions) as (keyof TypographyStyle)[]) {
      after[role][property] = Number((after[role][property] + tokens.typography[role][property] - before[role][property]).toFixed(4));
    }
  }
  const typography = validateTypography(after, getTypographyProfile(fontFamily));
  return { ...tokens, densityOverrides: validateDensityOverrides(tokens.densityOverrides), componentSpacing: validateComponentSpacing(tokens.componentSpacing), fontFamily, typography, fontSize: typography.body.size };
}

export function createComparisonTokens(tokens: ThemeTokens, fontFamily: FontFamily, density: Density): ThemeTokens {
  return applyDensity(applyFontFamily(tokens, fontFamily), density);
}

export function validateTokens(value: unknown, fallback = defaultTokens): ThemeTokens {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const tokens = { ...fallback, typography: cloneTypography(fallback.typography), densityOverrides: validateDensityOverrides(Object.hasOwn(input, 'densityOverrides') ? input.densityOverrides : fallback.densityOverrides, fallback.densityOverrides), componentSpacing: validateComponentSpacing(Object.hasOwn(input, 'componentSpacing') ? input.componentSpacing : fallback.componentSpacing, fallback.componentSpacing) };
  for (const key of colorTokenKeys) tokens[key] = normalizeColor(input[key]) ?? fallback[key];
  for (const key of ['radius', 'borderWidth', 'shadow', 'duration'] as const) tokens[key] = boundedNumber(input[key], fallback[key], tokenDefinitions[key]);
  if (typeof input.fontFamily === 'string' && Object.hasOwn(fontFamilies, input.fontFamily)) {
    const adjusted = applyFontFamily(tokens, input.fontFamily as FontFamily);
    tokens.fontFamily = adjusted.fontFamily;
    tokens.typography = adjusted.typography;
  }
  tokens.typography = validateTypography(input.typography, tokens.typography);
  const typographyInput = input.typography && typeof input.typography === 'object' ? input.typography as Record<string, unknown> : {};
  const bodyInput = typographyInput.body && typeof typographyInput.body === 'object' ? typographyInput.body as Record<string, unknown> : {};
  if (!('size' in bodyInput) && typeof input.fontSize === 'number' && Number.isFinite(input.fontSize)) {
    tokens.typography.body.size = boundedNumber(input.fontSize, tokens.typography.body.size, typographyDefinitions.size);
  }
  tokens.fontSize = tokens.typography.body.size;
  if (typeof input.density === 'string' && Object.hasOwn(densityProfiles, input.density)) tokens.density = input.density as Density;
  else if (!('density' in input) && typeof input.controlHeight === 'number' && Number.isFinite(input.controlHeight)) {
    // Version 1 had a free control-height slider; retain its closest coherent density.
    tokens.density = input.controlHeight <= 34 ? 'compact' : input.controlHeight >= 46 ? 'comfortable' : 'standard';
  }
  return applyDensity(tokens, tokens.density);
}

function rgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

export function mixColors(first: string, second: string, amount: number): string {
  const a = rgb(first);
  const b = rgb(second);
  return `#${a.map((value, index) => Math.round(value + (b[index] - value) * amount).toString(16).padStart(2, '0')).join('')}`;
}

function luminance(hex: string): number {
  const [r, g, b] = rgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722;
}

export function readableForeground(background: string): string {
  const light = '#ffffff';
  const dark = '#000000';
  const backgroundLuminance = luminance(background);
  const lightContrast = (luminance(light) + 0.05) / (backgroundLuminance + 0.05);
  const darkContrast = (backgroundLuminance + 0.05) / (luminance(dark) + 0.05);
  return lightContrast >= darkContrast ? light : dark;
}

/** WCAG relative luminance contrast, independent of argument order. */
export function getContrastRatio(first: string, second: string): number {
  const firstLuminance = luminance(normalizeColor(first) ?? '#000000');
  const secondLuminance = luminance(normalizeColor(second) ?? '#000000');
  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05);
}

/** Preserve the selected hue, moving only the derived foreground toward a readable endpoint. */
function contrastColor(base: string, backgrounds: string[], minimum: number): string {
  const score = (color: string) => Math.min(...backgrounds.map((background) => getContrastRatio(color, background)));
  if (score(base) >= minimum) return base;
  let best = base;
  let bestScore = score(base);
  // Search both directions so custom light/dark surfaces remain supported. The first
  // valid step keeps as much of the user's chosen color as possible.
  for (let step = 1; step <= 100; step++) {
    const candidates = ['#000000', '#ffffff'].map((endpoint) => mixColors(base, endpoint, step / 100));
    const valid = candidates.filter((color) => score(color) >= minimum);
    if (valid.length) return valid.sort((first, second) => score(second) - score(first))[0];
    for (const color of candidates) {
      const currentScore = score(color);
      if (currentScore > bestScore) { best = color; bestScore = currentScore; }
    }
  }
  // Extremely different custom background/surface pairs may have no shared 3:1
  // color. In that case use the highest contrast candidate rather than transparency.
  return best;
}

export function createDarkTokens(light: ThemeTokens): ThemeTokens {
  return {
    ...light, typography: cloneTypography(light.typography), densityOverrides: validateDensityOverrides(light.densityOverrides), componentSpacing: validateComponentSpacing(light.componentSpacing),
    primary: light.primary === defaultTokens.primary ? '#f2f2ed' : light.primary,
    accent: light.accent === defaultTokens.accent ? '#f2654e' : light.accent,
    background: '#0b0b0b', surface: '#151515',
    text: '#f6f6f3', muted: '#a0a09c', border: '#2c2c2a', danger: '#ed8178',
    success: '#85c7a2', warning: '#e7bc72', info: '#bbbbb5',
  };
}

export function getCssVariables(tokens: ThemeTokens, mode: ThemeMode): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const key of colorTokenKeys) variables[`--ui-${key}`] = tokens[key];
  const numericUnits = { radius: 'px', spacing: 'px', fontSize: 'px', controlHeight: 'px', borderWidth: 'px', duration: 'ms' } as const;
  for (const key of Object.keys(numericUnits) as (keyof typeof numericUnits)[]) {
    const name = key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
    variables[`--ui-${name}`] = `${tokens[key]}${numericUnits[key]}`;
  }
  for (const { value: role } of typographyRoleOptions) {
    const style = tokens.typography[role];
    variables[`--ui-type-${role}-size`] = `${style.size}px`;
    variables[`--ui-type-${role}-line-height`] = String(style.lineHeight);
    variables[`--ui-type-${role}-weight`] = String(style.weight);
    variables[`--ui-type-${role}-letter-spacing`] = `${style.letterSpacing}em`;
  }
  const density = resolveDensity(tokens);
  for (const size of ['sm', 'md', 'lg'] as const) {
    variables[`--ui-control-height-${size}`] = `${density.controlHeight[size]}px`;
    variables[`--ui-control-padding-x-${size}`] = `${density.controlPaddingX[size]}px`;
    variables[`--ui-icon-size-${size}`] = `${density.iconSize[size]}px`;
  }
  for (const key of ['controlGap', 'checkboxSize', 'fieldGap', 'formGap', 'sectionGap', 'cardPadding'] as const) {
    variables[`--ui-${key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`] = `${density[key]}px`;
  }
  variables['--ui-density'] = tokens.density;
  variables['--ui-spacing'] = `${density.spacing}px`;
  variables['--ui-control-height'] = `${density.controlHeight.md}px`;
  variables['--ui-control-size'] = `${density.controlHeight.md}px`;
  variables['--ui-control-padding-x'] = `${density.controlPaddingX.md}px`;
  variables['--ui-icon-size'] = `${density.iconSize.md}px`;
  variables['--ui-font-size'] = `${tokens.typography.body.size}px`;
  variables['--ui-space'] = `${density.spacing}px`;
  variables['--ui-font-family'] = fontFamilies[tokens.fontFamily];
  variables['--ui-font-family-code'] = fontFamilies.mono;
  variables['--ui-primary-foreground'] = readableForeground(tokens.primary);
  for (const key of ['primary', 'danger'] as const) {
    for (const state of ['hover', 'pressed'] as const) {
      const background = mixColors(tokens[key], mode === 'dark' ? '#ffffff' : '#000000', state === 'hover' ? 0.12 : 0.22);
      variables[`--ui-${key}-${state}`] = background;
      variables[`--ui-${key}-${state}-foreground`] = readableForeground(background);
    }
  }
  for (const tone of ['accent', ...semanticToneOptions.map(({ value }) => value)] as const) {
    const soft = mixColors(tokens.surface, tokens[tone], mode === 'dark' ? 0.18 : 0.08);
    variables[`--ui-${tone}-soft`] = soft;
    variables[`--ui-${tone}-text`] = contrastColor(tokens[tone], [soft], 4.5);
    variables[`--ui-${tone}-surface-text`] = contrastColor(tokens[tone], [tokens.surface], 4.5);
    variables[`--ui-${tone}-border`] = mixColors(tokens.surface, tokens[tone], mode === 'dark' ? 0.44 : 0.3);
    variables[`--ui-${tone}-foreground`] = readableForeground(tokens[tone]);
  }
  variables['--ui-primary-soft'] = mixColors(tokens.surface, tokens.primary, mode === 'dark' ? 0.24 : 0.09);
  variables['--ui-primary-soft-text'] = contrastColor(tokens.primary, [variables['--ui-primary-soft']], 4.5);
  variables['--ui-primary-surface-text'] = contrastColor(tokens.primary, [tokens.surface], 4.5);
  variables['--ui-input-bg'] = mixColors(tokens.surface, tokens.text, 0.065);
  // Surface dividers remain quiet; an empty field needs its own visible boundary.
  variables['--ui-control-border'] = contrastColor(tokens.border, [tokens.surface, tokens.background, variables['--ui-input-bg']], 3);
  variables['--ui-card-radius'] = `${tokens.radius + 4}px`;
  variables['--ui-surface-hover'] = mixColors(tokens.surface, tokens.text, 0.045);
  variables['--ui-control-hover-bg'] = variables['--ui-surface-hover'];
  variables['--ui-control-hover-border'] = contrastColor(mixColors(tokens.border, tokens.text, 0.22), [tokens.surface, tokens.background, variables['--ui-control-hover-bg']], 3);
  variables['--ui-control-pressed-bg'] = mixColors(tokens.surface, tokens.text, 0.085);
  variables['--ui-control-pressed-border'] = contrastColor(mixColors(tokens.border, tokens.text, 0.36), [tokens.surface, tokens.background, variables['--ui-control-pressed-bg']], 3);
  variables['--ui-focus-ring'] = contrastColor(tokens.primary, [tokens.surface, tokens.background], 3);
  variables['--ui-ring'] = variables['--ui-focus-ring'];
  variables['--ui-error-ring'] = contrastColor(tokens.danger, [tokens.surface, tokens.background], 3);
  variables['--ui-disabled-bg'] = mixColors(tokens.surface, tokens.text, mode === 'dark' ? 0.06 : 0.035);
  variables['--ui-disabled-text'] = mixColors(tokens.surface, tokens.text, 0.38);
  variables['--ui-disabled-border'] = mixColors(tokens.surface, tokens.border, 0.7);
  variables['--ui-loading-bg'] = tokens.primary;
  variables['--ui-loading-text'] = readableForeground(tokens.primary);
  variables['--ui-shadow-size'] = `${tokens.shadow}px`;
  variables['--ui-shadow'] = tokens.shadow === 0 ? 'none' : `0 ${Math.max(1, tokens.shadow / 4)}px ${tokens.shadow * 2}px -${tokens.shadow / 2}px rgb(0 0 0 / ${mode === 'dark' ? 0.32 : 0.1})`;
  variables['--ui-color-scheme'] = mode;
  Object.assign(variables, getComponentSpacingVariables(tokens.componentSpacing));
  return variables;
}

export function cssForTokens(tokens: ThemeTokens, mode: ThemeMode): string {
  const lines = Object.entries(getCssVariables(tokens, mode)).map(([name, value]) => `  ${name}: ${value};`);
  const componentCss = getComponentSpacingCss(tokens.componentSpacing);
  return `/* Moru UI · ${mode} theme · set data-theme="${mode}" on <html> */\n:root[data-theme="${mode}"] {\n  color-scheme: ${mode};\n${lines.join('\n')}\n}\n${componentCss ? `\n${componentCss}\n` : ''}`;
}
