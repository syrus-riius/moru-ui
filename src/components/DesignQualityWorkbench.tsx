import { useId, useState } from 'react'
import { ArrowRight, Check, CircleAlert, Type } from 'lucide-react'
import { auditDesignQuality } from '../lib/design-quality'
import { getTypographyProfile, type ThemeMode, type ThemeTokens } from '../theme/tokens'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { Field } from './ui/field'
import { Input } from './ui/input'
import { ThemeScope } from './ui/theme-scope'
import { Typography } from './ui/typography'
import './design-quality-workbench.css'

export function DesignQualityWorkbench({ tokens, mode, onTokensChange }: {
  tokens: ThemeTokens; mode: ThemeMode; onTokensChange: (update: ThemeTokens | ((previous: ThemeTokens) => ThemeTokens)) => void
}) {
  const id = useId()
  const [textSpacing, setTextSpacing] = useState(false)
  const [scale, setScale] = useState<1 | 2>(1)
  const [narrow, setNarrow] = useState(false)
  const [saved, setSaved] = useState(false)
  const [consent, setConsent] = useState(false)
  const checks = auditDesignQuality(tokens, mode)
  const previewTokens = scale === 1 ? tokens : {
    ...tokens,
    typography: Object.fromEntries(Object.entries(tokens.typography).map(([role, style]) => [role, { ...style, size: style.size * scale }])) as ThemeTokens['typography'],
  }
  return <div className="design-quality-workbench">
    <div className="quality-summary">
      <div><span className="eyebrow">READABILITY / RHYTHM</span><h3>작은 화면에서도, 더 크게 읽어도.</h3><p>현재 토큰을 점검하고 한글·영문과 실제 입력 폼으로 읽기 흐름을 확인하세요.</p></div>
      <button type="button" onClick={() => onTokensChange((previous) => ({ ...previous, typography: getTypographyProfile(previous.fontFamily), fontSize: getTypographyProfile(previous.fontFamily).body.size }))}><Type size={14} aria-hidden="true" />권장 타이포그래피 적용</button>
    </div>
    <section className="quality-checks" aria-label="현재 토큰 기준 점검">
      {checks.map((check) => <article key={check.id} data-result={check.passes ? 'pass' : 'review'}>
        <div>{check.passes ? <Check size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}<span>{check.label}</span><small>{check.passes ? '기준 충족' : '검토 권장'}</small></div>
        <strong>{check.value}</strong><p>{check.recommendation}</p>
      </article>)}
    </section>
    <p className="quality-scope-note">색 대비는 표시한 색상 쌍의 계산 결과이며, 행간·자간·그룹 간격은 Moru의 디자인 권장 기준입니다. 실제 포커스, 터치 영역과 전체 화면의 접근성은 별도 확인이 필요합니다.</p>
    <div className="quality-preview-toolbar">
      <div role="group" aria-label="가독성 미리보기 너비"><button type="button" aria-pressed={!narrow} onClick={() => setNarrow(false)}>유연한 너비</button><button type="button" aria-pressed={narrow} onClick={() => setNarrow(true)}>320px 화면</button></div>
      <button type="button" aria-pressed={scale === 2} onClick={() => setScale(scale === 1 ? 2 : 1)}>글자 {scale * 100}%</button>
      <label htmlFor={`${id}-spacing`}><input id={`${id}-spacing`} type="checkbox" checked={textSpacing} onChange={(event) => setTextSpacing(event.target.checked)} />사용자 글자 간격 테스트</label>
    </div>
    <div className="quality-preview-stage">
      <ThemeScope tokens={previewTokens} mode={mode} className="quality-preview" data-narrow={narrow || undefined} data-text-spacing={textSpacing || undefined}>
        <Card className="quality-preview-card">
          <div className="quality-preview-copy"><Typography variant="caption">MORU / READ & CREATE</Typography><Typography as="h3" variant="heading">아이디어를 함께 다듬는 공간</Typography><Typography as="p" variant="body">관련된 정보는 가까이, 새로운 주제는 여유 있게. 한글과 영문이 섞여도 편안하게 읽히는 흐름을 만듭니다.</Typography><Typography as="p" variant="body" lang="en">Good interfaces make the next step clear. Give words enough room, and let content shape the layout.</Typography></div>
          <form onSubmit={(event) => { event.preventDefault(); setSaved(true) }} onChange={() => setSaved(false)}>
            <Field label="프로젝트 이름" description="팀이 알아보기 쉬운 이름을 지어 주세요."><Input name="readability-project" required placeholder="Moru design system" /></Field>
            <Checkbox label="팀과 함께 변경 사항을 검토할게요." checked={consent} onCheckedChange={setConsent} />
            <Button type="submit">프로젝트 만들고 다음 단계로<ArrowRight size={14} aria-hidden="true" /></Button>
            {saved ? <Typography as="p" variant="caption" aria-live="polite">이름을 확인했어요. 미리보기 폼이 정상적으로 동작합니다.</Typography> : null}
          </form>
        </Card>
      </ThemeScope>
    </div>
    <details className="quality-principles"><summary>기준과 출처 보기</summary><div>
      <p><strong>읽기와 위계</strong> · 생산성 UI의 본문은 14px부터 시작하고, 긴 읽기에는 16px 이상을 검토합니다. 제목·본문·라벨을 역할로 나누고 읽기 영역의 줄 길이를 제한합니다. <a href="https://carbondesignsystem.com/elements/typography/overview/" target="_blank" rel="noreferrer">Carbon Typography</a></p>
      <p><strong>근접성과 리듬</strong> · 라벨과 입력창, 입력 항목, 섹션의 간격을 단계적으로 넓혀 정보의 관계가 드러나게 합니다. <a href="https://carbondesignsystem.com/elements/spacing/overview/" target="_blank" rel="noreferrer">Carbon Spacing</a></p>
      <p><strong>사용자 간격 변경</strong> · 테스트는 행간 1.5배, 문단 뒤 2em, 자간 0.12em, 단어 간격 0.16em을 적용합니다. WCAG는 이 값을 기본 디자인으로 강제하지 않으며, 사용자가 변경했을 때 내용과 기능을 보존하도록 요구합니다. <a href="https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html" target="_blank" rel="noreferrer">WCAG 1.4.12</a></p>
      <p><strong>색상과 조작</strong> · 일반 문구 4.5:1, 의미 있는 컨트롤 경계 3:1을 확인합니다. 웹의 최소 조작 영역은 예외를 제외하고 24×24 CSS px이며, 터치 환경에는 더 큰 영역을 제공합니다. <a href="https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" target="_blank" rel="noreferrer">WCAG 2.5.8</a></p>
    </div></details>
  </div>
}
