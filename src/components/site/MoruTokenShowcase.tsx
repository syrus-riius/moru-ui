import { useI18n } from '../../i18n'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ChevronDown, Pause, Play, RotateCcw, Shuffle, SlidersHorizontal } from 'lucide-react'
import {
  applyDensity,
  applyFontFamily,
  createDarkTokens,
  defaultTokens,
  type Density,
  type FontFamily,
  type ThemeMode,
  type ThemeTokens,
} from '../../theme/tokens'
import { ThemeScope, useThemePortalContainer } from '../ui/theme-scope'
import { ToastProvider } from '../ui/toast'
import { Popover } from '../ui/popover'
import './moru-token-showcase.css'

const palettes = [
  { name: 'Graphite', light: '#181818', dark: '#ededeb', accent: '#555563', tint: '#f2f2f1' },
  { name: 'Midnight', light: '#3d42a5', dark: '#b2b8ff', accent: '#555cc4', tint: '#f2f3f8' },
  { name: 'Oxblood', light: '#7a223a', dark: '#edabbc', accent: '#91374f', tint: '#f7f2f3' },
  { name: 'Slate', light: '#354b63', dark: '#a6c2dd', accent: '#496888', tint: '#f1f4f6' },
] as const
const densities: Density[] = ['compact', 'standard', 'comfortable']
const densityLabels: Record<Density, string> = {
  compact: '촘촘하게',
  standard: '기본 밀도',
  comfortable: '여유롭게',
}
const fonts: FontFamily[] = ['pretendard', 'noto-sans']
const radii = [2, 6, 12, 18]
const borderWidths = [0, 0.5, 1]
const cycleDuration = 4500
type Recipe = {
  palette: number
  density: Density
  font: FontFamily
  radius: number
  shadow: number
  borderWidth: number
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

function randomRecipe(previous: Recipe | null): Recipe {
  // Change the palette on every turn; independently vary the other bounded tokens.
  const palette = previous
    ? (previous.palette + 1 + Math.floor(Math.random() * (palettes.length - 1))) % palettes.length
    : Math.floor(Math.random() * palettes.length)
  const borderWidth = pick(borderWidths.filter((width) => width !== previous?.borderWidth))
  return {
    palette,
    density: pick(densities),
    font: pick(fonts),
    radius: pick(radii),
    shadow: pick([0, 4, 8]),
    borderWidth,
  }
}

function recipeTokens(recipe: Recipe, mode: ThemeMode): ThemeTokens {
  const palette = palettes[recipe.palette]
  let tokens = applyFontFamily(
    applyDensity(
      {
        ...defaultTokens,
        radius: recipe.radius,
        shadow: recipe.shadow,
        borderWidth: recipe.borderWidth,
      },
      recipe.density,
    ),
    recipe.font,
  )
  tokens = mode === 'dark' ? createDarkTokens(tokens) : { ...tokens, background: palette.tint }
  return {
    ...tokens,
    primary: palette[mode],
    accent: mode === 'dark' ? palette.dark : palette.accent,
  }
}

/** React events from portalled inputs still reach this boundary. Also inspect the
 * scoped portal host so moving from a trigger into its popup keeps playback paused. */
function InteractionBoundary({
  children,
  onInteraction,
}: {
  children: ReactNode
  onInteraction: (active: boolean) => void
}) {
  const content = useRef<HTMLDivElement>(null)
  const portal = useThemePortalContainer()
  const frame = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    },
    [],
  )

  function checkFocus() {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const target = document.activeElement
      onInteraction(
        Boolean(target && (content.current?.contains(target) || portal?.current?.contains(target))),
      )
    })
  }

  return (
    <div ref={content} onFocusCapture={() => onInteraction(true)} onBlurCapture={checkFocus}>
      <ToastProvider>{children}</ToastProvider>
    </div>
  )
}

type MoruTokenShowcaseProps = {
  tokens: ThemeTokens
  mode: ThemeMode
  children: ReactNode
  onEditTokens: (tokens: ThemeTokens) => void
  renderIntro?: (previewTokens: ThemeTokens) => ReactNode
}

/** The fill animation is also the cycle clock, so pauses never drift from token changes. */
function TokenCycleProgress({
  active,
  cycle,
  color,
  onComplete,
}: {
  active: boolean
  cycle: number
  color: string
  onComplete: () => void
}) {
  const { t, formatLocale } = useI18n()
  const fill = useRef<HTMLSpanElement>(null)
  const playback = useRef<Animation | null>(null)
  const running = useRef(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const animation = fill.current!.animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: cycleDuration, easing: 'linear', fill: 'both' },
    )
    animation.pause()
    animation.currentTime = 0
    animation.onfinish = () => {
      if (running.current) onComplete()
    }
    playback.current = animation
    return () => {
      animation.onfinish = null
      animation.cancel()
      playback.current = null
    }
  }, [cycle, onComplete])

  useEffect(() => {
    const animation = playback.current
    if (!animation) return
    running.current = active
    if (active) animation.play()
    else animation.pause()
    const update = () => setElapsed(Math.min(cycleDuration, Number(animation.currentTime ?? 0)))
    update()
    if (!active) return
    // Only this small indicator rerenders; the showcase stays untouched between cycles.
    const timer = window.setInterval(update, 250)
    return () => window.clearInterval(timer)
  }, [active, cycle])

  const seconds = new Intl.NumberFormat(formatLocale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format((cycleDuration - elapsed) / 1000)
  const description = t(active ? '다음 디자인까지 {seconds}초' : '일시정지 · {seconds}초 남음', {
    seconds,
  })
  return (
    <div
      className="moru-token-showcase__progress"
      role="progressbar"
      aria-label={t('다음 디자인으로 자동 전환')}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((elapsed / cycleDuration) * 100)}
      aria-valuetext={description}
      title={description}
      data-paused={!active || undefined}
    >
      <span ref={fill} style={{ backgroundColor: color }} />
    </div>
  )
}

export function MoruTokenShowcase({
  tokens,
  mode,
  children,
  onEditTokens,
  renderIntro,
}: MoruTokenShowcaseProps) {
  const { t } = useI18n()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [cycle, setCycle] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [visible, setVisible] = useState(() => !document.hidden)
  const [interacting, setInteracting] = useState(false)
  const [selecting, setSelecting] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const active = playing && visible && !interacting && !selecting && !detailsOpen && !reducedMotion
  const previewTokens = recipe ? recipeTokens(recipe, mode) : tokens
  const label = recipe ? palettes[recipe.palette].name : 'My Moru'

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    function motionChanged(event: MediaQueryListEvent) {
      setReducedMotion(event.matches)
      if (event.matches) setPlaying(false)
    }
    const visibilityChanged = () => setVisible(!document.hidden)
    media.addEventListener('change', motionChanged)
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      media.removeEventListener('change', motionChanged)
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [])

  const nextRecipe = useCallback(() => {
    setRecipe((previous) => randomRecipe(previous))
    setCycle((current) => current + 1)
  }, [])

  const fontLabel =
    previewTokens.fontFamily === 'noto-sans'
      ? 'Noto Sans'
      : previewTokens.fontFamily === 'pretendard' || previewTokens.fontFamily === 'sans'
        ? 'Pretendard'
        : previewTokens.fontFamily
  const playbackLabel = t(playing && !reducedMotion ? '자동 전환 일시정지' : '자동 전환 재생')
  const style = {
    '--moru-home-accent': 'var(--ui-accent-surface-text)',
    '--moru-home-accent-soft': 'var(--ui-accent-soft)',
  } as CSSProperties

  return (
    <>
      {renderIntro?.(previewTokens)}
      <section className="moru-token-showcase" aria-label={t('라이브 컴포넌트 쇼케이스')}>
        <div className="moru-token-showcase__toolbar">
          <Popover
            title={t('현재 디자인 토큰')}
            className="moru-token-showcase-details"
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            sideOffset={12}
            trigger={
              <button
                type="button"
                className="moru-token-showcase__identity"
                aria-label={t('{name} 디자인 토큰 상세 보기', { name: label })}
              >
                <span
                  className="moru-token-showcase__swatch"
                  style={{ background: previewTokens.primary }}
                  aria-hidden="true"
                />
                <strong>{label}</strong>
                <ChevronDown size={12} aria-hidden="true" />
              </button>
            }
          >
            <dl className="moru-token-showcase-details__values">
              <div>
                <dt>Palette</dt>
                <dd>{label}</dd>
              </div>
              <div>
                <dt>Font</dt>
                <dd>{fontLabel}</dd>
              </div>
              <div>
                <dt>Radius</dt>
                <dd>{previewTokens.radius}px</dd>
              </div>
              <div>
                <dt>Border</dt>
                <dd>{previewTokens.borderWidth}px</dd>
              </div>
              <div>
                <dt>Density</dt>
                <dd>{t(densityLabels[previewTokens.density])}</dd>
              </div>
            </dl>
          </Popover>
          <dl className="moru-token-showcase__values" aria-label={t('현재 예제 디자인 토큰')}>
            <div>
              <dt className="sr-only">Font</dt>
              <dd>{fontLabel}</dd>
            </div>
            <div>
              <dt>Radius</dt>
              <dd>{previewTokens.radius}</dd>
            </div>
            <div>
              <dt>Border</dt>
              <dd>{previewTokens.borderWidth}px</dd>
            </div>
            <div>
              <dt className="sr-only">Density</dt>
              <dd>{t(densityLabels[previewTokens.density])}</dd>
            </div>
          </dl>
          <div className="moru-token-showcase__controls">
            <button
              type="button"
              onClick={() => {
                nextRecipe()
                setPlaying(false)
              }}
              aria-label={t('랜덤 디자인 보기')}
              title={t('랜덤 디자인 보기')}
            >
              <Shuffle size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((current) => !current)}
              disabled={reducedMotion}
              aria-label={playbackLabel}
              title={
                reducedMotion ? t('모션 줄이기 설정으로 자동 전환이 꺼져 있어요') : playbackLabel
              }
              aria-pressed={playing && !reducedMotion}
            >
              {playing && !reducedMotion ? (
                <Pause size={16} aria-hidden="true" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setRecipe(null)
                setCycle((current) => current + 1)
                setPlaying(false)
              }}
              aria-label={t('내 디자인 토큰으로 되돌리기')}
              title={t('내 디자인 토큰으로 되돌리기')}
            >
              <RotateCcw size={15} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="moru-token-showcase__edit"
              aria-label={t('이 토큰 편집')}
              title={t('현재 조합을 적용하고 디자인 토큰 화면으로 이동')}
              onPointerEnter={() => setSelecting(true)}
              onPointerLeave={() => setSelecting(false)}
              onPointerDown={() => setPlaying(false)}
              onFocus={() => setPlaying(false)}
              onClick={() => {
                setPlaying(false)
                onEditTokens(previewTokens)
              }}
            >
              <SlidersHorizontal size={15} aria-hidden="true" />
              <span>{t('이 토큰 편집')}</span>
            </button>
          </div>
          <TokenCycleProgress
            active={active}
            cycle={cycle}
            color={previewTokens.primary}
            onComplete={nextRecipe}
          />
        </div>
        <ThemeScope
          tokens={previewTokens}
          mode={mode}
          className="moru-token-showcase__preview"
          data-interacting={interacting || undefined}
          style={style}
        >
          <InteractionBoundary onInteraction={setInteracting}>{children}</InteractionBoundary>
        </ThemeScope>
      </section>
    </>
  )
}
