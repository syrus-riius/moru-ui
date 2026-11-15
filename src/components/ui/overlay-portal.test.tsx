import { createRef, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { OverlayPortal } from './overlay-portal'

type TestPortalProps = ComponentProps<'div'> & { container?: unknown }

// Base UI portals are client-only. Render their host contract synchronously to
// exercise the shared React tree independently of their mount/animation cycle.
function TestPortal({ container: _container, children, ...props }: TestPortalProps) {
  return (
    <div {...props}>
      <span data-internal-backdrop="" />
      {children}
    </div>
  )
}

function layers(markup: string) {
  return [...markup.matchAll(/data-moru-overlay-layer="(\d+)"/g)].map((match) => Number(match[1]))
}

function hostStyle(markup: string) {
  const style = markup.match(/^<div[^>]*\bstyle="([^"]*)"/)?.[1] ?? ''
  return Object.fromEntries(
    style
      .split(';')
      .filter(Boolean)
      .map((rule) => rule.split(':')),
  )
}

describe('Overlay portal stacking', () => {
  it('places a dialog opened from a popover above the parent, with its select above both', () => {
    const markup = renderToStaticMarkup(
      <OverlayPortal portal={TestPortal} kind="popover">
        <OverlayPortal portal={TestPortal} kind="modal">
          <OverlayPortal portal={TestPortal} kind="menu">
            Select options
          </OverlayPortal>
        </OverlayPortal>
      </OverlayPortal>,
    )
    const [popover, dialog, select] = layers(markup)
    expect(dialog).toBeGreaterThan(popover)
    expect(select).toBeGreaterThan(dialog)
    expect(markup).toContain('Select options')
  })

  it('keeps consecutive modal and submenu levels above every ancestor', () => {
    const markup = renderToStaticMarkup(
      <OverlayPortal portal={TestPortal} kind="menu">
        <OverlayPortal portal={TestPortal} kind="menu">
          <OverlayPortal portal={TestPortal} kind="modal">
            <OverlayPortal portal={TestPortal} kind="modal">
              <OverlayPortal portal={TestPortal} kind="popover">
                Nested editor
              </OverlayPortal>
            </OverlayPortal>
          </OverlayPortal>
        </OverlayPortal>
      </OverlayPortal>,
    )
    const values = layers(markup)
    expect(values).toHaveLength(5)
    values.slice(1).forEach((layer, index) => expect(layer).toBeGreaterThan(values[index]))
  })

  it('preserves unrelated overlay priorities without leaking a nested layer into siblings', () => {
    const markup = renderToStaticMarkup(
      <>
        <OverlayPortal portal={TestPortal} kind="modal">
          First dialog
        </OverlayPortal>
        <OverlayPortal portal={TestPortal} kind="popover">
          <OverlayPortal portal={TestPortal} kind="command">
            Nested command
          </OverlayPortal>
        </OverlayPortal>
        <OverlayPortal portal={TestPortal} kind="modal">
          Independent dialog
        </OverlayPortal>
        <OverlayPortal portal={TestPortal} kind="tooltip">
          Tooltip
        </OverlayPortal>
        <OverlayPortal portal={TestPortal} kind="toast">
          Toast
        </OverlayPortal>
      </>,
    )
    const [firstDialog, popover, command, independentDialog, tooltip, toast] = layers(markup)
    expect(firstDialog).toBe(independentDialog)
    expect(popover).toBeGreaterThan(firstDialog)
    expect(tooltip).toBeGreaterThan(popover)
    expect(command).toBeGreaterThanOrEqual(tooltip)
    expect(toast).toBeGreaterThanOrEqual(command)
  })

  it('forwards separate theme hosts while preserving the shared overlay hierarchy', () => {
    const lightHost = createRef<HTMLDivElement>()
    const darkHost = createRef<HTMLDivElement>()
    const receivedContainers: unknown[] = []
    function ThemePortal({ container, ...props }: TestPortalProps) {
      receivedContainers.push(container)
      return <TestPortal {...props} />
    }

    const markup = renderToStaticMarkup(
      <OverlayPortal portal={ThemePortal} kind="popover" container={lightHost}>
        <OverlayPortal portal={ThemePortal} kind="modal" container={darkHost}>
          Dark dialog
        </OverlayPortal>
      </OverlayPortal>,
    )
    expect(receivedContainers).toEqual([lightHost, darkHost])
    expect(layers(markup)[1]).toBeGreaterThan(layers(markup)[0])
  })

  it('anchors the original portal and its focus guards to the viewport instead of the document end', () => {
    const markup = renderToStaticMarkup(
      <OverlayPortal portal={TestPortal} kind="modal">
        <section role="dialog">Dialog content</section>
      </OverlayPortal>,
    )
    expect(hostStyle(markup)).toMatchObject({
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      isolation: 'isolate',
    })
    expect(Number(hostStyle(markup)['z-index'])).toBeGreaterThan(0)
    expect(markup).toContain(
      '<span data-internal-backdrop=""></span><section role="dialog">Dialog content</section></div>',
    )
  })

  it('does not create a page-sized hitbox or clip popups that extend outside the host', () => {
    const markup = renderToStaticMarkup(
      <OverlayPortal portal={TestPortal} kind="popover">
        <button>Focusable popup content</button>
      </OverlayPortal>,
    )
    const style = hostStyle(markup)
    // A zero-height host leaves the page clickable. The popup and backdrop own their hit areas.
    expect(style.height).toBe('0')
    expect(style.bottom).toBeUndefined()
    expect(style['min-height']).toBeUndefined()
    expect(style['pointer-events']).not.toBe('none')
    expect(style.overflow).toBeUndefined()
    expect(style['overflow-x']).toBeUndefined()
    expect(style['overflow-y']).toBeUndefined()
    expect(style['clip-path']).toBeUndefined()
    // These properties would rebase viewport-fixed nested dialogs or clip their backdrops.
    for (const property of ['transform', 'filter', 'backdrop-filter', 'contain', 'perspective']) {
      expect(style[property]).toBeUndefined()
    }
  })
})
