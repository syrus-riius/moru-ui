import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n'
import {
  auditPaletteRecommendation,
  generatePaletteRecommendations,
  paletteRoleKeys,
  type PaletteColors,
  type PaletteRecommendation,
} from '../../theme/palette-recommendations'
import { normalizeColor, type ThemeMode, type ThemeTokens } from '../../theme/tokens'
import { Button } from '../ui/button'
import { Collapsible } from '../ui/collapsible'
import { Input } from '../ui/input'
import { colorRoleLabels } from './color-editor-labels'
import './palette-recommendations.css'

export type PalettePreview = {
  id: string
  name: string
  colors: PaletteColors
  mode: ThemeMode
}

export type PaletteRecommendationsProps = {
  /** Committed tokens: a temporary preview must not become the next starting point. */
  tokens: ThemeTokens
  mode: ThemeMode
  preview: PalettePreview | null
  onPreview: (candidate: PaletteRecommendation) => void
  onSave: () => void
  onCancel: () => void
}

export function PaletteRecommendations({
  tokens,
  mode,
  preview,
  onPreview,
  onSave,
  onCancel,
}: PaletteRecommendationsProps) {
  const { t } = useI18n()
  const id = useId()
  const initialSeed = preview?.colors.primary ?? tokens.primary
  const [seed, setSeed] = useState(initialSeed)
  const [generatedSeed, setGeneratedSeed] = useState(initialSeed)
  const [message, setMessage] = useState('')
  const savedPrimary = useRef(tokens.primary)
  const previousMode = useRef(mode)

  useEffect(() => {
    // External edits and mode changes start from the newly committed palette.
    if (savedPrimary.current !== tokens.primary || previousMode.current !== mode) {
      savedPrimary.current = tokens.primary
      if (previousMode.current !== mode) setMessage('')
      previousMode.current = mode
      setSeed(tokens.primary)
      setGeneratedSeed(tokens.primary)
    }
  }, [tokens.primary, mode])

  const normalizedSeed = normalizeColor(seed)
  const recommendationsStale = normalizedSeed !== generatedSeed
  const candidates = useMemo(
    () => generatePaletteRecommendations(generatedSeed, mode),
    [generatedSeed, mode],
  )
  const activePreview = preview?.mode === mode ? preview : null
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
    setMessage('')
    if (activePreview) onCancel()
  }

  function generate() {
    if (!normalizedSeed) return
    onCancel()
    setSeed(normalizedSeed)
    setGeneratedSeed(normalizedSeed)
    setMessage('팔레트 3개를 추천했습니다. 후보를 눌러 미리 보세요.')
  }

  return (
    <section className="palette-recommendations" aria-label={t('팔레트 추천')}>
      <Collapsible title={t('팔레트 추천')} size="sm" defaultOpen>
        <div className="palette-recommendations__body">
          <p className="palette-recommendations__note">
            {t('기준색을 유지한 세 가지 조합입니다. 선택하면 저장 전에 미리 볼 수 있어요.')}
          </p>
          <label htmlFor={`${id}-seed`} className="palette-recommendations__label">
            {t('팔레트 기준색')}
          </label>
          <div className="palette-recommendations__seed">
            <input
              type="color"
              aria-label={t('팔레트 기준색 선택')}
              value={normalizedSeed ?? generatedSeed}
              onChange={(event) => editSeed(event.target.value)}
            />
            <Input
              id={`${id}-seed`}
              size="sm"
              value={seed.toUpperCase()}
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
          <Button
            size="sm"
            variant="secondary"
            textWrap="wrap"
            disabled={!normalizedSeed}
            onClick={generate}
          >
            {t('팔레트 3개 추천')}
          </Button>

          <div
            className="palette-recommendations__candidates"
            role="group"
            aria-label={t('추천 팔레트 3개')}
          >
            {candidates.map((candidate) => {
              const selected = activePreview?.id === candidate.id
              return (
                <Button
                  key={candidate.id}
                  size="sm"
                  variant="secondary"
                  textWrap="wrap"
                  className="palette-recommendations__candidate"
                  aria-pressed={selected}
                  disabled={recommendationsStale}
                  aria-label={t('{name} 팔레트 미리보기', { name: t(candidate.name) })}
                  onClick={() => {
                    setMessage('')
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
                    {t(candidate.description)}
                  </span>
                </Button>
              )
            })}
          </div>

          <p className="palette-recommendations__status" role="status" aria-live="polite">
            {activePreview
              ? t('{name} · 미리보기 중, 아직 저장하지 않았습니다.', {
                  name: t(activePreview.name),
                })
              : message
                ? t(message)
                : recommendationsStale
                  ? t('기준색을 바꿨습니다. 팔레트를 다시 추천해 주세요.')
                  : t('후보를 선택하면 실제 컴포넌트에 미리 적용됩니다.')}
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
            {t('{mode} 모드의 베이스 컬러만 저장합니다. 시맨틱 컬러와 다른 설정은 유지됩니다.', {
              mode: t(mode === 'light' ? '라이트' : '다크'),
            })}
          </p>

          {activePreview && (
            <div className="palette-recommendations__inspection">
              <h3>{t('색상 역할')}</h3>
              <dl className="palette-recommendations__roles">
                {paletteRoleKeys.map((role) => (
                  <div key={role}>
                    <dt>
                      <span
                        style={{ backgroundColor: activePreview.colors[role] }}
                        aria-hidden="true"
                      />
                      {t(colorRoleLabels[role])}
                    </dt>
                    <dd>
                      <code>{activePreview.colors[role].toUpperCase()}</code>
                    </dd>
                  </div>
                ))}
              </dl>
              <h3>{t('텍스트 대비 확인')}</h3>
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
