import { useI18n } from '../../i18n'
import { useState } from 'react'
import {
  AlignVerticalJustifyCenter,
  ArrowRight,
  Check,
  CheckCheck,
  Columns2,
  Layers2,
  Moon,
  Sun,
  Type,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Field } from '../ui/field'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { ThemeScope } from '../ui/theme-scope'
import { Typography } from '../ui/typography'
import {
  createComparisonTokens,
  densityOptions,
  fontOptions,
  resolveDensity,
  typographyRoleOptions,
} from '../../theme/tokens'
import type { Density, ThemeMode, ThemeTokens, TypographyRole } from '../../theme/tokens'
import './foundation-comparison.css'

type CompareFont = 'pretendard' | 'noto-sans'
type Panel = 'combinations' | 'typography' | 'sizes'
type Props = {
  themes: Record<ThemeMode, ThemeTokens>
  activeMode: ThemeMode
  onApply: (font: CompareFont, density: Density, mode: ThemeMode) => void
}
const fonts: CompareFont[] = ['pretendard', 'noto-sans']
const modes: ThemeMode[] = ['light', 'dark']
const sizes = ['sm', 'md', 'lg'] as const
const teamItems = [
  { value: 'design', label: '디자인 팀' },
  { value: 'product', label: '프로덕트 팀' },
  { value: 'engineering', label: '개발 팀' },
]
const roleSamples: Record<TypographyRole, string> = {
  display: '아이디어가 자라는 곳',
  heading: '작은 시작, 단단한 기반',
  body: '팀의 다음 아이디어를 하나의 공간에 모아보세요. 좋은 경험은 읽기 편한 문장에서 시작됩니다.',
  label: '프로젝트 이름 Workspace',
  caption: '마지막 수정 · 2026.10.21 · 12:30',
  code: 'const design = { space: 24 };',
}
const fontName = (font: string) => fontOptions.find((item) => item.value === font)?.label ?? font
const densityName = (density: Density) =>
  densityOptions.find((item) => item.value === density)?.label ?? density

function ComparisonForm({
  tokens,
  mode,
  font,
  density,
  name,
  team,
  notifications,
  onNameChange,
  onTeamChange,
  onNotificationsChange,
  onApply,
  current,
}: {
  tokens: ThemeTokens
  mode: ThemeMode
  font: CompareFont
  density: Density
  name: string
  team: string
  notifications: boolean
  onNameChange: (value: string) => void
  onTeamChange: (value: string) => void
  onNotificationsChange: (value: boolean) => void
  onApply: () => void
  current: boolean
}) {
  const { t } = useI18n()

  const [savedValues, setSavedValues] = useState<{
    name: string
    team: string
    notifications: boolean
  } | null>(null)
  const saved =
    savedValues?.name === name &&
    savedValues.team === team &&
    savedValues.notifications === notifications
  const scopeName = `${fontName(font)} · ${t(densityName(density))} · ${t(mode === 'light' ? '라이트' : '다크')}`
  const metrics = resolveDensity(tokens)
  return (
    <ThemeScope tokens={tokens} mode={mode} className="comparison-scope">
      <article
        className="comparison-sample"
        aria-label={t(scopeName)}
        data-combination={`${font}-${density}-${mode}`}
      >
        <div className="sample-mode-bar">
          <span>
            {mode === 'light' ? <Sun size={13} /> : <Moon size={13} />}
            {mode === 'light' ? t('라이트') : t('다크')}
          </span>
          <span className="sample-font-name">
            {fontName(font)} <i /> {t(densityName(density))}
          </span>
        </div>
        <form
          className="sample-form"
          onSubmit={(event) => {
            event.preventDefault()
            setSavedValues({ name, team, notifications })
          }}
        >
          <div className="sample-title-group">
            <span className="sample-project-mark" aria-hidden="true">
              <Layers2 size={19} />
            </span>
            <Typography variant="heading" as="h3">
              {t('프로젝트 설정')}
            </Typography>
            <Typography variant="body" className="sample-introduction">
              {t('작은 아이디어가 좋은 경험이 되도록.')}
              <br />
              {t('팀과 함께할 공간을 다듬어 보세요.')}
            </Typography>
          </div>
          <Field
            label={t('프로젝트 이름')}
            description={t('한글과 영문, 숫자의 리듬을 함께 확인해 보세요.')}
          >
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              required
              maxLength={80}
            />
          </Field>
          <div className="sample-team-line">
            <Field label={t('함께할 팀')}>
              <Select
                items={teamItems.map((item) => ({ ...item, label: t(item.label) }))}
                value={team}
                onValueChange={onTeamChange}
              />
            </Field>
            <Button
              variant="secondary"
              type="button"
              onClick={() => onTeamChange(team === 'design' ? 'product' : 'design')}
            >
              {t('팀 변경')}
              <ArrowRight size={14} />
            </Button>
          </div>
          <Checkbox
            label={t('새로운 활동 알림 받기')}
            description={t('우리 팀의 다음 소식을 놓치지 마세요.')}
            checked={notifications}
            onCheckedChange={onNotificationsChange}
          />
          <div className="sample-actions">
            <Typography variant="caption" className="sample-characters">
              {t('가나다 · ABC · 0123')}
            </Typography>
            <Button type="submit">
              {saved ? (
                <>
                  <CheckCheck size={14} />
                  {t('적용했어요')}
                </>
              ) : (
                <>
                  {t('설정 적용')}
                  <Check size={14} />
                </>
              )}
            </Button>
          </div>
        </form>
        <div className="sample-specification">
          <span>
            {t('높이 {value}px', { value: metrics.controlHeight.md })} <i />{' '}
            {t('폼 간격 {value}px', { value: metrics.formGap })}
          </span>
          <button
            type="button"
            className={current ? 'sample-apply is-current' : 'sample-apply'}
            aria-label={t('{value0} 조합 사용', { value0: scopeName })}
            onClick={onApply}
          >
            {current ? (
              <>
                <Check size={11} />
                {t('사용 중')}
              </>
            ) : (
              <>
                {t('이 조합 사용')}
                <ArrowRight size={11} />
              </>
            )}
          </button>
        </div>
      </article>
    </ThemeScope>
  )
}

export function FoundationComparison({ themes, activeMode, onApply }: Props) {
  const { t } = useI18n()

  const [panel, setPanel] = useState<Panel>('combinations')
  const [fontFilter, setFontFilter] = useState<'all' | CompareFont>('all')
  const [densityFilter, setDensityFilter] = useState<'all' | Density>('all')
  const [modeFilter, setModeFilter] = useState<'all' | ThemeMode>('all')
  const [projectName, setProjectName] = useState('브랜드 리뉴얼 Workspace 2026')
  const [team, setTeam] = useState('design')
  const [notifications, setNotifications] = useState(true)
  const [notice, setNotice] = useState('')
  const active = themes[activeMode]
  const visibleFonts = fontFilter === 'all' ? fonts : [fontFilter]
  const visibleDensities =
    densityFilter === 'all' ? densityOptions.map((item) => item.value) : [densityFilter]
  const visibleModes = modeFilter === 'all' ? modes : [modeFilter]
  const count = visibleFonts.length * visibleDensities.length * visibleModes.length

  function apply(font: CompareFont, density: Density, mode: ThemeMode) {
    onApply(font, density, mode)
    setNotice(
      t('{font} · {density} · {mode} 조합을 전체 UI에 적용했어요.', {
        font: fontName(font),
        density: t(densityName(density)),
        mode: t(mode === 'light' ? '라이트' : '다크'),
      }),
    )
  }

  return (
    <div className="comparison-page foundation-comparison">
      <div className="foundation-overview comparison-overview">
        <div className="foundation-overview-copy comparison-overview-copy">
          <span className="foundation-overview-icon comparison-overview-icon">
            <Columns2 size={20} />
          </span>
          <div>
            <strong>{t('작은 차이를, 같은 화면에서.')}</strong>
            <p>
              {t('내용은 같게, 글꼴과 밀도는 다르게. 입력한 내용은 모든 표본에 함께 반영됩니다.')}
            </p>
          </div>
        </div>
        <div className="foundation-numbers comparison-overview-numbers">
          <span>
            <strong>2</strong>
            {t('글꼴')}
          </span>
          <i>×</i>
          <span>
            <strong>3</strong>
            {t('밀도')}
          </span>
          <i>×</i>
          <span>
            <strong>2</strong>
            {t('모드')}
          </span>
        </div>
      </div>
      <div
        className="foundation-panel-tabs comparison-page-tabs"
        role="group"
        aria-label={t('디자인 비교 항목')}
      >
        <button
          className={panel === 'combinations' ? 'active' : ''}
          aria-pressed={panel === 'combinations'}
          onClick={() => setPanel('combinations')}
        >
          <Columns2 size={14} />
          {t('조합 비교')}
          <span>12</span>
        </button>
        <button
          className={panel === 'typography' ? 'active' : ''}
          aria-pressed={panel === 'typography'}
          onClick={() => setPanel('typography')}
        >
          <Type size={14} />
          {t('역할별 타이포')}
          <span>6</span>
        </button>
        <button
          className={panel === 'sizes' ? 'active' : ''}
          aria-pressed={panel === 'sizes'}
          onClick={() => setPanel('sizes')}
        >
          <AlignVerticalJustifyCenter size={14} />
          {t('공통 크기')}
          <span>3</span>
        </button>
      </div>
      <div className="foundation-filters comparison-page-filters">
        <label>
          {t('글꼴')}
          <select
            aria-label={t('비교할 글꼴')}
            value={fontFilter}
            onChange={(event) => setFontFilter(event.target.value as 'all' | CompareFont)}
          >
            <option value="all">{t('두 글꼴 모두')}</option>
            <option value="pretendard">Pretendard</option>
            <option value="noto-sans">Noto Sans</option>
          </select>
        </label>
        <label>
          {t('밀도')}
          <select
            aria-label={t('비교할 밀도')}
            value={densityFilter}
            onChange={(event) => setDensityFilter(event.target.value as 'all' | Density)}
          >
            <option value="all">{t('세 가지 모두')}</option>
            {densityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {t(item.label)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('모드')}
          <select
            aria-label={t('비교할 화면 모드')}
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value as 'all' | ThemeMode)}
          >
            <option value="all">{t('라이트 + 다크')}</option>
            <option value="light">{t('라이트')}</option>
            <option value="dark">{t('다크')}</option>
          </select>
        </label>
        <span className="foundation-result-count">
          {t('{count}개 조합', { count })}
          <span className="foundation-result-dot" />
        </span>
      </div>
      <p
        className="foundation-apply-status comparison-page-context"
        role="status"
        aria-live="polite"
      >
        {notice ||
          t(
            '표본 안의 메뉴와 버튼을 직접 사용해 보세요. 마음에 드는 조합은 전체 UI에 적용할 수 있어요.',
          )}
      </p>

      {panel === 'combinations' ? (
        <div className="comparison-groups">
          {visibleFonts.flatMap((font) =>
            visibleDensities.map((density) => (
              <section
                key={`${font}-${density}`}
                className="comparison-group"
                aria-label={t('{value0} {value1} 비교', {
                  value0: fontName(font),
                  value1: t(densityName(density)),
                })}
              >
                <header className="comparison-group-heading">
                  <div>
                    <span className="comparison-font-symbol">
                      Ag<span>{t('가')}</span>
                    </span>
                    <h2>{fontName(font)}</h2>
                    <span className="comparison-density-badge">{t(densityName(density))}</span>
                  </div>
                  <span>
                    {t(densityOptions.find((item) => item.value === density)?.description ?? '')}
                  </span>
                </header>
                <div
                  className={`comparison-pair ${visibleModes.length === 1 ? 'single-mode' : ''}`}
                >
                  {visibleModes.map((mode) => (
                    <ComparisonForm
                      key={mode}
                      tokens={createComparisonTokens(themes[mode], font, density)}
                      mode={mode}
                      font={font}
                      density={density}
                      name={projectName}
                      team={team}
                      notifications={notifications}
                      onNameChange={setProjectName}
                      onTeamChange={setTeam}
                      onNotificationsChange={setNotifications}
                      onApply={() => apply(font, density, mode)}
                      current={
                        active.fontFamily === font &&
                        active.density === density &&
                        activeMode === mode
                      }
                    />
                  ))}
                </div>
              </section>
            )),
          )}
        </div>
      ) : null}

      {panel === 'typography' ? (
        <div className="type-comparison-groups">
          {visibleDensities.map((density) => (
            <section className="comparison-group" key={density}>
              <header className="comparison-group-heading">
                <div>
                  <Type size={17} />
                  <h2>{t('역할별 타이포그래피')}</h2>
                  <span className="comparison-density-badge">{t(densityName(density))}</span>
                </div>
                <span>{t('크기 · 굵기 · 줄높이 · 자간')}</span>
              </header>
              <div className="type-comparison-grid">
                {visibleFonts.flatMap((font) =>
                  visibleModes.map((mode) => {
                    const tokens = createComparisonTokens(themes[mode], font, density)
                    return (
                      <ThemeScope
                        key={`${font}-${mode}`}
                        tokens={tokens}
                        mode={mode}
                        className="type-specimen-scope"
                      >
                        <article className="type-specimen">
                          <div className="type-specimen-heading">
                            <strong>{fontName(font)}</strong>
                            <span>
                              {mode === 'light' ? <Sun size={13} /> : <Moon size={13} />}
                              {mode === 'light' ? t('라이트') : t('다크')}
                            </span>
                          </div>
                          {typographyRoleOptions.map(({ value, label }) => (
                            <div className="type-role-row" key={value}>
                              <div className="type-role-metadata">
                                <span>
                                  {t(label)}
                                  <i>{value}</i>
                                </span>
                                <code>
                                  {tokens.typography[value].size}px ·{' '}
                                  {tokens.typography[value].weight} ·{' '}
                                  {tokens.typography[value].lineHeight} ·{' '}
                                  {tokens.typography[value].letterSpacing}em
                                </code>
                              </div>
                              <Typography variant={value} as={value === 'code' ? 'code' : 'p'}>
                                {t(roleSamples[value])}
                              </Typography>
                            </div>
                          ))}
                        </article>
                      </ThemeScope>
                    )
                  }),
                )}
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {panel === 'sizes' ? (
        <div className="size-comparison-groups">
          {visibleDensities.map((density) => (
            <section key={density} className="comparison-group">
              <header className="comparison-group-heading">
                <div>
                  <AlignVerticalJustifyCenter size={17} />
                  <h2>{t(densityName(density))}</h2>
                </div>
                <span>{t('같은 size, 같은 높이. 버튼·입력창·선택창에 함께 적용됩니다.')}</span>
              </header>
              <div className="size-specimen-grid">
                {visibleFonts.flatMap((font) =>
                  visibleModes.map((mode) => (
                    <ThemeScope
                      key={`${font}-${mode}`}
                      tokens={createComparisonTokens(themes[mode], font, density)}
                      mode={mode}
                      className="size-specimen-scope"
                    >
                      <article className="size-specimen">
                        <div className="type-specimen-heading">
                          <strong>{fontName(font)}</strong>
                          <span>
                            {mode === 'light' ? <Sun size={13} /> : <Moon size={13} />}
                            {mode === 'light' ? t('라이트') : t('다크')}
                          </span>
                        </div>
                        {sizes.map((size) => (
                          <div className="size-rule" key={size} data-size-row={size}>
                            <div className="size-rule-label">
                              <code>{size.toUpperCase()}</code>
                              <span>
                                {resolveDensity(themes[mode], density).controlHeight[size]}
                                {t('px 현재 높이')}
                              </span>
                            </div>
                            <div className="size-control-row">
                              <Button
                                size={size}
                                onClick={() =>
                                  setNotice(
                                    t('{value0} / {value1} 버튼을 확인했어요.', {
                                      value0: t(densityName(density)),
                                      value1: size.toUpperCase(),
                                    }),
                                  )
                                }
                              >
                                {t('버튼')}
                              </Button>
                              <Input
                                size={size}
                                aria-label={t('{value0} {value1} {value2} {value3} 입력창', {
                                  value0: fontName(font),
                                  value1: density,
                                  value2: mode,
                                  value3: size,
                                })}
                                placeholder={t('입력창')}
                              />
                              <Select
                                size={size}
                                aria-label={t('{value0} {value1} {value2} {value3} 선택창', {
                                  value0: fontName(font),
                                  value1: density,
                                  value2: mode,
                                  value3: size,
                                })}
                                items={[
                                  { value: 'option', label: t('선택창') },
                                  { value: 'other', label: t('다른 옵션') },
                                ]}
                                defaultValue="option"
                              />
                            </div>
                          </div>
                        ))}
                      </article>
                    </ThemeScope>
                  )),
                )}
              </div>
            </section>
          ))}
        </div>
      ) : null}
      <div className="foundation-footnote">
        <CheckCheck size={14} />
        <span>
          {t(
            '모든 표본은 같은 컴포넌트와 역할 토큰을 사용합니다. 직접 조정한 크기도 각 밀도에 반영되며, 팝업은 표본의 글꼴과 테마를 따릅니다.',
          )}
        </span>
      </div>
    </div>
  )
}
