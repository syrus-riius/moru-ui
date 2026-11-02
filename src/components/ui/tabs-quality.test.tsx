import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Tabs } from './tabs'

const items = [
  { value: 'locked', label: '잠긴 탭', content: '비공개 콘텐츠', disabled: true },
  { value: 'overview', label: '개요', content: '개요 콘텐츠' },
  { value: 'activity', label: '활동', content: '활동 콘텐츠' },
]

describe('Tabs availability and accessible initial content', () => {
  it('selects the first available tab instead of revealing a disabled first panel', () => {
    const html = renderToStaticMarkup(<Tabs items={items} />)
    expect(html).toContain('개요 콘텐츠')
    expect(html).not.toContain('비공개 콘텐츠')
    expect(html).not.toContain('활동 콘텐츠')
    expect(html).toMatch(/<button[^>]*aria-disabled="true"[^>]*>잠긴 탭<\/button>/)
    expect(html).toContain('role="tablist"')
    expect(html).toContain('role="tabpanel"')
  })

  it('falls back to available content if a supplied default is unavailable', () => {
    const html = renderToStaticMarkup(<Tabs items={items} defaultValue="locked" />)
    expect(html).toContain('개요 콘텐츠')
    expect(html).not.toContain('비공개 콘텐츠')
  })

  it('preserves an explicit available default and its corresponding panel', () => {
    const html = renderToStaticMarkup(<Tabs items={items} defaultValue="activity" />)
    expect(html).toContain('활동 콘텐츠')
    expect(html).not.toContain('개요 콘텐츠')
  })

  it('renders no panel when all tabs are unavailable', () => {
    const html = renderToStaticMarkup(<Tabs items={items.map((item) => ({ ...item, disabled: true }))} />)
    expect(html).not.toContain('role="tabpanel"')
    expect(html).not.toContain('aria-selected="true"')
  })

  it('exposes vertical orientation to assistive technology and keeps the caller label', () => {
    const html = renderToStaticMarkup(<Tabs items={items} orientation="vertical" aria-label="프로젝트 영역" />)
    expect(html).toContain('aria-orientation="vertical"')
    expect(html).toContain('aria-label="프로젝트 영역"')
    expect(html).toContain('data-orientation="vertical"')
  })

  it('leaves a controlled selection under the caller’s ownership', () => {
    const html = renderToStaticMarkup(<Tabs items={items} value="activity" defaultValue="overview" />)
    expect(html).toContain('활동 콘텐츠')
    expect(html).not.toContain('개요 콘텐츠')
  })

  it('keeps tab triggers non-submitting inside a form', () => {
    const html = renderToStaticMarkup(<form><Tabs items={items} /></form>)
    expect(html.match(/type="button"/g)).toHaveLength(items.length)
  })
})
