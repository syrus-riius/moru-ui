import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, Lock, LockOpen, RotateCcw, Shuffle } from 'lucide-react'
import { useI18n } from '../../i18n'
import {
  auditPaletteRecommendation,
  generatePaletteRecommendations,
  generateRandomPaletteSet,
  paletteRoleKeys,
  type PaletteColors,
  type PaletteHarmony,
  type PaletteLocks,
  type PaletteRecommendation,
  type PaletteRole,
} from '../../theme/palette-recommendations'
import { harmonyOptions, type ColorHarmony } from '../../theme/color-scheme'
import { createWheelPalette, type PaletteWheelChange } from '../../theme/palette-wheel'
import { normalizeColor, type ThemeMode, type ThemeTokens } from '../../theme/tokens'
import { Button } from '../ui/button'
import { Collapsible } from '../ui/collapsible'
import { Input } from '../ui/input'
import { ToggleGroup } from '../ui/toggle-group'
import { colorRoleLabels } from './color-editor-labels'
import { PaletteColorWheel } from './PaletteColorWheel'
import './palette-recommendations.css'

export type PalettePreview = {
  id: string
  name: string
  colors: PaletteColors
  mode: ThemeMode
}

export type PaletteRecommendationsProps = {
  /** Committed tokens, kept separate so reverting never saves a temporary preview. */
  tokens: ThemeTokens
  mode: ThemeMode
  preview: PalettePreview | null
  lockedRoles: PaletteRole[]
  onToggleLock: (role: PaletteRole) => void
  onClearLocks: () => void
  onPreview: (candidate: PaletteRecommendation) => void
  onSave: () => void
  onCancel: () => void
}

type PaletteBatch = {
  seed: string
  mode: ThemeMode
  lockKey: string
  harmony: PaletteHarmony
  recommendations: PaletteRecommendation[]
}

function HarmonyIcon({ angles }: { angles: readonly number[] }) {
  const points = angles.map((angle) => {
    const radians = ((angle - 90) * Math.PI) / 180
    return { x: 16 + Math.cos(radians) * 11, y: 16 + Math.sin(radians) * 11 }
  })
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="3" opacity="0.16" />
      {points.length > 1 && (
        <polygon
          points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      )}
      {points.map(({ x, y }, index) => (
        <circle key={index} cx={x} cy={y} r="2.4" fill="currentColor" />
      ))}
      {points.length === 1 && <circle cx="16" cy="16" r="2.4" fill="currentColor" opacity="0.45" />}
    </svg>
  )
}

export function PaletteRecommendations({
  tokens,
  mode,
  preview,
  lockedRoles,
  onToggleLock,
  onClearLocks,
  onPreview,
  onSave,
  onCancel,
}: PaletteRecommendationsProps) {
  const { t } = useI18n()
  const id = useId()
  const activePreview = preview?.mode === mode ? preview : null
  const initialSeed = activePreview?.colors.primary ?? tokens.primary
  const [seed, setSeed] = useState(initialSeed)
  const [seedEdited, setSeedEdited] = useState(false)
  const [generatedSeed, setGeneratedSeed] = useState(initialSeed)
  const [batch, setBatch] = useState<PaletteBatch | null>(null)
  const [harmony, setHarmony] = useState<PaletteHarmony>('all')
  const [previewRevision, setPreviewRevision] = useState(preview ? 1 : 0)
  const [message, setMessage] = useState('')
  const [wheelInteracting, setWheelInteracting] = useState(false)
  const wheelChanged = useRef(false)
  const savedPrimary = useRef(tokens.primary)
  const previousMode = useRef(mode)
  const hadPreview = useRef(Boolean(activePreview))

  useEffect(() => {
    const previewEnded = hadPreview.current && !activePreview
    hadPreview.current = Boolean(activePreview)
    // The page-level Save/Revert actions must reset the wheel seed too, even
    // when a locked primary means the committed primary itself did not change.
    if (savedPrimary.current !== tokens.primary || previousMode.current !== mode || previewEnded) {
      savedPrimary.current = tokens.primary
      if (previousMode.current !== mode) setMessage('')
      previousMode.current = mode
      setSeed(tokens.primary)
      setSeedEdited(false)
      setGeneratedSeed(tokens.primary)
      setBatch(null)
    }
  }, [tokens.primary, mode, activePreview])

  const effectiveColors = activePreview?.colors ?? tokens
  const locks = useMemo(() => {
    const values: PaletteLocks = {}
    for (const role of lockedRoles) values[role] = effectiveColors[role]
    return values
  }, [effectiveColors, lockedRoles])
  const lockKey = paletteRoleKeys
    .filter((role) => locks[role])
    .map((role) => `${role}:${normalizeColor(locks[role]!)}`)
    .join('|')
  const primaryLocked = lockedRoles.includes('primary')
  const allLocked = paletteRoleKeys.every((role) => lockedRoles.includes(role))
  const visibleSeed = primaryLocked ? effectiveColors.primary : seed
  const normalizedSeed = normalizeColor(visibleSeed)
  // A random batch has an exploration seed even when primary itself is locked.
  // Keep that seed as its identity; the displayed input still shows locked primary.
  const candidateSeed = generatedSeed
  const recommendationsStale = !primaryLocked && seedEdited
  const candidates = useMemo(() => {
    // Random suggestions include their own lightness/chroma variations. Keep the
    // exact generated set until its seed, mode, or locked colors change.
    if (
      batch?.seed === candidateSeed &&
      batch.mode === mode &&
      batch.lockKey === lockKey &&
      batch.harmony === harmony
    ) {
      return batch.recommendations
    }
    return generatePaletteRecommendations(candidateSeed, mode, locks, harmony)
  }, [batch, candidateSeed, mode, lockKey, locks, harmony])
  const harmonyOption = harmonyOptions.find((option) => option.value === harmony)
  const previewHarmony =
    activePreview?.id === 'tonal'
      ? 'mono'
      : (harmonyOptions.find((option) => option.value === activePreview?.id)?.value ?? 'mono')
  const wheelHarmony: ColorHarmony = harmony === 'all' ? previewHarmony : harmony
  const wheelHarmonyName = harmonyOptions.find((option) => option.value === wheelHarmony)!.label
  const examinedTokens = useMemo(
    () => (activePreview ? { ...tokens, ...activePreview.colors } : null),
    [tokens, activePreview],
  )
  const audits = useMemo(
    () => (examinedTokens ? auditPaletteRecommendation(examinedTokens, mode) : []),
    [examinedTokens, mode],
  )

  function editSeed(value: string) {
    setSeed(value)
    setSeedEdited(true)
    setMessage('')
  }

  function generate() {
    if (!normalizedSeed || allLocked) return
    // Keep the current preview while choosing another candidate. Cancelling here
    // would replace locked preview colors with their previously saved values.
    const recommendations = generatePaletteRecommendations(normalizedSeed, mode, locks, harmony)
    setSeed(normalizedSeed)
    setSeedEdited(false)
    setGeneratedSeed(normalizedSeed)
    setBatch({ seed: normalizedSeed, mode, lockKey, harmony, recommendations })
    setMessage('팔레트 {count}개를 추천했습니다. 후보를 눌러 미리 보세요.')
  }

  function randomize() {
    if (allLocked) return
    const result = generateRandomPaletteSet(
      mode,
      primaryLocked ? generatedSeed : (normalizedSeed ?? generatedSeed),
      locks,
      Math.random,
      harmony,
    )
    const candidate = result.recommendations.find((item) => item.id === result.selectedId)
    if (!candidate) return
    setSeed(candidate.colors.primary)
    setSeedEdited(false)
    setGeneratedSeed(result.seed)
    setBatch({ seed: result.seed, mode, lockKey, harmony, recommendations: result.recommendations })
    setPreviewRevision((revision) => revision + 1)
    setMessage('')
    onPreview(candidate)
  }

  function changeWheel(change: PaletteWheelChange) {
    if (allLocked || lockedRoles.includes(change.role)) return
    const candidate = createWheelPalette(change, mode, wheelHarmony, locks)
    wheelChanged.current = true
    setHarmony(wheelHarmony)
    setSeed(candidate.colors.primary)
    setSeedEdited(false)
    setGeneratedSeed(candidate.colors.primary)
    // Preserve the exact dragged palette, including contrast corrections, so
    // the candidate card and the live components continue to show one result.
    setBatch({
      seed: candidate.colors.primary,
      mode,
      lockKey,
      harmony: wheelHarmony,
      recommendations: [candidate],
    })
    setMessage('')
    onPreview(candidate)
  }

  return (
    <section className="palette-recommendations" aria-label={t('팔레트 추천')}>
      <Collapsible title={t('팔레트 추천')} size="sm" defaultOpen>
        <div className="palette-recommendations__body">
          <p className="palette-recommendations__note">
            {t(
              '배색 규칙과 잠금 조건으로 팔레트를 만듭니다. 선택하면 저장 전에 미리 볼 수 있어요.',
            )}
          </p>
          <p className="palette-recommendations__wheel-rule">
            {t('색상환 · {name}', { name: t(wheelHarmonyName) })}
          </p>
          <PaletteColorWheel
            interactionKey={`${mode}:${wheelHarmony}`}
            colors={effectiveColors}
            lockedRoles={lockedRoles}
            disabled={allLocked}
            onChange={changeWheel}
            onInteractionStart={() => {
              wheelChanged.current = false
              setWheelInteracting(true)
            }}
            onInteractionEnd={() => {
              setWheelInteracting(false)
              if (wheelChanged.current) setPreviewRevision((revision) => revision + 1)
              wheelChanged.current = false
            }}
          />
          {harmony === 'all' && (
            <p className="palette-recommendations__note">
              {t(
                '색상환을 움직이면 {name} 규칙으로 조정합니다. 아래에서 다른 배색을 선택할 수 있어요.',
                {
                  name: t(wheelHarmonyName),
                },
              )}
            </p>
          )}
          <div className="palette-recommendations__harmony">
            <span id={`${id}-harmony`} className="palette-recommendations__label">
              {t('배색 규칙')}
            </span>
            <ToggleGroup
              size="sm"
              className="palette-recommendations__harmony-options"
              aria-labelledby={`${id}-harmony`}
              preventEmpty
              value={[harmony]}
              items={[
                { value: 'all', label: t('전체 추천'), icon: <Shuffle aria-hidden="true" /> },
                ...harmonyOptions.map((option) => ({
                  value: option.value,
                  label: t(option.label),
                  icon: <HarmonyIcon angles={option.angles} />,
                })),
              ]}
              onValueChange={([value]) => {
                if (value !== 'all' && !harmonyOptions.some((option) => option.value === value))
                  return
                setHarmony(value as PaletteHarmony)
                setMessage(
                  '배색 규칙을 바꿨습니다. 색상환을 움직이거나 후보·랜덤 추천으로 미리 보세요.',
                )
              }}
            />
            <p className="palette-recommendations__note">
              {t(
                harmonyOption?.description ??
                  '다섯 가지 배색을 비교하거나, 원하는 규칙만 선택해 추천받으세요.',
              )}
            </p>
          </div>
          <label htmlFor={`${id}-seed`} className="palette-recommendations__label">
            {t('팔레트 기준색')}
          </label>
          <div className="palette-recommendations__seed">
            <input
              type="color"
              aria-label={t('팔레트 기준색 선택')}
              value={normalizedSeed ?? candidateSeed}
              disabled={primaryLocked}
              onChange={(event) => editSeed(event.target.value)}
            />
            <Input
              id={`${id}-seed`}
              size="sm"
              value={visibleSeed.toUpperCase()}
              disabled={primaryLocked}
              aria-invalid={!normalizedSeed || undefined}
              aria-describedby={!normalizedSeed ? `${id}-error` : undefined}
              spellCheck={false}
              autoComplete="off"
              maxLength={7}
              onChange={(event) => editSeed(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  generate()
                }
              }}
            />
          </div>
          {!normalizedSeed && (
            <p id={`${id}-error`} className="palette-recommendations__error">
              {t('#RRGGBB 형식으로 입력해 주세요.')}
            </p>
          )}

          <div className="palette-recommendations__roles-heading">
            <h3>{t('색상 역할')}</h3>
            <Button
              size="sm"
              variant="ghost"
              textWrap="wrap"
              disabled={!lockedRoles.length}
              focusableWhenDisabled
              onClick={onClearLocks}
            >
              {t('잠금 모두 해제')}
            </Button>
          </div>
          <dl className="palette-recommendations__roles">
            {paletteRoleKeys.map((role) => {
              const locked = lockedRoles.includes(role)
              const roleName = t(colorRoleLabels[role])
              return (
                <div key={role} data-locked={locked || undefined}>
                  <dt>
                    <span style={{ backgroundColor: effectiveColors[role] }} aria-hidden="true" />
                    {roleName}
                  </dt>
                  <dd>
                    <code>{effectiveColors[role].toUpperCase()}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="palette-recommendations__lock"
                      aria-pressed={locked}
                      aria-label={t(locked ? '{role} 잠금 해제' : '{role} 잠금', {
                        role: roleName,
                      })}
                      title={t(locked ? '{role} 잠금 해제' : '{role} 잠금', { role: roleName })}
                      onClick={() => onToggleLock(role)}
                    >
                      {locked ? (
                        <Lock size={14} aria-hidden="true" />
                      ) : (
                        <LockOpen size={14} aria-hidden="true" />
                      )}
                    </Button>
                  </dd>
                </div>
              )
            })}
          </dl>
          {allLocked && (
            <p className="palette-recommendations__note" role="status">
              {t('모든 색이 잠겨 있습니다. 한 가지 이상 잠금을 해제하면 다시 추천할 수 있어요.')}
            </p>
          )}
          <div className="palette-recommendations__generate-actions">
            <Button
              size="sm"
              variant="secondary"
              textWrap="wrap"
              disabled={!normalizedSeed || allLocked}
              onClick={generate}
            >
              {t('기준색으로 추천')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              textWrap="wrap"
              disabled={allLocked}
              onClick={randomize}
            >
              <Shuffle size={14} aria-hidden="true" />
              {t('랜덤 추천')}
            </Button>
          </div>
          <p className="palette-recommendations__note">
            {t(
              '잠근 색은 유지하고 나머지만 추천합니다. 랜덤 추천은 잠기지 않은 기준색도 바꾸며 바로 미리 보여줍니다.',
            )}
          </p>
          {lockedRoles.length > 0 && (
            <p className="palette-recommendations__note">
              {t('잠근 색끼리의 조합은 유지됩니다. 조화와 대비는 별도로 확인하세요.')}
            </p>
          )}

          <div
            className="palette-recommendations__candidates"
            role="group"
            aria-label={t('추천 팔레트 {count}개', { count: candidates.length })}
          >
            {candidates.map((candidate) => {
              const selected =
                activePreview?.id === candidate.id &&
                paletteRoleKeys.every(
                  (role) =>
                    normalizeColor(activePreview.colors[role]) ===
                    normalizeColor(candidate.colors[role]),
                )
              return (
                <Button
                  key={candidate.id}
                  size="sm"
                  variant="secondary"
                  textWrap="wrap"
                  className="palette-recommendations__candidate"
                  aria-pressed={selected}
                  disabled={recommendationsStale || allLocked}
                  aria-label={t('{name} 팔레트 미리보기', { name: t(candidate.name) })}
                  onClick={() => {
                    setMessage('')
                    setSeed(candidate.colors.primary)
                    setSeedEdited(false)
                    setPreviewRevision((revision) => revision + 1)
                    onPreview(candidate)
                  }}
                >
                  <span className="palette-recommendations__candidate-title">
                    <span>{t(candidate.name)}</span>
                    {selected ? <Check size={14} aria-hidden="true" /> : null}
                  </span>
                  <span className="palette-recommendations__swatches" aria-hidden="true">
                    {paletteRoleKeys.map((role) => (
                      <span key={role} style={{ backgroundColor: candidate.colors[role] }} />
                    ))}
                  </span>
                  <span className="palette-recommendations__description">
                    {lockedRoles.length
                      ? t('{name} 규칙으로 잠기지 않은 색을 조정합니다.', {
                          name: t(candidate.name),
                        })
                      : t(candidate.description)}
                  </span>
                </Button>
              )
            })}
          </div>

          <p
            className="palette-recommendations__status"
            role="status"
            aria-live={wheelInteracting ? 'off' : 'polite'}
          >
            {recommendationsStale
              ? t('기준색을 바꿨습니다. 팔레트를 다시 추천해 주세요.')
              : message
                ? t(message, { count: candidates.length })
                : null}
            {activePreview ? (
              <span className="palette-recommendations__preview-status">
                {t('미리보기 {number} · {name} · {color} · 아직 저장하지 않았습니다.', {
                  number: previewRevision,
                  name: t(activePreview.name),
                  color: activePreview.colors.primary.toUpperCase(),
                })}
              </span>
            ) : !message && !recommendationsStale ? (
              t('후보를 선택하면 실제 컴포넌트에 미리 적용됩니다.')
            ) : null}
          </p>
          <div className="palette-recommendations__actions">
            <Button
              size="sm"
              textWrap="wrap"
              disabled={!activePreview}
              focusableWhenDisabled
              onClick={() => {
                onSave()
                setMessage('팔레트를 현재 모드에 저장했습니다.')
              }}
            >
              {t('이 팔레트 저장')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              textWrap="wrap"
              disabled={!activePreview}
              focusableWhenDisabled
              onClick={() => {
                onCancel()
                setMessage('저장된 컬러로 되돌렸습니다.')
              }}
            >
              <RotateCcw size={13} aria-hidden="true" />
              {t('되돌리기')}
            </Button>
          </div>
          <p className="palette-recommendations__note">
            {t('되돌리면 저장된 색으로 복원되고, 역할별 잠금은 유지됩니다.')}
          </p>
          <p className="palette-recommendations__note">
            {t('{mode} 모드의 베이스 컬러만 저장합니다. 시맨틱 컬러와 다른 설정은 유지됩니다.', {
              mode: t(mode === 'light' ? '라이트' : '다크'),
            })}
          </p>

          {activePreview && (
            <div className="palette-recommendations__inspection">
              <h3>{t('텍스트 대비 확인')}</h3>
              {audits.some((audit) => !audit.pass) && (
                <p className="palette-recommendations__error" role="status">
                  {t(
                    lockedRoles.length
                      ? '잠근 색을 유지하면 일부 텍스트 대비가 부족합니다. 해당 색의 잠금을 풀고 다시 추천하거나 직접 조정하세요.'
                      : '일부 텍스트 대비가 부족합니다. 색을 조정한 뒤 다시 확인하세요.',
                  )}
                </p>
              )}
              <ul className="palette-recommendations__audits">
                {audits.map((audit) => (
                  <li key={audit.id}>
                    <span className="palette-recommendations__audit-name">{t(audit.label)}</span>
                    <span className="palette-recommendations__audit-pair" aria-hidden="true">
                      <span style={{ backgroundColor: audit.background, color: audit.foreground }}>
                        Aa
                      </span>
                    </span>
                    <span className="palette-recommendations__ratio">
                      {(Math.floor(audit.ratio * 100) / 100).toFixed(2)}:1
                      <small>≥ {audit.minimum}:1</small>
                    </span>
                    <span className="palette-recommendations__result" data-pass={audit.pass}>
                      {t(audit.pass ? '충족' : '조정 필요')}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="palette-recommendations__note">
                {t(
                  '불투명 배경에서 위 텍스트 조합만 검사합니다. Glass의 반투명 표면과 전체 화면의 접근성은 별도로 확인하세요.',
                )}
              </p>
            </div>
          )}
        </div>
      </Collapsible>
    </section>
  )
}
