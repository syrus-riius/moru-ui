import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import * as ui from '../components/ui'
import { registryInstallItems, registryRelease } from './registry-install'

const registry = JSON.parse(
  readFileSync(new URL('../../registry.json', import.meta.url), 'utf8'),
) as { items: Array<{ name: string; type: string; meta: { version: string } }> }

describe('installer list and public exports follow the registry', () => {
  it('offers every installable item, and nothing the registry does not have', () => {
    // dialog is the legacy alias of modal; block-messages installs with the blocks.
    const dependenciesOnly = new Set(['dialog', 'block-messages'])
    const expected = registry.items
      .map((item) => item.name)
      .filter((name) => !dependenciesOnly.has(name))
    expect(registryInstallItems.map((item) => item.name).sort()).toEqual(expected.sort())
  })

  it('points at the release the registry was generated for', () => {
    expect(new Set(registry.items.map((item) => item.meta.version))).toEqual(
      new Set([registryRelease]),
    )
  })

  it('exports the installable input components from the UI entry', () => {
    // FormattedInput was installable and documented while missing from this entry.
    for (const name of ['FormattedInput', 'NumberInput', 'PasswordInput', 'LoadingOverlay'])
      expect(ui, name).toHaveProperty(name)
  })
})
