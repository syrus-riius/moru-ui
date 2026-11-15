import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createDarkTokens, defaultTokens, withDensityMetric } from '../../theme/tokens'
import { ShapeRhythmEditor } from './ShapeRhythmEditor'
import { FoundationComparison } from '../comparison/FoundationComparison'

describe('manual density values in reference screens', () => {
  it('shows the edited S/M/L control heights without changing the active density name', () => {
    const tokens = withDensityMetric(defaultTokens, 'controlHeight', 44)
    const markup = renderToStaticMarkup(
      <ShapeRhythmEditor
        tokens={tokens}
        onChange={() => {}}
        onTokensChange={() => {}}
        onTypographyChange={() => {}}
      />,
    )
    const sizePreview = markup.match(
      /aria-label="S M L 컨트롤 높이 미리보기"[^>]*>(.*?)<\/div>/,
    )?.[1]
    expect(sizePreview).toContain('height:35.2px')
    expect(sizePreview).toContain('<code>35.2px</code>')
    expect(sizePreview).toContain('height:44px')
    expect(sizePreview).toContain('<code>44px</code>')
    expect(sizePreview).toContain('height:52.8px')
    expect(sizePreview).toContain('<code>52.8px</code>')
    expect(markup).toContain('<code>기본 · 4px unit</code>')
  })

  it('shows resolved default spacing in the initially selected shape preview', () => {
    const markup = renderToStaticMarkup(
      <ShapeRhythmEditor
        tokens={defaultTokens}
        onChange={() => {}}
        onTokensChange={() => {}}
        onTypographyChange={() => {}}
      />,
    )
    const sizePreview = markup.match(
      /aria-label="S M L 컨트롤 높이 미리보기"[^>]*>(.*?)<\/div>/,
    )?.[1]
    const selectedTab = markup
      .match(/<button\b[^>]*>[^<]*<\/button>/g)
      ?.find((tag) => tag.includes('role="tab"') && tag.includes('aria-selected="true"'))
    expect(sizePreview).toContain('height:32px')
    expect(sizePreview).toContain('height:40px')
    expect(sizePreview).toContain('height:48px')
    expect(markup).toContain('<code>기본 · 4px unit</code>')
    expect(selectedTab).toContain('>형태</button>')
    // Moru Tabs mounts only the active panel; density restoration is available
    // after selecting Rhythm and is covered by the browser interaction checks.
    expect(markup).not.toContain('aria-label="형태와 리듬 현재 밀도 복원"')
  })

  it('keeps comparison metadata consistent with its scoped controls after manual edits', () => {
    const light = withDensityMetric(
      withDensityMetric(defaultTokens, 'controlHeight', 44),
      'formGap',
      30,
    )
    const before = structuredClone(light)
    const markup = renderToStaticMarkup(
      <FoundationComparison
        themes={{ light, dark: createDarkTokens(light) }}
        activeMode="light"
        onApply={() => {}}
      />,
    )
    expect(markup).toContain('--ui-control-height-md:44px')
    expect(markup).toContain('--ui-form-gap:30px')
    expect(markup).toContain('높이 44px <i></i> 폼 간격 30px')
    expect(light).toEqual(before)
  })
})
