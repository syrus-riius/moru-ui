import { getCssVariables, fontFamilies, mixColors, readableForeground, resolveDensity, typographyRoleOptions, type ThemeMode, type ThemeTokens } from './tokens'
import { spacingSides, validateComponentSpacing } from './component-spacing'

/** Numeric shared contract; web-only font stacks are explicitly separated from registered native fonts. */
export function createNativeThemeExport(tokens: ThemeTokens, mode: ThemeMode) {
  const variables = getCssVariables(tokens, mode)
  const metrics = resolveDensity(tokens)
  const typography = Object.fromEntries(typographyRoleOptions.map(({ value: role }) => {
    const style = tokens.typography[role]
    return [role, {
      fontSize: style.size,
      lineHeight: Number((style.size * style.lineHeight).toFixed(3)),
      fontWeight: String(Math.min(900, Math.max(100, Math.round(style.weight / 100) * 100))),
      letterSpacing: Number((style.size * style.letterSpacing).toFixed(3)),
    }]
  }))
  const componentSpacing: Record<string, Record<string, number>> = {}
  for (const [component, overrides] of Object.entries(validateComponentSpacing(tokens.componentSpacing))) {
    if (!overrides) continue
    const insets: Record<string, number> = {}
    for (const box of ['padding', 'margin'] as const) for (const side of spacingSides) {
      const length = overrides[box]?.[side]
      if (!length) continue
      insets[`${box}${side[0].toUpperCase()}${side.slice(1)}`] = Number((length.value * (length.unit === 'space' ? metrics.spacing : 1)).toFixed(3))
    }
    if (Object.keys(insets).length) componentSpacing[component] = insets
  }
  return {
    schemaVersion: 2,
    platform: 'react-native' as const,
    mode,
    tokens: {
      space: metrics.spacing,
      radius: tokens.radius,
      borderWidth: tokens.borderWidth,
      density: tokens.density,
      metrics,
      typography,
      componentSpacing,
      webFontFamily: fontFamilies[tokens.fontFamily],
      colors: {
        background: tokens.background, surface: tokens.surface,
        mutedSurface: mixColors(tokens.surface, tokens.text, .045), text: tokens.text,
        muted: tokens.muted, border: tokens.border, controlBorder: variables['--ui-control-border'], primary: tokens.primary,
        primaryForeground: readableForeground(tokens.primary), accent: tokens.accent,
        success: variables['--ui-success-surface-text'], warning: variables['--ui-warning-surface-text'],
        danger: variables['--ui-danger-surface-text'], info: variables['--ui-info-surface-text'],
      },
    },
    accessibility: { minTouchSize: 48, allowFontScaling: true },
    compatibility: {
      nativeFont: 'system-until-registered',
      weightStep: 100,
      componentSpacing: '웹·네이티브 대응 컴포넌트에 적용하며 OS 컨트롤의 내부 여백은 시스템이 담당합니다.',
    },
    usage: 'MoruNativeProvider의 mode와 tokens에 전달합니다. webFontFamily는 브라우저 전용입니다. 기기에서 사용자 폰트를 쓰려면 파일을 등록하고 tokens.fontFamily로 등록 이름을 전달하세요.',
  }
}
