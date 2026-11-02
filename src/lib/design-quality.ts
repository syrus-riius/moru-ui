import { getContrastRatio, getCssVariables, resolveDensity, type ThemeMode, type ThemeTokens } from '../theme/tokens'

export interface DesignQualityCheck {
  id: string
  label: string
  value: string
  recommendation: string
  passes: boolean
  kind: 'contrast' | 'guidance'
}

/** Token-level checks are guidance, not a substitute for auditing the rendered product. */
export function auditDesignQuality(tokens: ThemeTokens, mode: ThemeMode): DesignQualityCheck[] {
  const variables = getCssVariables(tokens, mode)
  const density = resolveDensity(tokens)
  function contrast(id: string, label: string, foreground: string, background: string, minimum = 4.5): DesignQualityCheck {
    const ratio = getContrastRatio(foreground, background)
    return { id, label, value: `${ratio.toFixed(2)}:1`, recommendation: `${minimum}:1 이상`, passes: ratio >= minimum, kind: 'contrast' }
  }
  const boundary = contrast('field-boundary', '입력 경계 / 입력 배경', variables['--ui-control-border'] ?? tokens.border, variables['--ui-input-bg'], 3)
  if (tokens.borderWidth === 0) {
    boundary.passes = getContrastRatio(variables['--ui-input-bg'], tokens.surface) >= 3
    boundary.value = '테두리 없음'
    boundary.recommendation = '테두리 또는 입력 배경과 주변 표면 3:1 이상'
  }
  return [
    contrast('body-surface', '본문 / 카드 표면', tokens.text, tokens.surface),
    contrast('body-background', '본문 / 페이지 배경', tokens.text, tokens.background),
    contrast('muted-surface', '보조 설명 / 카드 표면', tokens.muted, tokens.surface),
    contrast('primary', '주요 버튼 문구 / 배경', variables['--ui-primary-foreground'], tokens.primary),
    boundary,
    { id: 'body-rhythm', label: '본문 행간 · 자간', value: `${tokens.typography.body.lineHeight}× / ${tokens.typography.body.letterSpacing}em`, recommendation: '행간 1.5–1.8× · 기본 자간 0em', passes: tokens.typography.body.lineHeight >= 1.5 && tokens.typography.body.lineHeight <= 1.8 && tokens.typography.body.letterSpacing >= -0.01, kind: 'guidance' },
    { id: 'group-rhythm', label: '라벨 → 항목 → 섹션', value: `${density.fieldGap} / ${density.formGap} / ${density.sectionGap}px`, recommendation: '관련 정보는 가깝게, 다른 묶음은 더 넓게', passes: density.fieldGap < density.formGap && density.formGap < density.sectionGap, kind: 'guidance' },
    { id: 'control-size', label: '기본 컨트롤 높이', value: `${density.controlHeight.md}px`, recommendation: '웹 최소 24px · 터치 환경은 더 넓게', passes: density.controlHeight.md >= 24, kind: 'guidance' },
  ]
}
