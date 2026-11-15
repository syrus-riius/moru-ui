import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StatusIndicator } from './status-indicator'

describe('StatusIndicator accessible state', () => {
  it('renders readable status text without announcing static content', () => {
    const markup = renderToStaticMarkup(<StatusIndicator label="Connected" tone="success" />)
    expect(markup).toContain('<span>Connected</span>')
    expect(markup).not.toContain('role=')
    expect(markup).not.toContain('aria-live=')
    expect(markup).not.toContain('aria-atomic=')
  })

  it.each(['neutral', 'success', 'warning', 'danger', 'info'] as const)(
    'keeps a %s dot decorative while preserving visible text',
    (tone) => {
      const markup = renderToStaticMarkup(<StatusIndicator label="Connection status" tone={tone} />)
      expect(markup.match(/aria-hidden="true"/g)).toHaveLength(1)
      expect(markup).toMatch(
        /<span[^>]*aria-hidden="true"[^>]*><\/span><span>Connection status<\/span>/,
      )
      expect(markup).not.toContain('role="alert"')
    },
  )

  it('opts into a single polite, atomic status announcement', () => {
    const markup = renderToStaticMarkup(
      <StatusIndicator label="Syncing changes" tone="info" live="polite" pulse />,
    )
    expect(markup.match(/role="status"/g)).toHaveLength(1)
    expect(markup).toContain('aria-live="polite"')
    expect(markup).toContain('aria-atomic="true"')
    expect(markup).not.toContain('aria-live="assertive"')
    expect(markup).toContain('<span>Syncing changes</span>')
  })

  it('keeps its readable status when decorative motion is paused', () => {
    const markup = renderToStaticMarkup(
      <StatusIndicator label="Reconnecting" tone="warning" pulse paused />,
    )
    expect(markup).toContain('<span>Reconnecting</span>')
    expect(markup).not.toContain('aria-busy')
    expect(markup).not.toContain('aria-live=')
  })

  it('preserves the caller’s description link without hiding the visible label', () => {
    const markup = renderToStaticMarkup(
      <StatusIndicator
        id="connection"
        label="Offline"
        aria-describedby="connection-help"
        live="off"
      />,
    )
    expect(markup).toContain('id="connection"')
    expect(markup).toContain('aria-describedby="connection-help"')
    expect(markup).toContain('<span>Offline</span>')
    expect(markup).not.toContain('role="status"')
  })
})
