import { createRef, type ComponentProps } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { OverlayPortal } from './overlay-portal'

type TestPortalProps = ComponentProps<'div'> & { container?: unknown }

// Base UI portals are client-only. Render their host contract synchronously to
// exercise the shared React tree independently of their mount/animation cycle.
function TestPortal({ container: _container, children, ...props }: TestPortalProps) {
  return <div {...props}><span data-internal-backdrop="" />{children}</div>
}

function layers(markup: string) {
  return [...markup.matchAll(/data-moru-overlay-layer="(\d+)"/g)].map((match) => Number(match[1]))
}

describe('Overlay portal stacking', () => {
  it('places a dialog opened from a popover above the parent, with its select above both', () => {
    const markup = renderToStaticMarkup(
      <OverlayPortal portal={TestPortal} kind="popover">
        <OverlayPortal portal={TestPortal} kind="modal">
          <OverlayPortal portal={TestPortal} kind="menu">Select options</OverlayPortal>
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
              <OverlayPortal portal={TestPortal} kind="popover">Nested editor</OverlayPortal>
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
    const markup = renderToStaticMarkup(<>
      <OverlayPortal portal={TestPortal} kind="modal">First dialog</OverlayPortal>
      <OverlayPortal portal={TestPortal} kind="popover">
        <OverlayPortal portal={TestPortal} kind="command">Nested command</OverlayPortal>
      </OverlayPortal>
      <OverlayPortal portal={TestPortal} kind="modal">Independent dialog</OverlayPortal>
      <OverlayPortal portal={TestPortal} kind="tooltip">Tooltip</OverlayPortal>
      <OverlayPortal portal={TestPortal} kind="toast">Toast</OverlayPortal>
    </>)
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
        <OverlayPortal portal={ThemePortal} kind="modal" container={darkHost}>Dark dialog</OverlayPortal>
      </OverlayPortal>,
    )
    expect(receivedContainers).toEqual([lightHost, darkHost])
    expect(layers(markup)[1]).toBeGreaterThan(layers(markup)[0])
  })

  it('isolates the original portal host so its internal backdrop and popup stack together', () => {
    const markup = renderToStaticMarkup(
      <OverlayPortal portal={TestPortal} kind="modal"><section role="dialog">Dialog content</section></OverlayPortal>,
    )
    expect(markup).toMatch(/^<div class="ui-overlay-portal" style="position:relative;isolation:isolate;z-index:\d+"/)
    expect(markup).toContain('<span data-internal-backdrop=""></span><section role="dialog">Dialog content</section></div>')
    // Transform/filter/contain would change viewport-fixed dialog positioning.
    expect(markup).not.toMatch(/(?:transform|filter|contain):/)
  })
})
