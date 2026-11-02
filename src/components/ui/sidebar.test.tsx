import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Sidebar } from './sidebar'

const items = [
  { id: 'overview', label: '개요' },
  { id: 'team', label: '팀원', badge: 5 },
  { id: 'settings', label: '설정', disabled: true },
]

describe('Responsive Sidebar semantics', () => {
  it('does not announce an open mobile modal before a mobile viewport is known', () => {
    const markup = renderToStaticMarkup(<Sidebar title="Moru" mobileOpen items={items} />)
    const mobileTrigger = markup.match(/<button\b[^>]*class="ui-sidebar-mobile-trigger"[^>]*>/)?.[0]
    expect(mobileTrigger).toContain('aria-expanded="false"')
    expect(markup).not.toContain('role="dialog"')
  })

  it('keeps every interactive entry disabled even if a caller requests the mobile panel open', () => {
    const markup = renderToStaticMarkup(<Sidebar title="Moru" mobileOpen disabled items={items} />)
    const buttons = [...markup.matchAll(/<button\b[^>]*>/g)].map(([button]) => button)
    expect(buttons).toHaveLength(5)
    expect(buttons.every((button) => /disabled=""/.test(button))).toBe(true)
    expect(markup).toContain('aria-expanded="false"')
  })

  it('preserves the current destination and hides visual-only badges from a collapsed label', () => {
    const markup = renderToStaticMarkup(<Sidebar title="Moru" value="team" collapsed items={items} />)
    expect(markup).toMatch(/aria-current="page" aria-label="팀원"/)
    expect(markup).toContain('class="ui-sidebar-badge" aria-hidden="true">5</span>')
    expect(markup).toContain('tabindex="-1" class="ui-sidebar-root"')
  })
})
