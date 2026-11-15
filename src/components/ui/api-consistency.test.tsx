import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './checkbox'
import { Combobox } from './combobox'
import { Menu } from './menu'
import { Select } from './select'
import { Switch } from './switch'

const forwardRefType = Symbol.for('react.forward_ref')
const items = [
  { value: 'design', label: 'Design' },
  { value: 'build', label: 'Build' },
]

function openTag(markup: string, pattern: RegExp) {
  return markup.match(pattern)?.[0] ?? ''
}

describe('shared control contracts', () => {
  it.each([
    ['Checkbox', Checkbox],
    ['Switch', Switch],
    ['Select', Select],
    ['Combobox', Combobox],
  ] as const)('%s forwards a ref like Button and Input', (_name, Component) => {
    expect((Component as unknown as { $$typeof: symbol }).$$typeof).toBe(forwardRefType)
  })

  it('lets a controlled Select represent no selection with null', () => {
    const empty = renderToStaticMarkup(<Select items={items} value={null} aria-label="단계" />)
    expect(empty).toContain('선택해주세요')
    expect(empty).not.toContain('>Design<')
    const chosen = renderToStaticMarkup(<Select items={items} value="design" aria-label="단계" />)
    expect(chosen).toContain('Design')
  })

  it('accepts the same open-state props on Menu as on Popover and Modal', () => {
    // Server markup cannot show an open popup (it lives in a client portal), so this
    // guards the public props and the disabled contract; behavior is checked in a browser.
    const trigger = <button type="button">More</button>
    const menuItems = [{ label: 'Rename' }]
    const props: Pick<Parameters<typeof Menu>[0], 'open' | 'defaultOpen' | 'onOpenChange'> = {
      open: true,
      defaultOpen: false,
      onOpenChange: (next: boolean) => void next,
    }
    const controlled = renderToStaticMarkup(<Menu trigger={trigger} items={menuItems} {...props} />)
    expect(openTag(controlled, /<button\b[^>]*>/)).toContain('aria-haspopup="menu"')
    const disabled = renderToStaticMarkup(
      <Menu trigger={trigger} items={menuItems} open disabled />,
    )
    expect(openTag(disabled, /<button\b[^>]*>/)).toContain('aria-expanded="false"')
  })

  it('keeps a busy Checkbox focusable: read-only and announced, not disabled', () => {
    const busy = renderToStaticMarkup(<Checkbox label="알림" loading />)
    const box = openTag(busy, /<[a-z]+\b[^>]*role="checkbox"[^>]*>/)
    expect(box).toContain('aria-busy="true"')
    expect(box).toContain('aria-readonly="true"')
    expect(box).not.toContain('aria-disabled="true"')
    expect(box).not.toContain('data-disabled')
    expect(busy).toContain('ui-checkbox-loading-indicator')
    const off = renderToStaticMarkup(<Checkbox label="알림" disabled />)
    expect(openTag(off, /<[a-z]+\b[^>]*role="checkbox"[^>]*>/)).toContain('data-disabled')
  })

  it('gives Switch the same busy state as Checkbox', () => {
    const busy = renderToStaticMarkup(<Switch label="공개" loading />)
    const control = openTag(busy, /<[a-z]+\b[^>]*role="switch"[^>]*>/)
    expect(control).toContain('aria-busy="true"')
    expect(control).toContain('aria-readonly="true"')
    expect(control).toContain('data-loading')
    expect(control).not.toContain('data-disabled')
    expect(busy).toContain('ui-switch-loading-indicator')
    const idle = renderToStaticMarkup(<Switch label="공개" />)
    expect(idle).not.toContain('ui-switch-loading-indicator')
    expect(idle).not.toContain('aria-busy')
  })
})
