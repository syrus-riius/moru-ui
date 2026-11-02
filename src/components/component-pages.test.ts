import { describe, expect, it } from 'vitest'
import { components, type ComponentId } from './component-catalog'
import {
  adjacentComponents, componentGroupFor, componentGroups, componentPageHash, componentPageKey,
  componentPageTitle, groupComponents, parseComponentPage, type ComponentPage,
} from './component-pages'

describe('component page categories', () => {
  it('places every catalog component in exactly one of eight nonempty categories', () => {
    const membership = componentGroups.flatMap((group) => group.componentIds)
    expect(componentGroups).toHaveLength(8)
    expect(new Set(componentGroups.map((group) => group.id)).size).toBe(8)
    expect(membership).toHaveLength(components.length)
    expect(new Set(membership).size).toBe(components.length)
    expect([...membership].sort()).toEqual(components.map((component) => component.id).sort())
    expect(componentGroups.every((group) => group.componentIds.length && group.label && group.description && group.eyebrow)).toBe(true)
  })

  it('keeps catalog order and returns a category object for every valid component', () => {
    for (const group of componentGroups) {
      const expected = components.filter((component) => group.componentIds.includes(component.id))
      expect(groupComponents(group.id)).toEqual(expected)
      for (const component of expected) expect(componentGroupFor(component.id)).toBe(group)
    }
    expect(componentGroupFor('kbd').id).toBe('actions')
  })

  it('keeps previous and next links inside each category with explicit first and last boundaries', () => {
    for (const group of componentGroups) {
      const siblings = groupComponents(group.id)
      siblings.forEach((component, index) => {
        expect(adjacentComponents(component.id)).toEqual({
          previous: siblings[index - 1]?.id ?? null,
          next: siblings[index + 1]?.id ?? null,
          index, total: siblings.length,
        })
      })
    }
  })
})

describe('component page URL routing', () => {
  it.each(['', '#', '#components', '#components/', '#components?search=input'])('treats %j as the library index', (hash) => {
    expect(parseComponentPage(hash)).toEqual({ kind: 'index' })
  })

  it.each(['#simulator', '#tokens', '#brand', '#examples', '#guide', '#comparison', '#states', '#main-content', '#unknown'])('leaves %s to the studio router', (hash) => {
    expect(parseComponentPage(hash)).toBeNull()
  })

  it('round-trips every category and individual page to its canonical unique URL', () => {
    const pages: ComponentPage[] = [
      { kind: 'index' },
      ...componentGroups.map((group) => ({ kind: 'category' as const, group: group.id })),
      ...components.map((component) => ({ kind: 'detail' as const, group: componentGroupFor(component.id).id, component: component.id })),
    ]
    const keys = pages.map(componentPageKey)
    expect(new Set(keys).size).toBe(pages.length)
    for (const page of pages) {
      expect(parseComponentPage(componentPageHash(page))).toEqual(page)
      expect(componentPageTitle(page)).not.toBe('')
    }
    expect(componentPageTitle({ kind: 'index' })).toBe('컴포넌트')
    expect(componentPageTitle({ kind: 'detail', group: 'actions', component: 'button' })).toBe('Button')
  })

  it('accepts legacy component links and resolves mismatched group links to the actual category', () => {
    for (const component of components) {
      const page = { kind: 'detail', group: componentGroupFor(component.id).id, component: component.id }
      expect(parseComponentPage(`#components/${component.id}`)).toEqual(page)
      expect(parseComponentPage(`#component-${component.id}`)).toEqual(page)
    }
    expect(parseComponentPage('#components/forms/button')).toEqual({ kind: 'detail', group: 'actions', component: 'button' })
    expect(componentPageHash({ kind: 'detail', group: 'forms', component: 'button' })).toBe('#components/actions/button')
  })

  it('keeps valid categories useful when a component is missing and unknown categories fall back to the index', () => {
    expect(parseComponentPage('#components/forms/not-a-component')).toEqual({ kind: 'category', group: 'forms' })
    expect(parseComponentPage('#components/forms/')).toEqual({ kind: 'category', group: 'forms' })
    expect(parseComponentPage('#components/missing')).toEqual({ kind: 'index' })
    expect(parseComponentPage('#component-missing')).toEqual({ kind: 'index' })
    expect(parseComponentPage('#components/missing/input')).toEqual({ kind: 'index' })
  })

  it.each(['#components/%', '#components/%E0%A4%A', '#component-%E0%A4%A', '#components/%2Fforms', '#components//input'])('does not throw for malformed or escaped paths %s', (hash) => {
    expect(() => parseComponentPage(hash)).not.toThrow()
    expect(parseComponentPage(hash)).toEqual({ kind: 'index' })
  })

  it('decodes safe component segments and isolates query parameters from route names', () => {
    expect(parseComponentPage('#components/forms/%69nput?tab=code')).toEqual({ kind: 'detail', group: 'forms', component: 'input' })
    expect(parseComponentPage('#components/forms/%E0%A4%A')).toEqual({ kind: 'category', group: 'forms' })
    const last = groupComponents('conversation').at(-1)!.id as ComponentId
    expect(adjacentComponents(last).next).toBeNull()
  })
})
