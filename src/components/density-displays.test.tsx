import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createDarkTokens, defaultTokens, withDensityMetric } from '../theme/tokens'
import { ShapeRhythmEditor } from './ShapeRhythmEditor'
import { FoundationComparison } from './FoundationComparison'

describe('manual density values in reference screens', () => {
  it('shows the same S/M/L control heights as the edited density and marks the manual setting', () => {
    const tokens = withDensityMetric(defaultTokens, 'controlHeight', 44)
    const markup = renderToStaticMarkup(<ShapeRhythmEditor tokens={tokens} onChange={() => {}} onTokensChange={() => {}} onTypographyChange={() => {}} />)
    const sizePreview = markup.match(/aria-label="S M L 컨트롤 높이 미리보기"[^>]*>(.*?)<\/div>/)?.[1]
    const restoreButton = markup.match(/<button[^>]*aria-label="형태와 리듬 현재 밀도 복원"[^>]*>/)?.[0]
    expect(sizePreview).toContain('height:35.2px')
    expect(sizePreview).toContain('<code>35.2px</code>')
    expect(sizePreview).toContain('height:44px')
    expect(sizePreview).toContain('<code>44px</code>')
    expect(sizePreview).toContain('height:52.8px')
    expect(sizePreview).toContain('<code>52.8px</code>')
    expect(restoreButton).toBeDefined()
    expect(restoreButton).not.toContain('disabled')
    expect(markup).toContain('<code>기본 · 4px unit</code>')
  })

  it('uses resolved spacing without incorrectly marking an untouched profile as manual', () => {
    const markup = renderToStaticMarkup(<ShapeRhythmEditor tokens={defaultTokens} onChange={() => {}} onTokensChange={() => {}} onTypographyChange={() => {}} />)
    const sizePreview = markup.match(/aria-label="S M L 컨트롤 높이 미리보기"[^>]*>(.*?)<\/div>/)?.[1]
    const restoreButton = markup.match(/<button[^>]*aria-label="형태와 리듬 현재 밀도 복원"[^>]*>/)?.[0]
    expect(sizePreview).toContain('height:32px')
    expect(sizePreview).toContain('height:40px')
    expect(sizePreview).toContain('height:48px')
    expect(restoreButton).toContain('disabled=""')
    expect(markup).toContain('<code>기본 · 4px unit</code>')
  })

  it('keeps comparison metadata consistent with its scoped controls after manual edits', () => {
    const light = withDensityMetric(withDensityMetric(defaultTokens, 'controlHeight', 44), 'formGap', 30)
    const before = structuredClone(light)
    const markup = renderToStaticMarkup(<FoundationComparison themes={{ light, dark: createDarkTokens(light) }} activeMode="light" onApply={() => {}} />)
    expect(markup).toContain('--ui-control-height-md:44px')
    expect(markup).toContain('--ui-form-gap:30px')
    expect(markup).toContain('높이 44px <i></i> 폼 간격 30px')
    expect(light).toEqual(before)
  })
})
