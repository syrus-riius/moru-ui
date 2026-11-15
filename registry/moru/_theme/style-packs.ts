// Generated from Moru UI source. Do not edit. SPDX-License-Identifier: MIT
import type { ThemeMode, ThemeTokens } from './tokens'

export type StylePackId = 'default' | 'glass' | 'neon'
export type StyleAppearance = {
  preset: StylePackId
  /** Surface alpha, not the opacity of content or its descendants. */
  surfaceOpacity: number
  blur: number
  glow: number
  highlight: number
}

export const stylePackOptions: { id: StylePackId; label: string; description: string }[] = [
  { id: 'default', label: 'Default', description: '명확한 표면과 차분한 기본 스타일' },
  { id: 'glass', label: 'Glass', description: '배경이 은은하게 비치는 유리 표면' },
  { id: 'neon', label: 'Neon', description: '주요 동작과 선택 상태를 빛으로 강조' },
]

const defaults: Record<StylePackId, StyleAppearance> = {
  default: { preset: 'default', surfaceOpacity: 1, blur: 0, glow: 0, highlight: 0 },
  glass: { preset: 'glass', surfaceOpacity: 0.72, blur: 16, glow: 0, highlight: 0.4 },
  neon: { preset: 'neon', surfaceOpacity: 1, blur: 0, glow: 18, highlight: 0.35 },
}

function bounded(value: unknown, fallback: number, min: number, max: number, step: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Number((Math.round(Math.min(max, Math.max(min, value)) / step) * step).toFixed(3))
}

/** No arbitrary CSS enters the appearance contract. Older tokens resolve to Default. */
export function resolveAppearance(value?: unknown): StyleAppearance {
  const input =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const preset: StylePackId =
    input.preset === 'glass' || input.preset === 'neon' ? input.preset : 'default'
  const fallback = defaults[preset]
  return {
    preset,
    surfaceOpacity: bounded(input.surfaceOpacity, fallback.surfaceOpacity, 0.55, 1, 0.01),
    blur: bounded(input.blur, fallback.blur, 0, 24, 1),
    glow: bounded(input.glow, fallback.glow, 0, 24, 1),
    highlight: bounded(input.highlight, fallback.highlight, 0, 1, 0.01),
  }
}

/** Change only the material/effect recipe; palette, spacing and behavior are independent. */
export function applyStylePack(tokens: ThemeTokens, preset: StylePackId): ThemeTokens {
  return { ...tokens, appearance: resolveAppearance({ preset }) }
}

function alpha(hex: string, opacity: number): string {
  const color = /^#[\da-f]{6}$/i.test(hex) ? hex : '#181818'
  return `rgb(${parseInt(color.slice(1, 3), 16)} ${parseInt(color.slice(3, 5), 16)} ${parseInt(color.slice(5, 7), 16)} / ${Number(opacity.toFixed(3))})`
}

/** Every scope emits neutral values too, so an inner Default resets an outer effect. */
export function getStylePackVariables(
  tokens: ThemeTokens,
  mode: ThemeMode,
): Record<string, string> {
  const appearance = resolveAppearance(tokens.appearance)
  const { preset, surfaceOpacity, blur, glow, highlight } = appearance
  const variables: Record<string, string> = {
    '--ui-pack-opacity': String(preset === 'glass' ? surfaceOpacity : 1),
    '--ui-pack-blur': `${preset === 'glass' ? blur : 0}px`,
    '--ui-pack-glow': `${preset === 'neon' ? glow : 0}px`,
    '--ui-pack-highlight': String(preset === 'default' ? 0 : highlight),
    '--ui-pack-surface-bg': 'var(--ui-surface)',
    '--ui-pack-surface-image': 'none',
    '--ui-pack-surface-filter': 'none',
    '--ui-pack-surface-shadow': 'var(--ui-shadow)',
    '--ui-pack-sidebar-shadow': 'none',
    '--ui-pack-control-image': 'none',
    '--ui-pack-control-shadow': 'none',
    '--ui-pack-highlight-shadow': 'none',
    '--ui-pack-action-shadow': 'none',
    '--ui-pack-action-hover-shadow': 'none',
    '--ui-pack-active-shadow': 'none',
    '--ui-pack-pressed-shadow': 'inset 0 1px 2px #00000018',
  }
  if (preset === 'default') return variables

  const edgeColor = preset === 'glass' ? '#ffffff' : tokens.accent
  const edge =
    highlight > 0
      ? `inset 0 0 0 1px ${alpha(edgeColor, highlight * (mode === 'dark' ? 0.8 : 1))}`
      : ''
  variables['--ui-pack-highlight-shadow'] = edge || 'none'
  if (preset === 'glass') {
    variables['--ui-pack-surface-bg'] = alpha(tokens.surface, surfaceOpacity)
    if (highlight > 0) {
      // A reflective tint remains visible on plain backdrops as well as imagery.
      variables['--ui-pack-surface-image'] =
        `linear-gradient(135deg, ${alpha('#ffffff', highlight * 0.65)}, transparent 45%, ${alpha(tokens.accent, highlight * 0.3)})`
      variables['--ui-pack-control-image'] =
        `linear-gradient(160deg, ${alpha('#ffffff', highlight * 0.45)}, transparent 55%, ${alpha(tokens.accent, highlight * 0.18)})`
    }
    variables['--ui-pack-surface-filter'] = blur > 0 ? `blur(${blur}px) saturate(125%)` : 'none'
    variables['--ui-pack-surface-shadow'] = [
      edge,
      `0 8px 28px ${alpha('#000000', mode === 'dark' ? 0.28 : 0.1)}`,
    ]
      .filter(Boolean)
      .join(', ')
    // Controls keep an opaque fill under their reflective sheen.
    variables['--ui-pack-action-shadow'] = edge || 'none'
    variables['--ui-pack-action-hover-shadow'] = edge || 'none'
    variables['--ui-pack-active-shadow'] = edge || 'none'
    variables['--ui-pack-pressed-shadow'] = [edge, 'inset 0 1px 2px #00000018']
      .filter(Boolean)
      .join(', ')
    variables['--ui-pack-control-shadow'] = edge || 'none'
  } else {
    variables['--ui-pack-surface-shadow'] = edge || 'var(--ui-shadow)'
    if (highlight > 0) {
      variables['--ui-pack-surface-image'] =
        `linear-gradient(135deg, ${alpha(tokens.accent, highlight * 0.2)}, transparent 60%)`
    }
    variables['--ui-pack-control-shadow'] = edge || 'none'
    if (glow > 0) {
      const strength = mode === 'dark' ? 0.48 : 0.32
      const glowShadow = (radius: number, opacity: number) =>
        `0 0 ${radius}px ${alpha(tokens.accent, opacity)}`
      const withEdge = (shadow: string) => [edge, shadow].filter(Boolean).join(', ')
      variables['--ui-pack-surface-shadow'] = withEdge(glowShadow(glow, strength * 0.65))
      variables['--ui-pack-control-shadow'] = withEdge(
        glowShadow(Math.round(glow * 0.6), strength * 0.5),
      )
      variables['--ui-pack-action-shadow'] = withEdge(glowShadow(glow, strength))
      variables['--ui-pack-action-hover-shadow'] = withEdge(
        glowShadow(Math.round(glow * 1.4), strength + 0.1),
      )
      variables['--ui-pack-active-shadow'] = withEdge(glowShadow(glow, strength))
      variables['--ui-pack-pressed-shadow'] =
        `inset 0 1px 2px #00000018, ${variables['--ui-pack-active-shadow']}`
    }
  }
  variables['--ui-pack-sidebar-shadow'] = variables['--ui-pack-surface-shadow']
  return variables
}
