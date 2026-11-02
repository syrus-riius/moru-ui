import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Menu } from './menu'
import { NavigationMenu } from './navigation-menu'

const items = [
  { id: 'enabled', label: '리소스', links: [{ id: 'tokens', label: '토큰', href: '/tokens' }] },
  { id: 'disabled', label: '비공개', disabled: true, links: [{ id: 'private', label: '비공개 문서', href: '/private' }] },
]

describe('Navigation menu availability', () => {
  it('does not open a disabled submenu through defaultValue', () => {
    const markup = renderToStaticMarkup(<NavigationMenu items={items} defaultValue="disabled" />)
    expect(markup).not.toContain('aria-expanded="true"')
    expect(markup).toContain('aria-disabled="true"')
  })

  it('does not expose an unavailable controlled submenu', () => {
    const markup = renderToStaticMarkup(<NavigationMenu items={items} value="disabled" />)
    expect(markup).not.toContain('aria-expanded="true"')
  })

  it('keeps the enabled default submenu open', () => {
    const markup = renderToStaticMarkup(<NavigationMenu items={items} defaultValue="enabled" />)
    expect(markup).toContain('aria-expanded="true"')
  })

  it('closes a requested submenu while the whole navigation is disabled', () => {
    const markup = renderToStaticMarkup(<NavigationMenu disabled items={items} value="enabled" />)
    expect(markup).not.toContain('aria-expanded="true"')
  })

  it('disables a dropdown even when its supplied trigger remains enabled', () => {
    const markup = renderToStaticMarkup(<Menu disabled trigger={<button>작업</button>} items={[{ label: '실행' }]} />)
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('aria-expanded="false"')
  })

  it('preserves an unavailable supplied trigger without an explicit root override', () => {
    const markup = renderToStaticMarkup(<Menu trigger={<button disabled>작업</button>} items={[{ label: '실행' }]} />)
    expect(markup).toContain('disabled=""')
  })
})
