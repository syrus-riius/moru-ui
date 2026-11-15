import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MoruLocaleProvider } from '../../lib/i18n'
import { LoadingOverlay } from './loading-overlay'

describe('LoadingOverlay local loading boundary', () => {
  it('provides a programmatic boundary focus target without adding a tab stop', () => {
    const markup = renderToStaticMarkup(
      <LoadingOverlay loading={false}>
        <button>Save</button>
      </LoadingOverlay>,
    )
    expect(markup.match(/^<div[^>]*>/)?.[0]).toContain('tabindex="-1"')
  })

  it('preserves a caller-provided boundary tab index and accessible name', () => {
    const markup = renderToStaticMarkup(
      <LoadingOverlay loading={false} tabIndex={0} id="settings" aria-label="Settings">
        <button>Save</button>
      </LoadingOverlay>,
    )
    const root = markup.match(/^<div[^>]*>/)?.[0] ?? ''
    expect(root).toContain('tabindex="0"')
    expect(root).toContain('id="settings"')
    expect(root).toContain('aria-label="Settings"')
  })

  it('keeps covered controls mounted but inert while loading', () => {
    const markup = renderToStaticMarkup(
      <LoadingOverlay loading label="Saving project">
        <label>
          Project name
          <input name="project" defaultValue="Moru" />
        </label>
        <button type="button">Save</button>
      </LoadingOverlay>,
    )
    expect(markup).toContain('inert="" aria-busy="true"')
    expect(markup).toContain('name="project" value="Moru"')
    expect(markup).toContain('>Save</button>')
    expect(markup.match(/role="status"/g)).toHaveLength(1)
    expect(markup).not.toContain('aria-modal')
    expect(markup).not.toContain('role="dialog"')
  })

  it('places the announced status after the busy/inert content instead of inside it', () => {
    const markup = renderToStaticMarkup(
      <LoadingOverlay loading label="Loading records" description="Keep this page open.">
        <button>Covered control</button>
      </LoadingOverlay>,
    )
    expect(markup).toMatch(/Covered control<\/button><\/div><div[^>]*role="status"/)
    const status = markup.match(/<div[^>]*role="status"[^>]*>/)?.[0] ?? ''
    expect(status).toContain('aria-live="polite"')
    expect(status).toContain('aria-atomic="true"')
    expect(status).not.toContain('aria-busy')
    const labelId = status.match(/aria-labelledby="([^"]+)"/)?.[1]
    const descriptionId = status.match(/aria-describedby="([^"]+)"/)?.[1]
    expect(labelId).toBeTruthy()
    expect(descriptionId).toBeTruthy()
    expect(markup).toContain(`id="${labelId}"`)
    expect(markup).toContain(`id="${descriptionId}"`)
  })

  it('releases controls and leaves an empty live region ready for the next announcement', () => {
    const markup = renderToStaticMarkup(
      <LoadingOverlay loading={false} label="Loading">
        <button>Continue</button>
      </LoadingOverlay>,
    )
    expect(markup).toContain('aria-busy="false"')
    expect(markup).not.toContain('inert=')
    expect(markup).toContain('role="status"')
    expect(markup).not.toContain('>Loading<')
    expect(markup).not.toContain('aria-labelledby')
    expect(markup).not.toContain('<svg')
    expect(markup).toContain('>Continue</button>')
  })

  it('uses the localized default label and keeps the spinner decorative', () => {
    const markup = renderToStaticMarkup(
      <MoruLocaleProvider locale="en">
        <LoadingOverlay loading>
          <button>Save</button>
        </LoadingOverlay>
      </MoruLocaleProvider>,
    )
    expect(markup).toContain('Loading')
    expect(markup.match(/role="status"/g)).toHaveLength(1)
    expect(markup).not.toMatch(/<span[^>]*aria-label=/)
  })
})
