import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ComponentCatalogPage, type ComponentCatalogPageProps } from './ComponentCatalogPage'
import { addedComponentCount, type ComponentId } from './component-catalog'
import { componentGroups, groupComponents } from './component-pages'

function renderGallery(overrides: Partial<ComponentCatalogPageProps> = {}) {
  const rendered: ComponentId[] = []
  const markup = renderToStaticMarkup(<ComponentCatalogPage
    page={{ kind: 'category', group: 'forms' }} query="" newOnly={false} code={false}
    onQueryChange={() => {}} onNewOnlyChange={() => {}} onNavigate={() => {}}
    onCodeChange={() => {}} onExamples={() => {}} onSimulator={() => {}}
    {...overrides}
    renderComponent={(id) => {
      rendered.push(id)
      return <article data-component-preview={id}><button type="button">{id} 미리보기</button></article>
    }}
  />)
  return { markup, rendered }
}

describe('category component gallery', () => {
  it('renders all form previews in one page, including the entries after the former page boundary', () => {
    const { markup, rendered } = renderGallery()
    expect(rendered).toHaveLength(25)
    expect(new Set(rendered).size).toBe(25)
    expect(rendered).toEqual(groupComponents('forms').map((component) => component.id))
    expect(markup).toContain('data-component-preview="questionnaire"')
    expect(markup).toContain('전체 표시')
    expect(markup).not.toContain('aria-label="컴포넌트 목록 페이지"')
  })

  it.each(componentGroups)('renders only the complete $label category', (group) => {
    const { rendered } = renderGallery({ page: { kind: 'category', group: group.id } })
    expect(rendered).toEqual(groupComponents(group.id).map((component) => component.id))
  })

  it('opens an existing individual URL as the complete category rather than a single preview', () => {
    const { markup, rendered } = renderGallery({ page: { kind: 'detail', group: 'forms', component: 'input' } })
    expect(markup).toContain('<h1>폼 · 입력</h1>')
    expect(rendered).toEqual(groupComponents('forms').map((component) => component.id))
  })

  it('keeps search inside the chosen category and shows the empty state for an out-of-category match', () => {
    expect(renderGallery({ query: '스위치' }).rendered).toEqual(['switch'])
    const { markup, rendered } = renderGallery({ page: { kind: 'category', group: 'actions' }, query: '스위치' })
    expect(rendered).toEqual([])
    expect(markup).toContain('일치하는 컴포넌트가 없어요.')
  })

  it('combines the new-component filter with the selected category', () => {
    expect(renderGallery({ newOnly: true }).rendered).toEqual([
      'input-group', 'input-otp', 'label', 'native-select', 'attachment', 'questionnaire',
      'number-input', 'password-input', 'multi-select', 'file-input',
      'date-range-picker', 'time-picker', 'time-range-picker',
    ])
    expect(renderGallery({ newOnly: true, query: '스위치' }).rendered).toEqual([])
  })

  it('keeps the home directory at eight categories until searching or filtering', () => {
    const { markup, rendered } = renderGallery({ page: { kind: 'index' } })
    expect(rendered).toEqual([])
    expect(markup).toContain('aria-label="컴포넌트 카테고리"')
    for (const group of componentGroups) expect(markup).toContain(`href="#components/${group.id}"`)
    expect((markup.match(/<h2>/g) ?? []).length).toBe(8)
  })

  it('shows every global filtered preview without pagination, even when more than 12 match', () => {
    const { markup, rendered } = renderGallery({ page: { kind: 'index' }, newOnly: true })
    expect(rendered).toHaveLength(addedComponentCount)
    expect(rendered.length).toBeGreaterThan(12)
    expect(markup).not.toContain('aria-label="컴포넌트 목록 페이지"')
  })
})
