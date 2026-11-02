import { describe, expect, it } from 'vitest'
import { components, snippets, componentAliases, filterComponents, addedComponentCount } from './component-catalog'
import { shadcnReference } from './shadcn-component-reference'

describe('general component index coverage', () => {
  it('covers each reviewed official name exactly once without duplicate gallery IDs', () => {
    for (const name of shadcnReference.names) expect(components.filter((item) => item.name === name)).toHaveLength(1)
    expect(new Set(components.map((item) => item.id)).size).toBe(components.length)
    expect(components).toHaveLength(shadcnReference.names.length + 9)
  })
  it('connects a Korean discovery alias and usage snippet for every component', () => {
    for (const item of components) {
      expect(componentAliases[item.id].trim()).not.toBe('')
      expect(snippets[item.id]).toContain('<')
      expect(filterComponents('all', item.name).some((result) => result.id === item.id)).toBe(true)
    }
  })
  it('separates this expansion from both previous generations', () => {
    const latest = filterComponents('all', '', true)
    expect(latest).toHaveLength(42)
    expect(addedComponentCount).toBe(42)
    expect(latest.every((item) => item.generation === 'completion')).toBe(true)
    expect(filterComponents('all', 'dropdown-menu').map((item) => item.id)).toEqual(['menu'])
  })
})
